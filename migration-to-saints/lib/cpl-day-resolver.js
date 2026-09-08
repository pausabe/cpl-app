// Resolves cpl-app's REAL liturgy for one date, using cpl-app's own Services/Models, and
// flattens each Hour into the same field vocabulary the saints-app index uses
// (`himno`, `primer_salmo_texto`, `responsorios`, …). That shared vocabulary is what lets
// the day comparator put cpl-app's text and saints-app's text on the same row.
//
// This module is plain Node, but it must be loaded from a Jest test file: cpl-app's
// Services reach the DB through `DatabaseManagerService` and pull in RN/expo globals that
// only the `jest-expo` preset provides. The caller mocks that seam (see cpl-day.test.js);
// everything here runs the app's unmodified logic.

const CelebrationIdentifierService = require('../../src/Services/CelebrationIdentifierService');
const DatabaseDataService = require('../../src/Services/DatabaseDataService');
const DatabaseDataHelper = require('../../src/Services/DatabaseDataHelper');
const SpecialCelebrationService = require('../../src/Services/SpecialCelebrationService');
const { ObtainLiturgyMasters } = require('../../src/Services/Liturgy/LiturgyMastersService');
const { ObtainHoursLiturgy } = require('../../src/Services/Liturgy/HoursLiturgyService');
const LaudesService = require('../../src/Services/Liturgy/LaudesService');
const { ObtainHours } = require('../../src/Services/Liturgy/HoursService');
const { ObtainMassLiturgy } = require('../../src/Services/Liturgy/MassLiturgyService');
const Laudes = require('../../src/Models/HoursLiturgy/Laudes').default;
const Hours = require('../../src/Models/HoursLiturgy/Hours').default;
const { ferialFields } = require('./memorial-ferial');
const { Settings } = require('../../src/Models/Settings');
const LiturgyDayInformation = require('../../src/Models/LiturgyDayInformation').default;
const { DioceseCode } = require('../../src/Services/DatabaseEnums');
const { SpecificLiturgyTimeType } = require('../../src/Services/CelebrationTimeEnums');

// Fixed short-form doxology used mid-responsory — same constant the join uses, so the
// comparator's cpl-app column is byte-identical to what the join would have written.
const GLORIA_PATRI_SHORT = 'Glòria al Pare, i al Fill, i a l’Esperit Sant.';

// Mirrors DataService.ObtainCurrentSettings, minus AsyncStorage.
function buildSettings({ dioceseName, prayingPlace = 'Diòcesi', useLatin = false }) {
  const settings = new Settings();
  settings.PrayingPlace = prayingPlace;
  settings.DioceseName = dioceseName;
  settings.DioceseCode = DatabaseDataHelper.GetDioceseCodeFromDioceseName(dioceseName, prayingPlace);
  settings.DioceseCode2Letters =
    settings.DioceseCode === DioceseCode.Andorra ? settings.DioceseCode : settings.DioceseCode.substring(0, 2);
  settings.UseLatin = useLatin;
  settings.TextSize = 3;
  settings.DarkModeEnabled = false;
  settings.InvitationPsalmOption = '94';
  settings.VirginAntiphonOption = '1';
  settings.OptionalFestivityEnabled = false;
  return settings;
}

// Copied verbatim from DataService.tsx (it isn't exported).
function isSpecialChristmas(day) {
  if (day.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary) return false;
  if (CelebrationIdentifierService.CheckCelebration(CelebrationIdentifierService.Celebration.SacredFamily, day)) {
    return false;
  }
  const d = day.Date.getDate();
  const m = day.Date.getMonth();
  if (m === 11) return [17, 18, 19, 20, 21, 22, 23, 24, 29, 30, 31].includes(d);
  if (m === 0) return [2, 3, 4, 5, 7, 8, 9, 10, 11, 12].includes(d);
  return false;
}

async function obtainLiturgyDayInformation(date, settings) {
  const ldi = new LiturgyDayInformation();
  ldi.Today = await DatabaseDataService.ObtainLiturgySpecificDayInformation(date, settings);
  ldi.Today.SpecialCelebration = SpecialCelebrationService.ObtainSpecialCelebration(ldi.Today, settings);
  ldi.Today.IsSpecialChristmas = isSpecialChristmas(ldi.Today);
  const tomorrowDate = new Date(date);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  ldi.Tomorrow = await DatabaseDataService.ObtainLiturgySpecificDayInformation(tomorrowDate, settings);
  ldi.Tomorrow.SpecialCelebration = SpecialCelebrationService.ObtainSpecialCelebration(ldi.Tomorrow, settings);
  ldi.Tomorrow.IsSpecialChristmas = isSpecialChristmas(ldi.Tomorrow);
  return ldi;
}

