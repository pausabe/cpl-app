// Re-resolves the review dates with a CORRECT Vespers ferial control.
//
// cpl-day-resolver.js takes its control from hoursLiturgy.VespersOptions.VespersWithoutCelebration,
// but MergeVespersWithCelebration mutates that object in place (`let vespers =
// withoutCelebrationVespers`), so it ends up being the rendered Vespers itself and
// ferialFields marks every field ferial. Here the control is a fresh ObtainVespers call,
// which is what the proposed fix does.
//
// Output is drop-in compatible with cpl-day.test.js's, so build-review.js reads it unchanged.

jest.mock('/Users/pau/projects/personal/cpl-app/src/Services/SettingsService', () => {
  const DioceseName = {
    Andorra: 'Andorra', Barcelona: 'Barcelona', Girona: 'Girona', Lleida: 'Lleida',
    Mallorca: 'Mallorca', Menorca: 'Menorca', SantFeliu: 'Sant Feliu de Llobregat',
    Solsona: 'Solsona', Tarragona: 'Tarragona', Terrassa: 'Terrassa', Tortosa: 'Tortosa',
    Urgell: 'Urgell', Vic: 'Vic',
  };
  const PrayingPlace = { Diocese: 'Diòcesi', City: 'Ciutat', Cathedral: 'Catedral' };
  return { __esModule: true, DioceseName, PrayingPlace, default: {} };
});

jest.mock('/Users/pau/projects/personal/cpl-app/src/Services/DatabaseManagerService', () => {
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync('/Users/pau/projects/personal/cpl-app/src/Assets/db/cpl-app.db', { readOnly: true });
  return {
    executeQueryAsync: (q) => {
      try { return Promise.resolve(db.prepare(q).all()); } catch (e) { return Promise.reject(e); }
    },
  };
});

const fs = require('fs');
const REPO = '/Users/pau/projects/personal/cpl-app';
const {
  buildSettings, extractHourFields, hourDataOf, extractOfficeFields, extractMassFields, resolveMass,
} = require(REPO + '/migration-to-saints/lib/cpl-day-resolver');
const HOURS = ['Office', 'Laudes', 'Tercia', 'Sexta', 'Nona', 'Vespers', 'Mass'];
const { ferialFields } = require(REPO + '/migration-to-saints/lib/memorial-ferial');
const VespersService = require(REPO + '/src/Services/Liturgy/VespersService');
const LaudesService = require(REPO + '/src/Services/Liturgy/LaudesService');
const Laudes = require(REPO + '/src/Models/HoursLiturgy/Laudes').default;
const DatabaseDataService = require(REPO + '/src/Services/DatabaseDataService');
const SpecialCelebrationService = require(REPO + '/src/Services/SpecialCelebrationService');
const { ObtainLiturgyMasters } = require(REPO + '/src/Services/Liturgy/LiturgyMastersService');
const { ObtainHoursLiturgy } = require(REPO + '/src/Services/Liturgy/HoursLiturgyService');
const LiturgyDayInformation = require(REPO + '/src/Models/LiturgyDayInformation').default;

const DATES = (process.env.DATES || '').split(',').map((s) => s.trim()).filter(Boolean);

// Which shape `all_lectures.json` gives this day: one Mass in the plain roles, or two with the
// celebration's in `CELEBRATION_*`. Read straight from the index, because that is what decides
// it — see the Mass branch below.
const DAY_TEXTS_DIR = '/Users/pau/projects/saints/saints-app/src/store/db/day_specific_texts';
let allLectures = null;
let manifest = null;
// date -> litcal id, the same manifest the join walks.
function litcalIdFor(dateStr) {
  if (!manifest) {
    try {
      manifest = JSON.parse(fs.readFileSync(REPO + '/migration-to-saints/webui/run/date-to-key-manifest.json', 'utf8'));
    } catch { manifest = {}; }
  }
  return (manifest[dateStr] || {}).litcalId || null;
}
function massIndexEntry(litcalId) {
  if (!litcalId) return null;
  if (!allLectures) {
    try {
      allLectures = JSON.parse(fs.readFileSync(`${DAY_TEXTS_DIR}/all_lectures.json`, 'utf8'));
    } catch { allLectures = {}; }
  }
  const key = Object.keys(allLectures).find((k) => k.startsWith(`${litcalId}__`) && allLectures[k].lecturas
    && Object.keys(allLectures[k].lecturas).length);
  return key ? allLectures[key].lecturas : null;
}
const OUT = process.env.OUT;
const DIOCESE = process.env.DIOCESE || 'Barcelona';
const PRAYING_PLACE = process.env.PRAYING_PLACE || 'Diòcesi';

