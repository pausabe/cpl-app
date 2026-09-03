function setStatus(action, text, kind) {
  const el = document.querySelector(`[data-status="${action}"]`);
  el.textContent = text;
  el.className = 'status' + (kind ? ' ' + kind : '');
}

function resultsEl(action) {
  return document.querySelector(`[data-results="${action}"]`);
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function logBlock(log) {
  if (!log || !log.trim()) return '';
  return `<details><summary>Sortida completa</summary><pre class="log">${escapeHtml(log)}</pre></details>`;
}

async function runAction(action, { method = 'POST', body, endpoint, displayKey } = {}) {
  const key = displayKey || action;
  const buttons = document.querySelectorAll(`[data-action="${action}"]`);
  buttons.forEach((b) => (b.disabled = true));
  setStatus(key, 'Executant...');
  resultsEl(key).innerHTML = '';
  try {
    const res = await fetch(`/api/${endpoint || action.replace('-write', '')}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (data.ok === false) {
      setStatus(key, 'Error', 'error');
    } else {
      setStatus(key, 'Fet', 'ok');
    }
    return data;
  } catch (e) {
    setStatus(key, 'Error de connexió', 'error');
    resultsEl(key).innerHTML = `<pre class="log">${escapeHtml(String(e))}</pre>`;
    return null;
  } finally {
    buttons.forEach((b) => (b.disabled = false));
  }
}

function renderStage1(data) {
  const el = resultsEl('stage1');
  if (!data || !data.summary) {
    el.innerHTML = logBlock(data && data.log);
    return;
  }
  const { representativeYear, rowsSkipped, calendars } = data.summary;
  let html = `<div class="summary-line">Any de referència: <b>${representativeYear}</b> · files descartades en llegir cpl-app.db: <b>${rowsSkipped}</b></div>`;
  html += '<table><tr><th>Calendari</th><th>Parent</th><th>Regles candidates</th><th>Avisos</th></tr>';
  for (const [id, c] of Object.entries(calendars)) {
    html += `<tr><td>${id}.json</td><td>${c.parent}</td><td>${c.ruleCount}</td><td>${c.warnings.length}</td></tr>`;
  }
  html += '</table>' + logBlock(data.log);
  el.innerHTML = html;
}

function renderStage2(data) {
  const el = resultsEl('stage2');
  if (!data || !data.summary) {
    el.innerHTML = logBlock(data && data.log);
    return;
  }
  const { droppedCount, promotedCount, survivors } = data.summary;
  let html = `<div class="summary-line">${data.wrote ? '<b>Escrit a litcal/src/data/calendars/</b> · ' : '(prova, no escrit) · '}`;
  html += `Descartats per ja existir a litcal: <b>${droppedCount}</b> · promoguts a catalonia.json: <b>${promotedCount}</b></div>`;
  html += '<table><tr><th>Calendari</th><th>Parent</th><th>Celebracions noves</th></tr>';
  for (const [id, c] of Object.entries(survivors)) {
    html += `<tr><td>${id}.json</td><td>${c.parent}</td><td>${c.ruleCount}</td></tr>`;
  }
  html += '</table>';
  html += renderDroppedTable(data.summary.dropped);
  html += logBlock(data.log);
  el.innerHTML = html;
}

function renderDroppedTable(dropped) {
  if (!dropped || !dropped.length) return '';
  let html = `<details><summary>Veure els ${dropped.length} sants omesos (ja existeixen a litcal)</summary>`;
  html += '<table><tr><th>Calendari</th><th>Data</th><th>Nom català</th><th>Ja existeix com a</th></tr>';
  for (const d of dropped) {
    html += `<tr><td>${escapeHtml(d.calendar)}</td><td>${escapeHtml(d.date)}</td><td>${escapeHtml(d.catalanName)}</td><td>${escapeHtml((d.existing || []).map((e) => e.id).join(', '))}</td></tr>`;
  }
  html += '</table></details>';
  return html;
}

function renderGenerateLoaders(data) {
  resultsEl('generate-loaders').innerHTML = logBlock(data && data.log) || '<p class="summary-line">Fet.</p>';
}

function renderLaudes(data) {
  const el = resultsEl('laudes');
  if (!data || !data.sample) {
    el.innerHTML = logBlock(data && data.log);
    return;
  }
  let html = '';
  for (const day of data.sample) {
    const l = day.laudes || {};
    html += `<div class="laudes-day"><h3>${escapeHtml(day.date)} — ${escapeHtml(day.celebrationTitle || '(ferial)')}</h3>`;
    html += laudesField('Himne', l.Anthem);
    if (l.FirstPsalm) html += laudesField('1r salm', `${l.FirstPsalm.Title || ''}\n${l.FirstPsalm.Antiphon || ''}`);
    if (l.ShortReading) html += laudesField('Lectura breu', `${l.ShortReading.Quote || ''}\n${l.ShortReading.ShortReading || ''}`);
    if (l.ShortResponsory) {
      const r = l.ShortResponsory;
      html += laudesField('Responsori breu', r.HasSpecialAntiphon ? r.SpecialAntiphon : `${r.FirstPart || ''} ${r.SecondPart || ''}\n${r.ThirdPart || ''}`);
    }
    html += laudesField('Cántic evangèlic (antífona)', l.EvangelicalAntiphon);
    html += laudesField('Oració final', l.FinalPrayer);
    html += '</div>';
  }
  html += logBlock(data.log);
  el.innerHTML = html;
}

function laudesField(label, value) {
  if (!value) return '';
  return `<div class="field"><div class="field-label">${escapeHtml(label)}</div><div class="field-value">${escapeHtml(value)}</div></div>`;
}

function renderDroppedReport(data) {
  resultsEl('dropped-report').innerHTML = renderDroppedTable(data && data.report) || '<p class="summary-line">Cap informe guardat trobat.</p>';
}

function renderMigrator(data) {
  const el = resultsEl('migrator');
  if (!data) return;
  const totalResolved = data.coverage ? Object.values(data.coverage).reduce((a, b) => a + b, 0) : 0;
  let html = `<div class="summary-line">Rang: <b>${escapeHtml(data.start)} → ${escapeHtml(data.end)}</b> · Hores: <b>${(data.hours || []).join(', ')}</b> · Diòcesi: <b>${escapeHtml(data.diocese)}</b></div>`;
  html += `<div class="summary-line">Migrat (coincideix a totes les dates): <b>${totalResolved}</b> ids · Pendent de revisió (es deixa en blanc): <b>${data.pendingCount ?? 0}</b> ids</div>`;
  if (data.exported) {
    const r = data.exportReport || {};
    html += `<div class="summary-line" style="color:#3a7a3a"><b>Exportat a saints-app.</b> Fitxers escrits: ${(r.filesWritten || []).length} · claus noves: ${r.keysAdded ?? 0} · claus actualitzades: ${r.keysChanged ?? 0}</div>`;
  }
  if (data.coverage) {
    html += '<table><tr><th>Taula</th><th>Migrats</th><th>Pendents</th></tr>';
    for (const [table, count] of Object.entries(data.coverage)) {
      html += `<tr><td>${table}.json</td><td>${count}</td><td>${(data.pendingByTable && data.pendingByTable[table]) || 0}</td></tr>`;
    }
    html += '</table>';
  }
  if (data.pendingSample && data.pendingSample.length) {
    html += `<details><summary>Veure mostra de pendents, ordenats pels que afecten més dies (primers ${data.pendingSample.length})</summary>`;
    html += '<table><tr><th>Taula</th><th>ID</th><th>Dies/hores afectats</th><th>Variants trobades</th></tr>';
    for (const p of data.pendingSample) {
      const variantsHtml = (p.variants || [])
        .map((v) => `<div><i>${v.tags.length}×:</i> ${escapeHtml(v.preview)}</div>`)
        .join('');
      html += `<tr><td>${escapeHtml(p.table)}</td><td>${escapeHtml(p.id)}</td><td>${p.affectedCount}</td><td>${variantsHtml}</td></tr>`;
    }
    html += '</table></details>';
  }
  html += logBlock(data.log);
  el.innerHTML = html;
}

// --- Refresh (local litcal link + chained pipelines) ---

function migratorOptions() {
  const hours = [];
  if (document.getElementById('mig-hour-laudes').checked) hours.push('Laudes');
  if (document.getElementById('mig-hour-vespers').checked) hours.push('Vespers');
  return {
    start: document.getElementById('mig-start').value,
    end: document.getElementById('mig-end').value,
    diocese: document.getElementById('mig-diocese').value,
    hours,
  };
}

function renderLinkStatus(st) {
  const el = document.querySelector('[data-results="link-status"]');
  const box = document.getElementById('link-litcal');
  if (!st) {
    el.innerHTML = '<span class="bad">No he pogut llegir l\'estat.</span>';
    return;
  }
  box.checked = !!st.linked;
  const built = st.litcalBuilt
    ? `compilat ${new Date(st.litcalBuiltAt).toLocaleString('ca-ES')}`
    : '<span class="bad">sense compilar (dist/ no existeix)</span>';
  const cal = st.catalanCalendarsInDist
    ? 'calendaris catalans dins dist ✓'
    : '<span class="bad">els calendaris catalans encara no són a dist/</span>';
  el.innerHTML = st.linked
    ? `<span class="good">Enllaçat</span> · dependència <code>${escapeHtml(st.spec)}</code> · instal·lat com a <b>${escapeHtml(st.installedKind)}</b> · litcal ${built} · ${cal}`
    : `<span class="bad">No enllaçat</span> · eprex usa la versió publicada <code>${escapeHtml(st.spec || '?')}</code>, així que <b>no veurà</b> els calendaris catalans locals · litcal ${built}`;
}

async function loadLinkStatus() {
  try {
    const res = await fetch('/api/link-status');
    renderLinkStatus(await res.json());
  } catch {
    renderLinkStatus(null);
  }
}

async function toggleLink(enable) {
  const box = document.getElementById('link-litcal');
  box.disabled = true;
  setStatus(
    'refresh',
    enable ? 'Enllaçant litcal local i executant bun install...' : 'Restaurant la versió publicada i executant bun install...'
  );
  try {
    const res = await fetch('/api/link-litcal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable }),
    });
    const data = await res.json();
    renderLinkStatus(data.status);
    if (data.dirtyFiles && data.dirtyFiles.length) {
      resultsEl('refresh').innerHTML =
        `<div class="rs-warn"><b>Avís:</b> <code>bun install</code> ha deixat tocats aquests fitxers de saints-app: ` +
        `<code>${escapeHtml(data.dirtyFiles.join(', '))}</code>. bun re-resol dependències transitives pel seu compte, ` +
        `així que <b>bun.lock no torna sol a l'estat original</b> en desactivar la casella — si no ho vols al commit, ` +
        `fes <code>git checkout -- bun.lock</code> a saints-app.</div>`;
    }
    if (data.ok) setStatus('refresh', enable ? 'Enllaçat' : 'Desenllaçat', 'ok');
    else {
      setStatus('refresh', 'Error', 'error');
      resultsEl('refresh').innerHTML = `<pre class="log">${escapeHtml(data.error || data.log || '')}</pre>`;
    }
    if (!data.ok) box.checked = !enable;
  } catch (e) {
    setStatus('refresh', 'Error de connexió', 'error');
    box.checked = !enable;
  } finally {
    box.disabled = false;
    loadLinkStatus();
  }
}

function refreshStepsHtml(steps, state) {
  return steps
    .map((s, i) => {
      const st = state[i] || {};
      const icon = st.running ? '<span class="spin">◐</span>' : st.ok === true ? '✓' : st.ok === false ? '✕' : '·';
      const cls = st.running ? 'running' : st.ok === true ? 'ok' : st.ok === false ? 'fail' : 'idle';
      const time = st.seconds != null ? `<span class="rs-time">${st.seconds}s</span>` : '';
      const summary = st.summary ? `<div class="rs-summary">${escapeHtml(st.summary)}</div>` : '';
      const log = st.log && st.log.trim() ? logBlock(st.log) : '';
      return `<div class="rs-step ${cls}">
        <div class="rs-head"><span class="rs-icon">${icon}</span><span class="rs-label">${escapeHtml(s.label)}</span>${time}</div>
        ${summary}${log}
      </div>`;
    })
    .join('');
}

function runRefresh(what) {
  const opts = migratorOptions();
  if (what !== 'litcal' && opts.hours.length === 0) {
    setStatus('refresh', 'Tria almenys una hora a la targeta 5', 'error');
    return;
  }
  const buttons = document.querySelectorAll('[data-action^="refresh-"]');
  buttons.forEach((b) => (b.disabled = true));
  setStatus('refresh', 'Executant...');

  const params = new URLSearchParams({
    what,
    start: opts.start,
    end: opts.end,
    diocese: opts.diocese,
    hours: opts.hours.join(','),
  });
  const es = new EventSource(`/api/refresh?${params}`);
  let steps = [];
  const state = [];
  const el = resultsEl('refresh');

  const redraw = () => (el.innerHTML = refreshStepsHtml(steps, state));

  es.addEventListener('plan', (e) => {
    steps = JSON.parse(e.data).steps;
    redraw();
  });
  es.addEventListener('step-start', (e) => {
    const d = JSON.parse(e.data);
    state[d.index] = { running: true };
    setStatus('refresh', `${d.index + 1}/${steps.length} — ${d.label}`);
    redraw();
  });
  es.addEventListener('step-end', (e) => {
    const d = JSON.parse(e.data);
    state[d.index] = { running: false, ok: d.ok, seconds: d.seconds, summary: d.summary, log: d.log };
    redraw();
  });
  es.addEventListener('done', (e) => {
    const d = JSON.parse(e.data);
    setStatus('refresh', d.ok ? 'Fet — recarrega eprex per veure-ho' : `Ha fallat a "${d.failedAt}"`, d.ok ? 'ok' : 'error');
    if (d.status) renderLinkStatus(d.status);
    es.close();
    buttons.forEach((b) => (b.disabled = false));
  });
  es.onerror = () => {
    setStatus('refresh', 'Connexió interrompuda', 'error');
    es.close();
    buttons.forEach((b) => (b.disabled = false));
  };
}

document.getElementById('link-litcal').addEventListener('change', (e) => toggleLink(e.target.checked));
loadLinkStatus();

// --- Day inspector ---

// Short labels on purpose: they live in a narrow column next to the text itself, and the
// long version of each one is already spelled out in the "Per què" column.
const DC_STATUS = {
  ok: { label: 'català', cls: 'dc-ok' },
  conflict: { label: 'conflicte', cls: 'dc-conflict' },
  missing: { label: 'sense dades', cls: 'dc-missing' },
  notInAppYet: { label: 'no exportat', cls: 'dc-notyet' },
};

function renderDayCheck(d) {
  const el = resultsEl('daycheck');
  if (!d || d.error) {
    el.innerHTML = `<div class="rs-warn">${escapeHtml((d && d.error) || 'Error')}</div>`;
    return;
  }

  const verdict =
    d.verdict === 'complete'
      ? '<span class="dc-verdict good">✓ 100% — aquest dia sortirà sencer en català</span>'
      : d.verdict === 'unknown'
        ? '<span class="dc-verdict unknown">? Cap camp a comprovar (mira les notes de sota)</span>'
        : `<span class="dc-verdict bad">✗ ${d.percent}% — hi falta contingut</span>`;

  let html = `<div class="dc-head">${verdict}
    <div class="summary-line">${escapeHtml(d.date)} → <b>${escapeHtml(d.litcalId || '?')}</b>
      ${d.allXKey ? `· clau <code>${escapeHtml(d.allXKey)}</code>` : ''}</div>`;

  if (d.lastRun) {
    html += `<div class="pe-summary">Segons l'última migració: ${escapeHtml(d.lastRun.start)} → ${escapeHtml(d.lastRun.end)},
      diòcesi <b>${escapeHtml(d.lastRun.diocese)}</b>, hores ${escapeHtml((d.lastRun.hours || []).join(', '))}.</div>`;
  }

  const t = d.totals;
  html += `<div class="dc-bar">
      ${t.ok ? `<div class="dc-seg dc-ok" style="flex:${t.ok}" title="${t.ok} amb text"></div>` : ''}
      ${t.notInAppYet ? `<div class="dc-seg dc-notyet" style="flex:${t.notInAppYet}"></div>` : ''}
      ${t.conflict ? `<div class="dc-seg dc-conflict" style="flex:${t.conflict}"></div>` : ''}
      ${t.missing ? `<div class="dc-seg dc-missing" style="flex:${t.missing}"></div>` : ''}
    </div>
    <div class="rv-chips">
      <span class="rv-chip"><b>${t.ok}</b> amb text</span>
      <span class="rv-chip"><b>${t.conflict}</b> conflictes coneguts</span>
      <span class="rv-chip"><b>${t.missing}</b> sense dades</span>
      ${t.notInAppYet ? `<span class="rv-chip"><b>${t.notInAppYet}</b> calculats però no exportats</span>` : ''}
    </div></div>`;

  // Per-render handles, so the "what fails" chips can point at a concrete field row.
  // An id/table pair is not enough: the same cell often appears twice in a day (the same
  // hymn at Lauds and Vespers), and a chip has to land on the one it was made from.
  let seq = 0;
  for (const h of d.hours) for (const f of h.fields || []) f.key = `dcf${++seq}`;

  html += dcCelebrationBlock(d);
  html += dcFailBlock(d);

  for (const h of d.hours) {
    if (h.note) {
      html += `<div class="dc-hour dc-hour-empty"><h3>${escapeHtml(h.hour)}</h3>
        <div class="rs-warn">${escapeHtml(h.note)}</div></div>`;
      continue;
    }
    html += dcHourBlock(h);
  }
  el.innerHTML = html;
}

// "…i N més" is a dead end exactly where the hidden part is the answer: which days would
// break, which cells fail, which celebrations cause it. So the remainder ships with the
// page, folded, and the counter is the button that unfolds it — nothing to refetch, and it
// folds back once read so a 40-date list doesn't permanently bury the rows under it.
function dcMore(items, max, { sep = '', label, block = false } = {}) {
  if (items.length <= max) return items.join(sep);
  const rest = items.slice(max);
  const text = label ? label(rest.length) : `…i ${rest.length} més`;
  const tag = block ? 'div' : 'span';
  return (
    items.slice(0, max).join(sep) +
    `<${tag} class="dc-rest" hidden>${sep}${rest.join(sep)}</${tag}>` +
    `<button type="button" class="dc-more${block ? ' dc-more-block' : ''}"
       data-dc-more="${escapeHtml(text)}">${escapeHtml(text)}</button>`
  );
}

// "Why is this day different?" — the block to read before opening any Hour.
//
// Two separate questions, deliberately shown apart, because confusing them is the whole
// trap: what THIS day celebrates (and whether litcal agrees), and which celebrations are
// keeping this day's cells empty. They are usually not the same: a perfectly ordinary
// Wednesday can be blank because one unrelated day in 2022 wants different text there.
function dcCelebrationBlock(d) {
  const c = d.celebration;
  const blame = d.blameSummary || [];
  if (!c && !blame.length) {
    return `<div class="dc-cel dc-cel-none">Sense diagnòstic de calendari. Genera'l amb
      <code>npx jest migration-to-saints/celebration-probe.test.js</code> i després
      <code>node migration-to-saints/missing-celebrations.js</code>.</div>`;
  }

  let html = '<div class="dc-cel">';
  if (c) {
    html += `<div class="dc-cel-row">
      <span class="dc-cel-label">cpl-app hi celebra</span>
      <span class="dc-cel-value">${c.title ? escapeHtml(c.title) : '<i>res — fèria</i>'}
        ${c.group && c.group.ranks && c.group.ranks.length ? `<span class="dc-cel-rank">${escapeHtml(c.group.ranks.join(' / '))}</span>` : ''}</span>
    </div>
    <div class="dc-cel-row">
      <span class="dc-cel-label">litcal hi diu</span>
      <span class="dc-cel-value"><code>${escapeHtml(c.litcalId)}</code>
        ${c.litcalIsFerial ? '<span class="dc-cel-rank">fèria simple</span>' : ''}</span>
    </div>`;
    if (c.verdictLabel) {
      html += `<div class="dc-cel-verdict ${escapeHtml(c.verdict)}">${escapeHtml(c.verdictLabel)}</div>`;
    }
    if (c.verdict === 'missing' && c.group) {
      html += `<div class="dc-cel-suggest">Id proposat per al calendari català:
        <code>${escapeHtml(c.group.suggestedId)}</code> · afecta ${c.group.contestedDays} dies i
        ${c.group.cellsBlamed} caselles (<b>${c.group.cellsSole}</b> només per aquesta celebració)</div>`;
    }
  }

  // Only celebrations that are the SOLE contester of some cell earn a line here: settling
  // one of those unblocks its cells outright, so naming it is a to-do. When the blame is
  // spread over many celebrations no single line is actionable — sixteen rows all reading
  // "2 camps" describe two cells, not sixteen problems — and the one-line count under
  // "Què falla" says the same thing without the wall.
  const sole = blame.filter((b) => b.soleFields > 0);
  if (sole.length) {
    const rows = sole.map(
      (b) => `<div class="dc-blame-row ${escapeHtml(b.verdict)}">
        <span class="dc-blame-count">${b.soleFields} camp${b.soleFields === 1 ? '' : 's'} només per això${b.fields > b.soleFields ? ` · ${b.fields} en total` : ''}</span>
        <span class="dc-blame-title">${escapeHtml(b.title)}</span>
        <span class="dc-blame-why">${escapeHtml(b.verdictLabel)}</span>
      </div>`
    );
    html += `<div class="dc-blame"><div class="dc-blame-head">Arreglar això desbloqueja camps pel seu compte</div>
      ${dcMore(rows, 3, {
        block: true,
        label: (n) => `…i ${n} ${n === 1 ? 'causa única' : 'causes úniques'} més`,
      })}</div>`;
  }
  return html + '</div>';
}

const DC_FAIL_GROUP = {
  conflict: { label: 'en conflicte', cls: 'dc-conflict' },
  missing: { label: 'sense dades', cls: 'dc-missing' },
  notInAppYet: { label: 'per exportar', cls: 'dc-notyet' },
};

// What actually fails today, named cell by cell. This is the bounded list — a day has a
// handful of broken cells — while the celebrations contesting them are a property of the
// cell, not of the day: an ordinary Wednesday can be contested by sixteen unrelated
// feasts, and listing all sixteen up here says nothing at all about the Wednesday. So the
// day level answers "what", each cell answers "because of whom" when you open it.
function dcFailBlock(d, maxChips = 10) {
  const byStatus = (status) =>
    d.hours
      .map((h) => ({ hour: h.hour, status, fields: (h.fields || []).filter((f) => f.status === status) }))
      .filter((r) => r.fields.length);

  // Status before hour: a contested cell is a decision to take, an unexported one is just
  // the export not having run, and the two must not be interleaved by hour — thirty
  // pending exports would push the day's two real conflicts off the top of the block.
  const rows = [...byStatus('conflict'), ...byStatus('missing')];
  const pending = byStatus('notInAppYet');
  if (!rows.length && !pending.length) return '';

  const chips = (fields) =>
    dcMore(
      fields.map(
        (f) => `<button class="dc-jump" data-dc-jump="${escapeHtml(f.key)}"
          title="${escapeHtml(f.table)}/${escapeHtml(f.id)}">${escapeHtml(f.label)}</button>`
      ),
      maxChips
    );

  let body = rows
    .map((r) => {
      const g = DC_FAIL_GROUP[r.status];
      return `<div class="dc-fail-row">
        <span class="dc-fail-what"><b>${r.fields.length}</b> ${r.fields.length === 1 ? 'casella' : 'caselles'}
          <span class="dc-pill ${g.cls}">${g.label}</span> a <b>${escapeHtml(r.hour)}</b></span>
        <span class="dc-fail-chips">${chips(r.fields)}</span>
      </div>`;
    })
    .join('');

  // No chips for these: the text is already computed and every one of them has the same
  // answer ("the export hasn't run"), so there is nothing to open cell by cell.
  if (pending.length) {
    const n = pending.reduce((a, r) => a + r.fields.length, 0);
    body += `<div class="dc-fail-row dc-fail-pending">
      <span class="dc-fail-what"><b>${n}</b> ${n === 1 ? 'casella' : 'caselles'}
        <span class="dc-pill dc-notyet">per exportar</span></span>
      <span class="dc-fail-note">ja ${n === 1 ? 'calculada' : 'calculades'} a <code>output/commons-ca</code>
        (${pending.map((r) => `${r.fields.length} a ${escapeHtml(r.hour)}`).join(', ')}) —
        ${n === 1 ? 'surt' : 'surten'} amb la propera exportació</span>
    </div>`;
  }

  const blame = d.blameSummary || [];
  const sole = blame.filter((b) => b.soleFields > 0).length;
  const foot = !blame.length
    ? ''
    : `<div class="dc-fail-foot">Les caselles en conflicte les comparteixen
        <b>${blame.length}</b> ${blame.length === 1 ? 'altra celebració' : 'celebracions'} ·
        ${sole ? `<b>${sole}</b> ${sole === 1 ? 'n’és causa única' : 'en són causa única'}` : 'cap n’és causa única'}
        <span class="dc-fail-hint">— obre una casella per veure qui la comparteix i què hi vol</span></div>`;

  return `<div class="dc-fail"><div class="dc-blame-head">Què falla en aquest dia</div>${body}${foot}</div>`;
}

// A chip is only worth clicking if it lands you on the field, which lives inside a folded
// Hour — so open the Hour, open the cell (loading its impact table, the view that does
// answer "because of whom"), and flash the row so the eye finds it after the scroll.
function dcJumpTo(key) {
  const row = document.querySelector(`tr[data-dc-key="${key}"]`);
  if (!row) return;
  const hour = row.closest('details.dc-hour');
  if (hour) hour.open = true;
  const full = row.nextElementSibling;
  if (full && full.classList.contains('dc-full') && full.hasAttribute('hidden')) {
    full.removeAttribute('hidden');
    row.classList.add('open');
    const impact = full.querySelector('[data-dc-impact]');
    if (impact) dcLoadImpact(impact);
  }
  row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  row.classList.remove('dc-flash');
  void row.offsetWidth; // restart the animation when the same chip is clicked twice
  row.classList.add('dc-flash');
}

// One Hour, folded shut: the header alone (bar + counts) says whether it is worth opening.
function dcHourBlock(h) {
  const t = h.totals || { ok: 0, conflict: 0, missing: 0, notInAppYet: 0 };
  const total = t.ok + t.conflict + t.missing + t.notInAppYet;
  const seg = (n, cls) => (n ? `<span class="dc-seg ${cls}" style="flex:${n}"></span>` : '');
  return `<details class="dc-hour">
    <summary class="dc-hour-head">
      <span class="pe-caret">▶</span>
      <span class="dc-hour-name">${escapeHtml(h.hour)}</span>
      <span class="dc-bar dc-bar-inline">
        ${seg(t.ok, 'dc-ok')}${seg(t.notInAppYet, 'dc-notyet')}${seg(t.conflict, 'dc-conflict')}${seg(t.missing, 'dc-missing')}
      </span>
      <span class="dc-hour-count">${t.ok}/${total} camps amb text</span>
    </summary>
    <table class="dc-table">
      <tr><th>Camp</th><th>Estat</th><th>Valor</th><th>Per què</th></tr>
      ${h.fields.map(dcFieldRows).join('')}
    </table>
  </details>`;
}

function dcSnippet(text, max = 110) {
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > max ? flat.slice(0, max - 1).trimEnd() + '…' : flat;
}

// A field is two rows: the summary line, and a hidden one with the whole text (or, for a
// conflict, the texts that were competing). Clicking the first toggles the second.
function dcFieldRows(f) {
  const s = DC_STATUS[f.status];
  const variants = (f.conflict && f.conflict.variants) || [];
  // The impact clause is the part that tells you whether THIS day is the problem: usually
  // it isn't, and the cell is withheld because of a handful of other dates.
  const imp = f.conflict && f.conflict.impact;
  const impactLine = !imp
    ? ''
    : imp.breakDays === 0
      ? '<div class="dc-why-impact ok">tots els dies que la comparteixen volen el mateix text</div>'
      : `<div class="dc-why-impact">amb el text d’aquest dia, <b>${imp.breakDays}</b> ${imp.breakDays === 1 ? 'dia' : 'dies'} de ${imp.days} ${imp.breakDays === 1 ? 'sortiria' : 'sortirien'} malament</div>`;

  // Which celebration the disagreeing days belong to. The cause line above says the cell
  // is shared; this says what is actually different about the days that break it. Named
  // only when there is one: past that, a list of titles in a narrow column is unreadable
  // and the drill-down below gives the same names with day counts and a verdict each.
  const blames = f.blame || [];
  const blameLine =
    blames.length === 1
      ? `<div class="dc-why-blame ${escapeHtml(blames[0].verdict)}">${blames[0].sole ? 'causa única' : 'una de les causes'}:
           <b>${escapeHtml(blames[0].title)}</b> — ${escapeHtml(blames[0].verdictLabel)}</div>`
      : blames.length
        ? `<div class="dc-why-blame"><b>${blames.length}</b> celebracions es reparteixen aquesta casella ·
             cap n’és causa única</div>`
        : '';

  const why = f.conflict
    ? `${escapeHtml(f.conflict.cause)} · ${f.conflict.variantCount} variants · ${f.conflict.affectedCount} dies · decisió: <b>${escapeHtml(f.conflict.decision)}</b>${impactLine}${blameLine}`
    : f.status === 'missing'
      ? 'el migrador no ha vist mai cap valor per a aquest id'
      : f.status === 'notInAppYet'
        ? 'ja calculat a output/commons-ca, falta exportar-lo'
        : f.source
          ? escapeHtml(f.source)
          : '';

  const value = f.value
    ? escapeHtml(dcSnippet(f.value))
    : variants.length
      ? `<span class="dc-snip-alt">la més comuna de ${variants.length}: ${escapeHtml(dcSnippet(variants[0].preview, 80))}</span>`
      : '<span class="dc-snip-none">sense text</span>';

  const expandable = !!f.value || variants.length > 0;
  const row = `<tr class="${s.cls}-row dc-row${expandable ? ' dc-expandable' : ''}"${expandable ? ' data-dc-row' : ''} data-dc-key="${escapeHtml(f.key || '')}">
    <td>${escapeHtml(f.label)} <span class="dc-id">${escapeHtml(f.table)}/${escapeHtml(f.id)}</span></td>
    <td><span class="dc-pill ${s.cls}">${escapeHtml(s.label)}</span></td>
    <td class="dc-cell-value">${value}</td>
    <td>${why}</td></tr>`;
  if (!expandable) return row;

  // For a conflict the raw variant list answers the wrong question ("how many texts are
  // there?") — the useful one is "if we filled this cell with what today wants, which
  // days break?". That needs the per-celebration breakdown, fetched on first open.
  const full = f.value
    ? `<div class="dc-fulltext">${escapeHtml(f.value)}</div>`
    : `<div class="dc-impact" data-dc-impact="${escapeHtml(f.table)}/${escapeHtml(f.id)}">
         <div class="dc-impact-loading">Calculant qui més fa servir aquesta casella…</div>
       </div>`;
  return row + `<tr class="dc-full" hidden><td colspan="4">${full}</td></tr>`;
}

// --- Conflict impact: which concrete days would end up wrong ---

const DC_VERDICT = {
  same: { label: 'coincideix', cls: 'dc-imp-same' },
  differs: { label: 'es trencaria', cls: 'dc-imp-differs' },
  varies: { label: 'varia segons l’any', cls: 'dc-imp-varies' },
};

// Each date is a way into the comparator: "this day would break" is a claim, and the only
// way to check it is to read that day in both apps. The cell travels with the date so the
// comparator can land on the very field being argued about instead of on a 60-row page.
function dcDates(dates, cell, max = 6) {
  const chips = dates.map(
    (d) => `<button type="button" class="dc-date-chip" data-dcmp-goto="${escapeHtml(d.date)}"
      data-dcmp-cell="${escapeHtml(cell || '')}" data-dcmp-hour="${escapeHtml(d.hour || '')}"
      title="Llegir ${escapeHtml(d.date)} a les dues apps">${escapeHtml(d.date)}</button>`
  );
  return dcMore(chips, max, { sep: ' ' });
}

function dcImpactGroupRow(g, cell) {
  const v = DC_VERDICT[g.verdict];
  // The agreeing text is already quoted in full above the table; repeating it on every
  // row would bury the one line that is actually news — the text that differs.
  const texts = g.texts
    .map(
      (t) => `<div class="dc-imp-text${t.sameAsReference ? ' is-ref' : ''}">
        <div class="dc-imp-text-head">
          <b>${t.days}</b> ${t.days === 1 ? 'dia' : 'dies'}
          ${t.sameAsReference ? '<span class="dc-imp-tag ok">el mateix text</span>' : '<span class="dc-imp-tag bad">text diferent</span>'}
          ${t.containsDate ? '<span class="dc-imp-tag mine">el dia que mires</span>' : ''}
        </div>
        ${t.sameAsReference ? '' : `<div class="dc-imp-text-body">${escapeHtml(dcSnippet(t.text, 120))}${t.truncated ? ' […]' : ''}</div>`}
        <div class="dc-imp-dates">${dcDates(t.dates, cell)}</div>
      </div>`
    )
    .join('');
  return `<tr class="dc-imp-row ${v.cls}${g.isMine ? ' is-mine' : ''}">
    <td class="dc-imp-cel">
      ${g.isMine ? '<span class="dc-imp-tag mine">aquest dia</span> ' : ''}${escapeHtml(g.name)}
      <div class="dc-id">${escapeHtml(g.litcalId)}</div>
    </td>
    <td class="dc-imp-days">${g.days}</td>
    <td><span class="dc-imp-verdict ${v.cls}">${v.label}</span></td>
    <td class="dc-imp-texts">${texts}</td>
  </tr>`;
}

function dcRenderImpact(el, d) {
  if (!d || d.found === false) {
    el.innerHTML = '<div class="rs-warn">No hi ha detall de conflicte per a aquesta casella.</div>';
    return;
  }
  const t = d.totals;
  const ref = d.reference ? dcSnippet(d.reference.text, 160) : '—';

  // The headline is deliberately a sentence, not a metric: the whole point is that the
  // day in front of you can be fine while the cell is still unusable.
  const verdictLine = t.breakDays
    ? `Si hi escrivíssim el text d’aquest dia: <b class="dc-ok-txt">${t.agreeDays}</b> ${t.agreeDays === 1 ? 'dia sortiria bé' : 'dies sortirien bé'}
       i <b class="dc-bad-txt">${t.breakDays}</b> ${t.breakDays === 1 ? 'dia mostraria un text que no li toca' : 'dies mostrarien un text que no els toca'}
       (${t.breakCelebrations} ${t.breakCelebrations === 1 ? 'celebració afectada' : 'celebracions afectades'}).`
    : 'Tots els dies que comparteixen aquesta casella volen el mateix text.';

  el.innerHTML = `
    <div class="dc-imp-head">
      <div class="dc-imp-title">Aquesta casella (<code>${escapeHtml(d.table)}/${escapeHtml(d.id)}</code>)
        la comparteixen <b>${t.days}</b> dies de <b>${t.celebrations}</b> celebracions,
        i cpl-app hi calcula <b>${t.texts}</b> textos diferents.</div>
      <div class="dc-imp-ref">
        ${d.dateNotObserved
          ? 'Aquest dia no surt a la migració, així que es pren el text majoritari:'
          : `El text que vol <b>${escapeHtml(d.date || '')}</b>${d.myName ? ` (${escapeHtml(d.myName)})` : ''}:`}
        <span class="dc-imp-ref-text">${escapeHtml(ref)}</span>
      </div>
      ${d.esText
        ? `<div class="dc-imp-ref">El que hi ha ara mateix en castellà (el que veus a eprex en <code>es</code>):
             <span class="dc-imp-ref-text dc-imp-es">${escapeHtml(dcSnippet(d.esText, 160))}</span></div>`
        : ''}
      <div class="dc-imp-verdict-line">${verdictLine}</div>
    </div>
    <table class="dc-imp-table">
      <tr><th>Celebració que comparteix la casella</th><th>Dies</th><th>Efecte</th><th>Què hi vol cpl-app</th></tr>
      ${d.groups.map((g) => dcImpactGroupRow(g, `${d.table}/${d.id}`)).join('')}
    </table>`;
}

async function dcLoadImpact(el) {
  if (el.dataset.loaded) return;
  el.dataset.loaded = '1';
  const [table, id] = el.dataset.dcImpact.split('/');
  const date = document.getElementById('dc-date').value;
  try {
    const res = await fetch(
      `/api/conflict-detail?table=${encodeURIComponent(table)}&id=${encodeURIComponent(id)}&date=${encodeURIComponent(date)}`
    );
    // A 404 here means the panel's server predates this endpoint — by far the most common
    // cause, and one a generic "connection error" sends you looking in the wrong place.
    if (res.status === 404) {
      el.dataset.loaded = '';
      el.innerHTML =
        '<div class="rs-warn">Aquest servidor no té <code>/api/conflict-detail</code>. Reinicia el panell: <code>node migration-to-saints/webui/server.js</code></div>';
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    dcRenderImpact(el, await res.json());
  } catch (e) {
    el.dataset.loaded = '';
    el.innerHTML = `<div class="rs-warn">No s’ha pogut carregar el detall (${escapeHtml(String(e.message || e))})</div>`;
  }
}

// --- Month calendar ---

const CAL_MONTHS = ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'];
const CAL_WEEKDAYS = ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'];
let calYear = null;
let calMonth = null;

// Buckets rather than a continuous gradient: a colour you can name is easier to scan
// than a shade you have to compare against its neighbours.
function calBucket(d) {
  if (d.outOfRange) return 'cal-out';
  if (d.notInIndex) return 'cal-none';
  if (d.percent === 100) return 'cal-100';
  if (d.percent >= 70) return 'cal-70';
  if (d.percent >= 40) return 'cal-40';
  if (d.percent > 0) return 'cal-1';
  return 'cal-0';
}

function renderCalendar(m) {
  document.querySelector('[data-results="cal-title"]').textContent = `${CAL_MONTHS[m.month - 1]} ${m.year}`;

  const t = m.totals;
  document.querySelector('[data-results="cal-summary"]').innerHTML =
    `<div class="summary-line">Global del mes: <b>${m.percent}%</b> dels camps amb text català ` +
    `(${t.fieldsOk} de ${t.fields})</div>` +
    `<div class="rv-chips">
       <span class="rv-chip"><b>${t.complete}</b> dies complets</span>
       <span class="rv-chip"><b>${t.incomplete}</b> parcials</span>
       <span class="rv-chip"><b>${t.unknown}</b> fora de l'índex compartit</span>
       ${t.outOfRange ? `<span class="rv-chip"><b>${t.outOfRange}</b> fora del rang migrat</span>` : ''}
     </div>`;

  // Monday-first grid: getUTCDay() is 0=Sunday, so shift it.
  const first = new Date(`${m.days[0].date}T00:00:00Z`).getUTCDay();
  const lead = (first + 6) % 7;

  let html = CAL_WEEKDAYS.map((w) => `<div class="cal-wd">${w}</div>`).join('');
  if (lead) html += `<div style="grid-column: span ${lead}"></div>`;

  for (const d of m.days) {
    const bucket = calBucket(d);
    const label = d.outOfRange ? '—' : d.notInIndex ? 'n/d' : `${d.percent}%`;
    const title = d.outOfRange
      ? 'fora del rang migrat'
      : `${d.litcalId}${d.notInIndex ? ' — sense entrada a l\'índex compartit' : ` — ${d.totals.ok}/${d.total} camps`}`;
    html += `<button class="cal-day ${bucket}" data-cal-day="${d.date}" title="${escapeHtml(title)}">
      <span class="cal-num">${d.day}</span>
      <span class="cal-pct">${label}</span>
    </button>`;
  }
  document.querySelector('[data-results="calendar"]').innerHTML = html;
}

async function calLoad(year, month) {
  calYear = year;
  calMonth = month;
  setStatus('cal', 'Carregant...');
  try {
    const res = await fetch(`/api/month-check?year=${year}&month=${month}`);
    const data = await res.json();
    if (data.ok === false) {
      setStatus('cal', data.error || 'Error', 'error');
      return;
    }
    renderCalendar(data);
    setStatus('cal', '', 'ok');
  } catch (e) {
    setStatus('cal', 'Error de connexió', 'error');
  }
}

function calShift(delta) {
  let y = calYear;
  let m = calMonth + delta;
  if (m < 1) {
    m = 12;
    y--;
  } else if (m > 12) {
    m = 1;
    y++;
  }
  calLoad(y, m);
}

async function dcCheck() {
  const date = document.getElementById('dc-date').value;
  if (!date) {
    setStatus('dc-check', 'Tria una data', 'error');
    return;
  }
  setStatus('dc-check', 'Comprovant...');
  try {
    const res = await fetch(`/api/day-check?date=${encodeURIComponent(date)}`);
    const data = await res.json();
    renderDayCheck(data);
    setStatus('dc-check', data.error ? 'Sense dades' : 'Fet', data.error ? 'error' : 'ok');
  } catch (e) {
    setStatus('dc-check', 'Error de connexió', 'error');
  }
}

// --- Day comparator: the same day read in both apps, side by side ----------------------
//
// The point of this view is to not have to open cpl-app and eprex on the phone and scroll
// them in parallel. So it is built for reading, not for counting: identical text is shown
// once (there is nothing to compare), and everything else is shown in full, in two columns.

const DCMP_VERDICT = {
  same: { label: 'igual', cls: 'dcmp-same' },
  diff: { label: 'diferent', cls: 'dcmp-diff' },
  onlyCpl: { label: 'només a cpl-app', cls: 'dcmp-onlycpl' },
  onlyApp: { label: 'només a saints-app', cls: 'dcmp-onlyapp' },
  ferial: { label: 'de la fèria', cls: 'dcmp-ferial' },
  none: { label: 'buit a les dues', cls: 'dcmp-none' },
};

const DCMP_STATUS_WHY = {
  conflict: 'la casella és compartida i els dies no s’hi posen d’acord',
  missing: 'el migrador no ha vist mai cap valor per a aquest id',
  notInAppYet: 'ja calculat, falta exportar-lo a saints-app',
};

let dcmpData = null;
let dcmpOnlyDiff = false;
// The cell the reader was sent here to look at, when they arrived from a conflict
// drill-down: {cell: "himnos/840", hour: "Laudes"}. Kept across a language switch, so
// "and how does this same cell read in Spanish?" doesn't cost a second hunt.
let dcmpFocus = null;
// The saints-app calendar follows the cpl-app diocese until you pick one yourself: the
// common case is "the same place on both sides", and the interesting case is deliberate.
let dcmpCalendarLinked = true;
let dcmpDioceseCalendar = {};

// The selectors are filled from the server (which reads litcal's calendars and the
// commons/<lang> trees), so a newly generated Catalan calendar appears without touching
// this file.
async function dcmpLoadOptions() {
  try {
    const opts = await (await fetch('/api/compare-options')).json();
    dcmpDioceseCalendar = opts.dioceseCalendar || {};
    const fill = (id, values, selected) => {
      const el = document.getElementById(id);
      el.innerHTML = values
        .map((v) => `<option value="${escapeHtml(v)}"${v === selected ? ' selected' : ''}>${escapeHtml(v)}</option>`)
        .join('');
    };
    const diocese = (opts.lastRun && opts.lastRun.diocese) || 'Barcelona';
    fill('dcmp-diocese', opts.dioceses || [], diocese);
    fill('dcmp-calendar', opts.calendars || [], dcmpDioceseCalendar[diocese] || 'spain');
    fill('dcmp-lang', opts.languages || ['ca'], 'ca');
  } catch (e) {
    setStatus('dc-compare', 'No s’han pogut carregar les opcions', 'error');
  }
}

function dcmpText(s) {
  return `<div class="dcmp-text">${escapeHtml(s)}</div>`;
}

function dcmpRow(r) {
  const v = DCMP_VERDICT[r.verdict];
  const cell = `<span class="dc-id">${r.table ? escapeHtml(`${r.table}/${r.id}`) : ''}</span>`;
  const why = r.status && DCMP_STATUS_WHY[r.status] ? `<div class="dcmp-why">${DCMP_STATUS_WHY[r.status]}</div>` : '';

  const head = `<div class="dcmp-row-head">
      <span class="dcmp-label">${escapeHtml(r.label)}</span>
      <span class="dcmp-pill ${v.cls}">${v.label}</span>
      ${cell}
      ${r.fromFerial ? '<span class="dcmp-note" title="Aquest dia l’app duu dos oficis (memòria i fèria) i cpl-app resa el de la fèria: es compara aquesta pestanya">de la fèria</span>' : ''}
      ${r.whitespaceOnly ? '<span class="dcmp-note">(mateix text, espais diferents)</span>' : ''}
    </div>`;

  // Nothing to compare: the two apps say the same thing, so it is printed once. Reading it
  // twice in parallel columns is exactly the work this tool exists to remove.
  const anchor = r.table ? ` data-dcmp-row-cell="${escapeHtml(`${r.table}/${r.id}`)}"` : '';
  if (r.verdict === 'same') {
    return `<div class="dcmp-row ${v.cls}"${anchor}>${head}<div class="dcmp-single">${dcmpText(r.cpl)}</div></div>`;
  }
  // Nothing to migrate here, and it is the longest text on the page (a whole psalm), so it
  // is folded away: the day stays readable and one click still opens it.
  if (r.verdict === 'ferial') {
    return `<div class="dcmp-row ${v.cls}"${anchor}>${head}
      <details class="dcmp-fold">
        <summary><span class="pe-caret">▶</span> L’índex de saints-app hi posa <code>-1</code>: aquest dia no té text
          propi aquí, el pren del saltiri/la fèria${r.cpl ? '. A cpl-app hi surt:' : '.'}</summary>
        ${r.cpl ? `<div class="dcmp-single">${dcmpText(r.cpl)}</div>` : ''}
      </details></div>`;
  }

  // What the phone shows when the cell is empty is not a blank — TextService prints its
  // own diagnostic string, and seeing it here is what makes the two views match.
  //
  // Unless the page's OTHER mode says exactly what cpl-app says: then that text is the
  // honest content of this column, and the empty default cell is the footnote. Repeating
  // the whole text in a second block below would double a hymn on screen to say "these
  // agree".
  const appSide = r.altModeMatch
    ? `<div class="dcmp-altmatch-head">llegint-lo en <b>l’altra pestanya</b> — idèntic a cpl-app:</div>
       ${dcmpText(r.altMode)}
       <div class="dcmp-why">a la pestanya que resa cpl-app la casella (${escapeHtml(`${r.table}/${r.id}`)}) és buida:
         <span class="dcmp-notfound-inline">${escapeHtml(r.appRender || '')}</span></div>`
    : r.app
      ? dcmpText(r.app)
      : r.appRender
        ? `<div class="dcmp-notfound">${escapeHtml(r.appRender)}</div>${why}`
        : `<div class="dcmp-empty">— cap casella per a aquest camp —</div>`;

  return `<div class="dcmp-row ${v.cls}"${r.table ? ` data-dcmp-row-cell="${escapeHtml(`${r.table}/${r.id}`)}"` : ''}>${head}
    <div class="dcmp-cols">
      <div class="dcmp-col">
        <div class="dcmp-col-head">cpl-app</div>
        ${r.cpl ? dcmpText(r.cpl) : '<div class="dcmp-empty">— res —</div>'}
      </div>
      <div class="dcmp-col">
        <div class="dcmp-col-head">saints-app (eprex)</div>
        ${appSide}
      </div>
    </div></div>`;
}

function dcmpHourBlock(h) {
  const rows = h.rows.filter((r) => r.verdict !== 'none' && (!dcmpOnlyDiff || (r.verdict !== 'same' && r.verdict !== 'ferial')));
  const t = h.totals;
  const counts = [
    t.same ? `${t.same} iguals` : '',
    t.diff ? `${t.diff} diferents` : '',
    t.onlyCpl ? `${t.onlyCpl} només a cpl-app` : '',
    t.onlyApp ? `${t.onlyApp} només a saints-app` : '',
    t.ferial ? `${t.ferial} sense text propi` : '',
    t.altModeMatch ? `${t.altModeMatch} coincideixen a l’altra pestanya` : '',
  ].filter(Boolean).join(' · ');

  return `<details class="dcmp-hour" open data-dcmp-hour="${escapeHtml(h.hour)}">
    <summary class="dcmp-hour-head">
      <span class="pe-caret">▶</span>
      <span class="dc-hour-name">${escapeHtml(h.hour)}</span>
      <span class="dcmp-hour-counts">${counts || 'sense camps'}</span>
    </summary>
    ${h.note ? `<div class="rs-warn">${escapeHtml(h.note)}</div>` : ''}
    ${rows.length ? rows.map(dcmpRow).join('') : '<div class="dcmp-empty">Cap camp per ensenyar amb aquest filtre.</div>'}
  </details>`;
}

function renderDayCompare(d) {
  const el = resultsEl('daycompare');
  if (!d || d.error) {
    el.innerHTML = `<div class="rs-warn">${escapeHtml((d && d.error) || 'Error')}</div>`;
    return;
  }
  dcmpData = d;

  const c = d.celebration || {};
  const sameTitle = c.verdict === 'same';
  const t = d.totals;

  let html = `<div class="dcmp">
    <div class="dcmp-head">
      <div class="dcmp-title">
        <span class="dcmp-date">${escapeHtml(d.date)}</span>
        ${sameTitle
          ? `<span class="dcmp-cel same">${escapeHtml(c.cpl || c.appGloss || '—')}</span>`
          : `<span class="dcmp-cel">cpl-app: <b>${escapeHtml(c.cpl || '— fèria —')}</b></span>
             <span class="dcmp-cel">saints-app: <b>${escapeHtml(c.appGloss || '—')}</b></span>`}
      </div>
      <div class="dcmp-controls">
        <label><input type="checkbox" data-dcmp-filter${dcmpOnlyDiff ? ' checked' : ''} /> només el que no coincideix</label>
        ${d.language === 'ca'
          ? '<button data-action="dcmp-es" title="El castellà ja està complet: serveix de referència per veure què conté la casella. No toca el calendari, així que la casella llegida és la mateixa">Llegir-ho en castellà</button>'
          : '<button data-action="dcmp-ca">Tornar al català</button>'}
        <button data-action="dcmp-fresh">Recalcular cpl-app</button>
      </div>
    </div>
    <div class="dcmp-sides">
      <span class="dcmp-side-tag">cpl-app · <b>${escapeHtml(d.diocese || '?')}</b>${d.prayingPlace && d.prayingPlace !== 'Diòcesi' ? ` · ${escapeHtml(d.prayingPlace)}` : ''}</span>
      <span class="dcmp-side-tag">saints-app · <b>${escapeHtml(d.calendar || '?')}</b> · ${escapeHtml((d.language || 'ca').toUpperCase())}
        → <code>${escapeHtml(d.litcalId || '?')}</code></span>
    </div>
    <div class="rv-chips">
      <span class="rv-chip"><b>${t.same}</b> iguals</span>
      <span class="rv-chip"><b>${t.diff}</b> diferents</span>
      <span class="rv-chip"><b>${t.onlyCpl}</b> només a cpl-app</span>
      ${t.onlyApp ? `<span class="rv-chip"><b>${t.onlyApp}</b> només a saints-app</span>` : ''}
      ${t.ferial ? `<span class="rv-chip"><b>${t.ferial}</b> sense text propi</span>` : ''}
      ${t.altModeMatch ? `<span class="rv-chip"><b>${t.altModeMatch}</b> coincideixen a l’altra pestanya</span>` : ''}
      ${d.cached ? '<span class="rv-chip">cpl-app: de la memòria cau</span>' : ''}
    </div>`;

  if (d.cplError) html += `<div class="rs-warn">${escapeHtml(d.cplError)}</div>`;
  // Only Catalan is being migrated: in es/it an empty cell is not a pending task but a
  // hole in the app as it ships, so the column must not be read the same way.
  if (!d.isMigrationTarget) {
    html += `<div class="dcmp-warn">Estàs llegint saints-app en <b>${escapeHtml((d.language || '').toUpperCase())}</b>,
      que no és l'idioma que s'està migrant: aquí un camp buit no vol dir "falta per migrar".</div>`;
  }
  // Only claimed when both titles are in the same language; across languages the two names
  // are expected to differ and saying so would be noise (see compareCelebration).
  if (c.verdict === 'diff' || c.verdict === 'onlyCpl' || c.verdict === 'onlyApp') {
    html += `<div class="dcmp-warn">Els dos costats no celebren el mateix aquest dia — la resta de diferències
      segurament venen d'aquí.</div>`;
  }

  html += d.hours.map(dcmpHourBlock).join('') + '</div>';
  el.innerHTML = html;
  dcmpApplyFocus();
}

// Lands the reader on the cell they clicked. The filter is cleared first: arriving from
// "this day would break" and finding the row hidden because it happens to match is the
// one outcome that would make the jump useless.
function dcmpApplyFocus() {
  if (!dcmpFocus || !dcmpFocus.cell) return;
  const el = resultsEl('daycompare');
  // Both the selectors here are class-qualified on purpose: the chips that send you here
  // carry the same cell and hour in their own data attributes, and they sit earlier in the
  // document, so an unqualified query lands on the chip you just clicked.
  const sel = `.dcmp-row[data-dcmp-row-cell="${CSS.escape(dcmpFocus.cell)}"]`;
  const scope = dcmpFocus.hour
    ? document.querySelector(`details.dcmp-hour[data-dcmp-hour="${CSS.escape(dcmpFocus.hour)}"]`)
    : null;
  const row = (scope && scope.querySelector(sel)) || document.querySelector(sel);

  // The cell you came to look at isn't in this reading. Almost always the calendar was
  // changed and the date now resolves to a different celebration, which reads different
  // cells — a silent answer about another day would be worse than no answer.
  if (!row) {
    const warn = document.createElement('div');
    warn.className = 'rs-warn';
    warn.innerHTML = `La casella <code>${escapeHtml(dcmpFocus.cell)}</code> no surt en aquesta lectura:
      amb el calendari <b>${escapeHtml((dcmpData && dcmpData.calendar) || '?')}</b> aquest dia resol a
      <code>${escapeHtml((dcmpData && dcmpData.litcalId) || '?')}</code>, que llegeix unes altres caselles.
      El calendari és el que decideix quina casella es llegeix; l'idioma no.`;
    const container = el.querySelector('.dcmp');
    if (container) container.insertBefore(warn, container.children[2] || null);
    return;
  }

  document.querySelectorAll('.dcmp-row.focused').forEach((n) => n.classList.remove('focused'));
  row.classList.add('focused');
  row.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function dcCompare({ fresh = false } = {}) {
  const date = document.getElementById('dcmp-date').value;
  if (!date) {
    setStatus('dc-compare', 'Tria una data', 'error');
    return;
  }
  const val = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : '';
  };
  setStatus('dc-compare', fresh ? 'Rellegint cpl-app…' : 'Llegint les dues apps…');
  try {
    const params = new URLSearchParams({
      date,
      diocese: val('dcmp-diocese'),
      prayingPlace: val('dcmp-praying-place'),
      calendar: val('dcmp-calendar'),
      lang: val('dcmp-lang'),
    });
    if (fresh) params.set('fresh', '1');
    const res = await fetch(`/api/day-compare?${params}`);
    const data = await res.json();
    renderDayCompare(data);
    setStatus('dc-compare', data.error ? 'Sense dades' : 'Fet', data.error ? 'error' : 'ok');
  } catch (e) {
    setStatus('dc-compare', 'Error de connexió', 'error');
  }
}

// --- Review queue ---

const RV_KIND_LABEL = {
  feast: 'Una festa concreta',
  psalter: 'Saltiri de 4 setmanes',
  'ordinary-weekday': 'Temps Ordinari (barrejat)',
  shared: 'Casella compartida',
  unknown: 'Sense classificar',
};
let rvQueue = null;

function rvRenderTotals(q) {
  const el = document.querySelector('[data-results="review-totals"]');
  const t = q.totals;
  const pct = t.ids ? ((100 * t.idsDecided) / t.ids).toFixed(0) : 0;
  const kinds = Object.entries(q.byKind)
    .sort((a, b) => b[1].ids - a[1].ids)
    .map(([k, v]) => `<span class="rv-chip">${escapeHtml(RV_KIND_LABEL[k] || k)}: <b>${v.bundles}</b> paquets · ${v.ids} ids</span>`)
    .join('');
  el.innerHTML =
    `<div class="summary-line"><b>${t.ids}</b> ids en conflicte → <b>${t.bundles}</b> paquets de revisió · ` +
    `decidits <b>${t.decided}</b> paquets (<b>${t.idsDecided}</b> ids, ${pct}%)` +
    (t.stale ? ` · <span class="bad">${t.stale} desactualitzats</span>` : '') +
    `</div><div class="rv-chips">${kinds}</div>` +
    `<div class="rv-bar"><div class="rv-bar-fill" style="width:${pct}%"></div></div>`;
}

function rvPopulateFilters(q) {
  const sel = document.getElementById('rv-kind');
  const kinds = Object.keys(q.byKind).sort();
  sel.innerHTML =
    '<option value="">Totes les causes</option>' +
    kinds.map((k) => `<option value="${k}">${escapeHtml(RV_KIND_LABEL[k] || k)} (${q.byKind[k].bundles})</option>`).join('');
}

function rvRenderList() {
  if (!rvQueue) return;
  const kind = document.getElementById('rv-kind').value;
  const decision = document.getElementById('rv-decision').value;
  const search = document.getElementById('rv-search').value.trim().toLowerCase();

  const items = rvQueue.bundles.filter((b) => {
    if (kind && b.kind !== kind) return false;
    if (decision === 'pending' && b.decision !== 'pending') return false;
    if (decision === 'decided' && b.decision === 'pending') return false;
    if (decision === 'stale' && !b.stale) return false;
    if (search && !(b.label + ' ' + b.tables.join(' ') + ' ' + b.litcalKeys.join(' ')).toLowerCase().includes(search))
      return false;
    return true;
  });

  const shown = items.slice(0, 150);
  const el = resultsEl('review');
  el.innerHTML =
    `<div class="pe-summary">Mostrant <b>${shown.length}</b> de <b>${items.length}</b> paquets.</div>` +
    shown.map(rvRenderBundle).join('');
}

function rvRenderBundle(b) {
  const choices = Object.entries(rvQueue.choices)
    .map(
      ([value, label]) =>
        `<button class="rv-choice ${b.decision === value ? 'active' : ''}" data-rv-choice="${escapeHtml(value)}" data-rv-bundle="${escapeHtml(b.id)}" data-rv-fp="${escapeHtml(b.fingerprint)}">${escapeHtml(label)}</button>`
    )
    .join('');
  const badge =
    b.decision === 'pending'
      ? '<span class="rv-badge pending">sense revisar</span>'
      : `<span class="rv-badge done">${escapeHtml(rvQueue.choices[b.decision] || b.decision)}</span>`;
  const stale = b.stale ? '<span class="rv-badge stale">desactualitzat</span>' : '';
  return `<div class="pe-item rv-item" data-rv-id="${escapeHtml(b.id)}">
    <div class="pe-item-header" data-rv-toggle="${escapeHtml(b.id)}">
      <span class="pe-caret">▶</span>
      <span class="pe-item-title">${escapeHtml(b.label)}</span>
      <span class="rv-kind">${escapeHtml(RV_KIND_LABEL[b.kind] || b.kind)}</span>
      ${badge}${stale}
      <span class="pe-item-count">${b.idCount} ids · ${b.dayCount} dies</span>
    </div>
    <div class="pe-detail">
      <div class="rv-tables">Taules afectades: ${escapeHtml(b.tables.join(', '))}</div>
      <div class="rv-choices">${choices}</div>
      <label class="rv-note-wrap">Nota
        <input type="text" class="rv-note" data-rv-note="${escapeHtml(b.id)}" value="${escapeHtml(b.note)}"
               placeholder="per què has decidit això..." />
      </label>
      <div class="rv-items" data-rv-items="${escapeHtml(b.id)}"><span class="pe-summary">Obre per carregar el detall...</span></div>
    </div>
  </div>`;
}

async function rvLoadBundleDetail(id) {
  const holder = document.querySelector(`[data-rv-items="${CSS.escape(id)}"]`);
  if (!holder || holder.dataset.loaded) return;
  holder.innerHTML = '<span class="pe-summary">Carregant...</span>';
  try {
    const res = await fetch(`/api/review-bundle?id=${encodeURIComponent(id)}`);
    const b = await res.json();
    holder.innerHTML = (b.items || [])
      .map((it) => {
        const total = it.variants.reduce((a, v) => a + v.tags.length, 0) || 1;
        const bar = it.variants
          .map((v, i) => {
            const pct = ((v.tags.length / total) * 100).toFixed(1);
            return `<div class="pe-bar-seg" style="width:${pct}%;background:${PE_PALETTE[i % PE_PALETTE.length]}" title="${escapeHtml(v.preview)}"></div>`;
          })
          .join('');
        const variants = it.variants
          .map(
            (v, i) =>
              `<div class="pe-variant"><div class="pe-variant-head">
                 <span class="pe-variant-swatch" style="background:${PE_PALETTE[i % PE_PALETTE.length]}"></span>
                 ${v.tags.length} ocurrència(es)</div>
               <div class="pe-variant-text">${escapeHtml(v.preview)}</div></div>`
          )
          .join('');
        return `<div class="rv-id-block">
          <div class="rv-id-head"><b>${escapeHtml(it.table)}</b> · id ${escapeHtml(it.id)} · ${it.affectedCount} afectats</div>
          <div class="pe-bar">${bar}</div>${variants}</div>`;
      })
      .join('');
    holder.dataset.loaded = '1';
  } catch (e) {
    holder.innerHTML = `<span class="bad">Error carregant el detall</span>`;
  }
}

async function rvSaveDecision(bundleId, choice, fingerprint) {
  const noteEl = document.querySelector(`[data-rv-note="${CSS.escape(bundleId)}"]`);
  const res = await fetch('/api/review-decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bundleId, choice, note: noteEl ? noteEl.value : '', fingerprint }),
  });
  const data = await res.json();
  if (!data.ok) {
    setStatus('rv-load', 'Error desant', 'error');
    return;
  }
  const bundle = rvQueue.bundles.find((b) => b.id === bundleId);
  if (bundle) {
    bundle.decision = choice;
    bundle.note = noteEl ? noteEl.value : '';
    bundle.stale = false;
  }
  rvQueue.totals = data.totals;
  rvRenderTotals(rvQueue);
  // Repaint just this bundle's controls, keeping the rest of the list (and scroll) put.
  const item = document.querySelector(`[data-rv-id="${CSS.escape(bundleId)}"]`);
  if (item) {
    item.querySelectorAll('[data-rv-choice]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.rvChoice === choice);
    });
    const badge = item.querySelector('.rv-badge');
    if (badge) {
      badge.className = 'rv-badge ' + (choice === 'pending' ? 'pending' : 'done');
      badge.textContent = choice === 'pending' ? 'sense revisar' : rvQueue.choices[choice] || choice;
    }
  }
  setStatus('rv-load', 'Desat', 'ok');
}

