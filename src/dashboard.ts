/**
 * Dashboard fintech — claro, limpio, institucional. HTML embebido.
 * Humanos ven esto en GET / ; los agentes (Accept: json) reciben el estado JSON.
 */
export function dashboardHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>yield-pilot · autonomous yield, every move justified</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Instrument+Sans:wght@400;500;600&family=Spline+Sans+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
  :root {
    --paper: #f7f6f1;
    --card: #ffffff;
    --ink: #10231a;
    --muted: #6b7a72;
    --hair: #e4e2d8;
    --green: #1d6b45;
    --green-soft: #e4f0e6;
    --mint: #4cc38a;
    --gold: #c99a2e;
    --red: #b4453a;
    --body: "Instrument Sans", sans-serif;
    --display: "Bricolage Grotesque", sans-serif;
    --mono: "Spline Sans Mono", monospace;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: var(--paper); color: var(--ink); font-family: var(--body); font-size: 15.5px; line-height: 1.6; }
  .wrap { max-width: 1000px; margin: 0 auto; padding: 0 28px 90px; }

  header { display: flex; align-items: center; gap: 14px; padding: 26px 0; }
  .logo { font-family: var(--display); font-weight: 700; font-size: 21px; letter-spacing: -.02em; }
  .logo em { font-style: normal; color: var(--green); }
  .badge { font-size: 12px; font-weight: 600; letter-spacing: .04em; padding: 4px 12px; border-radius: 100px; }
  .badge.dry { background: #f4ead2; color: #8a6a14; }
  .badge.live { background: var(--green-soft); color: var(--green); }
  header nav { margin-left: auto; display: flex; gap: 20px; font-size: 14px; }
  header a { color: var(--muted); text-decoration: none; font-weight: 500; }
  header a:hover { color: var(--green); }

  .hero { padding: 54px 0 20px; max-width: 720px; }
  h1 { font-family: var(--display); font-weight: 700; font-size: clamp(34px, 5.2vw, 56px); line-height: 1.04; letter-spacing: -.03em; }
  h1 .u { text-decoration: underline; text-decoration-color: var(--mint); text-decoration-thickness: 5px; text-underline-offset: 7px; }
  .lede { margin-top: 20px; color: var(--muted); font-size: 17px; max-width: 560px; }
  .lede b { color: var(--ink); font-weight: 600; }

  .strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1px; background: var(--hair);
    border: 1px solid var(--hair); border-radius: 14px; overflow: hidden; margin-top: 40px; }
  .cell { background: var(--card); padding: 18px 20px; }
  .cell .v { font-family: var(--display); font-size: 26px; font-weight: 600; letter-spacing: -.01em; }
  .cell .k { font-size: 12px; color: var(--muted); letter-spacing: .05em; text-transform: uppercase; margin-top: 2px; }

  h2 { font-family: var(--display); font-size: 22px; font-weight: 600; letter-spacing: -.02em; margin: 58px 0 18px; }
  h2 small { font-family: var(--body); font-size: 13px; color: var(--muted); font-weight: 400; margin-left: 10px; }

  .markets { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
  .mkt { background: var(--card); border: 1px solid var(--hair); border-radius: 14px; padding: 22px;
    transition: box-shadow .2s, transform .2s; }
  .mkt:hover { box-shadow: 0 10px 30px rgba(16,35,26,.08); transform: translateY(-2px); }
  .mkt .sym { font-family: var(--display); font-weight: 600; font-size: 17px; display: flex; justify-content: space-between; align-items: baseline; }
  .mkt .apr { font-family: var(--mono); color: var(--green); font-size: 22px; font-weight: 500; }
  .bar { height: 6px; background: var(--green-soft); border-radius: 4px; margin: 16px 0 10px; overflow: hidden; }
  .bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--mint), var(--green)); border-radius: 4px;
    width: 0; transition: width .8s cubic-bezier(.2,.8,.2,1); }
  .mkt .pos { font-size: 13px; color: var(--muted); }
  .mkt .pos b { color: var(--ink); font-family: var(--mono); font-weight: 500; }
  .mkt.best { border-color: var(--mint); }
  .mkt.best .sym::after { content: "best yield"; font-size: 11px; font-weight: 600; color: var(--green);
    background: var(--green-soft); padding: 2px 10px; border-radius: 100px; }

  .log { background: var(--card); border: 1px solid var(--hair); border-radius: 14px; overflow: hidden; }
  .row { display: grid; grid-template-columns: 170px 110px 1fr; gap: 14px; padding: 14px 20px; border-bottom: 1px solid var(--hair);
    font-size: 14px; align-items: baseline; }
  .row:last-child { border-bottom: 0; }
  .row time { font-family: var(--mono); font-size: 12.5px; color: var(--muted); }
  .k-hold { color: var(--muted); font-weight: 600; }
  .k-rebalance { color: var(--green); font-weight: 600; }
  .k-deploy_idle { color: var(--gold); font-weight: 600; }
  .row .why { color: var(--muted); }
  .empty { padding: 34px 20px; color: var(--muted); font-size: 14px; text-align: center; }

  .note { margin-top: 46px; background: var(--green-soft); border-radius: 14px; padding: 22px 24px; font-size: 14.5px; color: var(--green); }
  .note b { font-weight: 600; }
  footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid var(--hair); display: flex; gap: 22px;
    font-size: 13px; color: var(--muted); flex-wrap: wrap; }
  footer a { color: var(--muted); }
  @media (max-width: 640px) { .row { grid-template-columns: 1fr; gap: 4px; } }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <span class="logo">yield<em>·pilot</em></span>
    <span class="badge dry" id="modebadge">…</span>
    <nav>
      <a href="https://github.com/odiseo159-beep/yield-pilot" target="_blank" rel="noopener">GitHub</a>
      <a href="/decisions">Decision log</a>
      <a href="/health">Health</a>
    </nav>
  </header>

  <section class="hero">
    <h1>Autonomous yield.<br /><span class="u">Every move justified.</span></h1>
    <p class="lede">yield-pilot manages a stablecoin position across <b>Aave v3 Celo</b> and rebalances only when the
    real APY delta clears a threshold. Every decision — including <b>doing nothing</b> — is logged with its
    economic reason, publicly.</p>
    <div class="strip" id="strip">
      <div class="cell"><div class="v" id="s-best">—</div><div class="k">best supply APR</div></div>
      <div class="cell"><div class="v" id="s-pos">—</div><div class="k">position</div></div>
      <div class="cell"><div class="v" id="s-thr">—</div><div class="k">rebalance threshold</div></div>
      <div class="cell"><div class="v" id="s-cool">—</div><div class="k">cooldown</div></div>
    </div>
  </section>

  <h2>Markets <small>Aave v3 · Celo mainnet · live</small></h2>
  <div class="markets" id="markets"></div>

  <h2>Decision log <small>latest first · anti-farming by design</small></h2>
  <div class="log" id="log"><div class="empty">loading…</div></div>

  <div class="note"><b>Why this is not wash-volume:</b> the agent only moves capital when the APY delta clears the
  threshold and the cooldown has passed. The full decision history above is the audit trail — every on-chain
  transaction maps to a logged economic reason, and each one carries the ERC-8021 attribution tag.
  Pre-trade safety by <a href="https://github.com/odiseo159-beep/celo-sentinel" style="color:inherit">celo-sentinel</a>, paid per check via x402.</div>

  <footer>
    <span>yield-pilot · Agentic Payments &amp; DeFAI Hackathon · Track 1</span>
    <a href="https://github.com/odiseo159-beep/yield-pilot" target="_blank" rel="noopener">source</a>
    <a href="https://dune.com/celo/agentic-payments-defai-hackathon" target="_blank" rel="noopener">leaderboard</a>
  </footer>