// Where one Hour's data lives on the resolved day. Laudes, Vespers and the Office of
// Readings sit at the root; Terce, Sext and None hang off `Hours`.
function hourDataOf(hoursLiturgy, hour) {
  const nested = INTERMEDIATE_HOURS[hour];
  if (nested) return hoursLiturgy.Hours ? hoursLiturgy.Hours[nested] : null;
  return hoursLiturgy[hour];
}

// The Mass, in the two halves saints-app keeps apart.
//
// `all_lectures.json` carries a memorial's own readings under `CELEBRATION_*` and the
// weekday's under the plain roles, and `lecturesStore` merges the two so the page shows both.
// cpl-app shows ONE Mass: `GetMassLiturgy` returns the celebration's on a memorial, feast or
// solemnity and the weekday's otherwise. So which of the two cells cpl-app's text belongs in
// depends on what it decided to render — and the way to know is the same trick the Hours use
// (lib/memorial-ferial.js): ask for the weekday's Mass a second time, from the real code path
// (`GetNormalDaysMassLiturgy`, keyed on season, weekday, week and year cycle), and see whether
// what it rendered is that or something else.
//
// Both halves are returned. A day where they are equal simply has nothing proper.
async function resolveMass(ldi, hoursLiturgy, settings) {
  let rendered = null;
  try {
    const massLiturgy = await ObtainMassLiturgy(
      ldi, hoursLiturgy.TodayCelebrationInformation, hoursLiturgy.TomorrowCelebrationInformation, settings,
    );
    // `MassLiturgy.Vespers` is the anticipated evening Mass of the following day. The index
    // has one entry per day and no cell for it, so it is not carried: see PLAN §18.5.
    rendered = massLiturgy.Today;
  } catch {
    return null;
  }
  let ferial = null;
  try {
    ferial = await DatabaseDataService.GetNormalDaysMassLiturgy(ldi.Today);
  } catch {
    ferial = null;
  }
  return { rendered, ferial };
}

// Mirrors DataService.ReloadAllData.
async function resolveDay(date, settings) {
  const ldi = await obtainLiturgyDayInformation(date, settings);
  const tomorrowLdi = await obtainLiturgyDayInformation(ldi.Tomorrow.Date, settings);
  const todayMasters = await ObtainLiturgyMasters(ldi, settings);
  const tomorrowMasters = await ObtainLiturgyMasters(tomorrowLdi, settings);
  const hoursLiturgy = await ObtainHoursLiturgy(todayMasters, tomorrowMasters, ldi, settings);

  // The same day with the celebration taken out, so a caller can tell a proper text from a
  // weekday one field by field (lib/memorial-ferial.js). Laudes has to be asked for;
  // Vespers without the celebration is already one of the options just computed.
  // Terce/Sext/None come as one object; asked for with an empty celebration it is the same
  // call the app makes, so seasons and psalter weeks behave exactly as on screen.
  const ferialHours = ObtainHours(todayMasters, ldi.Today, new Hours(), settings);
  const ferial = {
    Laudes: LaudesService.ObtainLaudes(todayMasters, ldi.Today, new Laudes(), settings),
    Vespers: hoursLiturgy.VespersOptions.VespersWithoutCelebration,
    Tercia: ferialHours.ThirdHour,
    Sexta: ferialHours.SixthHour,
    Nona: ferialHours.NinthHour,
  };
  const mass = await resolveMass(ldi, hoursLiturgy, settings);
  return { liturgyDayInformation: ldi, hoursLiturgy, ferial, mass };
}

// --- Prayers blob -> its parts (same parse as the join; see join-content.test.js) --------
// One addition: the final paragraph, cpl-app's own invitation to the Lord's Prayer. The
// join doesn't observe it (that cell is filled from a hand-translated table), but the
// comparator must still show what cpl-app says there — it's a line Pau reads in the app.
function parsePrayers(blob) {
  if (!blob) return null;
  const paragraphs = blob.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length < 2) return null;
  const firstLines = paragraphs[0].split('\n').map((l) => l.trim()).filter(Boolean);
  const middle = paragraphs.slice(1, -1);
  return {
    intro: firstLines.slice(0, -1).join('\n'),
    respuesta: firstLines[firstLines.length - 1],
    contenido: middle.map((p) => {
      const idx = p.indexOf('—');
      if (idx === -1) return { peticion: p.trim(), cierre: '' };
      return { peticion: p.slice(0, idx).trim(), cierre: p.slice(idx + 1).replace(/^\t/, '').trim() };
    }),
    padrenuestro: paragraphs[paragraphs.length - 1],
  };
}

