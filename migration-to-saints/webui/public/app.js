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

async function runAction(action, { method = 'POST', body } = {}) {
  const buttons = document.querySelectorAll(`[data-action="${action}"]`);
  buttons.forEach((b) => (b.disabled = true));
  setStatus(action, 'Executant...');
  resultsEl(action).innerHTML = '';
  try {
    const res = await fetch(`/api/${action.replace('-write', '')}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (data.ok === false) {
      setStatus(action, 'Error', 'error');
    } else {
      setStatus(action, 'Fet', 'ok');
    }
    return data;
  } catch (e) {
    setStatus(action, 'Error de connexió', 'error');
    resultsEl(action).innerHTML = `<pre class="log">${escapeHtml(String(e))}</pre>`;
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

document.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'stage1') renderStage1(await runAction('stage1'));
  else if (action === 'stage2') renderStage2(await runAction('stage2', { body: { write: false } }));
  else if (action === 'stage2-write') {
    if (!confirm('Això escriurà de veritat a litcal/src/data/calendars/. Continuar?')) return;
    renderStage2(await runAction('stage2-write', { body: { write: true } }));
  } else if (action === 'generate-loaders') renderGenerateLoaders(await runAction('generate-loaders'));
  else if (action === 'laudes') renderLaudes(await runAction('laudes'));
  else if (action === 'dropped-report') {
    const res = await fetch('/api/dropped-report');
    renderDroppedReport(await res.json());
    setStatus('dropped-report', 'Fet', 'ok');
  }
});
