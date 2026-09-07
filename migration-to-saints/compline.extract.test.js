// Compline (Completes) -> saints-app's `db/compline/ca/{1..7}.json`. Phase 2 of FASES.md.
//
// This Hour does NOT go through day_specific_texts: saints-app keeps it as SEVEN files per
// language, one per weekday (`complineStore.ts` imports `compline/{lang}/{dayNumber}.json`,
// Sunday = 1 … Saturday = 7). There is no shared numeric id space, so there are no shared
// cells, no conflicts to resolve and no probe to run — which is why it is the cheapest whole
// Hour on the board and why it needs its own extractor instead of the join.
//
// The two apps agree on the structure, verified psalm by psalm on a clean week
// (2026-09-06..12): Ps 90 / 85 / 142,1-11 / 30,2-6 + 129 / 15 / 87 / 4 + 133. They also
// agree on the rule that moves Saturday's office to the eve of a solemnity — cpl-app does it
// in its own resolution and saints-app in `dayWhenSpecialDays`, so the representative dates
// below are deliberately taken from a week with no solemnity in it.
//
//   npx jest migration-to-saints/compline.extract.test.js

const path = require('path');
const fs = require('fs');

// A week of Ordinary Time with no solemnity and no solemnity eve, so each weekday resolves
// to its OWN psalmody instead of being pulled to the Sunday-after-First-Vespers office.
const ORDINARY_WEEK = {
  1: '2026-09-06', 2: '2026-09-07', 3: '2026-09-08', 4: '2026-09-09',
  5: '2026-09-10', 6: '2026-09-11', 7: '2026-09-12',
};
// Season-wide fields. All seven files carry the same value for each of these (checked
// against es: `responsorio`, `responsorio_pascua`, `antifona_inalbis` and
// `cantico_evangelico_antifona` have exactly one distinct value across the seven), so one
// representative date each is enough.
const EASTER_WEEKDAY = '2026-04-20';   // Easter season, plain weekday -> the alleluia responsory
const EASTER_OCTAVE = '2026-04-08';    // -> antifona_inalbis
const HOLY_SATURDAY = '2026-04-04';    // -> antifona_triduo (the full form, as es has it)

const OUT_DIR = process.env.OUT_DIR
  ? path.resolve(process.env.OUT_DIR)
  : path.resolve(__dirname, 'output/compline-ca');
const ES_DIR = '/Users/pau/projects/saints/saints-app/src/store/db/compline/es';
const HEADINGS_PATH = path.resolve(__dirname, 'static-translations/compline_oracion.ca.json');

jest.mock('../src/Services/SettingsService', () => {
  const DioceseName = {
    Andorra: 'Andorra', Barcelona: 'Barcelona', Girona: 'Girona', Lleida: 'Lleida',
    Mallorca: 'Mallorca', Menorca: 'Menorca', SantFeliu: 'Sant Feliu de Llobregat',
    Solsona: 'Solsona', Tarragona: 'Tarragona', Terrassa: 'Terrassa', Tortosa: 'Tortosa',
    Urgell: 'Urgell', Vic: 'Vic',
  };
  const PrayingPlace = { Diocese: 'Diòcesi', City: 'Ciutat', Cathedral: 'Catedral' };
  return { __esModule: true, DioceseName, PrayingPlace, default: {} };
});

jest.mock('../src/Services/DatabaseManagerService', () => {
  const p = require('path');
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(p.resolve(__dirname, '../src/Assets/db/cpl-app.db'), { readOnly: true });
  return {
    executeQueryAsync: (q) => {
      try { return Promise.resolve(db.prepare(q).all()); } catch (e) { return Promise.reject(e); }
    },
  };
});

const { buildSettings, resolveDay, responsoryParts } = require('./lib/cpl-day-resolver');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

async function nightPrayer(dateStr, settings) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const { hoursLiturgy } = await resolveDay(new Date(y, m - 1, d), settings);
  return hoursLiturgy.NightPrayer;
}