function expandResponsory(r) {
  if (!r) return null;
  if (r.HasSpecialAntiphon) return { special: r.SpecialAntiphon };
  const full = `${r.FirstPart || ''} ${r.SecondPart || ''}`.trim();
  return {
    parts: [
      `℣. ${r.FirstPart || ''} * ${r.SecondPart || ''}`,
      `℟. ${full}`,
      `℣. ${r.ThirdPart || ''}`,
      `℟. ${r.SecondPart || ''}`,
      `℣. ${GLORIA_PATRI_SHORT}`,
      `℟. ${full}`,
    ],
  };
}


// The two places an intermediate Hour differs from Laudes in cpl-app's model. They live
// here, and both the comparator's flattener below and the join's `observeHour` call them,
// so the two can't drift — which is the mistake this file's header exists to prevent.

// A celebration says ONE antiphon over all three psalms (`HasMultipleAntiphons: false`),
// and the psalms keep carrying the psalter's own antiphons underneath — cpl-app does not
// show those. The index has the same shape: 173 of the 495 entries of `all_tercia.json`
// carry `primer_salmo_antifona` and -1 in the other two. Returns one entry per psalm.
function psalmAntiphons(hourData) {
  if (hourData.HasMultipleAntiphons === false && hourData.UniqueAntiphon) {
    return [hourData.UniqueAntiphon, null, null];
  }
  return [hourData.FirstPsalm, hourData.SecondPsalm, hourData.ThirdPsalm].map((p) => (p ? p.Antiphon : null));
}

// The responsory in the shape the index stores it. Laudes and Vespers expand to six lines;
// an intermediate Hour's is a plain versicle/response pair (`CommonParts.Responsory`) and
// the index holds exactly two ids for it — `℣.` then `℟.`, verified against es/responsorios
// 10415/10416 of `advent_1_friday__ANY`.
function responsoryParts(hourData) {
  if (hourData.ShortResponsory) {
    const r = expandResponsory(hourData.ShortResponsory);
    if (!r) return null;
    return r.parts || (r.special ? [r.special] : null);
  }
  const r = hourData.Responsory;
  if (r && (r.Versicle || r.Response)) return [`℣. ${r.Versicle || ''}`, `℟. ${r.Response || ''}`];
  return null;
}

// --- The Office of Readings ------------------------------------------------------------
//
// A different shape from every other Hour, so it gets its own three helpers rather than
// bending `extractHourFields` around it. What each one has to produce is not a matter of
// taste: `OfficeFirstLecture.vue` and `OfficeSecondLecture.vue` take the fields apart
// themselves, and the Catalan has to come apart the same way or the page loses a line.

// `lectura_*_cita_a` is TWO lines in one cell, separated by a literal `$`: the components
// render `split("$")[0]` as its own paragraph (the book, or the author and work) and
// `split("$")[1]` in the `reference-bible` style next to the title (the chapter and verses,
// or the critical edition). Writing the citation as one plain string would leave that second
// slot empty on every day of the year.
//
// cpl-app already holds the two halves apart — `Reference` and `Quote` — so the separator is
// inserted between them, spaced exactly as `es` spaces it ("Del libro del profeta Miqueas
// $Miq 4, 1-7 $"). Where cpl-app cuts is not where `es` cuts: for the patristic reading `es`
// puts the author alone before the `$` and the work after it, while cpl-app puts "Dels
// comentaris de sant Agustí, bisbe, als Salms" before and the locus "(Salm 47, 7: CCL 38,
// 543-545...)" after. Both render coherently; cpl-app's is the cut the Catalan volumes print.
function officeCitation(reading) {
  if (!reading) return null;
  const ref = (reading.Reference || '').trim();
  const quote = (reading.Quote || '').trim();
  if (ref && quote) return `${ref} $${quote} $`;
  return ref || quote || null;
}

