/**
 * Dashboard "Terminal" — señalética de aeropuerto: limpia, legible, wayfinding.
 * Split-flap board para el log, gauges como instrumentos, boarding pass sobrio.
 * HTML embebido. Humanos en GET / ; agentes (Accept: json) reciben el estado JSON.
 */
export function dashboardHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>YIELD PILOT — Terminal 1 · Aave v3 Celo</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Spline+Sans+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root {
    --bg: #f3f3f0;
    --card: #ffffff;
    --ink: #16181a;
    --muted: #64686c;
    --faint: #9aa0a4;
    --line: #e2e2dd;
    --sign: #1b1d20;
    --sign-text: #f4f5f6;
    --yellow: #ffd60a;
    --green: #157a4a;
    --green-soft: #e7f2ea;
    --mint: #2fbf7f;
    --amber: #ffb000;
    --board: #131511;
    --board-2: #191c16;
    --red: #c8442e;
    --sans: "Archivo", sans-serif;
    --mono: "Spline Sans Mono", monospace;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: var(--bg); color: var(--ink); font-family: var(--sans); font-size: 15.5px;
    line-height: 1.6; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 1060px; margin: 0 auto; padding: 0 28px 90px; }

  @keyframes up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
  .r1 { opacity: 0; animation: up .5s cubic-bezier(.2,.7,.2,1) .05s forwards; }
  .r2 { opacity: 0; animation: up .5s cubic-bezier(.2,.7,.2,1) .16s forwards; }
  .r3 { opacity: 0; animation: up .5s cubic-bezier(.2,.7,.2,1) .3s forwards; }
  .r4 { opacity: 0; animation: up .5s cubic-bezier(.2,.7,.2,1) .44s forwards; }

  /* ── TICKER (franja informativa fina, estilo FIDS) ── */
  .ticker { background: var(--sign); color: #cfd3d6; font-family: var(--mono); font-size: 12px;
    letter-spacing: .1em; text-transform: uppercase; overflow: hidden; white-space: nowrap; }
  .ticker .roll { display: inline-block; padding: 8px 0; animation: roll 30s linear infinite; }
  @keyframes roll { to { transform: translateX(-50%); } }
  .ticker b { color: var(--yellow); font-weight: 600; }
  .ticker .up { color: var(--mint); }

  /* ── HEADER señalética ── */
  header { display: flex; align-items: center; gap: 14px; padding: 22px 0; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .gate-chip { background: var(--yellow); color: var(--ink); font-family: var(--mono); font-weight: 700;
    font-size: 15px; padding: 8px 11px; border-radius: 8px; letter-spacing: .02em; }
  .brand .name { font-weight: 800; font-size: 20px; letter-spacing: .01em; }
  .brand .name span { color: var(--green); }
  .brand small { display: block; font-family: var(--mono); font-size: 9.5px; letter-spacing: .24em;
    color: var(--faint); text-transform: uppercase; margin-top: 1px; }
  header nav { margin-left: auto; display: flex; gap: 8px; }
  header a { color: var(--ink); text-decoration: none; font-size: 13.5px; font-weight: 600;
    padding: 8px 16px; border-radius: 100px; border: 1.5px solid var(--line); background: var(--card); }
  header a:hover { border-color: var(--ink); }

  /* ── HERO ── */
  .hero { display: grid; grid-template-columns: 1.1fr .9fr; gap: 48px; align-items: center; padding: 52px 0 26px; }
  h1 { font-weight: 800; font-size: clamp(38px, 5.6vw, 62px); line-height: 1.04; letter-spacing: -.025em; }
  h1 em { font-style: normal; color: var(--green); }
  .lede { margin-top: 18px; color: var(--muted); font-size: 16.5px; max-width: 470px; }
  .lede b { color: var(--ink); font-weight: 600; }
  .tagchip { display: inline-flex; align-items: center; gap: 8px; margin-top: 22px; font-family: var(--mono);
    font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--green);
    background: var(--green-soft); padding: 8px 16px; border-radius: 100px; }
  .tagchip::before { content: "✓"; font-weight: 700; }

  /* ── BOARDING PASS sobrio ── */
  .pass { background: var(--card); border: 1.5px solid var(--line); border-radius: 16px; overflow: hidden;
    box-shadow: 0 1px 2px rgba(22,24,26,.05), 0 16px 40px -22px rgba(22,24,26,.25); }
  .pass-head { background: var(--sign); color: var(--sign-text); padding: 11px 22px; display: flex;
    justify-content: space-between; align-items: center; font-family: var(--mono); font-size: 11px;
    letter-spacing: .18em; text-transform: uppercase; }
  .pass-head b { color: var(--yellow); }
  .pass-route { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 10px; }
  .pass-route .port { text-align: center; }
  .pass-route .code { font-weight: 800; font-size: 40px; letter-spacing: -.01em; line-height: 1; }
  .pass-route .apr { font-family: var(--mono); font-size: 12.5px; color: var(--muted); margin-top: 4px; }
  .pass-route .to .code { color: var(--green); }
  .pass-route .arrow { flex: 1; position: relative; height: 1.5px; margin: 0 20px; background: var(--line); }
  .pass-route .arrow::before { content: ""; position: absolute; inset: 0;
    background: repeating-linear-gradient(90deg, var(--ink) 0 7px, transparent 7px 14px); opacity: .5; }
  .pass-route .arrow::after { content: "✈"; position: absolute; right: -2px; top: -12px; font-size: 17px;
    animation: taxi 4s ease-in-out infinite; }
  @keyframes taxi { 50% { transform: translateX(-8px); } }
  .pass-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 14px; padding: 14px 24px 20px; }
  .pass-grid .f { min-width: 0; }
  .pass-grid .l { font-family: var(--mono); font-size: 9px; letter-spacing: .2em; color: var(--faint); text-transform: uppercase; }
  .pass-grid .v { font-family: var(--mono); font-size: 13.5px; font-weight: 600; margin-top: 3px; }
  .pass-tear { border-top: 1.5px dashed var(--line); position: relative; padding: 13px 24px; display: flex;
    align-items: center; gap: 16px; }
  .pass-tear::before, .pass-tear::after { content: ""; position: absolute; top: -11px; width: 20px; height: 20px;
    border-radius: 50%; background: var(--bg); border: 1.5px solid var(--line); }
  .pass-tear::before { left: -12px; } .pass-tear::after { right: -12px; }
  .barcode { height: 30px; flex: 1; opacity: .85; background: repeating-linear-gradient(90deg,
    var(--ink) 0 2px, transparent 2px 5px, var(--ink) 5px 9px, transparent 9px 11px,
    var(--ink) 11px 12px, transparent 12px 16px); }
  .modechip { font-family: var(--mono); font-size: 11px; font-weight: 700; letter-spacing: .14em;
    text-transform: uppercase; padding: 6px 14px; border-radius: 100px; }
  .modechip.dry { background: #fff6d6; color: #8a6d00; border: 1.5px solid var(--yellow); }
  .modechip.live { background: var(--green-soft); color: var(--green); border: 1.5px solid var(--mint); }

  /* ── SECTION SIGNS (barras de señalética) ── */
  .sign-bar { display: flex; align-items: stretch; margin: 60px 0 22px; border-radius: 12px; overflow: hidden;
    box-shadow: 0 1px 2px rgba(22,24,26,.06); }
  .sign-bar .num { background: var(--yellow); color: var(--ink); font-family: var(--mono); font-weight: 700;
    font-size: 15px; display: flex; align-items: center; padding: 0 16px; }
  .sign-bar .txt { background: var(--sign); color: var(--sign-text); font-weight: 700; font-size: 15px;
    letter-spacing: .06em; text-transform: uppercase; display: flex; align-items: center; gap: 12px;
    padding: 13px 20px; flex: 1; }
  .sign-bar .txt small { font-family: var(--mono); font-size: 10.5px; font-weight: 400; color: #9aa0a4;
    letter-spacing: .14em; }

  /* ── GAUGES ── */
  .gauges { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; }
  .gauge { background: var(--card); border: 1.5px solid var(--line); border-radius: 16px; padding: 22px 20px 18px;
    text-align: center; position: relative; overflow: hidden; transition: transform .2s, box-shadow .2s; }
  .gauge:hover { transform: translateY(-3px); box-shadow: 0 14px 34px -16px rgba(22,24,26,.28); }
  .gauge svg { width: 168px; height: 98px; color: var(--faint); }
  .gauge .sym { font-weight: 800; font-size: 17px; margin-top: 2px; }
  .gauge .apr { font-family: var(--mono); font-size: 26px; font-weight: 700; margin-top: 2px; color: var(--green);
    font-variant-numeric: tabular-nums; }
  .gauge .pos { font-family: var(--mono); font-size: 11px; color: var(--faint); margin-top: 6px;
    letter-spacing: .08em; text-transform: uppercase; }
  .gauge.best { border-color: var(--ink); border-width: 2px; }
  .gauge.best .bestchip { position: absolute; top: 12px; right: 12px; background: var(--yellow); color: var(--ink);
    font-family: var(--mono); font-size: 9.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
    padding: 4px 10px; border-radius: 6px; }
  .needle { transition: transform 1.3s cubic-bezier(.3,.9,.4,1.08); transform-origin: 84px 86px; }

  /* ── DEPARTURE BOARD ── */
  .board { background: var(--board); border-radius: 16px; overflow: hidden;
    box-shadow: 0 20px 50px -24px rgba(22,24,26,.5); }
  .board-head { display: grid; grid-template-columns: 105px 145px 1fr 64px; gap: 14px; padding: 15px 22px 11px;
    font-family: var(--mono); font-size: 10px; letter-spacing: .26em; color: #6d7568; text-transform: uppercase;
    border-bottom: 1px solid #262a22; }
  .board-rows { padding: 6px 0 10px; max-height: 420px; overflow-y: auto; }
  .brow { display: grid; grid-template-columns: 105px 145px 1fr 64px; gap: 14px; padding: 10px 22px;
    font-family: var(--mono); font-size: 13px; letter-spacing: .04em; align-items: baseline; }
  .brow > * { min-width: 0; }
  .brow:nth-child(odd) { background: var(--board-2); }
  .brow time { color: var(--amber); font-variant-numeric: tabular-nums; font-size: 12px; }
  .brow .st { font-weight: 700; text-transform: uppercase; letter-spacing: .12em; }
  .st-hold { color: #aeb6a8; }
  .st-rebalance { color: var(--mint); }
  .st-deploy_idle { color: var(--yellow); }
  .brow .rem { color: #8f978a; font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .brow .rem a { color: var(--mint); }
  .brow .gate { color: #6d7568; text-transform: uppercase; font-size: 11px; }
  .brow.now .st::after { content: "▌"; animation: cur 1.1s steps(1) infinite; margin-left: 4px; }
  @keyframes cur { 50% { opacity: 0; } }
  .board-empty { padding: 40px; text-align: center; font-family: var(--mono); font-size: 12.5px; color: #6d7568;
    letter-spacing: .12em; text-transform: uppercase; }

  /* ── MANIFEST ── */
  .manifest { margin-top: 54px; background: var(--card); border: 1.5px solid var(--line); border-radius: 16px;
    padding: 26px 30px; display: grid; grid-template-columns: auto 1fr; gap: 20px; align-items: start; }
  .manifest .icon { background: var(--yellow); border-radius: 12px; width: 46px; height: 46px; display: flex;
    align-items: center; justify-content: center; font-size: 22px; }
  .manifest .t { font-weight: 800; font-size: 17px; margin-bottom: 6px; }
  .manifest p { color: var(--muted); font-size: 14.5px; max-width: 780px; }
  .manifest b { color: var(--ink); font-weight: 600; }
  .manifest a { color: var(--green); font-weight: 600; }

  footer { margin-top: 56px; padding-top: 20px; border-top: 1.5px solid var(--line); display: flex; gap: 22px;
    font-family: var(--mono); font-size: 11px; letter-spacing: .06em; color: var(--faint); flex-wrap: wrap;
    text-transform: uppercase; align-items: baseline; }
  footer a { color: var(--faint); }
  footer .addr { margin-left: auto; text-transform: none; }

  @media (max-width: 860px) {
    .hero { grid-template-columns: 1fr; gap: 34px; }
    .board-head, .brow { grid-template-columns: 90px 120px 1fr; }
    .board-head span:last-child, .brow .gate { display: none; }
    .manifest { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
<div class="ticker"><div class="roll" id="ticker"><span>· YIELD PILOT · TERMINAL 1 · LOADING MARKET DATA ·</span></div></div>
<div class="wrap">
  <header class="r1">
    <div class="brand">
      <span class="gate-chip">T1</span>
      <div>
        <div class="name">YIELD <span>PILOT</span></div>
        <small>flight operations · celo</small>
      </div>
    </div>
    <nav>
      <a href="https://github.com/odiseo159-beep/yield-pilot" target="_blank" rel="noopener">GitHub</a>
      <a href="/decisions">Log</a>
      <a href="/health">Health</a>
    </nav>
  </header>

  <section class="hero">
    <div>
      <h1 class="r1">Autonomous yield.<br /><em>Every move justified.</em></h1>
      <p class="lede r2">A rebalancing agent for <b>Aave v3 on Celo</b> that only files a flight plan when the
      real APY delta clears its threshold — and keeps a public record of <b>every decision</b>, including staying grounded.</p>
      <span class="tagchip r3">anti-farming by design</span>
    </div>
    <div class="pass r2">
      <div class="pass-head"><span>Boarding pass</span><b>Route 8021</b></div>
      <div class="pass-route">
        <div class="port from"><div class="code" id="p-from">···</div><div class="apr" id="p-fromapr">—</div></div>
        <div class="arrow"></div>
        <div class="port to"><div class="code" id="p-to">···</div><div class="apr" id="p-toapr">—</div></div>
      </div>
      <div class="pass-grid">
        <div class="f"><div class="l">Passenger</div><div class="v" id="p-pax">STABLE CAPITAL</div></div>
        <div class="f"><div class="l">Gate</div><div class="v">AAVE V3</div></div>
        <div class="f"><div class="l">Seat</div><div class="v">42220A</div></div>
        <div class="f"><div class="l">Threshold</div><div class="v" id="p-thr">—</div></div>
        <div class="f"><div class="l">Cooldown</div><div class="v" id="p-cool">—</div></div>
        <div class="f"><div class="l">Decisions</div><div class="v" id="p-dec">—</div></div>
      </div>
      <div class="pass-tear">
        <div class="barcode"></div>
        <span class="modechip dry" id="p-mode">…</span>
      </div>
    </div>
  </section>

  <div class="sign-bar r3"><span class="num">01</span><span class="txt">Instruments <small>live supply APR · Aave v3 Celo</small></span></div>
  <div class="gauges r3" id="gauges"></div>

  <div class="sign-bar r4"><span class="num">02</span><span class="txt">Departures <small>the flight log · latest first</small></span></div>
  <div class="board r4">
    <div class="board-head"><span>Time</span><span>Status</span><span>Remarks</span><span>Gate</span></div>
    <div class="board-rows" id="board"><div class="board-empty">awaiting first evaluation…</div></div>
  </div>

  <div class="manifest r4">
    <div class="icon">🛄</div>
    <div>
      <div class="t">Why this is not wash-volume</div>
      <p>The agent moves only when the APY delta clears the threshold <b>and</b> the cooldown has passed. The
      departure board above is the audit trail: every on-chain transaction maps to a logged economic reason and
      carries the <b>ERC-8021 attribution tag</b>. Pre-flight safety checks by
      <a href="https://celo-sentinel.vercel.app" target="_blank" rel="noopener">celo-sentinel</a> — one x402
      micropayment per check. Agents paying agents, for real work.</p>
    </div>
  </div>

  <footer>
    <span>Yield Pilot · Agentic Payments &amp; DeFAI Hackathon · Track 1</span>
    <a href="https://github.com/odiseo159-beep/yield-pilot" target="_blank" rel="noopener">Source</a>
    <a href="https://dune.com/celo/agentic-payments-defai-hackathon" target="_blank" rel="noopener">Leaderboard</a>
    <span class="addr" id="signer"></span>
  </footer>
</div>
<script>
  const fmt = (n) => "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const rel = (iso) => {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 90) return "NOW";
    if (s < 5400) return Math.round(s / 60) + "M AGO";
    if (s < 129600) return Math.round(s / 3600) + "H AGO";
    return Math.round(s / 86400) + "D AGO";
  };
  function gaugeSvg(id) {
    let ticks = "";
    for (let i = 0; i <= 8; i++) {
      const a = (-90 + i * 22.5) * Math.PI / 180;
      const x1 = 84 + Math.sin(a) * 60, y1 = 86 - Math.cos(a) * 60;
      const x2 = 84 + Math.sin(a) * 68, y2 = 86 - Math.cos(a) * 68;
      ticks += \`<line x1="\${x1}" y1="\${y1}" x2="\${x2}" y2="\${y2}" stroke="currentColor" stroke-width="\${i % 2 ? 1 : 2}" opacity=".6"/>\`;
    }
    return \`<svg viewBox="0 0 168 98">
      <path d="M 16 86 A 68 68 0 0 1 152 86" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35"/>
      \${ticks}
      <g class="needle" id="\${id}"><line x1="84" y1="86" x2="84" y2="26" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><circle cx="84" cy="86" r="5.5" fill="var(--ink)"/><circle cx="84" cy="86" r="2" fill="var(--yellow)"/></g>
    </svg>\`;
  }
  async function load() {
    const st = await (await fetch("/", { headers: { accept: "application/json" } })).json();
    const ms = st.markets ?? [];
    const sorted = [...ms].sort((a, b) => parseFloat(b.supplyApr) - parseFloat(a.supplyApr));
    const best = sorted[0], worst = sorted[sorted.length - 1];
    const totalPos = ms.reduce((s, m) => s + (m.position || 0), 0);

    const t = ms.map(m => \`\${m.symbol} <b>\${m.supplyApr}</b>\`).join(" · ");
    const seg = \`· TERMINAL 1 · AAVE V3 CELO · \${t} · UNDER MGMT <b>\${fmt(totalPos)}</b> · MODE <span class="up">\${st.dryRun ? "DRY RUN" : "LIVE"}</span> \`;
    document.getElementById("ticker").innerHTML = "<span>" + seg + seg + "</span>";

    if (best && worst) {
      document.getElementById("p-from").textContent = worst.symbol;
      document.getElementById("p-fromapr").textContent = worst.supplyApr;
      document.getElementById("p-to").textContent = best.symbol;
      document.getElementById("p-toapr").textContent = best.supplyApr;
    }
    document.getElementById("p-pax").textContent = totalPos > 0 ? fmt(totalPos) + " STABLES" : "AWAITING FUNDS";
    document.getElementById("p-thr").textContent = (st.strategy.minApyDeltaBps / 100).toFixed(2) + " PP";
    document.getElementById("p-cool").textContent = st.strategy.cooldownHours + " H";
    const mode = document.getElementById("p-mode");
    mode.textContent = st.dryRun ? "DRY RUN" : "LIVE";
    mode.className = "modechip " + (st.dryRun ? "dry" : "live");
    if (st.signer) document.getElementById("signer").textContent = st.signer.slice(0, 10) + "…" + st.signer.slice(-6);

    const maxScale = Math.max(4, Math.ceil(Math.max(...ms.map(m => parseFloat(m.supplyApr)))));
    document.getElementById("gauges").innerHTML = ms.map((m, i) => \`
      <div class="gauge \${best && m.symbol === best.symbol ? "best" : ""}">
        \${best && m.symbol === best.symbol ? '<span class="bestchip">best yield</span>' : ""}
        \${gaugeSvg("nd" + i)}
        <div class="sym">\${m.symbol}</div>
        <div class="apr">\${m.supplyApr}</div>
        <div class="pos">position \${fmt(m.position || 0)}</div>
      </div>\`).join("");
    requestAnimationFrame(() => requestAnimationFrame(() => ms.forEach((m, i) => {
      const deg = Math.min(90, -90 + (parseFloat(m.supplyApr) / maxScale) * 180);
      const el = document.getElementById("nd" + i);
      if (el) el.style.transform = "rotate(" + deg + "deg)";
    })));

    const log = await (await fetch("/decisions")).json();
    document.getElementById("p-dec").textContent = log.length;
    const el = document.getElementById("board");
    if (!log.length) {
      el.innerHTML = '<div class="board-empty">no departures yet — next evaluation in ' + (st.strategy.loopMinutes ?? 15) + ' min</div>';
      return;
    }
    // Consecutive identical HOLDs (repetitive, expected, boring) collapse into one
    // row so the real moves -- rebalance / deploy_idle -- keep the spotlight.
    const recent = log.slice(-200).reverse();
    const groups = [];
    for (const d of recent) {
      const prev = groups[groups.length - 1];
      if (d.decision === "hold" && prev && prev.decision === "hold" && prev.reason === d.reason) {
        prev.count++; prev.oldestAt = d.at;
      } else {
        groups.push({ decision: d.decision, reason: d.reason, txHashes: d.txHashes, at: d.at, oldestAt: d.at, count: 1 });
      }
    }
    el.innerHTML = groups.slice(0, 40).map((g, i) => \`
      <div class="brow \${i === 0 ? "now" : ""}">
        <time title="\${g.at}">\${g.count > 1 ? rel(g.at) + " – " + rel(g.oldestAt) : rel(g.at)}</time>
        <span class="st st-\${g.decision}">\${g.decision.replace("_", " ")}\${g.count > 1 ? " ×" + g.count : ""}</span>
        <span class="rem">\${g.reason || ""}\${g.txHashes?.length ? ' · <a href="https://celoscan.io/tx/' + g.txHashes[0] + '" target="_blank" rel="noopener">TX↗</a>' : ""}</span>
        <span class="gate">AAVE</span>
      </div>\`).join("");
  }
  load().catch(e => console.error(e));
  setInterval(load, 60_000);
</script>
</body>
</html>`;
}
