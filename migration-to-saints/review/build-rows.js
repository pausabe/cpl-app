// Day-by-day review driver: for each date, pairs cpl-app's real text with the cell
// saints-app reads, in BOTH languages, and attaches everything known about why a cell is
// withheld. Emits one JSON of rows for the report to be written from.
//
// The Catalan column is the migration target but is still mostly empty on these days; the
// Spanish column is complete and is the same cell, so it stands in as "what liturgical slot
// is this" when Catalan has nothing yet. See the plan for the three channels.

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const dayCheck = require(path.join(REPO, 'migration-to-saints/day-check'));
const dayCompare = require(path.join(REPO, 'migration-to-saints/day-compare'));
const { splitHeading } = require(path.join(REPO, 'migration-to-saints/lib/citation-headings'));
const { textKey } = require(path.join(REPO, 'migration-to-saints/lib/text-key'));

const RUN = process.env.RUN_DIR || path.join(__dirname, 'run');
fs.mkdirSync(RUN, { recursive: true });
const DATES = process.env.DATES
  ? process.env.DATES.split(',').map((s) => s.trim()).filter(Boolean)
  : ['2026-08-20', '2026-08-21', '2026-08-22', '2026-08-23', '2026-08-24'];
const CPL_DUMP = process.env.CPL_DUMP || path.join(RUN, 'cpl-days.json');
const OUT = process.env.OUT || path.join(RUN, 'review-rows.json');

// The fields under review, derived from the inspector's own per-Hour lists so a new Hour can
// never again be reviewed through Laudes' vocabulary. Out of scope by instruction: the hymn
// and the Latin hymn (copied from `es`), the Our Father invitation (hand-translated) and the
// Mass commentaries (`COMMENT`, which never enter `MASS_FIELDS` in the first place).
const OUT_OF_SCOPE = new Set(['himno', 'himno_latino', 'invitacion_padrenuestro']);
const IN_SCOPE = new Set(
  [dayCheck.FIELDS, dayCheck.OFFICE_FIELDS, dayCheck.MASS_FIELDS]
    .flat()
    .map((f) => f.key)
    .filter((k) => !OUT_OF_SCOPE.has(k))
);

// Fields whose value is a citation, not prose: these get the language-independent fingerprint
// treatment. Everything else is compared as text. The Mass's reference cells and the Office's
// reading citations are citations too — with a subtitle glued on after a `_`, which
// `bareReference()` strips.
const CITATION_FIELDS = new Set(
  [...IN_SCOPE].filter((k) => /_cita$|_cita_a$|_ref$/.test(k))
);

// --- Normalisation -------------------------------------------------------------------
//
// stripMarkup, bareReference and fingerprint live in lib/citation-key.js: the Common proposal
// needs the very same answers, and a second copy of the book table would drift.
const {
  stripMarkup, bareReference, fingerprint,
} = require(path.join(REPO, 'migration-to-saints/lib/citation-key'));

// --- Row assembly --------------------------------------------------------------------

function rowsByKey(compare) {
  const out = new Map();
  for (const h of compare.hours) {
    for (const r of h.rows) {
      out.set(`${h.hour}\u0000${r.key}\u0000${r.label}`, { hour: h.hour, ...r });
    }
  }
  return out;
}