// The responsory that follows each of the two readings. `es` stores it as THREE ids:
//
//   [0]  a blank (" " in 912 of the 920 entries; nothing renders it)
//   [1]  ℟. FirstPart * SecondPart
//   [2]  ℣. ThirdPart * SecondPart
//
// — confirmed field by field against 2026-08-12, where cpl-app's `FirstReading.Responsory`
// carries exactly those three parts and `es/responsorios` 12507-12509 hold exactly that
// composition. The sigils are the ones the components force anyway (`OfficeFirstLecture.vue`
// rewrites [1]'s to ℟ and [2]'s to ℣), so they are written the way they will be shown.
//
// Not the same shape as `responsoryParts` above: that one is the short responsory of Laudes,
// Vespers and the little Hours. This one belongs to a reading, and the Office has two.
function readingResponsoryParts(reading) {
  const r = reading && reading.Responsory;
  if (!r) return null;
  if (r.HasSpecialAntiphon) return r.SpecialAntiphon ? [' ', r.SpecialAntiphon] : null;
  const first = (r.FirstPart || '').trim();
  const second = (r.SecondPart || '').trim();
  const third = (r.ThirdPart || '').trim();
  if (!first && !second && !third) return null;
  return [' ', `℟. ${first} * ${second}`, `℣. ${third} * ${second}`];
}

// The Office of Readings flattened into the index's field names. Only the `_a` (annual)
// cycle is produced: cpl-app has a single cycle of readings, and Catalan is not in
// `LanguageFeatures.biennialReadings`, so the app never asks for `_i`/`_p`. If `ca` is ever
// added there, those cells will render empty — see FASES.md, fase 3.
function extractOfficeFields(office) {
  if (!office) return null;
  const out = {};
  const set = (key, value) => {
    if (value !== undefined && value !== null && value !== '') out[key] = value;
  };

  set('himno', office.Anthem);
  [['primer', office.FirstPsalm], ['segundo', office.SecondPsalm], ['tercer', office.ThirdPsalm]]
    .forEach(([prefix, psalm]) => {
      if (!psalm) return;
      set(`${prefix}_salmo_cita`, psalm.Title);
      set(`${prefix}_salmo_antifona`, psalm.Antiphon);
      set(`${prefix}_salmo_texto`, psalm.Psalm);
    });
  // The Office's own responsory is a plain versicle/response pair, like an intermediate
  // Hour's, so the shared helper reads it — `Office` has no `ShortResponsory` field and
  // falls through to `Responsory` on its own.
  set('responsorio1', responsoryParts(office));
  [['biblica', office.FirstReading], ['patristica', office.SecondReading]].forEach(([kind, reading]) => {
    if (!reading) return;
    set(`lectura_${kind}_cita_a`, officeCitation(reading));
    set(`lectura_${kind}_titulo_a`, reading.Title);
    set(`lectura_${kind}_texto_a`, reading.Reading);
  });
  set('responsorio2_a', readingResponsoryParts(office.FirstReading));
  set('responsorio3_a', readingResponsoryParts(office.SecondReading));
  set('oracion_final', office.FinalPrayer);
  return out;
}

// --- The Mass ---------------------------------------------------------------------------
//
// A vocabulary of its own again, and for once it is saints-app's that is the odd one:
// `lecturesStore.contentByDay` is an ARRAY of `Lecture` objects (`title`, `body`, `type`)
// rather than an object with one key per field. The type IS the role, so flattening it to
// `{ROLE}_ref` / `{ROLE}_texto` gives the join and the probe one vocabulary again — see
// PLAN §18.