async function rvLoad() {
  setStatus('rv-load', 'Carregant...');
  try {
    const res = await fetch('/api/review-queue');
    rvQueue = await res.json();
    rvPopulateFilters(rvQueue);
    rvRenderTotals(rvQueue);
    rvRenderList();
    setStatus('rv-load', `Fet (${rvQueue.totals.bundles} paquets)`, 'ok');
  } catch (e) {
    setStatus('rv-load', 'Error de connexió', 'error');
  }
}

// Open on the current month; the arrows walk to any month of the migrated window.
(function initCalendar() {
  const now = new Date();
  calLoad(now.getFullYear(), now.getMonth() + 1);
})();

// The comparator opens on today: the day you are most likely to want to read.
(function initComparator() {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  document.getElementById('dcmp-date').value = iso;
  dcmpLoadOptions();
})();

['rv-kind', 'rv-decision'].forEach((id) =>
  document.getElementById(id).addEventListener('change', () => rvQueue && rvRenderList())
);
document.getElementById('rv-search').addEventListener('input', () => rvQueue && rvRenderList());

// --- Pending explorer ---
const PE_PALETTE = ['#e07a5f', '#3d5a80', '#8a9b68', '#c9a227', '#6b4e8e', '#4a7c7c', '#b5545a', '#5b7fa6'];
let peItems = [];

