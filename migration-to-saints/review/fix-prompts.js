// Turns each fixable finding into a prompt to paste into a fresh session.
//
// The review itself never writes: it reads cpl-app.db, the join output and eprex's trees and
// reports. Applying a correction is a different kind of act — it edits code, may need the
// join re-run, and must end in a reviewable commit — so it happens in its own session, with
// the finding's evidence carried over so nothing has to be re-derived.
//
// One prompt per finding, self-contained: what is wrong, how it was proven, what to change,
// how to verify it, and how to record it.

const { FINDINGS, VERDICTS } = require('./findings');

const strip = (s) => String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// Where the fix lands decides what "done" means, so each verdict gets its own closing ritual.
const PROTOCOL = {
  1: `- Fix al codi de cpl-app, test de regressió a \`__tests__/services/\`, i dossier a \`migration-to-saints/cpl-bugs/CPL-LIT-NNN.md\`.
- Si el problema és de DADES i no de codi: **no toquis \`src/assets/db/cpl-app.db\` a mà**. Escriu \`db-fixes/CPL-LIT-NNN.sql\` idempotent (que corregeixi per l'estat incorrecte, no per \`id\` de fila) i documenta-ho al dossier.
- Commit amb el trailer \`Cpl-Bug: CPL-LIT-NNN\`.`,
  2: `- El contingut és d'eprex, **fora d'aquest repositori**. No hi facis canvis directament.
- Deixa la proposta escrita a \`migration-to-saints/cpl-bugs/\` amb els ids concrets, perquè es pugui passar a qui manté saints-app.`,
  3: `- És codi nostre: aplica el canvi, afegeix el test que detecti la regressió, i commiteja.
- Si el canvi afecta el join, **torna'l a córrer** i apunta com queden els pendents abans i després.`,
};

function promptFor(f) {
  if (!f.fix || !f.fix.promptable) return null;
  const v = VERDICTS[f.verdict];
  const lines = [];

  lines.push(`# ${f.id} · ${strip(f.headline)}`);
  lines.push('');
  lines.push(`Repositori: \`/Users/pau/projects/personal/cpl-app\` (branca \`catalan-migration\`).`);
  lines.push(`Veredicte de la revisió: **${f.verdict} — ${v.label}**.`);
  lines.push(`Dies on es va veure: ${f.days.join(', ')}.`);
  lines.push('');
  lines.push('## Què passa');
  lines.push(strip(f.detail));
  if (f.why) { lines.push(''); lines.push(strip(f.why)); }
  if (f.impact) { lines.push(''); lines.push(`**Conseqüència:** ${strip(f.impact)}`); }

  if (f.table) {
    lines.push('');
    lines.push(`| ${f.table.head.join(' | ')} |`);
    lines.push(`|${f.table.head.map(() => '---').join('|')}|`);
    for (const r of f.table.rows) lines.push(`| ${r.join(' | ')} |`);
  }

  if (f.proof && f.proof.length) {
    lines.push('');
    lines.push('## Com es va provar');
    for (const [k, txt, url] of f.proof) lines.push(`- **${k}** — ${strip(txt)}${url ? ` <${url}>` : ''}`);
  }

  lines.push('');
  lines.push('## Què s’ha de canviar');
  lines.push(`A: \`${f.fix.where}\``);
  lines.push('');
  lines.push(strip(f.fix.summary));
  if (f.fix.diff) {
    lines.push('');
    lines.push('```diff');
    lines.push(f.fix.diff);
    lines.push('```');
  }
  if (f.fix.table) {
    lines.push('');
    lines.push(`| ${f.fix.table.head.join(' | ')} |`);
    lines.push(`|${f.fix.table.head.map(() => '---').join('|')}|`);
    for (const r of f.fix.table.rows) lines.push(`| ${r.join(' | ')} |`);
  }
  if (f.fix.note) { lines.push(''); lines.push(`> ${strip(f.fix.note)}`); }

  lines.push('');
  lines.push('## Com tancar-ho');
  lines.push(PROTOCOL[f.verdict] || '- Aplica, verifica i commiteja.');
  lines.push('');
  lines.push('## Comprovació');
  lines.push('Torna a córrer la revisió dels mateixos dies i confirma que la troballa ha desaparegut:');
  lines.push('');
  lines.push('```sh');
  lines.push(`make review DATES=${f.days.join(',')}`);
  lines.push('```');

  return { id: f.id, verdict: f.verdict, title: strip(f.headline), text: lines.join('\n') };
}

function all() {
  return FINDINGS.map(promptFor).filter(Boolean);
}

module.exports = { all, promptFor };

if (require.main === module) {
  const prompts = all();
  for (const p of prompts) {
    console.log(`\n${'='.repeat(78)}\n${p.id} · veredicte ${p.verdict}\n${'='.repeat(78)}\n`);
    console.log(p.text);
  }
  console.error(`\n${prompts.length} prompts generats.`);
}
