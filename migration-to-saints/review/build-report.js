// The review, as a page you read by scanning days.
//
// The order is deliberate: a one-line summary, then the days, and nothing else above them.
// The way this gets read is "is there something red on the 20th? — ah, this — right", so a
// finding lives INSIDE the day it shows up on, with its evidence folded away until asked
// for. The copy-paste prompts go at the bottom, because they are what you do after reading,
// not while reading.

const fs = require('fs');
const path = require('path');
const { forDay, forDates, claimFor, VERDICTS } = require('./findings');
const fixPrompts = require('./fix-prompts');

const RUN = process.env.RUN_DIR || path.join(__dirname, 'run');
const OUT = process.env.OUT || path.join(RUN, 'review.html');
const data = JSON.parse(fs.readFileSync(path.join(RUN, 'review-rows.json'), 'utf8'));
const proposal = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(RUN, 'commons-proposal.json'), 'utf8')); }
  catch { return { days: [] }; }
})();
const harvest = new Map(proposal.days.map((d) => [d.date, d]));

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const WEEKDAY = ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte'];
const MONTH = ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'];
// "de gener" but "d'abril": the preposition elides before a vowel.
const de = (m) => (/^[aeiouAEIOU]/.test(m) ? `d'${m}` : `de ${m}`);
function humanDate(d) {
  const dt = new Date(`${d}T12:00:00Z`);
  return `${dt.getUTCDate()} ${de(MONTH[dt.getUTCMonth()])} · ${WEEKDAY[dt.getUTCDay()]}`;
}

// A row is divergent when the comparison says so — a Catalan cell that differs, or a
// citation naming different scripture — or when an investigated finding claims it, which is
// how the prose divergences (only visible to a reader) get counted.
//
// Divergence and explanation are separate on purpose: a divergent row with no finding is the
// session's to-do list, and must never be silently dropped.
function isDivergent(day, row) {
  if (row.match === 'diff' || row.match === 'diffRef') return true;
  return claimFor(day.date, row) !== null;
}
function findingOf(day, row) {
  return claimFor(day.date, row);
}

// --- Day ------------------------------------------------------------------------------

function fieldRow(row, fid, divergent) {
  const label = `${esc(row.label)} <span class="cell">${esc(row.table)}/${esc(row.id)}</span>`;
  if (!divergent) return `<li class="fr ok"><span>${label}</span></li>`;
  const tag = fid
    ? `<a class="ref" href="#${fid}-${row.date}">${fid}</a>`
    : `<span class="ref open">sense investigar</span>`;
  return `<li class="fr no">
    <span>${label} ${tag}</span>
    <div class="two">
      <div><span class="who">cpl-app</span><p class="lit">${esc(row.cplClean) || '—'}</p></div>
      <div><span class="who">saints-app</span><p class="lit">${esc(row.caClean || row.esClean) || '—'}</p></div>
    </div>
  </li>`;
}