// Which of cpl-app's fields each role of the index is made of. `part` is where the role lives
// on `DayMassLiturgy`; `body` is the field holding the reading itself, which is named
// differently for a reading, a psalm and the Gospel.
const MASS_ROLES = {
  FIRSTLECTURE: { part: 'FirstReading', body: 'Reading' },
  SECONDLECTURE: { part: 'SecondReading', body: 'Reading' },
  THIRDLECTURE: { part: 'ThirdReading', body: 'Reading' },
  FOURTHLECTURE: { part: 'FourthReading', body: 'Reading' },
  FIFTHLECTURE: { part: 'FifthReading', body: 'Reading' },
  SIXTHLECTURE: { part: 'SixthReading', body: 'Reading' },
  SEVENTHLECTURE: { part: 'SeventhReading', body: 'Reading' },
  // The epistle of the Easter Vigil (Rm 6), which the index numbers as the eighth reading.
  EIGHTHLECTURE: { part: 'ApostleReading', body: 'Reading' },
  GOSPEL: { part: 'Gospel', body: 'Gospel' },
  PSALM: { part: 'Psalm', body: 'Psalm', psalm: true },
  SECONDPSALM: { part: 'SecondPsalm', body: 'Psalm', psalm: true },
  THIRDPSALM: { part: 'ThirdPsalm', body: 'Psalm', psalm: true },
  FOURTHPSALM: { part: 'FourthPsalm', body: 'Psalm', psalm: true },
  FIFTHPSALM: { part: 'FifthPsalm', body: 'Psalm', psalm: true },
  SIXTHPSALM: { part: 'SixthPsalm', body: 'Psalm', psalm: true },
  SEVENTHPSALM: { part: 'SeventhPsalm', body: 'Psalm', psalm: true },
  // The verse before the Gospel. Only the verse: the refrain that the index keeps in the
  // reference cell ("Al·leluia, al·leluia, al·leluia") is not data in cpl-app at all — it is
  // a constant inside its own screen — so nothing here can supply it. See PLAN §18.3.
  ACCLAMATION: { part: 'Hallelujah', body: 'Hallelujah', noRef: true },
};

// cpl-app writes "-" where a slot is empty, and its own `StringManagement.HasLiturgyContent`
// treats that exactly like an empty string. Observing it would file a hyphen as if it were a
// reading.
const massContent = (v) => {
  if (v === undefined || v === null) return null;
  const t = String(v).trim();
  return t === '' || t === '-' ? null : t;
};

// The reference cell, which carries TWO things separated by a literal `_`:
// `formatTitleLectures()` renders `split("_")[0]` as the citation and `[1]` as the subtitle.
// cpl-app already holds the two apart — `Quote` and `Comment` — so the separator goes between
// them, spelled the way `es` spells it ("Ez 9, 17; 10, 18-22: _La marca en la frente…_").
//
// The psalm is the exception, and deliberately. In `es` the subtitle of a psalm is its
// RESPONSE and the body carries none (917 of 918 psalms have no `R.` line); cpl-app does the
// opposite — the response is inside the body, repeated after each stanza, which is how the
// Catalan volume prints it and how cpl-app's own screen shows it. `formatTextLecture()` turns
// those `R.` into `℟` on its own, so copying the body as it is renders correctly and no
// surgery on a liturgical text is needed. The reference is then just the citation.
//
// cpl-app leaves the book name off a psalm ("112,1-2.3-4.5-6 (R.: 4b)") because its screen
// prints "Salm responsorial" before it, so `Sl ` is prefixed here — but only to a citation
// that really starts with a psalm number, never to a canticle ("Ex 15, 1-2…") standing in for
// one, which the Easter Vigil uses twice.
function massCitation(part, isPsalm) {
  const quote = massContent(part && part.Quote);
  if (isPsalm) return quote && /^\d/.test(quote) ? `Sl ${quote}` : quote;
  const comment = massContent(part && part.Comment);
  if (quote && comment) return `${quote}: _${comment}_`;
  return quote || comment || null;
}

// One Mass of cpl-app, keyed by the index's role names. `Title` ("Lectura de la profecia
// d'Ezequiel") is deliberately absent: the index has no cell for it and saints-app builds it
// itself from the role's own literal.
function extractMassFields(dayMass) {
  if (!dayMass) return null;
  const out = {};
  for (const [role, spec] of Object.entries(MASS_ROLES)) {
    const part = dayMass[spec.part];
    if (!part) continue;
    if (!spec.noRef) {
      const ref = massCitation(part, spec.psalm);
      if (ref) out[`${role}_ref`] = ref;
    }
    const body = massContent(part[spec.body]);
    if (body) out[`${role}_texto`] = body;
  }
  return out;
}

// Terce, Sext and None live under `hoursLiturgy.Hours`, not at the root, and their model
// (`Models/HoursLiturgy/Hours.tsx`, class SpecificHour) is a smaller Laudes: no evangelical
// antiphon, no intercessions, and two fields shaped differently. `extractHourFields` reads
// both shapes, so the comparator, the inspector and the join keep speaking one vocabulary.
const INTERMEDIATE_HOURS = { Tercia: 'ThirdHour', Sexta: 'SixthHour', Nona: 'NinthHour' };

