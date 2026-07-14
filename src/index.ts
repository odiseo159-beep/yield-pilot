import express from "express";
import { appendFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { config } from "./config.js";
import { account } from "./chain.js";
import { readMarkets } from "./apy.js";
import { decide } from "./strategy.js";
import { execute } from "./executor.js";

const DATA_DIR = "data";
const LOG_FILE = `${DATA_DIR}/decisions.jsonl`;
mkdirSync(DATA_DIR, { recursive: true });

type LogEntry = {
  at: string;
  decision: string;
  reason: string;
  executed: boolean;
  txHashes: string[];
  markets: { symbol: string; aprBps: number; position: number }[];
};

let lastMoveAt: number | null = null;

/**
 * Un tick del agente: leer mercados → decidir → ejecutar → loguear.
 * El log JSONL es la defensa anti-farming: cada movimiento con su razón económica,
 * público en el dashboard.
 */
async function tick() {
  try {
    const markets = await readMarkets();
    const decision = decide(markets, lastMoveAt);
    const result = await execute(decision);
    if (result.executed) lastMoveAt = Date.now();

    const entry: LogEntry = {
      at: new Date().toISOString(),
      decision: decision.kind,
      reason: "reason" in decision ? decision.reason : "",
      executed: result.executed,
      txHashes: result.txHashes,
      markets: markets.map((m) => ({ symbol: m.symbol, aprBps: m.supplyAprBps, position: m.position })),
    };
    appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
    console.log(`[tick] ${entry.decision} — ${result.note}`);
  } catch (e) {
    console.error("[tick] error:", e instanceof Error ? e.message : e);
  }
}

// --- Dashboard mínimo: estado + historial de decisiones (transparencia para jueces) ---
const app = express();

app.get("/", async (_req, res) => {
  const markets = await readMarkets().catch(() => []);
  res.json({
    name: "yield-pilot",
    description:
      "Autonomous yield rebalancer on Celo (Aave v3 stable markets). Moves capital only when the real APY delta justifies it. Every decision logged with its economic reason; every tx carries the ERC-8021 attribution tag. Pre-trade safety checks via celo-sentinel (x402).",
    signer: account?.address ?? null,
    dryRun: config.dryRun,
    strategy: {
      minApyDeltaBps: config.minApyDeltaBps,
      cooldownHours: config.cooldownHours,
      maxMoveUsd: config.maxMoveUsd,
    },
    markets: markets.map((m) => ({
      symbol: m.symbol,
      supplyApr: `${(m.supplyAprBps / 100).toFixed(2)}%`,
      position: m.position,
    })),
  });
});

app.get("/decisions", (_req, res) => {
  if (!existsSync(LOG_FILE)) return res.json([]);
  const lines = readFileSync(LOG_FILE, "utf8").trim().split("\n").filter(Boolean);
  res.json(lines.slice(-200).map((l) => JSON.parse(l)));
});

app.get("/health", (_req, res) => res.json({ ok: true, service: "yield-pilot", dryRun: config.dryRun }));

app.listen(config.port, () => {
  console.log(`yield-pilot en http://localhost:${config.port} — DRY_RUN=${config.dryRun}`);
  if (!config.attributionTag) console.warn("⚠️  Sin ATTRIBUTION_TAG: las txs NO contarían en el leaderboard.");
  if (!account) console.warn("⚠️  Sin SIGNER_PRIVATE_KEY: solo lectura/decisión, sin ejecución.");
  void tick();
  setInterval(() => void tick(), config.loopMinutes * 60_000);
});
