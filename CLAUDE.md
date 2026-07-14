# yield-pilot — Track 1 (Most Revenue Generated)

Contexto persistente del proyecto. Plan maestro en `../PLAN.md`.

## Por qué existe

Rebalanceador autónomo de yield en Celo para el hackathon Agentic Payments & DeFAI (Track 1: volumen on-chain con attribution tag; deadline 20 jul 09:00 GMT). Mueve ~$500 entre los mercados stables de **Aave v3 Celo** (USDC / USDT / USDm) solo cuando el delta de APR real supera el umbral.

**Encuadre honesto:** techo de volumen legítimo bajo — es upside sobre la apuesta principal (celo-sentinel/Track 2). La versión de alto volumen sería churn = farming = riesgo de DQ. NO convertirlo en eso.

## Defensa anti-farming (el corazón del diseño)

- Rebalancea SOLO si delta APR ≥ `MIN_APY_DELTA_BPS` (default 50 bps).
- Cooldown mínimo entre movimientos (`COOLDOWN_HOURS`, default 8h).
- Cada decisión (incluidos los hold) se loguea en `data/decisions.jsonl` con su razón económica y se expone en `GET /decisions` — transparencia total ante jueces.

## Arquitectura

```
src/config.ts    env + direcciones (address book oficial @bgd-labs/aave-address-book)
src/chain.ts     clientes viem + writeTagged (ERC-8021: APPEND del suffix al calldata)
src/apy.ts       lee supply APR (getReserveData, RAY→bps) y posiciones
src/strategy.ts  decide: deploy_idle | rebalance | hold
src/executor.ts  ejecuta: withdraw → swap (SwapRouter02, mejor fee via QuoterV2) → supply
src/sentinel.ts  check pre-operación contra celo-sentinel (x402 si SENTINEL_PAID)
src/index.ts     loop (LOOP_MINUTES) + dashboard express (/, /decisions, /health)
```

## Direcciones (verificadas)

```
AAVE_POOL       0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402  (AaveV3Celo.POOL)
SWAP_ROUTER_02  0x5615CDAb10dc425a742d643d949a7F474C01abc4  (verificado Blockscout)
QUOTER_V2       0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8
USDC 6dec / USDT 6dec / USDm=cUSD 18dec  → ver config.ts (address book)
```

## Invariantes

1. **`DRY_RUN=true` por defecto.** Solo pasar a false con: signer fondeado, `ATTRIBUTION_TAG` puesto, y UN swap de prueba verificado en el Dune del hackathon.
2. **Toda tx firmada pasa por `writeTagged`** — nunca `sendTransaction` directo. El tag se APPENDEA al calldata codificado (asignar `data = suffix` solo vale en transferencias vacías).
3. **Sentinel check antes de operar** un token (AVOID → aborta). Fail-open a CAUTION con allowlist (los 3 stables de Aave).
4. **Simulate antes de firmar** (`publicClient.call`) — si revierte, no se firma.
5. Secretos solo por env. La private key del signer NUNCA en código/git.

## Convenciones

- Código en inglés, comentarios narrativos en español (igual que celo-sentinel).
- Cantidades on-chain en base units bigint; en la capa de estrategia, unidades humanas number.
- Cambios de estrategia = actualizar también la sección "strategy" del descriptor en `GET /`.
