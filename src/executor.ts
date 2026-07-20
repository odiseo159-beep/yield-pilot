import { parseAbi, parseUnits, type Address } from "viem";
import { config, AAVE_POOL, MARKETS, SWAP_ROUTER_02, POOL_FEES, type MarketSymbol } from "./config.js";
import { publicClient, account, writeTagged } from "./chain.js";
import { checkToken } from "./sentinel.js";
import type { Decision } from "./strategy.js";

const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
]);

const POOL_ABI = parseAbi([
  "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)",
  "function withdraw(address asset, uint256 amount, address to) returns (uint256)",
]);

const ROUTER_ABI = parseAbi([
  "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)",
]);

const QUOTER_ABI = parseAbi([
  "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
]);
const QUOTER_V2 = "0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8" as const;

export type ExecutionResult = { executed: boolean; txHashes: string[]; note: string };

async function ensureAllowance(token: Address, spender: Address, amount: bigint, hashes: string[]) {
  if (!account) throw new Error("sin signer");
  const current = await publicClient.readContract({
    address: token, abi: ERC20_ABI, functionName: "allowance", args: [account.address, spender],
  });
  if (current < amount) {
    hashes.push(await writeTagged({ to: token, abi: ERC20_ABI as never, functionName: "approve", args: [spender, amount] }));
  }
}

/** Encuentra el mejor fee tier con el quoter y devuelve { fee, amountOut }. */
async function bestRoute(tokenIn: Address, tokenOut: Address, amountIn: bigint) {
  let best: { fee: number; amountOut: bigint } | null = null;
  for (const fee of POOL_FEES) {
    try {
      const { result } = await publicClient.simulateContract({
        address: QUOTER_V2, abi: QUOTER_ABI, functionName: "quoteExactInputSingle",
        args: [{ tokenIn, tokenOut, amountIn, fee, sqrtPriceLimitX96: 0n }],
      });
      const amountOut = (result as readonly bigint[])[0];
      if (amountOut > 0n && (!best || amountOut > best.amountOut)) best = { fee, amountOut };
    } catch { /* sin pool en este tier */ }
  }
  if (!best) throw new Error("sin ruta de swap entre los stables");
  return best;
}