function pePopulateTableFilter() {
  const select = document.getElementById('pe-table');
  const tables = [...new Set(peItems.map((i) => i.table))].sort();
  select.innerHTML = '<option value="">Totes les taules</option>' + tables.map((t) => `<option value="${t}">${t}</option>`).join('');
}

function peBalanceRatio(item) {
  const counts = item.variants.map((v) => v.tags.length).sort((a, b) => b - a);
  const total = counts.reduce((a, b) => a + b, 0);
  return total ? counts[0] / total : 1; // 1 = all agree on one dominant variant, lower = more split
}

function peRenderList() {
  const table = document.getElementById('pe-table').value;
  const search = document.getElementById('pe-search').value.trim().toLowerCase();
  const sort = document.getElementById('pe-sort').value;

  let items = peItems.filter((i) => {
    if (table && i.table !== table) return false;
    if (!search) return true;
    if (i.id.toLowerCase().includes(search)) return true;
    return i.variants.some((v) => v.preview.toLowerCase().includes(search));
  });

  if (sort === 'count-desc') items = items.slice().sort((a, b) => b.affectedCount - a.affectedCount);
  else if (sort === 'variants-desc') items = items.slice().sort((a, b) => b.variants.length - a.variants.length);
  else if (sort === 'balance') items = items.slice().sort((a, b) => peBalanceRatio(a) - peBalanceRatio(b));

  const total = items.length;
  const shown = items.slice(0, 200);

  document.querySelector('[data-results="pe-summary"]').innerHTML =
    `Mostrant <b>${shown.length}</b> de <b>${total}</b> pendents (d'un total de ${peItems.length}). Afina la cerca o la taula si en falten.`;

  const el = resultsEl('pending-explorer');
  el.innerHTML = shown.map((item, idx) => peRenderItem(item, idx)).join('');
}

