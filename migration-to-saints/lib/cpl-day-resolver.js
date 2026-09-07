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

// Where one Hour's data lives on the resolved day. Laudes and Vespers sit at the root;
// Terce, Sext and None hang off `Hours`.
function hourDataOf(hoursLiturgy, hour) {
  const nested = INTERMEDIATE_HOURS[hour];
  if (nested) return hoursLiturgy.Hours ? hoursLiturgy.Hours[nested] : null;
  return hoursLiturgy[hour];
}

// Mirrors DataService.ReloadAllData (Mass liturgy omitted: the Hours are what migrates).
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
  return { liturgyDayInformation: ldi, hoursLiturgy, ferial };
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
  hourDataOf,
  buildSettings,
  resolveDay,
  resolveDayForComparison,
  extractHourFields,
  parsePrayers,
  expandResponsory,
  GLORIA_PATRI_SHORT,
};
