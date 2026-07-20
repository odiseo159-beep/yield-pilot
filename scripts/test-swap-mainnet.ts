/**
 * Primer swap TAGUEADO en Celo mainnet — la prueba del Track 1.
 * Swapea un monto chico (default $1) USDT->USDC vía SwapRouter02 con el
 * attribution tag appendeado, y verifica el decode on-chain con verifyTx.
 *
 * Después de correrlo: verificar que la tx aparece en el Dune bajo tu tag
 * (https://dune.com/celo/agentic-payments-defai-hackathon) — ese read-back
 * es la única prueba real de que el volumen del pilot va a contar.
 *
 * Prerrequisitos: signer con USDT + CELO para gas, y ATTRIBUTION_TAG asignado.
 * Uso: SIGNER_PRIVATE_KEY=0x... ATTRIBUTION_TAG=celo_xxxx npx tsx scripts/test-swap-mainnet.ts [monto_usd]
 */
import "dotenv/config";
import { createPublicClient, createWalletClient, http, parseAbi, parseUnits, formatUnits, encodeFunctionData, concat, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { toDataSuffix, verifyTx } from "@celo/attribution-tags";

const USDC = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as const; // 6 dec
const USDT = "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as const; // 6 dec
const ROUTER = "0x5615CDAb10dc425a742d643d949a7F474C01abc4" as const; // SwapRouter02 (verificado)
const QUOTER = "0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8" as const;
const FEES = [100, 500, 3000] as const;
const SLIPPAGE_BPS = 50n;

const amountUsd = Number(process.argv[2] ?? 1);
const pk = process.env.SIGNER_PRIVATE_KEY as `0x${string}` | undefined;
const tag = process.env.ATTRIBUTION_TAG;
if (!pk || !tag) { console.error("Faltan SIGNER_PRIVATE_KEY y/o ATTRIBUTION_TAG"); process.exit(1); }

const account = privateKeyToAccount(pk);
const publicClient = createPublicClient({ chain: celo, transport: http("https://forno.celo.org") });
const walletClient = createWalletClient({ account, chain: celo, transport: http("https://forno.celo.org") });

const erc20 = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
]);
const routerAbi = parseAbi([
  "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) payable returns (uint256)",
]);
const quoterAbi = parseAbi([
  "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) returns (uint256,uint160,uint32,uint256)",
]);

const suffix = toDataSuffix(tag) as Hex;
console.log(`signer ${account.address} · tag "${tag}"`);

async function sendTagged(to: `0x${string}`, encoded: Hex): Promise<Hex> {
  const data = concat([encoded, suffix]);
  await publicClient.call({ account: account.address, to, data }); // simulate primero
  const hash = await walletClient.sendTransaction({ to, data });
  const rcpt = await publicClient.waitForTransactionReceipt({ hash });
  if (rcpt.status !== "success") throw new Error(`tx revirtió: ${hash}`);
  return hash;
}

// --- pre-flight ---
const [usdtBal, celoBal] = await Promise.all([
  publicClient.readContract({ address: USDT, abi: erc20, functionName: "balanceOf", args: [account.address] }),
  publicClient.getBalance({ address: account.address }),
]);
console.log(`USDT: ${formatUnits(usdtBal, 6)} · CELO (gas): ${formatUnits(celoBal, 18)}`);
const amountIn = parseUnits(amountUsd.toFixed(6), 6);
if (usdtBal < amountIn) { console.error(`⛔ USDT insuficiente para swapear $${amountUsd}`); process.exit(1); }
if (celoBal === 0n) { console.error("⛔ Sin CELO para gas"); process.exit(1); }

// --- mejor ruta ---
let best: { fee: number; out: bigint } | null = null;
for (const fee of FEES) {
  try {
    const { result } = await publicClient.simulateContract({
      address: QUOTER, abi: quoterAbi, functionName: "quoteExactInputSingle",
      args: [{ tokenIn: USDT, tokenOut: USDC, amountIn, fee, sqrtPriceLimitX96: 0n }],
    });
    const out = (result as readonly bigint[])[0];
    if (out > 0n && (!best || out > best.out)) best = { fee, out };
  } catch { /* sin pool */ }
}
if (!best) { console.error("⛔ sin ruta USDT->USDC"); process.exit(1); }
console.log(`ruta: fee tier ${best.fee} → ~${formatUnits(best.out, 6)} USDC`);

// --- approve (tagueado) si hace falta ---
const allowance = await publicClient.readContract({ address: USDT, abi: erc20, functionName: "allowance", args: [account.address, ROUTER] });
if (allowance < amountIn) {
  console.log("approve tagueado…");
  const h = await sendTagged(USDT, encodeFunctionData({ abi: erc20, functionName: "approve", args: [ROUTER, amountIn] }));
  console.log(`  https://celoscan.io/tx/${h}`);
}

// --- swap (tagueado) ---
console.log(`swap $${amountUsd} USDT→USDC tagueado…`);
const minOut = (best.out * (10_000n - SLIPPAGE_BPS)) / 10_000n;
const swapHash = await sendTagged(ROUTER, encodeFunctionData({
  abi: routerAbi, functionName: "exactInputSingle",
  args: [{ tokenIn: USDT, tokenOut: USDC, fee: best.fee, recipient: account.address, amountIn, amountOutMinimum: minOut, sqrtPriceLimitX96: 0n }],
}));
console.log(`  🎉 https://celoscan.io/tx/${swapHash}`);

// --- verificación del tag on-chain ---
const decoded = await verifyTx({ client: publicClient, hash: swapHash });
console.log(`tag on-chain: ${decoded ? "✅ " + JSON.stringify(decoded) : "❌ NO decodificado"}`);
console.log("\nSiguiente: confirmar que aparece bajo tu tag en el Dune (puede demorar minutos):");
console.log("https://dune.com/celo/agentic-payments-defai-hackathon");
console.log("Solo cuando aparezca → DRY_RUN=false en el pilot.");