async function ldiFor(date, settings) {
  const ldi = new LiturgyDayInformation();
  ldi.Today = await DatabaseDataService.ObtainLiturgySpecificDayInformation(date, settings);
  ldi.Today.SpecialCelebration = SpecialCelebrationService.ObtainSpecialCelebration(ldi.Today, settings);
  ldi.Today.IsSpecialChristmas = false;
  const t = new Date(date); t.setDate(t.getDate() + 1);
  ldi.Tomorrow = await DatabaseDataService.ObtainLiturgySpecificDayInformation(t, settings);
  ldi.Tomorrow.SpecialCelebration = SpecialCelebrationService.ObtainSpecialCelebration(ldi.Tomorrow, settings);
  ldi.Tomorrow.IsSpecialChristmas = false;
  return ldi;
}

test('resolves the dates with a correct Vespers ferial control', async () => {
  const settings = buildSettings({ dioceseName: DIOCESE, prayingPlace: PRAYING_PLACE });
  const days = {};
  for (const dateStr of DATES) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const ldi = await ldiFor(date, settings);
    const tomorrowLdi = await ldiFor(ldi.Tomorrow.Date, settings);
    const todayMasters = await ObtainLiturgyMasters(ldi, settings);
    const tomorrowMasters = await ObtainLiturgyMasters(tomorrowLdi, settings);

    // Taken BEFORE the merge runs, so nothing has written the celebration into it.
    const ferialVespers = VespersService.ObtainVespers(todayMasters, ldi.Today, settings);
    const ferialLaudes = LaudesService.ObtainLaudes(todayMasters, ldi.Today, new Laudes(), settings);
    const hoursLiturgy = await ObtainHoursLiturgy(todayMasters, tomorrowMasters, ldi, settings);

    const hours = {};
    // Three field vocabularies, not one: the Hours share `extractHourFields`, the Office of
    // Readings has two long readings with a responsory each, and the Mass has none of either.
    const mass = await resolveMass(ldi, hoursLiturgy, settings);
    for (const h of HOURS) {
      if (h === 'Office') { hours[h] = extractOfficeFields(hoursLiturgy.Office); continue; }
      // The Mass fills BOTH of saints-app's columns, and which of cpl-app's two Masses goes
      // in which is decided by the INDEX, not by whether the day is proper:
      //
      //   - an entry with `CELEBRATION_*` roles carries two Masses — the weekday's in the
      //     plain roles and the celebration's in the `CELEBRATION_` ones (every `__MEMORY`,
      //     and the feast of Peter and Paul, whose plain roles hold the vigil Mass);
      //   - an entry without them carries ONE, in the plain roles, and on a feast or a
      //     solemnity that one is the celebration's own.
      //
      // Guessing from "does cpl-app pray something proper today" instead put the weekday's
      // Mass beside the Nativity of the BVM's own readings and reported all seven fields as
      // divergent. The join does not guess either — it matches on the citation (PLAN §18.7).
      if (h === 'Mass') {
        const rendered = extractMassFields(mass && mass.rendered) || {};
        const ferialMass = extractMassFields(mass && mass.ferial) || {};
        const entry = massIndexEntry(litcalIdFor(dateStr));
        const twoColumns = entry && Object.keys(entry).some((k) => k.startsWith('CELEBRATION_'));
        hours[h] = twoColumns && Object.keys(ferialMass).length
          ? { ...ferialMass, ...Object.fromEntries(Object.entries(rendered).map(([k, v]) => [`CELEBRATION_${k}`, v])) }
          : rendered;
        continue;
      }
      hours[h] = extractHourFields(hourDataOf(hoursLiturgy, h));
    }
    days[dateStr] = {
      date: dateStr,
      diocese: DIOCESE,
      prayingPlace: PRAYING_PLACE,
      celebration: {
        title: (hoursLiturgy.TodayCelebrationInformation && hoursLiturgy.TodayCelebrationInformation.Title) || null,
        celebrationType: ldi.Today.CelebrationType,
        specificLiturgyTime: ldi.Today.SpecificLiturgyTime,
        week: ldi.Today.Week,
        weekCycle: ldi.Today.WeekCycle,
        yearType: ldi.Today.YearType,
      },
      hours,
      ferialFields: {
        Laudes: [...ferialFields(hours.Laudes, extractHourFields(ferialLaudes))],
        Vespers: [...ferialFields(hours.Vespers, extractHourFields(ferialVespers))],
        // Neither the intermediate Hours nor the Office of Readings have a memorial/weekday
        // switch (see HOURS_CONFIG in join-content.test.js): on a memorial their stores
        // replace the record outright instead of offering two. Nothing to mark ferial here.
        Tercia: [], Sexta: [], Nona: [], Office: [], Mass: [],
      },
      invitatory: hoursLiturgy.Invitation ? hoursLiturgy.Invitation.InvitationAntiphon || null : null,
    };
    console.log(`${dateStr}  L=${days[dateStr].ferialFields.Laudes.length}  V=${days[dateStr].ferialFields.Vespers.length}`);
  }
  fs.writeFileSync(OUT, JSON.stringify({ diocese: DIOCESE, prayingPlace: PRAYING_PLACE, hours: HOURS, days }, null, 2), 'utf8');
  expect(Object.keys(days).length).toBe(DATES.length);
}, 300000);
