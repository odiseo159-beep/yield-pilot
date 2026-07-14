/**
 * Dashboard "Flight Operations Center" — aviación vintage x reporte financiero.
 * Boarding pass, gauges analógicos, departure board. HTML embebido.
 * Humanos en GET / ; agentes (Accept: json) reciben el estado JSON.
 */
export function dashboardHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>YIELD·PILOT — flight operations · Aave v3 Celo</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&family=Spline+Sans+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root {
    --cream: #f2ecdd;
    --cream-2: #eae2cd;
    --card: #faf6ea;
    --ink: #142519;
    --muted: #5e6f60;
    --faint: #8d9c8d;
    --line: #cfc6ac;
    --green: #14472e;
    --green-bright: #1e7a4a;
    --mint: #35b877;
    --orange: #e8541e;
    --orange-soft: #fbe3d6;
    --board: #10150f;
    --board-2: #161d14;
    --amber: #ffb000;
    --display: "Bricolage Grotesque", sans-serif;
    --body: "Instrument Sans", sans-serif;
    --mono: "Spline Sans Mono", monospace;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: var(--cream); color: var(--ink); font-family: var(--body); font-size: 15.5px;
    line-height: 1.6; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  /* grano + halftone sutil */
  body::before { content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: .5;
    background-image: radial-gradient(rgba(20,37,25,.05) 1px, transparent 1.4px); background-size: 22px 22px; }

  @keyframes up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
  .r1 { opacity: 0; animation: up .6s cubic-bezier(.2,.7,.2,1) .05s forwards; }
  .r2 { opacity: 0; animation: up .6s cubic-bezier(.2,.7,.2,1) .2s forwards; }
  .r3 { opacity: 0; animation: up .6s cubic-bezier(.2,.7,.2,1) .38s forwards; }
  .r4 { opacity: 0; animation: up .6s cubic-bezier(.2,.7,.2,1) .55s forwards; }

  /* ── TICKER ── */
  .ticker { background: var(--green); color: var(--cream); font-family: var(--mono); font-size: 12.5px;
    letter-spacing: .12em; text-transform: uppercase; overflow: hidden; white-space: nowrap;
    border-bottom: 3px solid var(--ink); position: relative; z-index: 2; }
  .ticker .roll { display: inline-block; padding: 9px 0; animation: roll 28s linear infinite; }
  @keyframes roll { to { transform: translateX(-50%); } }
  .ticker b { color: var(--amber); font-weight: 600; }
  .ticker .up { color: var(--mint); }

  .wrap { position: relative; z-index: 1; max-width: 1080px; margin: 0 auto; padding: 0 28px 90px; }

  header { display: flex; align-items: center; gap: 16px; padding: 26px 0 20px; border-bottom: 2px solid var(--ink); }
  .logo { font-family: var(--display); font-weight: 800; font-size: 24px; letter-spacing: -.03em; }
  .logo em { font-style: normal; color: var(--orange); }
  .logo small { font-family: var(--mono); font-size: 9.5px; letter-spacing: .3em; color: var(--muted);
    display: block; margin-top: -4px; text-transform: uppercase; }
  header nav { margin-left: auto; display: flex; gap: 4px; }
  header a { color: var(--ink); text-decoration: none; font-family: var(--mono); font-size: 12px;
    text-transform: uppercase; letter-spacing: .1em; padding: 7px 14px; border: 1.5px solid transparent; border-radius: 100px; }
  header a:hover { border-color: var(--ink); background: var(--card); }

  /* ── HERO ── */
  .hero { display: grid; grid-template-columns: 1.15fr .85fr; gap: 40px; align-items: center; padding: 58px 0 30px; }
  h1 { font-family: var(--display); font-weight: 800; font-size: clamp(46px, 7vw, 88px); line-height: .94;
    letter-spacing: -.04em; text-transform: uppercase; }
  h1 .solid { display: block; }
  h1 .outline { display: block; color: transparent; -webkit-text-stroke: 2.5px var(--green); }
  h1 .tail { display: block; color: var(--orange); font-size: .55em; letter-spacing: -.02em; margin-top: 6px; }
  .lede { margin-top: 20px; color: var(--muted); font-size: 16.5px; max-width: 480px; }
  .lede b { color: var(--ink); font-weight: 600; }
  .stamp { display: inline-block; margin-top: 24px; font-family: var(--mono); font-weight: 700; font-size: 13px;
    letter-spacing: .18em; text-transform: uppercase; color: var(--orange); border: 3px double var(--orange);
    border-radius: 8px; padding: 8px 18px; transform: rotate(-3deg); opacity: .9;
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='40'%3E%3Crect width='100' height='40' fill='white'/%3E%3C/svg%3E"); }

  /* ── BOARDING PASS ── */
  .pass { background: var(--card); border: 2px solid var(--ink); border-radius: 18px; transform: rotate(2deg);
    box-shadow: 8px 10px 0 rgba(20,37,25,.16); overflow: hidden; position: relative; transition: transform .3s; }
  .pass:hover { transform: rotate(.5deg) translateY(-4px); }
  .pass-head { background: var(--green); color: var(--cream); padding: 12px 22px; display: flex;
    justify-content: space-between; align-items: baseline; font-family: var(--mono); font-size: 11px;
    letter-spacing: .2em; text-transform: uppercase; }
  .pass-head b { color: var(--amber); }
  .pass-route { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 8px; }
  .pass-route .port { text-align: center; }
  .pass-route .code { font-family: var(--display); font-weight: 800; font-size: 42px; letter-spacing: -.02em; line-height: 1; }
  .pass-route .apr { font-family: var(--mono); font-size: 13px; color: var(--muted); margin-top: 2px; }
  .pass-route .to .code { color: var(--green-bright); }
  .pass-route .arrow { flex: 1; position: relative; height: 2px; margin: 0 18px;
    background: repeating-linear-gradient(90deg, var(--ink) 0 8px, transparent 8px 15px); }
  .pass-route .arrow::after { content: "✈"; position: absolute; right: -4px; top: -13px; font-size: 19px;
    animation: taxi 4s ease-in-out infinite; }
  @keyframes taxi { 50% { transform: translateX(-9px); } }
  .pass-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 14px; padding: 16px 24px 20px; }
  .pass-grid .f .l { font-family: var(--mono); font-size: 9px; letter-spacing: .22em; color: var(--faint); text-transform: uppercase; }
  .pass-grid .f .v { font-family: var(--mono); font-size: 13.5px; font-weight: 600; margin-top: 2px; }
  .pass-tear { border-top: 2px dashed var(--line); position: relative; padding: 14px 24px; display: flex;
    align-items: center; justify-content: space-between; gap: 14px; }
  .pass-tear::before, .pass-tear::after { content: ""; position: absolute; top: -12px; width: 22px; height: 22px;
    border-radius: 50%; background: var(--cream); border: 2px solid var(--ink); }
  .pass-tear::before { left: -13px; } .pass-tear::after { right: -13px; }
  .barcode { height: 34px; flex: 1; background: repeating-linear-gradient(90deg,
    var(--ink) 0 2px, transparent 2px 5px, var(--ink) 5px 9px, transparent 9px 11px,
    var(--ink) 11px 12px, transparent 12px 16px); }
  .pass-tear .mode { font-family: var(--mono); font-size: 11px; font-weight: 700; letter-spacing: .18em;
    text-transform: uppercase; padding: 6px 12px; border-radius: 6px; }
  .mode.dry { background: var(--orange-soft); color: var(--orange); border: 1.5px dashed var(--orange); }
  .mode.live { background: #dff0e2; color: var(--green-bright); border: 1.5px solid var(--green-bright); }

  /* ── SECTION TITLES ── */
  h2 { font-family: var(--display); font-weight: 800; font-size: 15px; letter-spacing: .24em; text-transform: uppercase;
    margin: 66px 0 26px; display: flex; align-items: center; gap: 16px; }
  h2::after { content: ""; flex: 1; height: 2px; background: var(--ink); }
  h2 .no { color: var(--orange); font-family: var(--mono); }

  /* ── GAUGES ── */
  .gauges { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; }
  .gauge { background: var(--card); border: 2px solid var(--ink); border-radius: 18px; padding: 22px 20px 18px;
    text-align: center; position: relative; overflow: hidden; transition: transform .25s, box-shadow .25s; }
  .gauge:hover { transform: translateY(-4px); box-shadow: 6px 8px 0 rgba(20,37,25,.14); }
  .gauge.best { background: var(--green); border-color: var(--green); color: var(--cream); }
  .gauge.best .sym, .gauge.best .apr { color: var(--cream); }
  .gauge.best .flagbest { position: absolute; top: 14px; right: -32px; transform: rotate(38deg); background: var(--orange);
    color: #fff; font-family: var(--mono); font-size: 9.5px; letter-spacing: .16em; padding: 4px 38px; text-transform: uppercase; }
  .gauge svg { width: 170px; height: 100px; }
  .gauge .sym { font-family: var(--display); font-weight: 800; font-size: 18px; letter-spacing: .02em; }
  .gauge .apr { font-family: var(--mono); font-size: 27px; font-weight: 700; margin-top: 2px; color: var(--green-bright);
    font-variant-numeric: tabular-nums; }
  .gauge .pos { font-family: var(--mono); font-size: 11.5px; color: var(--faint); margin-top: 6px;
    letter-spacing: .08em; text-transform: uppercase; }
  .gauge.best .pos { color: #9dbfa6; }
  .needle { transition: transform 1.4s cubic-bezier(.3,.9,.35,1.1); transform-origin: 85px 88px; }

  /* ── DEPARTURE BOARD ── */
  .board { background: var(--board); border: 2px solid var(--ink); border-radius: 18px; overflow: hidden;
    box-shadow: 8px 10px 0 rgba(20,37,25,.16); }
  .board-head { display: grid; grid-template-columns: 110px 150px 1fr 70px; gap: 14px; padding: 14px 22px 10px;
    font-family: var(--mono); font-size: 10px; letter-spacing: .28em; color: #67785f; text-transform: uppercase;
    border-bottom: 1px solid #26301f; }
  .board-rows { padding: 6px 0 10px; max-height: 420px; overflow-y: auto; }
  .brow { display: grid; grid-template-columns: 110px 150px 1fr 70px; gap: 14px; padding: 9px 22px;
    font-family: var(--mono); font-size: 13px; letter-spacing: .06em; align-items: baseline; }
  .brow:nth-child(odd) { background: var(--board-2); }
  .brow > * { min-width: 0; } /* evita grid blowout con remarks nowrap */
  .brow time { color: #7d8f73; font-variant-numeric: tabular-nums; }
  .brow .st { font-weight: 700; text-transform: uppercase; letter-spacing: .14em; }
  .st-hold { color: #b9c4ae; }
  .st-rebalance { color: var(--mint); text-shadow: 0 0 12px rgba(53,184,119,.55); }
  .st-deploy_idle { color: var(--amber); text-shadow: 0 0 12px rgba(255,176,0,.45); }
  .brow .rem { color: #93a389; font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .brow .rem a { color: var(--mint); }
  .brow .gate { color: #67785f; text-transform: uppercase; font-size: 11px; }
  .brow.now .st::after { content: "▌"; animation: cur 1.1s steps(1) infinite; margin-left: 4px; }
  @keyframes cur { 50% { opacity: 0; } }
  .board-empty { padding: 40px; text-align: center; font-family: var(--mono); font-size: 13px; color: #67785f;
    letter-spacing: .1em; text-transform: uppercase; }

  /* ── MANIFEST ── */
  .manifest { margin-top: 54px; border: 3px double var(--ink); border-radius: 18px; padding: 28px 32px;
    background: var(--card); position: relative; }
  .manifest .t { font-family: var(--display); font-weight: 800; font-size: 19px; text-transform: uppercase;
    letter-spacing: .04em; margin-bottom: 10px; }
  .manifest p { color: var(--muted); font-size: 14.5px; max-width: 760px; }
  .manifest b { color: var(--ink); }
  .manifest a { color: var(--green-bright); font-weight: 600; }
  .manifest .seal { position: absolute; right: 26px; top: -22px; background: var(--orange); color: #fff;
    font-family: var(--mono); font-size: 10.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
    padding: 10px 16px; border-radius: 100px; transform: rotate(4deg); box-shadow: 3px 4px 0 rgba(20,37,25,.25); }

  footer { margin-top: 60px; padding-top: 22px; border-top: 2px solid var(--ink); display: flex; gap: 24px;
    font-family: var(--mono); font-size: 11.5px; letter-spacing: .08em; color: var(--muted); flex-wrap: wrap;
    text-transform: uppercase; align-items: baseline; }
  footer a { color: var(--muted); }
  footer .addr { margin-left: auto; text-transform: none; }

  @media (max-width: 860px) {
    .hero { grid-template-columns: 1fr; }
    .pass { transform: rotate(0); }
    .board-head, .brow { grid-template-columns: 90px 120px 1fr; }
    .board-head span:last-child, .brow .gate { display: none; }
  }
</style>
</head>
<body>
<div class="ticker"><div class="roll" id="ticker"><span>· YIELD·PILOT FLIGHT OPS · LOADING MARKET DATA ·</span></div></div>
<div class="wrap">
  <header class="r1">
    <span class="logo">YIELD<em>·</em>PILOT<small>flight operations · celo</small></span>
    <nav>
      <a href="https://github.com/odiseo159-beep/yield-pilot" target="_blank" rel="noopener">GitHub</a>
      <a href="/decisions">Log</a>
      <a href="/health">Health</a>
    </nav>
  </header>

  <section class="hero">
    <div>
      <h1 class="r1"><span class="solid">Autonomous</span><span class="outline">yield.</span><span class="tail">every move justified.</span></h1>
      <p class="lede r2">A rebalancing agent for <b>Aave v3 on Celo</b> that only files a flight plan when the
      real APY delta clears its threshold — and stamps a public record of <b>every decision</b>, including staying grounded.</p>
      <span class="stamp r3">✓ anti-farming by design</span>
    </div>
    <div class="pass r2" id="pass">
      <div class="pass-head"><span>YIELD·PILOT AIRWAYS</span><b>ROUTE 8021</b></div>
      <div class="pass-route">
        <div class="port from"><div class="code" id="p-from">···</div><div class="apr" id="p-fromapr">—</div></div>
        <div class="arrow"></div>
        <div class="port to"><div class="code" id="p-to">···</div><div class="apr" id="p-toapr">—</div></div>
      </div>
      <div class="pass-grid">
        <div class="f"><div class="l">Passenger</div><div class="v" id="p-pax">STABLE CAPITAL</div></div>
        <div class="f"><div class="l">Gate</div><div class="v">AAVE V3</div></div>
        <div class="f"><div class="l">Seat</div><div class="v" id="p-seat">42220A</div></div>
        <div class="f"><div class="l">Threshold</div><div class="v" id="p-thr">—</div></div>
        <div class="f"><div class="l">Cooldown</div><div class="v" id="p-cool">—</div></div>
        <div class="f"><div class="l">Decisions</div><div class="v" id="p-dec">—</div></div>
      </div>
      <div class="pass-tear">
        <div class="barcode"></div>
        <span class="mode dry" id="p-mode">…</span>
      </div>
    </div>
  </section>

  <h2 class="r3"><span class="no">01</span> Instruments <span style="letter-spacing:.1em;color:var(--faint);font-size:11px">— live supply APR, Aave v3 Celo</span></h2>
  <div class="gauges r3" id="gauges"></div>

  <h2 class="r4"><span class="no">02</span> Departures <span style="letter-spacing:.1em;color:var(--faint);font-size:11px">— the flight log, latest first</span></h2>
  <div class="board r4">
    <div class="board-head"><span>Time</span><span>Status</span><span>Remarks</span><span>Gate</span></div>
    <div class="board-rows" id="board"><div class="board-empty">awaiting first evaluation…</div></div>
  </div>

  <div class="manifest r4">
    <span class="seal">certified · no wash</span>
    <div class="t">Flight manifest — why this is not wash-volume</div>
    <p>The agent moves only when the APY delta clears the threshold <b>and</b> the cooldown has passed. The
    departure board above is the audit trail: every on-chain transaction maps to a logged economic reason and
    carries the <b>ERC-8021 attribution tag</b>. Pre-flight safety checks by
    <a href="https://celo-sentinel.vercel.app" target="_blank" rel="noopener">celo-sentinel</a> — one x402
    micropayment per check. Agents paying agents, for real work.</p>
  </div>

  <footer>
    <span>YIELD·PILOT · Agentic Payments &amp; DeFAI Hackathon · Track 1</span>
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
  // gauge SVG: arco -90..90, APR 0..maxScale mapea a ángulo
  function gaugeSvg(id) {
    let ticks = "";
    for (let i = 0; i <= 8; i++) {
      const a = (-90 + i * 22.5) * Math.PI / 180;
      const x1 = 85 + Math.sin(a) * 62, y1 = 88 - Math.cos(a) * 62;
      const x2 = 85 + Math.sin(a) * 70, y2 = 88 - Math.cos(a) * 70;
      ticks += \`<line x1="\${x1}" y1="\${y1}" x2="\${x2}" y2="\${y2}" stroke="currentColor" stroke-width="\${i % 2 ? 1 : 2.5}" opacity=".55"/>\`;
    }
    return \`<svg viewBox="0 0 170 100">
      <path d="M 15 88 A 70 70 0 0 1 155 88" fill="none" stroke="currentColor" stroke-width="2" opacity=".3"/>
      \${ticks}
      <g class="needle" id="\${id}"><line x1="85" y1="88" x2="85" y2="26" stroke="var(--orange)" stroke-width="3.5" stroke-linecap="round"/><circle cx="85" cy="88" r="6" fill="var(--orange)"/></g>
    </svg>\`;
  }
  async function load() {
    const st = await (await fetch("/", { headers: { accept: "application/json" } })).json();
    const ms = st.markets ?? [];
    const sorted = [...ms].sort((a, b) => parseFloat(b.supplyApr) - parseFloat(a.supplyApr));
    const best = sorted[0], worst = sorted[sorted.length - 1];
    const totalPos = ms.reduce((s, m) => s + (m.position || 0), 0);

    // ticker
    const t = ms.map(m => \`\${m.symbol} <b>\${m.supplyApr}</b>\`).join(" · ");
    const seg = \`· AAVE V3 CELO · \${t} · UNDER MGMT <b>\${fmt(totalPos)}</b> · MODE <span class="up">\${st.dryRun ? "DRY RUN" : "LIVE"}</span> · ROUTE 8021 \`;
    document.getElementById("ticker").innerHTML = "<span>" + seg + seg + "</span>";

    // boarding pass
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
    mode.className = "mode " + (st.dryRun ? "dry" : "live");
    if (st.signer) document.getElementById("signer").textContent = st.signer.slice(0, 10) + "…" + st.signer.slice(-6);

    // gauges — escala 0..(maxApr redondeado arriba)
    const maxScale = Math.max(4, Math.ceil(Math.max(...ms.map(m => parseFloat(m.supplyApr)))));
    document.getElementById("gauges").innerHTML = ms.map((m, i) => \`
      <div class="gauge \${best && m.symbol === best.symbol ? "best" : ""}">
        \${best && m.symbol === best.symbol ? '<span class="flagbest">◈ best yield</span>' : ""}
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

    // departure board
    const log = await (await fetch("/decisions")).json();
    document.getElementById("p-dec").textContent = log.length;
    const el = document.getElementById("board");
    if (!log.length) {
      el.innerHTML = '<div class="board-empty">no departures yet — next evaluation in ' + (st.strategy.loopMinutes ?? 15) + ' min</div>';
      return;
    }
    el.innerHTML = log.slice(-40).reverse().map((d, i) => \`
      <div class="brow \${i === 0 ? "now" : ""}">
        <time title="\${d.at}">\${rel(d.at)}</time>
        <span class="st st-\${d.decision}">\${d.decision.replace("_", " ")}</span>
        <span class="rem">\${d.reason || ""}\${d.txHashes?.length ? ' · <a href="https://celoscan.io/tx/' + d.txHashes[0] + '" target="_blank" rel="noopener">TX↗</a>' : ""}</span>
        <span class="gate">AAVE</span>
      </div>\`).join("");
  }
  load().catch(e => console.error(e));
  setInterval(load, 60_000);
</script>
</body>
</html>`;
}