</div>
<script>
  const fmt = (n) => "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
  async function load() {
    const st = await (await fetch("/", { headers: { accept: "application/json" } })).json();
    const badge = document.getElementById("modebadge");
    badge.textContent = st.dryRun ? "DRY RUN" : "LIVE";
    badge.className = "badge " + (st.dryRun ? "dry" : "live");

    const ms = st.markets ?? [];
    const best = [...ms].sort((a, b) => parseFloat(b.supplyApr) - parseFloat(a.supplyApr))[0];
    const totalPos = ms.reduce((s, m) => s + (m.position || 0), 0);
    document.getElementById("s-best").textContent = best ? best.supplyApr : "—";
    document.getElementById("s-pos").textContent = fmt(totalPos);
    document.getElementById("s-thr").textContent = (st.strategy.minApyDeltaBps / 100).toFixed(2) + " pp";
    document.getElementById("s-cool").textContent = st.strategy.cooldownHours + " h";

    const maxApr = Math.max(...ms.map(m => parseFloat(m.supplyApr)), 0.01);
    document.getElementById("markets").innerHTML = ms.map(m => \`
      <div class="mkt \${best && m.symbol === best.symbol ? "best" : ""}">
        <div class="sym">\${m.symbol}</div>
        <div class="apr">\${m.supplyApr}</div>
        <div class="bar"><i data-w="\${(parseFloat(m.supplyApr) / maxApr * 100).toFixed(0)}"></i></div>
        <div class="pos">position <b>\${fmt(m.position || 0)}</b></div>
      </div>\`).join("");
    requestAnimationFrame(() => requestAnimationFrame(() =>
      document.querySelectorAll(".bar i").forEach(i => i.style.width = i.dataset.w + "%")));

    const log = await (await fetch("/decisions")).json();
    const el = document.getElementById("log");
    if (!log.length) { el.innerHTML = '<div class="empty">no decisions yet — the agent evaluates every ' + (st.strategy.loopMinutes ?? 15) + ' minutes</div>'; return; }
    el.innerHTML = log.slice(-40).reverse().map(d => \`
      <div class="row">
        <time>\${d.at.replace("T", " ").slice(0, 19)} UTC</time>
        <span class="k-\${d.decision}">\${d.decision.replace("_", " ")}</span>
        <span class="why">\${d.reason || ""}\${d.txHashes?.length ? ' · <a href="https://celoscan.io/tx/' + d.txHashes[0] + '" target="_blank" rel="noopener">tx↗</a>' : ""}</span>
      </div>\`).join("");
  }
  load().catch(e => console.error(e));
  setInterval(load, 60_000);
</script>
</body>
</html>`;
}
