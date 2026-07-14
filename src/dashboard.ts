/**
 * Dashboard fintech "flight deck" — claro, limpio, con identidad de piloto.
 * HTML embebido. Humanos en GET / ; agentes (Accept: json) reciben el estado JSON.
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
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&family=Spline+Sans+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  :root {
    --paper: #f6f5ef;
    --card: #fffefb;
    --ink: #101f18;
    --muted: #6a7a70;
    --faint: #96a49b;
    --hair: #e3e1d5;
    --green: #175c3c;
    --green-deep: #0c3f28;
    --green-soft: #e2efe4;
    --mint: #3fb877;
    --sky: #dbe9e0;
    --gold: #b8860b;
    --gold-soft: #f5ead0;
    --red: #b4453a;
    --body: "Instrument Sans", sans-serif;
    --display: "Bricolage Grotesque", sans-serif;
    --mono: "Spline Sans Mono", monospace;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: var(--paper); color: var(--ink); font-family: var(--body); font-size: 15.5px; line-height: 1.6;
    -webkit-font-smoothing: antialiased; }
  /* grano sutil de papel */
  body::before { content: ""; position: fixed; inset: 0; pointer-events: none; opacity: .35; z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E"); }
  .wrap { position: relative; z-index: 1; max-width: 1020px; margin: 0 auto; padding: 0 28px 90px; }

  @keyframes up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
  .r1 { opacity: 0; animation: up .55s cubic-bezier(.2,.7,.2,1) .05s forwards; }
  .r2 { opacity: 0; animation: up .55s cubic-bezier(.2,.7,.2,1) .18s forwards; }
  .r3 { opacity: 0; animation: up .55s cubic-bezier(.2,.7,.2,1) .32s forwards; }
  .r4 { opacity: 0; animation: up .55s cubic-bezier(.2,.7,.2,1) .46s forwards; }

  header { display: flex; align-items: center; gap: 14px; padding: 24px 0; }
  .logo { font-family: var(--display); font-weight: 800; font-size: 21px; letter-spacing: -.03em; }
  .logo em { font-style: normal; color: var(--green); }
  .badge { font-family: var(--mono); font-size: 11px; font-weight: 600; letter-spacing: .1em; padding: 5px 13px;
    border-radius: 100px; text-transform: uppercase; }
  .badge.dry { background: var(--gold-soft); color: var(--gold); }
  .badge.live { background: var(--green-soft); color: var(--green); }
  .badge.live::before { content: "●"; margin-right: 6px; animation: blink 2s ease infinite; }
  @keyframes blink { 50% { opacity: .3; } }
  header nav { margin-left: auto; display: flex; gap: 22px; font-size: 14px; }
  header a { color: var(--muted); text-decoration: none; font-weight: 500; }
  header a:hover { color: var(--green); }

  /* HERO con flight path */
  .hero { position: relative; padding: 58px 0 30px; }
  h1 { font-family: var(--display); font-weight: 800; font-size: clamp(38px, 5.8vw, 64px); line-height: 1.0;
    letter-spacing: -.035em; max-width: 620px; }
  h1 .alt { color: var(--green); }
  .lede { margin-top: 22px; color: var(--muted); font-size: 17px; max-width: 540px; }
  .lede b { color: var(--ink); font-weight: 600; }
  .flight { position: absolute; right: -30px; top: 30px; width: 380px; max-width: 42vw; height: 230px; pointer-events: none; }
  .flight path.trail { fill: none; stroke: var(--mint); stroke-width: 2.5; stroke-dasharray: 6 7;
    stroke-linecap: round; animation: dash 30s linear infinite; }
  @keyframes dash { to { stroke-dashoffset: -520; } }
  .flight .plane { animation: bob 5s ease-in-out infinite; transform-origin: center; }
  @keyframes bob { 50% { transform: translateY(-6px); } }
  .flight .wp { fill: var(--card); stroke: var(--mint); stroke-width: 2; }

  /* instrument strip */
  .strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1px; background: var(--hair);
    border: 1px solid var(--hair); border-radius: 16px; overflow: hidden; margin-top: 44px;
    box-shadow: 0 1px 2px rgba(16,31,24,.04), 0 12px 32px -18px rgba(16,31,24,.18); }
  .cell { background: var(--card); padding: 20px 22px; position: relative; }
  .cell .v { font-family: var(--display); font-size: 30px; font-weight: 700; letter-spacing: -.02em;
    font-variant-numeric: tabular-nums; }
  .cell .v small { font-size: 16px; color: var(--faint); font-weight: 600; }
  .cell .k { font-family: var(--mono); font-size: 10.5px; color: var(--faint); letter-spacing: .14em;
    text-transform: uppercase; margin-top: 4px; }
  .cell.accent { background: var(--green-deep); }
  .cell.accent .v { color: #eaf6ec; }
  .cell.accent .k { color: #7fae8e; }

  h2 { font-family: var(--display); font-size: 24px; font-weight: 700; letter-spacing: -.025em; margin: 62px 0 18px;
    display: flex; align-items: baseline; gap: 12px; }
  h2 small { font-family: var(--mono); font-size: 11px; color: var(--faint); font-weight: 400;
    letter-spacing: .12em; text-transform: uppercase; }

  /* allocation */
  .alloc { display: flex; height: 14px; border-radius: 8px; overflow: hidden; border: 1px solid var(--hair);
    background: var(--card); margin-bottom: 10px; }
  .alloc i { display: block; height: 100%; transition: width .9s cubic-bezier(.2,.8,.2,1); width: 0; }
  .alloc-legend { display: flex; gap: 18px; flex-wrap: wrap; font-size: 12.5px; color: var(--muted); margin-bottom: 26px; }
  .alloc-legend .sw { display: inline-block; width: 9px; height: 9px; border-radius: 3px; margin-right: 6px; }

  /* markets */
  .markets { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
  .mkt { background: var(--card); border: 1px solid var(--hair); border-radius: 16px; padding: 22px;
    transition: box-shadow .25s, transform .25s, border-color .25s; position: relative; overflow: hidden; }
  .mkt:hover { box-shadow: 0 16px 40px -14px rgba(16,31,24,.22); transform: translateY(-3px); }
  .mkt .sym { font-family: var(--display); font-weight: 700; font-size: 17px; display: flex;
    justify-content: space-between; align-items: center; }
  .mkt .apr { font-family: var(--mono); color: var(--green); font-size: 26px; font-weight: 600; margin-top: 8px;
    font-variant-numeric: tabular-nums; }
  .bar { height: 6px; background: var(--sky); border-radius: 4px; margin: 14px 0 12px; overflow: hidden; }
  .bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--mint), var(--green));
    border-radius: 4px; width: 0; transition: width .9s cubic-bezier(.2,.8,.2,1); }
  .mkt .pos { font-size: 13px; color: var(--muted); display: flex; justify-content: space-between; }
  .mkt .pos b { color: var(--ink); font-family: var(--mono); font-weight: 500; font-variant-numeric: tabular-nums; }
  .mkt.best { border-color: var(--mint); }
  .mkt.best::after { content: "◈ best yield"; position: absolute; top: 14px; right: -34px; transform: rotate(38deg);
    background: var(--green); color: #eaf6ec; font-family: var(--mono); font-size: 9.5px; letter-spacing: .12em;
    padding: 4px 38px; text-transform: uppercase; }

  /* flight log */
  .log { position: relative; }
  .log::before { content: ""; position: absolute; left: 137px; top: 8px; bottom: 8px; width: 2px;
    background: repeating-linear-gradient(var(--hair) 0 6px, transparent 6px 12px); }
  .row { display: grid; grid-template-columns: 118px 40px 130px 1fr; gap: 0 12px; padding: 13px 0; align-items: baseline; }
  .row time { font-family: var(--mono); font-size: 12px; color: var(--faint); text-align: right;
    font-variant-numeric: tabular-nums; }
  .row .node { justify-self: center; width: 11px; height: 11px; border-radius: 50%; border: 2.5px solid;
    background: var(--paper); position: relative; top: 2px; }
  .row .kind { font-family: var(--mono); font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; }
  .k-hold { color: var(--faint); } .n-hold { border-color: var(--faint); }
  .k-rebalance { color: var(--green); } .n-rebalance { border-color: var(--green); background: var(--mint) !important; }
  .k-deploy_idle { color: var(--gold); } .n-deploy_idle { border-color: var(--gold); }
  .row .why { color: var(--muted); font-size: 14px; }
  .row .why a { color: var(--green); font-weight: 500; }
  .empty { padding: 36px 20px; color: var(--faint); font-size: 14px; text-align: center;
    border: 1px dashed var(--hair); border-radius: 16px; }

  .note { margin-top: 48px; background: var(--green-deep); color: #cfe5d4; border-radius: 18px; padding: 26px 30px;
    font-size: 14.5px; line-height: 1.7; position: relative; overflow: hidden; }
  .note::before { content: "✈"; position: absolute; right: 22px; top: 12px; font-size: 64px; opacity: .12; }
  .note b { color: #fff; font-weight: 600; }
  .note a { color: var(--mint); }
  .note .t { font-family: var(--display); font-weight: 700; font-size: 17px; color: #fff; margin-bottom: 8px; }

  footer { margin-top: 56px; padding-top: 20px; border-top: 1px solid var(--hair); display: flex; gap: 22px;
    font-size: 13px; color: var(--faint); flex-wrap: wrap; align-items: baseline; }
  footer a { color: var(--faint); }
  footer .addr { font-family: var(--mono); font-size: 11.5px; margin-left: auto; }
  @media (max-width: 700px) {
    .flight { display: none; }
    .log::before { display: none; }
    .row { grid-template-columns: 1fr; gap: 3px; padding: 12px 0; border-bottom: 1px solid var(--hair); }
    .row time { text-align: left; } .row .node { display: none; }
  }
</style>
</head>
<body>
<div class="wrap">
  <header class="r1">
    <span class="logo">yield<em>·pilot</em></span>
    <span class="badge dry" id="modebadge">…</span>
    <nav>
      <a href="https://github.com/odiseo159-beep/yield-pilot" target="_blank" rel="noopener">GitHub</a>
      <a href="/decisions">Decision log</a>
      <a href="/health">Health</a>
    </nav>
  </header>

  <section class="hero">
    <svg class="flight r3" viewBox="0 0 380 230" aria-hidden="true">
      <path class="trail" d="M 8 210 C 90 205, 130 170, 175 130 S 275 60, 355 28" />
      <circle class="wp" cx="8" cy="210" r="5" />
      <circle class="wp" cx="175" cy="130" r="5" />
      <g class="plane">
        <g transform="translate(355 28) rotate(-22)">
          <path d="M0 0 L-16 6 L-13 0 L-16 -6 Z" fill="var(--green)" />
        </g>
      </g>
      <text x="14" y="228" font-family="var(--mono)" font-size="9" fill="var(--faint)" letter-spacing="2">USDT 0.34%</text>
      <text x="300" y="52" font-family="var(--mono)" font-size="9" fill="var(--green)" letter-spacing="2">USDm 2.54%</text>
    </svg>
    <h1 class="r1">Autonomous yield.<br /><span class="alt">Every move justified.</span></h1>
    <p class="lede r2">A rebalancing agent for <b>Aave v3 on Celo</b> that only moves capital when the real APY
    delta clears its threshold — and files a public <b>flight log</b> for every decision, including
    the decision to stay put.</p>
    <div class="strip r3" id="strip">
      <div class="cell accent"><div class="v" id="s-best">—</div><div class="k">best supply APR</div></div>
      <div class="cell"><div class="v" id="s-pos">—</div><div class="k">under management</div></div>
      <div class="cell"><div class="v" id="s-thr">—<small> pp</small></div><div class="k">move threshold</div></div>
      <div class="cell"><div class="v" id="s-cool">—<small> h</small></div><div class="k">cooldown</div></div>
      <div class="cell"><div class="v" id="s-dec">—</div><div class="k">decisions filed</div></div>
    </div>
  </section>

  <h2 class="r4">Markets <small>aave v3 · celo mainnet · live</small></h2>
  <div class="alloc r4" id="alloc"></div>
  <div class="alloc-legend r4" id="alloclegend"></div>
  <div class="markets r4" id="markets"></div>

  <h2>Flight log <small>latest first · full audit trail</small></h2>
  <div class="log" id="log"><div class="empty">loading…</div></div>

  <div class="note">
    <div class="t">Why this is not wash-volume</div>
    The agent only moves when the APY delta clears the threshold <b>and</b> the cooldown has passed.
    The flight log above is the audit trail: every on-chain transaction maps to a logged economic reason and
    carries the <b>ERC-8021 attribution tag</b>. Pre-trade safety by
    <a href="https://celo-sentinel.vercel.app" target="_blank" rel="noopener">celo-sentinel</a> — one x402
    micropayment per check, agents paying agents for real work.
  </div>

  <footer>
    <span>yield-pilot · Agentic Payments &amp; DeFAI Hackathon · Track 1</span>
    <a href="https://github.com/odiseo159-beep/yield-pilot" target="_blank" rel="noopener">source</a>
    <a href="https://dune.com/celo/agentic-payments-defai-hackathon" target="_blank" rel="noopener">leaderboard</a>
    <span class="addr" id="signer"></span>
  </footer>
</div>
<script>
  const fmt = (n) => "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const PAL = { USDC: "#3fb877", USDT: "#175c3c", USDm: "#b8d97a" };
  const rel = (iso) => {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 90) return "just now";
    if (s < 5400) return Math.round(s / 60) + "m ago";
    if (s < 129600) return Math.round(s / 3600) + "h ago";
    return Math.round(s / 86400) + "d ago";
  };
  async function load() {
    const st = await (await fetch("/", { headers: { accept: "application/json" } })).json();
    const badge = document.getElementById("modebadge");
    badge.textContent = st.dryRun ? "dry run" : "live";
    badge.className = "badge " + (st.dryRun ? "dry" : "live");
    if (st.signer) document.getElementById("signer").textContent = st.signer.slice(0, 10) + "…" + st.signer.slice(-6);

    const ms = st.markets ?? [];
    const best = [...ms].sort((a, b) => parseFloat(b.supplyApr) - parseFloat(a.supplyApr))[0];
    const totalPos = ms.reduce((s, m) => s + (m.position || 0), 0);
    document.getElementById("s-best").textContent = best ? best.supplyApr : "—";
    document.getElementById("s-pos").textContent = fmt(totalPos);
    document.getElementById("s-thr").innerHTML = (st.strategy.minApyDeltaBps / 100).toFixed(2) + "<small> pp</small>";
    document.getElementById("s-cool").innerHTML = st.strategy.cooldownHours + "<small> h</small>";

    // asignación de capital
    const alloc = document.getElementById("alloc"), leg = document.getElementById("alloclegend");
    if (totalPos > 0) {
      alloc.innerHTML = ms.filter(m => m.position > 0).map(m =>
        \`<i style="background:\${PAL[m.symbol] || "#888"}" data-w="\${(m.position / totalPos * 100).toFixed(1)}"></i>\`).join("");
      leg.innerHTML = ms.filter(m => m.position > 0).map(m =>
        \`<span><span class="sw" style="background:\${PAL[m.symbol] || "#888"}"></span>\${m.symbol} \${fmt(m.position)}</span>\`).join("");
    } else {
      alloc.innerHTML = '<i style="background:var(--hair)" data-w="100"></i>';
      leg.innerHTML = '<span>no capital deployed yet — waiting for funding</span>';
    }

    const maxApr = Math.max(...ms.map(m => parseFloat(m.supplyApr)), 0.01);
    document.getElementById("markets").innerHTML = ms.map(m => \`
      <div class="mkt \${best && m.symbol === best.symbol ? "best" : ""}">
        <div class="sym">\${m.symbol}</div>
        <div class="apr">\${m.supplyApr}</div>
        <div class="bar"><i data-w="\${(parseFloat(m.supplyApr) / maxApr * 100).toFixed(0)}"></i></div>
        <div class="pos"><span>position</span><b>\${fmt(m.position || 0)}</b></div>
      </div>\`).join("");
    requestAnimationFrame(() => requestAnimationFrame(() =>
      document.querySelectorAll(".bar i, .alloc i").forEach(i => i.style.width = i.dataset.w + "%")));

    const log = await (await fetch("/decisions")).json();
    document.getElementById("s-dec").textContent = log.length;
    const el = document.getElementById("log");
    if (!log.length) {
      el.innerHTML = '<div class="empty">no decisions yet — the agent evaluates every ' + (st.strategy.loopMinutes ?? 15) + ' minutes</div>';
      return;
    }
    el.innerHTML = log.slice(-40).reverse().map(d => \`
      <div class="row">
        <time title="\${d.at}">\${rel(d.at)}</time>
        <span class="node n-\${d.decision}"></span>
        <span class="kind k-\${d.decision}">\${d.decision.replace("_", " ")}</span>
        <span class="why">\${d.reason || ""}\${d.txHashes?.length ? ' · <a href="https://celoscan.io/tx/' + d.txHashes[0] + '" target="_blank" rel="noopener">view tx ↗</a>' : ""}</span>
      </div>\`).join("");
  }
  load().catch(e => console.error(e));
  setInterval(load, 60_000);
</script>
</body>
</html>`;
}