test('writes Catalan Compline for the seven weekdays', async () => {
  const settings = buildSettings({ dioceseName: 'Barcelona', prayingPlace: 'Diòcesi' });
  const headings = readJson(HEADINGS_PATH);

  // The two seasonal antiphons ride on ShortResponsory.SpecialAntiphon, which is exactly
  // where cpl-app puts them: the Triduum's "Crist es féu per nosaltres obedient…" and the
  // Easter octave's "Avui és el dia en què ha obrat el Senyor…".
  const triduum = await nightPrayer(HOLY_SATURDAY, settings);
  const octave = await nightPrayer(EASTER_OCTAVE, settings);
  const easter = await nightPrayer(EASTER_WEEKDAY, settings);
  const antifonaTriduo = triduum.ShortResponsory && triduum.ShortResponsory.SpecialAntiphon;
  const antifonaInalbis = octave.ShortResponsory && octave.ShortResponsory.SpecialAntiphon;
  const responsorioPascua = responsoryParts(easter);
  expect(antifonaTriduo).toBeTruthy();
  expect(antifonaInalbis).toBeTruthy();
  expect(responsorioPascua).toHaveLength(6);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const written = [];
  for (const [n, dateStr] of Object.entries(ORDINARY_WEEK)) {
    const es = readJson(path.join(ES_DIR, `${n}.json`));
    const np = await nightPrayer(dateStr, settings);

    const out = {
      // Identity and the link back to CPL's own site: not content, copied as-is.
      idd: es.idd,
      slug: es.slug,
      // The file's heading ("Completas: Lunes"). Not liturgical text and not in cpl-app.db —
      // hand-translated, the same way invitacion_padrenuestro was.
      oracion: headings[n],
      himno: np.Anthem,
      // Latin does not depend on the app's language, so es is the source. cpl-app pairs the
      // Latin hymns with the weekdays differently; changing that here would make the Catalan
      // app disagree with the Spanish and Italian ones over a text none of them translates.
      himno_latino: es.himno_latino,
    };

    const psalms = [['primer', np.FirstPsalm]];
    if (np.HasMultiplePsalms && np.SecondPsalm) psalms.push(['segundo', np.SecondPsalm]);
    for (const [prefix, psalm] of psalms) {
      out[`${prefix}_salmo_cita`] = psalm.Title;
      // With two psalms under one antiphon cpl-app leaves the second one's empty; the
      // renderer then has nothing to print there, which is what the screen shows too.
      out[`${prefix}_salmo_antifona`] =
        prefix === 'segundo' && np.UseOnlyFirstPsalmAntiphon ? '' : psalm.Antiphon;
      out[`${prefix}_salmo_texto`] = psalm.Psalm;
    }

    out.lectura_biblica_cita = np.ShortReading.Quote;
    out.lectura_biblica = np.ShortReading.ShortReading;
    out.responsorio = responsoryParts(np);
    out.responsorio_pascua = responsorioPascua;
    if ('antifona_triduo' in es) out.antifona_triduo = antifonaTriduo;
    out.antifona_inalbis = antifonaInalbis;
    out.cantico_evangelico_antifona = np.EvangelicalAntiphon;
    // es renders "Oremos:" as the first line of the blob rather than as its own field.
    out.final = `Preguem:\n${np.FinalPrayer}`;

    // Same shape as the Spanish file, minus the fields es carries and cpl-app has no source
    // for (the rubrics and alternative prayers inside `final` — see D-004).
    expect(out.primer_salmo_cita).toBeTruthy();
    expect(out.himno).toBeTruthy();
    expect(Object.keys(out).length).toBeGreaterThanOrEqual(15);

    fs.writeFileSync(path.join(OUT_DIR, `${n}.json`), JSON.stringify(out, null, 2), 'utf8');
    written.push(n);
  }
  expect(written).toHaveLength(7);
  console.log(`Completes escrites a ${OUT_DIR}: ${written.join(', ')}.json`);
}, 600000);
