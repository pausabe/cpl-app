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
  let html = `<div class="summary-line">Rang: <b>${escapeHtml(data.start)} → ${escapeHtml(data.end)}</b> · Hores: <b>${(data.hours || []).join(', ')}</b></div>`;
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
      const tags = v.tags.slice(0, 40).map((t) => `<span>${escapeHtml(t)}</span>`).join('');
      const more = v.tags.length > 40 ? `<span>+${v.tags.length - 40} més</span>` : '';
      return `<div class="pe-variant">
        <div class="pe-variant-head"><span class="pe-variant-swatch" style="background:${color}"></span> ${v.tags.length} ocurrència(es)</div>
        <div class="pe-variant-text">${escapeHtml(v.preview)}</div>
        <div class="pe-variant-tags">${tags}${more}</div>
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

document.addEventListener('click', async (e) => {
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
    if (action === 'mig-export' && !confirm('Això escriurà de veritat a saints-app/.../commons/ca/. Continuar?')) return;
    const endpoint = action === 'mig-export' ? 'migrator/export' : 'migrator/calculate';
    renderMigrator(await runAction(action, { body: { start, end, hours }, endpoint, displayKey: 'migrator' }));
  }
  else if (action === 'dropped-report') {
    const res = await fetch('/api/dropped-report');
    renderDroppedReport(await res.json());
    setStatus('dropped-report', 'Fet', 'ok');
  }
});
