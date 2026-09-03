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
const { buildSettings, extractHourFields } = require(REPO + '/migration-to-saints/lib/cpl-day-resolver');
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

    const hours = {
      Laudes: extractHourFields(hoursLiturgy.Laudes),
      Vespers: extractHourFields(hoursLiturgy.Vespers),
    };
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
      },
      invitatory: hoursLiturgy.Invitation ? hoursLiturgy.Invitation.InvitationAntiphon || null : null,
    };
    console.log(`${dateStr}  L=${days[dateStr].ferialFields.Laudes.length}  V=${days[dateStr].ferialFields.Vespers.length}`);
  }
  fs.writeFileSync(OUT, JSON.stringify({ diocese: DIOCESE, prayingPlace: PRAYING_PLACE, hours: ['Laudes', 'Vespers'], days }, null, 2), 'utf8');
  expect(Object.keys(days).length).toBe(DATES.length);
}, 300000);
