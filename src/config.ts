import "dotenv/config";
import { AaveV3Celo } from "@bgd-labs/aave-address-book";

export const config = {
  dryRun: (process.env.DRY_RUN ?? "true").toLowerCase() !== "false",
  signerPrivateKey: (process.env.SIGNER_PRIVATE_KEY ?? "") as `0x${string}`,
  attributionTag: process.env.ATTRIBUTION_TAG ?? "",

  minApyDeltaBps: Number(process.env.MIN_APY_DELTA_BPS ?? 50),
  cooldownHours: Number(process.env.COOLDOWN_HOURS ?? 8),
  maxMoveUsd: Number(process.env.MAX_MOVE_USD ?? 500),
  slippageBps: BigInt(process.env.SLIPPAGE_BPS ?? 30),

  sentinelUrl: process.env.SENTINEL_URL ?? "http://localhost:1996",
  sentinelPaid: (process.env.SENTINEL_PAID ?? "false").toLowerCase() === "true",

  rpcUrl: process.env.RPC_URL ?? "https://forno.celo.org",
  port: Number(process.env.PORT ?? 1997),
  loopMinutes: Number(process.env.LOOP_MINUTES ?? 15),
} as const;

// --- Direcciones canónicas (address book oficial de BGD Labs, verificado en vivo) ---
export const AAVE_POOL = AaveV3Celo.POOL; // 0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402

/** Mercados stables que rotamos. USDm es el cUSD nativo (18 dec). */
export const MARKETS = {
  USDC: { underlying: AaveV3Celo.ASSETS.USDC.UNDERLYING, aToken: AaveV3Celo.ASSETS.USDC.A_TOKEN, decimals: 6 },
  USDT: { underlying: AaveV3Celo.ASSETS.USDT.UNDERLYING, aToken: AaveV3Celo.ASSETS.USDT.A_TOKEN, decimals: 6 },
  USDm: { underlying: AaveV3Celo.ASSETS.USDm.UNDERLYING, aToken: AaveV3Celo.ASSETS.USDm.A_TOKEN, decimals: 18 },
} as const;

export type MarketSymbol = keyof typeof MARKETS;
export const MARKET_SYMBOLS = Object.keys(MARKETS) as MarketSymbol[];

// Uniswap V3 en Celo (SwapRouter02 verificado en Blockscout)
export const SWAP_ROUTER_02 = "0x5615CDAb10dc425a742d643d949a7F474C01abc4" as const;
export const POOL_FEES = [100, 500, 3000] as const; // stable-stable suele ser 0.01%/0.05%

export const RAY = 10n ** 27n;