function peRenderItem(item, idx) {
  const total = item.variants.reduce((a, v) => a + v.tags.length, 0) || 1;
  const bar = item.variants
    .map((v, i) => {
      const pct = ((v.tags.length / total) * 100).toFixed(1);
      const color = PE_PALETTE[i % PE_PALETTE.length];
      return `<div class="pe-bar-seg" style="width:${pct}%;background:${color}" title="${escapeHtml(v.preview)} — ${v.tags.length}×"></div>`;
    })
    .join('');
  const details = item.variants
    .map((v, i) => {
      const color = PE_PALETTE[i % PE_PALETTE.length];
      const tags = dcMore(
        v.tags.map((t) => `<span>${escapeHtml(t)}</span>`),
        40,
        { label: (n) => `+${n} més` }
      );
      return `<div class="pe-variant">
        <div class="pe-variant-head"><span class="pe-variant-swatch" style="background:${color}"></span> ${v.tags.length} ocurrència(es)</div>
        <div class="pe-variant-text">${escapeHtml(v.preview)}</div>
        <div class="pe-variant-tags">${tags}</div>
      </div>`;
    })
    .join('');
  return `<div class="pe-item" data-pe-idx="${idx}">
    <div class="pe-item-header" data-pe-toggle="${idx}">
      <span class="pe-caret">▶</span>
      <span class="pe-item-title">${escapeHtml(item.table)}.json — <b>${escapeHtml(item.id)}</b></span>
      <div class="pe-bar">${bar}</div>
      <span class="pe-item-count">${item.affectedCount} afectats · ${item.variants.length} variants</span>
    </div>
    <div class="pe-detail">${details}</div>
  </div>`;
}