/** Ejecuta la decisión. En DRY_RUN solo describe lo que haría. */
export async function execute(decision: Decision): Promise<ExecutionResult> {
  if (decision.kind === "hold") return { executed: false, txHashes: [], note: decision.reason };

  if (config.dryRun) {
    return {
      executed: false, txHashes: [],
      note: `DRY_RUN — habría ejecutado: ${decision.kind} ${"from" in decision ? `${decision.from}→` : "→"}${decision.to} $${decision.amountUsd.toFixed(2)}`,
    };
  }
  if (!account) throw new Error("sin SIGNER_PRIVATE_KEY");

  const hashes: string[] = [];
  const to = MARKETS[decision.to];

  // Check de seguridad pre-operación (paga x402 si SENTINEL_PAID) — el token
  // destino se verifica SIEMPRE antes de tocar el capital.
  const report = await checkToken(to.underlying);
  if (report.recommendation === "AVOID") {
    return { executed: false, txHashes: [], note: `sentinel dice AVOID sobre ${decision.to}: ${report.reason}` };
  }

  if (decision.kind === "deploy_idle") {
    // El capital ocioso está en el token de `from`; el mejor mercado es `to`.
    // Si difieren, hay que swapear primero — depositar `to` sin tenerlo revierte.
    const idle = MARKETS[decision.from];
    // decision.amountUsd viene de un snapshot de decide() (roundtrip bigint->float->bigint,
    // puede quedar unos pocos base units por encima del balance real) — releer el balance
    // ON-CHAIN justo antes de firmar y nunca pedir más de lo que hay de verdad (si no, "STF").
    const wantIdle = parseUnits(decision.amountUsd.toFixed(idle.decimals), idle.decimals);
    const actualIdleBalance = await publicClient.readContract({
      address: idle.underlying as Address, abi: ERC20_ABI, functionName: "balanceOf", args: [account.address],
    });
    const amountIdle = wantIdle < actualIdleBalance ? wantIdle : actualIdleBalance;
    if (amountIdle === 0n) {
      return { executed: false, txHashes: [], note: `deploy_idle: balance real de ${decision.from} es 0 (snapshot desactualizado)` };
    }
    let target = to;

    if (decision.from !== decision.to) {
      let route: Awaited<ReturnType<typeof bestRoute>> | null = null;
      try {
        route = await bestRoute(idle.underlying as Address, to.underlying as Address, amountIdle);
      } catch { /* sin ruta de swap hacia el mejor mercado */ }

      if (route) {
        const minOut = (route.amountOut * (10_000n - config.slippageBps)) / 10_000n;
        await ensureAllowance(idle.underlying as Address, SWAP_ROUTER_02 as Address, amountIdle, hashes);
        hashes.push(await writeTagged({
          to: SWAP_ROUTER_02 as Address, abi: ROUTER_ABI as never, functionName: "exactInputSingle",
          args: [{
            tokenIn: idle.underlying, tokenOut: to.underlying, fee: route.fee,
            recipient: account.address, amountIn: amountIdle, amountOutMinimum: minOut, sqrtPriceLimitX96: 0n,
          }],
          viaMulticall: true, // struct-param único: sin multicall revierte con "STF" al taguear
        }));
      } else {
        // Fallback defendible: sin ruta al mejor mercado, el idle rinde en su propio mercado.
        target = idle;
      }
    }

    // depositar el balance real del token destino (post-swap incluye residuales)
    const supplyAmount = await publicClient.readContract({
      address: target.underlying as Address, abi: ERC20_ABI, functionName: "balanceOf", args: [account.address],
    });
    if (supplyAmount === 0n) {
      return { executed: hashes.length > 0, txHashes: hashes, note: `deploy_idle: sin balance de ${target === to ? decision.to : decision.from} que depositar tras el swap` };
    }
    await ensureAllowance(target.underlying as Address, AAVE_POOL as Address, supplyAmount, hashes);
    hashes.push(await writeTagged({
      to: AAVE_POOL as Address, abi: POOL_ABI as never, functionName: "supply",
      args: [target.underlying, supplyAmount, account.address, 0],
    }));
    const targetSymbol = target === to ? decision.to : decision.from;
    return { executed: true, txHashes: hashes, note: `deploy_idle ${decision.from}→${targetSymbol} $${decision.amountUsd.toFixed(2)}${target !== to ? " (sin ruta al mejor mercado, depositado en el propio)" : ""}` };
  }

  // rebalance: withdraw → swap → supply
  const from = MARKETS[decision.from];
  const amountIn = parseUnits(decision.amountUsd.toFixed(from.decimals), from.decimals);

  hashes.push(await writeTagged({
    to: AAVE_POOL as Address, abi: POOL_ABI as never, functionName: "withdraw",
    args: [from.underlying, amountIn, account.address],
  }));

  const route = await bestRoute(from.underlying as Address, to.underlying as Address, amountIn);
  const minOut = (route.amountOut * (10_000n - config.slippageBps)) / 10_000n;
  await ensureAllowance(from.underlying as Address, SWAP_ROUTER_02 as Address, amountIn, hashes);
  hashes.push(await writeTagged({
    to: SWAP_ROUTER_02 as Address, abi: ROUTER_ABI as never, functionName: "exactInputSingle",
    args: [{
      tokenIn: from.underlying, tokenOut: to.underlying, fee: route.fee,
      recipient: account.address, amountIn, amountOutMinimum: minOut, sqrtPriceLimitX96: 0n,
    }],
    viaMulticall: true, // exactInputSingle toma un único param struct: sin esto revierte con "STF" al appendear el tag
  }));

  // depositar lo recibido (balance real post-swap, no el estimado)
  const received = await publicClient.readContract({
    address: to.underlying as Address, abi: ERC20_ABI, functionName: "balanceOf", args: [account.address],
  });
  await ensureAllowance(to.underlying as Address, AAVE_POOL as Address, received, hashes);
  hashes.push(await writeTagged({
    to: AAVE_POOL as Address, abi: POOL_ABI as never, functionName: "supply",
    args: [to.underlying, received, account.address, 0],
  }));

  return {
    executed: true, txHashes: hashes,
    note: `rebalance ${decision.from}→${decision.to} $${decision.amountUsd.toFixed(2)} (delta ${(decision.deltaBps / 100).toFixed(2)}pp, fee tier ${route.fee})`,
  };
}