// One Hour of cpl-app, keyed by the saints-app index's field names. List fields hold an
// array (one entry per responsory part / intercession), matching how the index stores
// them. A field cpl-app has nothing for is simply absent.
function extractHourFields(hourData) {
  if (!hourData) return null;
  const out = {};
  const set = (key, value) => {
    if (value !== undefined && value !== null && value !== '') out[key] = value;
  };

  set('himno', hourData.Anthem);
  const psalms = [
    ['primer', hourData.FirstPsalm],
    ['segundo', hourData.SecondPsalm],
    ['tercer', hourData.ThirdPsalm],
  ];
  const antiphons = psalmAntiphons(hourData);
  psalms.forEach(([prefix, psalm], i) => {
    if (!psalm) return;
    set(`${prefix}_salmo_cita`, psalm.Title);
    set(`${prefix}_salmo_antifona`, antiphons[i]);
    set(`${prefix}_salmo_texto`, psalm.Psalm);
  });
  if (hourData.ShortReading) {
    set('lectura_biblica_cita', hourData.ShortReading.Quote);
    set('lectura_biblica', hourData.ShortReading.ShortReading);
  }
  set('responsorios', responsoryParts(hourData));
  set('cantico_evangelico_antifona', hourData.EvangelicalAntiphon);

  const prayers = parsePrayers(hourData.Prayers);
  if (prayers) {
    set('preces_intro', prayers.intro);
    set('preces_respuesta', prayers.respuesta);
    set('preces_contenido', prayers.contenido.map((c) => `${c.peticion}\n${c.cierre}`));
    set('invitacion_padrenuestro', prayers.padrenuestro);
  }
  set('oracion_final', hourData.FinalPrayer);
  return out;
}

// Everything the comparator needs from cpl-app for one date: the day as cpl-app
// understands it, plus each requested Hour flattened into index field names.
async function resolveDayForComparison(dateStr, { diocese = 'Barcelona', prayingPlace = 'Diòcesi', hours = ['Laudes', 'Vespers'] } = {}) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const settings = buildSettings({ dioceseName: diocese, prayingPlace });
  const { liturgyDayInformation, hoursLiturgy, ferial } = await resolveDay(new Date(y, m - 1, d), settings);
  const today = liturgyDayInformation.Today;

  const out = {
    date: dateStr,
    diocese,
    prayingPlace,
    celebration: {
      title: (hoursLiturgy.TodayCelebrationInformation && hoursLiturgy.TodayCelebrationInformation.Title) || null,
      // Kept alongside the title because the same saint can be a Memory in one diocese and
      // a Feast in another, which is exactly what makes days differ between the two apps.
      celebrationType: today.CelebrationType,
      specificLiturgyTime: today.SpecificLiturgyTime,
      week: today.Week,
      weekCycle: today.WeekCycle,
      yearType: today.YearType,
      saintsAbbreviation: today.SaintsAbbreviation,
    },
    hours: {},
    // Per Hour, the fields cpl-app took from the weekday rather than from the celebration.
    // On a day where saints-app offers both offices this is what says which of its two tabs
    // each field should be read against (lib/memorial-ferial.js); everywhere else it is
    // just true and unused.
    ferialFields: {},
  };
  for (const hour of hours) {
    // The Office of Readings has its own field vocabulary (two long readings, three
    // responsories) and no ferial twin to compare against: saints-app shows one office
    // there, whatever the day.
    if (hour === 'Office') {
      out.hours[hour] = extractOfficeFields(hoursLiturgy.Office);
      out.ferialFields[hour] = [];
      continue;
    }
    out.hours[hour] = extractHourFields(hourDataOf(hoursLiturgy, hour));
    out.ferialFields[hour] = [...ferialFields(out.hours[hour], extractHourFields(ferial[hour]))];
  }
  // Not one of the Hours the inspector walks field by field, but it is the first thing the
  // app shows in the morning, so it travels with the day.
  out.invitatory = hoursLiturgy.Invitation ? hoursLiturgy.Invitation.InvitationAntiphon || null : null;
  return out;
}

module.exports = {
  INTERMEDIATE_HOURS,
  psalmAntiphons,
  responsoryParts,
  MASS_ROLES,
  massCitation,
  extractMassFields,
  resolveMass,
  readingResponsoryParts,
  officeCitation,
  extractOfficeFields,
  hourDataOf,
  buildSettings,
  resolveDay,
  resolveDayForComparison,
  extractHourFields,
  parsePrayers,
  expandResponsory,
  GLORIA_PATRI_SHORT,
};
