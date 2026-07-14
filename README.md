# yield-pilot ✈️

**Autonomous yield rebalancer on Celo — every move justified, every tx attributed.**

yield-pilot manages a stablecoin position across **Aave v3 Celo** markets (USDC / USDT / USDm) and rebalances **only when the real supply-APR delta exceeds a threshold**. It is deliberately not a volume machine: each decision — including the decision to do nothing — is logged with its economic reason and published at `/decisions`.

Built for the **Agentic Payments & DeFAI Hackathon** (Track 1 — Most Revenue Generated).

## How it works

Every `LOOP_MINUTES` the agent:

1. Reads live supply APRs from the Aave v3 Pool (`getReserveData`) and its own positions.
2. Decides:
   - **deploy_idle** — un-deposited capital goes to the best market immediately;
   - **rebalance** — move position only if `bestAPR − currentAPR ≥ MIN_APY_DELTA_BPS` (default 0.50pp) *and* the cooldown (default 8h) has passed;
   - **hold** — otherwise, with the reason logged.
3. Executes (withdraw → swap via Uniswap V3 SwapRouter02, best fee tier via QuoterV2 → supply), with:
   - **ERC-8021 attribution tag appended to every calldata** (`@celo/attribution-tags`);
   - a **pre-trade safety check against [celo-sentinel](https://github.com/odiseo159-beep/celo-sentinel)** — paid per request via x402 (`AVOID` aborts the move);
   - simulation before signing (reverts never reach the chain).

## Anti-farming by design

Track 1 rewards on-chain volume; the failure mode is wash-volume. yield-pilot's answer is radical transparency:

- APY-delta threshold + cooldown make every move an economically defensible decision.
- `GET /decisions` exposes the full decision log (JSONL) — judges can audit every tx against its reason.
- `GET /` exposes the live strategy parameters and current market view.

## Run

```bash
cp .env.example .env    # set SIGNER_PRIVATE_KEY, ATTRIBUTION_TAG when going live
npm install
npm run dev
```

`DRY_RUN=true` (default) reads mainnet and logs decisions without signing anything. Flip to `false` only with a funded signer and your attribution tag set.

## Stack

TypeScript · viem · `@bgd-labs/aave-address-book` · `@celo/attribution-tags` (ERC-8021) · `@x402/fetch` (paying sentinel checks) · Express (dashboard).

## License

MIT
