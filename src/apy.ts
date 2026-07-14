import { parseAbi, formatUnits, type Address } from "viem";
import { publicClient, account } from "./chain.js";
import { AAVE_POOL, MARKETS, MARKET_SYMBOLS, RAY, type MarketSymbol } from "./config.js";

const POOL_ABI = parseAbi([
  "function getReserveData(address) view returns ((uint256,uint128,uint128,uint128,uint128,uint128,uint40,uint16,address,address,address,address,uint128,uint128,uint128))",
]);

const ERC20_ABI = parseAbi(["function balanceOf(address) view returns (uint256)"]);

export type MarketState = {
  symbol: MarketSymbol;
  /** APR de supply en basis points (250 = 2.50%) */
  supplyAprBps: number;
  /** balance del signer en el aToken (posición actual), unidades humanas */
  position: number;
  /** balance del signer en el underlying sin depositar, unidades humanas */
  idle: number;
};

/** Lee APR de supply y posición del signer en cada mercado stable. */
export async function readMarkets(): Promise<MarketState[]> {
  const out: MarketState[] = [];
  for (const symbol of MARKET_SYMBOLS) {
    const m = MARKETS[symbol];
    const data = await publicClient.readContract({
      address: AAVE_POOL,
      abi: POOL_ABI,
      functionName: "getReserveData",
      args: [m.underlying as Address],
    });
    const liquidityRate = data[2] as bigint; // RAY
    const supplyAprBps = Number((liquidityRate * 10_000n) / RAY);

    let position = 0;
    let idle = 0;
    if (account) {
      const [aBal, uBal] = await Promise.all([
        publicClient.readContract({ address: m.aToken as Address, abi: ERC20_ABI, functionName: "balanceOf", args: [account.address] }),
        publicClient.readContract({ address: m.underlying as Address, abi: ERC20_ABI, functionName: "balanceOf", args: [account.address] }),
      ]);
      position = Number(formatUnits(aBal, m.decimals));
      idle = Number(formatUnits(uBal, m.decimals));
    }
    out.push({ symbol, supplyAprBps, position, idle });
  }
  return out;
}