function main() {
  const dump = JSON.parse(fs.readFileSync(CPL_DUMP, 'utf8'));
  const ctxCa = dayCheck.buildContext({ language: 'ca' });
  const ctxEs = dayCheck.buildContext({ language: 'es' });

  const days = [];
  for (const date of DATES) {
    const cplDay = dump.days[date];
    if (!cplDay || cplDay.error) {
      days.push({ date, error: (cplDay && cplDay.error) || 'cpl-app no ha resolt el dia' });
      continue;
    }
    const fromFerial = cplDay.ferialFields;
    const chkCa = dayCheck.checkDay(date, { ctx: ctxCa, fromFerial, impact: true });
    const chkEs = dayCheck.checkDay(date, { ctx: ctxEs, fromFerial });
    // Coverage as the reader will experience it. `fromFerial` redirects a memorial's fields
    // to the ferial cells — right for deciding WHICH cell cpl-app's text belongs in, but not
    // for "what shows up when you open the app", because saints-app's page opens on the
    // saint's tab. Counted without the redirect, this is the same number the panel reports.
    const chkCaApp = dayCheck.checkDay(date, { ctx: ctxCa });
    const cmpCa = dayCompare.compareDay(date, cplDay, chkCa, { language: 'ca' });
    const cmpEs = dayCompare.compareDay(date, cplDay, chkEs, { language: 'es' });
    const esRows = rowsByKey(cmpEs);

    const rows = [];
    for (const h of cmpCa.hours) {
      for (const r of h.rows) {
        if (!IN_SCOPE.has(r.key)) continue;
        const es = esRows.get(`${h.hour}\u0000${r.key}\u0000${r.label}`) || null;
        const cpl = r.cpl;
        const ca = r.app;
        const esText = es ? es.app : null;

        // Channel: Catalan cell filled -> compare like with like. Otherwise fall back to
        // the Spanish cell, which is the same slot and is complete.
        const channel = ca != null ? 'C1' : esText != null ? 'C2' : 'C0';

        const isCitation = CITATION_FIELDS.has(r.key);
        const fpCpl = isCitation ? fingerprint(cpl) : null;
        const fpEs = isCitation ? fingerprint(esText) : null;
        const fpCa = isCitation ? fingerprint(ca) : null;

        // The app shows Catalan text here and cpl-app prays NOTHING here. That is not a text
        // disagreement — there is no cpl-app text to disagree with — but it is not "they
        // match" either: the reader of eprex sees a line cpl-app does not have. It gets its
        // own verdict so the report can never fold it into "everything coincides".
        //
        // Two shapes of it are structural and expected, and only those are excused:
        //
        // One shape of it is structural and expected: the `CELEBRATION_*` column on a day
        // cpl-app prays the FERIAL Mass, as the Missal says it should. cpl-app has nothing for
        // the saint's column by design (D-001), and `resolve-cpl-days` emits no `CELEBRATION_`
        // key at all on those days.
        //
        // Everything else counts, and it is where the real findings are: on a feast cpl-app
        // says ONE antiphon over the three psalms of an intermediate Hour, so antiphons 2 and
        // 3 come back empty — while eprex prints two antiphons nobody prays that day.
        const cplEmpty = cpl == null || String(cpl).trim() === '';
        const expectedNoSource = cplEmpty && r.key.startsWith('CELEBRATION_')
          && !Object.keys((cplDay.hours && cplDay.hours[h.hour]) || {}).some((k) => k.startsWith('CELEBRATION_'));

        let match = null;
        if (channel === 'C1') {
          // Equality first, and only then emptiness. The other way round, the deliberate blank
          // that `es` keeps in slot 0 of a reading responsory — which cpl-app matches exactly,
          // both a single space — was reported as "the app shows what cpl-app does not".
          const equal = textKey(String(cpl ?? '')) === textKey(String(ca ?? ''));
          match = equal ? 'same' : cplEmpty ? 'onlyApp' : 'diff';

          // A citation is not prose: what makes two of them the same is the scripture they
          // name, not the bytes. cpl-app keeps the reference and its descriptive line in two
          // columns and the proper tables leave the line out; saints-app has ONE cell, and the
          // join fills it with the fullest spelling — the decision of 14 Aug 2026, written up
          // in lib/citation-headings. So on every day with proper psalmody the app reads
          // "Salm 23\nEntrada del Senyor al santuari" against cpl-app's bare "Salm 23" and
          // this reported it as a divergence: the accepted cost of a decision, dressed up as a
          // bug. C2 had compared citations by fingerprint since the start; C1 never did,
          // although it was already computing `fpCa` and importing `splitHeading` to do it.
          if (match === 'diff' && isCitation && fpCpl && fpCa) {
            const headCpl = splitHeading(cpl).description;
            const headCa = splitHeading(ca).description;
            // Only a MISSING heading is excused. Two different descriptions for one reference
            // are not a context difference — the single case in the corpus is a typo in
            // cpl-app's data (citation-headings.js) — so those stay visible.
            const headingOnly = !headCpl || !headCa || headCpl === headCa;
            match = fpCpl.token !== fpCa.token
              ? 'diffRef'                                    // different book or chapter
              : !headingOnly
                ? 'diff'                                     // same psalm, two descriptions
                : fpCpl.tokenFull !== fpCa.tokenFull
                  ? 'sameRefVerses'                          // same psalm, different precision
                  : 'sameRefHeading';                        // same psalm, heading on one side
          }
        } else if (channel === 'C2' && isCitation) {
          match = !fpCpl || !fpEs
            ? 'unparsed'
            : fpCpl.token !== fpEs.token
              ? 'diffRef'                                  // different book or chapter
              : fpCpl.tokenFull === fpEs.tokenFull
                ? 'sameRef'                                // identical down to the verses
                : 'sameRefVerses';                         // same psalm, different precision
        } else if (channel === 'C2') {
          match = 'prose'; // needs judgement, carried through for reading
        }

        rows.push({
          hour: h.hour,
          key: r.key,
          label: r.label,
          table: r.table,
          id: r.id,
          status: r.status,          // ok | conflict | missing | notInAppYet
          verdictCa: r.verdict,      // same | diff | onlyCpl | onlyApp | ferial | none
          channel,
          match,
          // Set only on the two structural shapes above: cpl-app was never going to have a
          // value here. Anything else marked `onlyApp` is a real difference to look at.
          expectedNoSource,
          fromFerial: r.fromFerial,
          altModeMatch: r.altModeMatch,
          noProperText: r.noProperText,
          cpl,
          ca,
          es: esText,
          cplClean: stripMarkup(cpl),
          caClean: stripMarkup(ca),
          esClean: stripMarkup(esText),
          fp: { cpl: fpCpl, es: fpEs, ca: fpCa },
          conflict: r.conflict
            ? {
                cause: r.conflict.cause,
                bundleId: r.conflict.bundleId,
                variantCount: r.conflict.variantCount,
                affectedCount: r.conflict.affectedCount,
                decision: r.conflict.decision,
                impact: r.conflict.impact || null,
                variants: r.conflict.variants,
              }
            : null,
          blame: r.blame || null,
        });
      }
    }

    days.push({
      date,
      litcalId: chkCa.litcalId,
      allXKey: chkCa.allXKey,
      cplTitle: (cplDay.celebration && cplDay.celebration.title) || null,
      cplType: (cplDay.celebration && cplDay.celebration.celebrationType) || null,
      cplWeek: (cplDay.celebration && cplDay.celebration.week) || null,
      cplWeekCycle: (cplDay.celebration && cplDay.celebration.weekCycle) || null,
      cplSpecificTime: (cplDay.celebration && cplDay.celebration.specificLiturgyTime) || null,
      appName: cmpCa.celebration.app,
      appGloss: cmpCa.celebration.appGloss,
      celebration: chkCa.celebration,
      // Two different questions, deliberately kept apart (see the report's "dos eixos"):
      //   coverage  — what the reader sees on the tab the app opens on. Matches the panel.
      //   compared  — the cells this review actually read, after the ferial redirect.
      coverage: (() => {
        const t = chkCaApp.totals;
        // `have` counts the text we already hold, whether or not it has shipped.
        // `reachable` adds the contested cells: those DO have Catalan text, it is only
        // withheld until the disagreement is settled — so they are the real target.
        // `unreachable` is the honest ceiling: nobody ever supplied a value, and on a
        // memorial that is structural, because cpl-app prays the ferial office and so has
        // no text for the saint's tab at all.
        const have = t.ok + t.notInAppYet;
        const reachable = have + t.conflict;
        return {
          ok: t.ok,
          notInAppYet: t.notInAppYet,
          conflict: t.conflict,
          missing: t.missing,
          have,
          reachable,
          unreachable: t.missing,
          total: chkCaApp.total,
          percent: chkCaApp.percent,
          percentOfReachable: reachable ? Math.round((100 * have) / reachable) : 0,
        };
      })(),
      migration: {
        ok: chkCa.totals.ok,
        conflict: chkCa.totals.conflict,
        missing: chkCa.totals.missing,
        notInAppYet: chkCa.totals.notInAppYet,
        total: chkCa.total,
        percent: chkCa.percent,
      },
      // True on the days where the two counts disagree, i.e. memorials with the switch.
      tabsDiffer: chkCaApp.totals.ok !== chkCa.totals.ok,
      ferialFieldCount: {
        Laudes: (fromFerial.Laudes || []).length,
        Vespers: (fromFerial.Vespers || []).length,
      },
      blameSummary: chkCa.blameSummary,
      rows,
    });
  }

  fs.writeFileSync(OUT, JSON.stringify({ dates: DATES, diocese: dump.diocese, days }, null, 2), 'utf8');

  // Terminal summary so the shape is visible without opening the JSON.
  for (const d of days) {
    if (d.error) { console.log(`${d.date}  ERROR ${d.error}`); continue; }
    const c = {};
    for (const r of d.rows) {
      const k = `${r.channel}/${r.match}`;
      c[k] = (c[k] || 0) + 1;
    }
    console.log(`${d.date}  ${d.litcalId}  files=${d.rows.length}  ca=${d.migration.ok}/${d.migration.total}`);
    console.log(`   ${Object.entries(c).sort().map(([k, v]) => `${k}:${v}`).join('  ')}`);
  }
  console.log(`\n-> ${OUT}`);
}

main();