document.getElementById('pe-table').addEventListener('change', () => peItems.length && peRenderList());
document.getElementById('pe-sort').addEventListener('change', () => peItems.length && peRenderList());
document.getElementById('pe-search').addEventListener('input', () => peItems.length && peRenderList());

async function peLoad() {
  setStatus('pe-load', 'Carregant...');
  try {
    const res = await fetch('/api/pending-report');
    const data = await res.json();
    peItems = data.items || [];
    pePopulateTableFilter();
    peRenderList();
    setStatus('pe-load', `Fet (${peItems.length} pendents)`, 'ok');
  } catch (e) {
    setStatus('pe-load', 'Error de connexió', 'error');
  }
}

// The comparator's controls. The filter only re-renders what is already loaded; the
// selectors do not fetch on their own — reading a day costs a Jest run, so it waits for
// the button — except that picking a diocese moves the calendar with it, which is the
// pairing you want by default and which you can then override.
document.addEventListener('change', (e) => {
  if (e.target.matches('[data-dcmp-filter]')) {
    dcmpOnlyDiff = e.target.checked;
    if (dcmpData) renderDayCompare(dcmpData);
    return;
  }
  if (e.target.id === 'dcmp-diocese' && dcmpCalendarLinked) {
    const wanted = dcmpDioceseCalendar[e.target.value];
    const cal = document.getElementById('dcmp-calendar');
    if (wanted && cal && [...cal.options].some((o) => o.value === wanted)) cal.value = wanted;
    return;
  }
  // Touching the calendar yourself unlinks it: from then on the two sides stay where you
  // put them, which is the whole point of having them apart.
  if (e.target.id === 'dcmp-calendar') dcmpCalendarLinked = false;
});

