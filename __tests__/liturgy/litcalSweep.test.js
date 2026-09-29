// Every day and every place of the calendar table that cpl-cloud's process X writes from litcal
// (calendar/, `npm run write`), loaded the way the app loads it: the celebration the app shows has to
// be the one litcal chose. For the years nobody has checked by hand yet, this is the only check.
//
// It runs only when it is given the database and what to expect, both written by process X:
//
//   CPL_DB=<out/cpl-app.db> LITCAL_EXPECTED=<out/expected.json> npx jest __tests__/liturgy/litcalSweep
//
// LITCAL_COLUMNS (BaD,BaV…; all 37 if not given), LITCAL_FROM and LITCAL_TO (years), and LITCAL_DAYS (a
// JSON file with a list of dates) narrow it, and LITCAL_REPORT is a file where every difference is
// written as JSON. make litcal-sweep runs it in parallel over all the places.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));

const fs = require('fs');
const { PROFILES, loadDay } = require('../helpers/liturgyDay');

const EXPECTED = process.env.LITCAL_EXPECTED;
const describeWhenGiven = EXPECTED ? describe : describe.skip;

const DIOCESES = {
  Ba: 'Barcelona',
  Gi: 'Girona',
  Ll: 'Lleida',
  SF: 'Sant Feliu de Llobregat',
  So: 'Solsona',
  Ta: 'Tarragona',
  Te: 'Terrassa',
  To: 'Tortosa',
  Ur: 'Urgell',
  Vi: 'Vic',
  Ma: 'Mallorca',
  Me: 'Menorca',
};
const PLACES = { D: 'Diòcesi', V: 'Ciutat', C: 'Catedral' };
const SATURDAY_MEMORIAL_OF_MARY = 'saturday_memorial_of_the_blessed_virgin_mary';

// The settings of someone who prays in the place of a column of the table
function profileName(column) {
  const name = `litcal-${column}`;
  PROFILES[name] ??=
    column === 'Andorra'
      ? { diocesis: 'Andorra', lloc: 'Diòcesi' }
      : { diocesis: DIOCESES[column.slice(0, -1)], lloc: PLACES[column.slice(-1)] };
  return name;
}

// What went wrong, or nothing: in a day of a saint, the app has to show its name (in a day with
// optional memorials, the name of one of them); in a day of the season, no saint at all
function mismatch(group, titles, saintTitles, shown) {
  const { expectation, letter } = group;
  if (expectation.kind === 'saint') {
    const wanted = expectation.ids.flatMap((id) => titles[id] ?? []);
    return wanted.includes(shown) ? null : wanted;
  }
  const allowed = letter === 'V' ? (titles[SATURDAY_MEMORIAL_OF_MARY] ?? []) : [];
  return saintTitles.has(shown) && !allowed.includes(shown) ? [] : null;
}

function summary(differences) {
  const groups = new Map();
  for (const d of differences) {
    const key = `${d.column} ${d.letter} ${d.ids.join('+')} → «${d.shown}»`;
    groups.set(key, [...(groups.get(key) ?? []), d.date]);
  }
  return [...groups]
    .map(([key, dates]) => `${key}: ${dates.length} (${dates.slice(0, 3).join(', ')}${dates.length > 3 ? '…' : ''})`)
    .join('\n');
}

describeWhenGiven('the table process X writes from litcal', () => {
  const expected = EXPECTED ? JSON.parse(fs.readFileSync(EXPECTED, 'utf8')) : { days: {}, titles: {} };
  const titles = expected.titles;
  const saintTitles = new Set(Object.values(titles).flat());
  const columns = process.env.LITCAL_COLUMNS?.split(',');
  const onlyDays = process.env.LITCAL_DAYS
    ? new Set(JSON.parse(fs.readFileSync(process.env.LITCAL_DAYS, 'utf8')))
    : null;
  const first = Number(process.env.LITCAL_FROM ?? expected.from?.slice(0, 4));
  const last = Number(process.env.LITCAL_TO ?? expected.to?.slice(0, 4));
  const years = Array.from({ length: Math.max(last - first + 1, 0) }, (_, i) => first + i);
  const differences = [];

  afterAll(() => {
    if (process.env.LITCAL_REPORT) {
      fs.writeFileSync(process.env.LITCAL_REPORT, JSON.stringify({ litcal: expected.litcal, differences }, null, 1));
    }
  });

  test.each(years)(
    '%i: the app shows the celebration litcal chose, every day and in every place',
    async (year) => {
      const found = [];
      for (const [date, groups] of Object.entries(expected.days)) {
        if (Number(date.slice(0, 4)) !== year || (onlyDays && !onlyDays.has(date))) continue;
        for (const group of groups) {
          for (const column of group.columns) {
            if (columns && !columns.includes(column)) continue;
            const state = await loadDay(date, profileName(column));
            const shown = (state.celebration.title ?? '').trim();
            const wanted = mismatch(group, titles, saintTitles, shown);
            if (!wanted) continue;
            found.push({
              date,
              column,
              letter: group.letter,
              kind: group.expectation.kind,
              ids: group.expectation.ids ?? [group.expectation.id],
              wanted,
              shown,
              type: state.dayInformation.today.celebrationType,
            });
          }
        }
      }
      differences.push(...found);
      if (found.length > 0)
        throw new Error(`${found.length} days do not show litcal's celebration:\n${summary(found)}`);
    },
    60 * 60 * 1000,
  );
});