function findingBlock(f, date) {
  const v = VERDICTS[f.verdict];
  const tbl = (t) => t ? `<div class="tw"><table><thead><tr>${t.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${t.rows.map((r) => `<tr>${r.map((c, i) => `<td${i ? '' : ' class="k"'}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
  return `<div class="finding ${v.cls}${f.resolved ? ' done' : ''}" id="${f.id}-${date}">
    <p class="fh"><a class="fid" href="#${f.id}-${date}">${f.id}</a>
      <span class="vp ${v.cls}">${esc(v.label)}</span>
      ${f.resolved ? `<span class="vp done">corregit</span>` : ''}
      <strong>${esc(f.headline.replace(/`/g, ''))}</strong></p>
    <p class="fd">${f.detail}</p>
    ${tbl(f.table)}
    <details class="more">
      <summary>Per què, i com es va provar</summary>
      <div class="mb">
        ${f.why ? `<p>${f.why}</p>` : ''}
        ${f.impact ? `<p><strong>Conseqüència:</strong> ${f.impact}</p>` : ''}
        ${f.proof && f.proof.length ? `<ul class="pl">${f.proof.map(([k, t, u]) => `<li><strong>${esc(k)}</strong> — ${t}${u ? ` <a href="${esc(u)}" target="_blank" rel="noopener">font ↗</a>` : ''}</li>`).join('')}</ul>` : ''}
        ${f.fix ? `<p class="fixline"><span class="who">${f.resolved ? 'correcció aplicada' : 'correcció proposada'}</span> ${f.fix.summary} ${f.fix.where !== '—' ? `<code>${esc(f.fix.where)}</code>` : ''}</p>` : ''}
        ${f.fix && f.fix.diff ? `<pre><code>${esc(f.fix.diff)}</code></pre>` : ''}
        ${f.fix ? tbl(f.fix.table) : ''}
        ${f.fix && f.fix.note ? `<p class="note">${f.fix.note}</p>` : ''}
        ${f.fix && f.fix.promptable ? `<p class="note">Hi ha un prompt llest per enganxar a <a href="#prompts">Què fer ara</a>.</p>` : ''}
      </div>
    </details>
  </div>`;
}

function dayBlock(day) {
  if (day.error || !day.rows) {
    return `<article class="day" id="d${day.date}">
      <header>
        <div class="dt"><h3>${humanDate(day.date)}</h3><p class="cel">—</p></div>
        <div class="sts"><span class="st open">no s’ha pogut resoldre</span></div>
      </header>
      <p class="fd">${esc(day.error || 'cpl-app no ha retornat cap ofici per a aquest dia.')}</p>
    </article>`;
  }
  const c = day.coverage;
  const hv = harvest.get(day.date) || { covered: 0, common: null };
  const reach = c.have + c.conflict + hv.covered;
  const pct = reach ? Math.round((100 * c.have) / reach) : 0;
  const nosource = Math.max(0, c.unreachable - hv.covered);
  const fs_ = forDay(day.date);

  let divergent = 0, unexplained = 0;
  for (const r of day.rows) if (isDivergent(day, r)) { divergent++; if (!findingOf(day, r)) unexplained++; }

  const HOUR_LABELS = {
    Office: 'Ofici de lectura', Laudes: 'Laudes', Tercia: 'Tèrcia', Sexta: 'Sexta',
    Nona: 'Nona', Vespers: 'Vespres', Mass: 'Missa',
  };
  const hours = ['Office', 'Laudes', 'Tercia', 'Sexta', 'Nona', 'Vespers', 'Mass'].map((h) => {
    const rows = day.rows.filter((r) => r.hour === h);
    if (!rows.length) return '';
    const bad = rows.filter((r) => isDivergent(day, r));
    const good = rows.filter((r) => !isDivergent(day, r));
    return `<section class="hr">
      <h4>${HOUR_LABELS[h] || h} <span class="hc">${bad.length ? `${bad.length} de ${rows.length} divergeixen` : `${rows.length} camps, tots coincideixen`}</span></h4>
      ${bad.length ? `<ul class="fl">${bad.map((r) => fieldRow({ ...r, date: day.date }, findingOf(day, r), true)).join('')}</ul>` : ''}
      ${good.length ? `<details class="fold"><summary>${good.length} camps que coincideixen</summary><ul class="fl">${good.map((r) => fieldRow({ ...r, date: day.date }, null, false)).join('')}</ul></details>` : ''}
    </section>`;
  }).join('');

  // Two separate signals, because they answer different questions: whether the two apps pray
  // different text, and whether anything on this day needs looking at at all. A day can have
  // no divergence and still carry findings — F2 and F4 are about the pipeline, not the text.
  const verdict = [
    divergent
      ? `<span class="st bad">${divergent} camps divergeixen</span>`
      : `<span class="st good">cap divergència</span>`,
    fs_.length ? `<span class="st note-st">${fs_.length} ${fs_.length === 1 ? 'troballa' : 'troballes'}</span>` : '',
    unexplained ? `<span class="st open">${unexplained} sense investigar</span>` : '',
  ].join('');

  return `<article class="day" id="d${day.date}">
    <header>
      <div class="dt">
        <h3>${humanDate(day.date)}</h3>
        <p class="cel">${esc(day.cplTitle || 'fèria')}</p>
      </div>
      <div class="sts">${verdict}</div>
    </header>

    ${fs_.length ? `<div class="fs">${fs_.map((f) => findingBlock(f, day.date)).join('')}</div>` : ''}

    ${day.tabsDiffer ? `<p class="note">Dia de memòria: la pestanya del sant de saints-app segueix
      el <strong>Comú</strong> i cpl-app resa la fèria. Les dues coses són lícites (OGLH 235b) i
      la diferència és <strong>volguda</strong> — decisió D-001. Per això la comparació d'aquí
      sota es fa contra la casella ferial, que és on va el text de cpl-app; el Comú va a la
      casella del sant, que cpl-app no omple mai.</p>` : ''}

    <div class="prog">
      <div class="bar" role="img" aria-label="${c.have} fetes, ${c.conflict} retingudes, ${hv.covered} per collir, ${nosource} sense font, de ${c.total}">
        <span class="sg have" style="width:${(100 * c.have) / c.total}%"></span>
        <span class="sg blk" style="width:${(100 * c.conflict) / c.total}%"></span>
        <span class="sg hav" style="width:${(100 * hv.covered) / c.total}%"></span>
      </div>
      <p class="lg">
        <span class="k have"></span>${c.have} fetes
        <span class="k blk"></span>${c.conflict} retingudes
        ${hv.covered ? `<span class="k hav"></span>${hv.covered} per collir del Comú` : ''}
        ${nosource ? `<span class="k out"></span>${nosource} sense font` : ''}
        <span class="pc">${pct}% de ${reach} assolibles</span>
      </p>
    </div>

    <details class="camps"><summary>Els ${day.rows.length} camps, un per un</summary>${hours}</details>
  </article>`;
}

// --- Page -----------------------------------------------------------------------------

const dates = data.days.map((d) => d.date).sort();
const range = (() => {
  if (!dates.length) return '';
  const a = new Date(`${dates[0]}T12:00:00Z`), b = new Date(`${dates[dates.length - 1]}T12:00:00Z`);
  const y = b.getUTCFullYear();
  if (dates.length === 1) return `${a.getUTCDate()} ${de(MONTH[a.getUTCMonth()])} de ${y}`;
  return a.getUTCMonth() === b.getUTCMonth()
    ? `${a.getUTCDate()}–${b.getUTCDate()} ${de(MONTH[b.getUTCMonth()])} de ${y}`
    : `${a.getUTCDate()} ${de(MONTH[a.getUTCMonth()])} – ${b.getUTCDate()} ${de(MONTH[b.getUTCMonth()])} de ${y}`;
})();

let rows = 0, div = 0, open_ = 0, c1 = 0, harvestTotal = 0;
for (const d of data.days) {
  if (d.error || !d.rows) continue;
  for (const r of d.rows) {
    rows++;
    if (isDivergent(d, r)) { div++; if (!findingOf(d, r)) open_++; }
    if (r.channel === 'C1') c1++;
  }
  harvestTotal += (harvest.get(d.date) || { covered: 0 }).covered;
}
const prompts = fixPrompts.all().filter((p) => forDates(dates).some((f) => f.id === p.id));

const html = `<title>Revisió litúrgica ${range}</title>
<style>
:root{
  --bg:#FCFCFB; --sf:#FFFFFF; --sf2:#F5F4F1;
  --ink:#171614; --ink2:#443F39; --mut:#6E6A63; --rl:#E3E0DA;
  --ac:#9E2B25;
  --v1:#8A5A00; --v2:#9E2B25; --v3:#B4761A; --v4:#4F7A52; --v5:#4A6D8C;
  --badbg:#FBF1F0; --outbg:#ECE9E3;
  --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  --serif:Georgia,"Iowan Old Style","Palatino Linotype",Palatino,serif;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --bg:#141312; --sf:#1C1A18; --sf2:#232120;
  --ink:#EDEAE4; --ink2:#C3BDB4; --mut:#948E85; --rl:#332F2B;
  --ac:#D9564E;
  --v1:#C99A3A; --v2:#D9564E; --v3:#D3963A; --v4:#7FA983; --v5:#7C9DBB;
  --badbg:#2A1C1A; --outbg:#2A2724;
}}
:root[data-theme="dark"]{
  --bg:#141312; --sf:#1C1A18; --sf2:#232120;
  --ink:#EDEAE4; --ink2:#C3BDB4; --mut:#948E85; --rl:#332F2B;
  --ac:#D9564E;
  --v1:#C99A3A; --v2:#D9564E; --v3:#D3963A; --v4:#7FA983; --v5:#7C9DBB;
  --badbg:#2A1C1A; --outbg:#2A2724;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);
  font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased}
.w{max-width:54rem;margin:0 auto;padding:2.6rem 1.4rem 5rem}
h1,h2,h3,h4{text-wrap:balance;margin:0;line-height:1.2}
h1{font-family:var(--serif);font-size:1.9rem;font-weight:400;letter-spacing:-.01em}
h2{font-family:var(--serif);font-size:1.35rem;font-weight:400;margin:0 0 .8rem}
h3{font-size:1.12rem;font-weight:600}
h4{font-size:.82rem;font-weight:650;text-transform:uppercase;letter-spacing:.08em;color:var(--mut)}
p{margin:.5rem 0}
a{color:var(--ac)}
code{font-family:var(--mono);font-size:.85em;background:var(--sf2);padding:.08em .32em;border-radius:3px}
pre{background:var(--sf2);border:1px solid var(--rl);border-radius:6px;padding:.7rem .9rem;
  overflow-x:auto;margin:.7rem 0}
pre code{background:none;padding:0;font-size:.78rem;line-height:1.5}
.mut,.note{color:var(--mut)}
.note{font-size:.85rem;font-style:italic}
.sub{color:var(--ink2);font-size:.95rem;margin:.5rem 0 0}
.tw{overflow-x:auto;margin:.6rem 0}
table{border-collapse:collapse;width:100%;font-size:.85rem}
th{text-align:left;font-size:.68rem;text-transform:uppercase;letter-spacing:.07em;
  color:var(--mut);padding:.3rem .6rem .3rem 0;border-bottom:1px solid var(--rl)}
td{padding:.35rem .6rem .35rem 0;border-bottom:1px solid var(--rl);vertical-align:top}
td.k{font-weight:600;white-space:nowrap}

/* day */
.day{background:var(--sf);border:1px solid var(--rl);border-radius:9px;
  padding:1.25rem 1.35rem;margin:1rem 0}
.day>header{display:flex;justify-content:space-between;align-items:flex-start;
  gap:1rem;flex-wrap:wrap}
.dt h3{font-size:1.15rem}
.cel{font-size:.9rem;color:var(--ink2);margin:.15rem 0 0}
.st{font-size:.78rem;font-weight:650;padding:.2rem .6rem;border-radius:99px;
  border:1px solid currentColor;white-space:nowrap}
.st.good{color:var(--v4)} .st.bad{color:var(--v2)} .st.note-st{color:var(--ink2)}
.st.open{color:var(--v5)} .ref.open{color:var(--v5);font-weight:600}
.openw{color:var(--v5)}
.sts{display:flex;gap:.35rem;flex-wrap:wrap}

/* finding, inside its day */
.fs{margin-top:1rem;display:grid;gap:.7rem}
.finding{border-left:3px solid var(--rl);padding:.15rem 0 .15rem .85rem}
.finding.v1{border-left-color:var(--v1)} .finding.v2{border-left-color:var(--v2)}
.finding.v3{border-left-color:var(--v3)} .finding.v4{border-left-color:var(--v4)}
.finding.v5{border-left-color:var(--v5)}
.fh{display:flex;gap:.45rem;align-items:baseline;flex-wrap:wrap;margin:0 0 .2rem;font-size:.95rem}
.fid{font-family:var(--mono);font-size:.7rem;font-weight:700;color:var(--mut);text-decoration:none}
.vp{font-size:.66rem;font-weight:650;padding:.08rem .4rem;border-radius:99px;
  border:1px solid currentColor;white-space:nowrap}
.vp.v1{color:var(--v1)} .vp.v2{color:var(--v2)} .vp.v3{color:var(--v3)}
.vp.v4{color:var(--v4)} .vp.v5{color:var(--v5)}
.vp.done{color:var(--v4);border-style:dashed}
.finding.done{border-left-style:dashed}
.fd{font-size:.88rem;color:var(--ink2);margin:.15rem 0 0}
.more summary{cursor:pointer;font-size:.78rem;color:var(--mut);padding:.3rem 0}
.more summary:hover{color:var(--ac)}
.mb{font-size:.87rem;color:var(--ink2);border-top:1px solid var(--rl);padding-top:.5rem}
.pl{margin:.3rem 0;padding-left:1rem}
.pl li{margin:.3rem 0}
.fixline{background:var(--sf2);border-radius:5px;padding:.45rem .6rem}

/* progress */
.prog{margin:1rem 0 0}
.bar{display:flex;height:7px;border-radius:99px;overflow:hidden;background:var(--outbg);
  border:1px solid var(--rl)}
.sg{display:block;height:100%}
.sg.have{background:var(--v4)} .sg.blk{background:var(--v3)}
.sg.hav{background:repeating-linear-gradient(135deg,var(--v5) 0 4px,
  color-mix(in srgb,var(--v5) 40%,transparent) 4px 8px)}
.lg{font-size:.76rem;color:var(--ink2);margin:.45rem 0 0;display:flex;
  flex-wrap:wrap;gap:.1rem .85rem;align-items:baseline}
.k{display:inline-block;width:.55rem;height:.55rem;border-radius:2px;margin-right:.3rem}
.k.have{background:var(--v4)} .k.blk{background:var(--v3)}
.k.hav{background:repeating-linear-gradient(135deg,var(--v5) 0 3px,
  color-mix(in srgb,var(--v5) 40%,transparent) 3px 6px)}
.k.out{background:var(--outbg);border:1px solid var(--rl)}
.pc{margin-left:auto;color:var(--mut)}

/* fields */
.camps{margin-top:.9rem;border-top:1px solid var(--rl);padding-top:.5rem}
.camps>summary,.fold>summary{cursor:pointer;font-size:.78rem;color:var(--mut);padding:.25rem 0}
.camps>summary:hover,.fold>summary:hover{color:var(--ac)}
.hr{margin-top:.8rem}
.hr h4{display:flex;gap:.6rem;align-items:baseline;flex-wrap:wrap;
  padding-bottom:.25rem;border-bottom:1px solid var(--rl)}
.hc{font-size:.72rem;font-weight:400;text-transform:none;letter-spacing:0}
.fl{list-style:none;margin:.3rem 0;padding:0}
.fr{padding:.28rem 0;font-size:.85rem;border-bottom:1px solid var(--rl)}
.fr:last-child{border-bottom:0}
.fr.ok{color:var(--ink2)}
.cell{font-family:var(--mono);font-size:.68rem;color:var(--mut);background:var(--sf2);
  padding:.05em .32em;border-radius:3px}
.ref{font-family:var(--mono);font-size:.68rem;font-weight:700;text-decoration:none;
  border:1px solid currentColor;border-radius:99px;padding:0 .3em}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:.6rem;
  margin:.4rem 0 .2rem;padding:.55rem;background:var(--badbg);border-radius:5px}
.who{font-size:.62rem;text-transform:uppercase;letter-spacing:.09em;color:var(--mut);
  font-weight:650;display:block}
.lit{font-family:var(--serif);font-size:.87rem;margin:.1rem 0 0}

/* prompts */
.pr{background:var(--sf);border:1px solid var(--rl);border-radius:9px;padding:1.1rem 1.25rem;
  margin:.8rem 0}
.pr>h3{font-size:1rem;display:flex;gap:.5rem;align-items:baseline;flex-wrap:wrap}
.pr pre{max-height:22rem;overflow:auto}
hr{height:1px;background:var(--rl);border:0;margin:2.6rem 0 1.4rem}

a:focus-visible,summary:focus-visible{outline:2px solid var(--ac);outline-offset:2px;border-radius:3px}
@media (max-width:600px){.w{padding:1.6rem 1rem 3rem}.pc{margin-left:0}}
</style>

<div class="w">

<h1>Revisió litúrgica · ${range}</h1>
<p class="sub">${rows} camps comparats entre cpl-app i saints-app · <strong>${div} divergeixen</strong>${open_ ? `, <strong class="openw">${open_} encara sense investigar</strong>` : ''} ·
${c1} caselles ja migrades al català i totes coincideixen · ${harvestTotal} caselles per collir del Comú.
Diòcesi de Barcelona.</p>

${data.days.map(dayBlock).join('')}

<hr>
<h2 id="prompts">Què fer ara</h2>
<p class="sub">La revisió no toca res. Cada correcció va amb un prompt per enganxar en un fil
nou, que ja porta les proves a dins perquè no s'hagi de tornar a investigar.</p>
${prompts.map((p) => `<div class="pr">
  <h3><span class="vp ${VERDICTS[p.verdict].cls}">${p.id} · ${esc(VERDICTS[p.verdict].label)}</span> ${esc(p.title)}</h3>
  <pre><code>${esc(p.text)}</code></pre>
</div>`).join('')}

<hr>
<p class="note">cpl-app resolt amb els seus Serveis reals sobre <code>cpl-app.db</code>;
saints-app llegit per la casella que l'app fa servir de veritat, mesurada amb la sonda.
Les caselles en conflicte s'obren per veure qui hi discrepa encara que caigui fora dels dies
revisats. Diferències d'espais, accents o abreviatura de cita no compten
(<code>lib/text-key.js</code>).</p>
</div>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html, 'utf8');
console.log(`${rows} camps · ${div} divergències · ${prompts.length} prompts`);
for (const d of data.days) {
  if (d.error || !d.rows) { console.log(`  ${d.date}  ERROR ${d.error}`); continue; }
  const n = d.rows.filter((r) => isDivergent(d, r)).length;
  const u = d.rows.filter((r) => isDivergent(d, r) && !findingOf(d, r)).length;
  console.log(`  ${d.date}  ${n ? `${n} divergeixen${u ? ` (${u} sense investigar)` : ''}` : 'net'}`);
}
console.log(`-> ${OUT}`);