document.addEventListener('click', async (e) => {
  // First, before any container handler: these buttons sit inside rows and headers that are
  // themselves clickable, and unfolding a list must never also open/close its host.
  const more = e.target.closest('[data-dc-more]');
  if (more) {
    const rest = more.previousElementSibling;
    if (rest && rest.classList.contains('dc-rest')) {
      const nowHidden = rest.toggleAttribute('hidden');
      more.textContent = nowHidden ? more.dataset.dcMore : 'mostra’n menys';
      more.classList.toggle('open', !nowHidden);
    }
    return;
  }

  const calDay = e.target.closest('[data-cal-day]');
  if (calDay) {
    document.querySelectorAll('.cal-day.selected').forEach((n) => n.classList.remove('selected'));
    calDay.classList.add('selected');
    const date = calDay.dataset.calDay;
    document.getElementById('dc-date').value = date;
    // Carry the day over to the comparator too, so "this one looks wrong, let me read it"
    // is one button away instead of a second date pick.
    document.getElementById('dcmp-date').value = date;
    await dcCheck();
    resultsEl('daycheck').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  const jump = e.target.closest('[data-dc-jump]');
  if (jump) {
    dcJumpTo(jump.dataset.dcJump);
    return;
  }

  // A date from a conflict drill-down: read that day in both apps, on the cell that was
  // being argued about.
  //
  // It lands in Spanish, because that is the question being asked. The cell is contested,
  // so in Catalan it is empty and both days would show nothing — nothing to compare. The
  // shipped Spanish holds ONE text for that cell, the same one on every day that shares
  // it, and reading it next to what cpl-app wants on this particular day is what tells you
  // whether the two days are really the same thing or not.
  //
  // The calendar is left alone on purpose: it is what decides which cell gets read (see
  // the dcmp-es handler), so moving it could land on a day where this cell doesn't exist.
  const goto = e.target.closest('[data-dcmp-goto]');
  if (goto) {
    document.getElementById('dcmp-date').value = goto.dataset.dcmpGoto;
    dcmpFocus = { cell: goto.dataset.dcmpCell || null, hour: goto.dataset.dcmpHour || null };
    const lang = document.getElementById('dcmp-lang');
    if (dcmpFocus.cell && [...lang.options].some((o) => o.value === 'es')) lang.value = 'es';
    if (dcmpOnlyDiff) {
      dcmpOnlyDiff = false;
      const box = document.querySelector('[data-dcmp-filter]');
      if (box) box.checked = false;
    }
    document.getElementById('daycompare').scrollIntoView({ behavior: 'smooth', block: 'start' });
    await dcCompare();
    return;
  }

  const dcRow = e.target.closest('tr[data-dc-row]');
  if (dcRow) {
    const full = dcRow.nextElementSibling;
    if (full && full.classList.contains('dc-full')) {
      const nowHidden = full.toggleAttribute('hidden');
      dcRow.classList.toggle('open', !nowHidden);
      const impact = !nowHidden && full.querySelector('[data-dc-impact]');
      if (impact) dcLoadImpact(impact);
    }
    return;
  }

  const choice = e.target.closest('[data-rv-choice]');
  if (choice) {
    await rvSaveDecision(choice.dataset.rvBundle, choice.dataset.rvChoice, choice.dataset.rvFp);
    return;
  }

  const rvToggle = e.target.closest('[data-rv-toggle]');
  if (rvToggle) {
    const item = rvToggle.closest('.pe-item');
    item.classList.toggle('open');
    if (item.classList.contains('open')) rvLoadBundleDetail(rvToggle.dataset.rvToggle);
    return;
  }

  const toggle = e.target.closest('[data-pe-toggle]');
  if (toggle) {
    toggle.closest('.pe-item').classList.toggle('open');
    return;
  }

  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'pe-load') {
    await peLoad();
    return;
  }
  if (action === 'rv-load') {
    await rvLoad();
    return;
  }
  if (action === 'dc-check') {
    await dcCheck();
    return;
  }
  if (action === 'dc-compare') {
    await dcCompare();
    return;
  }
  if (action === 'dcmp-fresh') {
    await dcCompare({ fresh: true });
    return;
  }
  // The shipped Spanish is the reference reading: it is complete, so if the cell holds the
  // right thing at all, `es` shows what that thing is.
  //
  // Only the language moves. The calendar decides which litcal day the date resolves to,
  // and therefore WHICH CELL is read: switching it to `spain` to "read it in Spanish"
  // would, on a Catalan-only feast, quietly answer about a different day (12-02-2026 is
  // santa_eulalia under diocese-barcelona and an ordinary Thursday under spain). The
  // language alone keeps the cell and changes only the text that comes out of it.
  if (action === 'dcmp-es' || action === 'dcmp-ca') {
    document.getElementById('dcmp-lang').value = action === 'dcmp-es' ? 'es' : 'ca';
    await dcCompare();
    return;
  }
  if (action === 'cal-prev') {
    calShift(-1);
    return;
  }
  if (action === 'cal-next') {
    calShift(1);
    return;
  }
  if (action.startsWith('refresh-')) {
    const what = action.replace('refresh-', '');
    if (what !== 'litcal' && !confirm('Això escriurà de veritat a litcal i/o a saints-app/.../commons/ca/. Continuar?')) return;
    if (what === 'litcal' && !confirm('Això escriurà de veritat a litcal/src/data/calendars/. Continuar?')) return;
    runRefresh(what);
    return;
  }
  if (action === 'stage1') renderStage1(await runAction('stage1'));
  else if (action === 'stage2') renderStage2(await runAction('stage2', { body: { write: false } }));
  else if (action === 'stage2-write') {
    if (!confirm('Això escriurà de veritat a litcal/src/data/calendars/. Continuar?')) return;
    renderStage2(await runAction('stage2-write', { body: { write: true } }));
  } else if (action === 'generate-loaders') renderGenerateLoaders(await runAction('generate-loaders'));
  else if (action === 'laudes') renderLaudes(await runAction('laudes'));
  else if (action === 'mig-calculate' || action === 'mig-export') {
    const start = document.getElementById('mig-start').value;
    const end = document.getElementById('mig-end').value;
    const hours = [];
    if (document.getElementById('mig-hour-laudes').checked) hours.push('Laudes');
    if (document.getElementById('mig-hour-vespers').checked) hours.push('Vespers');
    const diocese = document.getElementById('mig-diocese').value;
    if (action === 'mig-export' && !confirm('Això escriurà de veritat a saints-app/.../commons/ca/. Continuar?')) return;
    const endpoint = action === 'mig-export' ? 'migrator/export' : 'migrator/calculate';
    renderMigrator(await runAction(action, { body: { start, end, hours, diocese }, endpoint, displayKey: 'migrator' }));
  }
  else if (action === 'dropped-report') {
    const res = await fetch('/api/dropped-report');
    renderDroppedReport(await res.json());
    setStatus('dropped-report', 'Fet', 'ok');
  }
});
