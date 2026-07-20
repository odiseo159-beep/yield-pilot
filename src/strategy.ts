import { config, type MarketSymbol } from "./config.js";
import type { MarketState } from "./apy.js";

export type Decision =
  | { kind: "hold"; reason: string; markets: MarketState[] }
  | {
      kind: "rebalance";
      from: MarketSymbol;
      to: MarketSymbol;
      amountUsd: number;
      deltaBps: number;
      reason: string;
      markets: MarketState[];
    }
  | {
      kind: "deploy_idle";
      /** mercado cuyo token está ocioso en la wallet (lo que realmente tenemos) */
      from: MarketSymbol;
      /** mejor mercado destino (si difiere de from, hay que swapear primero) */
      to: MarketSymbol;
      amountUsd: number;
      reason: string;
      markets: MarketState[];
    };

/**
 * Núcleo de la estrategia defendible:
 * - Solo rebalancea si el delta de APR supera MIN_APY_DELTA_BPS (por defecto 50 bps).
 * - Respeta cooldown entre movimientos (anti-churn — cada tx debe ser justificable
 *   ante los jueces como decisión económica real, no farming).
 * - Capital idle (sin depositar) se despliega al mejor mercado sin esperar delta.
 */
export function decide(markets: MarketState[], lastMoveAt: number | null): Decision {
  const best = [...markets].sort((a, b) => b.supplyAprBps - a.supplyAprBps)[0];

  // 1. Capital ocioso → siempre conviene desplegarlo al mejor mercado.
  const idleTotal = markets.reduce((s, m) => s + m.idle, 0);
  if (idleTotal > 1) {
    const idleMarket = markets.find((m) => m.idle > 1)!;
    return {
      kind: "deploy_idle",
      from: idleMarket.symbol,
      to: best.symbol,
      amountUsd: Math.min(idleMarket.idle, config.maxMoveUsd),
      reason: `Capital ocioso ($${idleTotal.toFixed(2)} ${idleMarket.symbol}) sin generar yield; mejor mercado: ${best.symbol} @ ${(best.supplyAprBps / 100).toFixed(2)}%`,
      markets,
    };
  }

  // 2. Cooldown activo → hold aunque haya delta.
  if (lastMoveAt !== null) {
    const hoursSince = (Date.now() - lastMoveAt) / 3_600_000;
    if (hoursSince < config.cooldownHours) {
      return {
        kind: "hold",
        reason: `Cooldown activo (${hoursSince.toFixed(1)}h de ${config.cooldownHours}h) — anti-churn.`,
        markets,
      };
    }
  }

  // 3. ¿La posición actual está en un mercado peor que el mejor disponible?
  const current = markets.filter((m) => m.position > 1).sort((a, b) => b.position - a.position)[0];
  if (!current) {
    return { kind: "hold", reason: "Sin posición ni capital ocioso (wallet vacía o DRY_RUN sin fondos).", markets };
  }
  const deltaBps = best.supplyAprBps - current.supplyAprBps;
  if (best.symbol !== current.symbol && deltaBps >= config.minApyDeltaBps) {
    return {
      kind: "rebalance",
      from: current.symbol,
      to: best.symbol,
      amountUsd: Math.min(current.position, config.maxMoveUsd),
      deltaBps,
      reason: `${best.symbol} rinde ${(deltaBps / 100).toFixed(2)}pp más que ${current.symbol} (${(best.supplyAprBps / 100).toFixed(2)}% vs ${(current.supplyAprBps / 100).toFixed(2)}%) — supera el umbral de ${(config.minApyDeltaBps / 100).toFixed(2)}pp.`,
      markets,
    };
  }

  return {
    kind: "hold",
    reason: `Posición en ${current.symbol} @ ${(current.supplyAprBps / 100).toFixed(2)}%; delta con el mejor (${best.symbol}) = ${(deltaBps / 100).toFixed(2)}pp < umbral ${(config.minApyDeltaBps / 100).toFixed(2)}pp.`,
    markets,
  };
}
