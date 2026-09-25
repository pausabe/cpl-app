// The full liturgy of hand-picked days, compared text by text against a golden file made on
// a build that was checked by hand (see helpers/golden.js). This is what proves that an
// upgrade or a refactor did not change a single antiphon.
//
// The days are the ones where the calendar logic works hardest: season boundaries, the
// Triduum, moved solemnities, days that are proper only in some dioceses, and the years
// where a solemnity falls on a privileged Sunday and has to move.
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));

const { loadDay } = require('../helpers/liturgyDay');
const { readGolden, writeGolden, diffPaths } = require('../helpers/golden');

const DAYS = [
  // Advent and Christmas 2025
  '2025-11-30',
  '2025-12-08',
  '2025-12-17',
  '2025-12-24',
  '2025-12-25',
  '2025-12-28',
  '2025-12-31',
  '2026-01-01',
  '2026-01-04',
  '2026-01-06',
  '2026-01-11',
  // Ordinary Time before Lent
  '2026-01-20',
  '2026-01-24',
  '2026-02-02',
  '2026-02-12',
  // Lent and Holy Week
  '2026-02-18',
  '2026-02-22',
  '2026-03-19',
  '2026-03-25',
  '2026-03-28',
  '2026-03-29',
  '2026-03-30',
  '2026-04-01',
  // Triduum and Easter
  '2026-04-02',
  '2026-04-03',
  '2026-04-04',
  '2026-04-05',
  '2026-04-06',
  '2026-04-12',
  '2026-04-23',
  '2026-04-27',
  // Ascension, Pentecost and the solemnities after it
  '2026-05-14',
  '2026-05-17',
  '2026-05-23',
  '2026-05-24',
  '2026-05-25',
  '2026-05-31',
  '2026-06-04',
  '2026-06-07',
  '2026-06-12',
  // Ordinary Time: saints, local feasts, first Vespers on Saturday
  '2026-06-24',
  '2026-06-29',
  '2026-07-11',
  '2026-07-25',
  '2026-08-15',
  '2026-09-08',
  '2026-09-11',
  '2026-09-19',
  '2026-09-20',
  '2026-09-21',
  '2026-09-23',
  '2026-09-24',
  '2026-10-12',
  '2026-10-29',
  '2026-11-01',
  '2026-11-02',
  '2026-11-22',
  '2026-11-29',
  '2026-12-08',
  '2026-12-25',
  // Older years with a moved solemnity (8 December on a Sunday of Advent; the
  // Annunciation in Holy Week) and Saint Joseph in Lent
  '2019-12-08',
  '2019-12-09',
  '2024-03-25',
  '2024-04-08',
  '2024-12-08',
  '2024-12-09',
  '2020-03-19',
  '2018-04-01',
];
const PROFILES = ['barcelona', 'tarragonaCatedral', 'gironaCiutat', 'andorra', 'mallorcaLliure'];
const GOLDEN = 'liturgy-days';

describe('full liturgy of selected days, against the golden', () => {
  const resolved = {};
  let golden;

  beforeAll(async () => {
    golden = readGolden(GOLDEN);
    for (const day of DAYS) {
      for (const profile of PROFILES) resolved[`${day} ${profile}`] = await loadDay(day, profile);
    }
    if (!golden) writeGolden(GOLDEN, resolved);
  }, 300000);

  test.each(DAYS.flatMap((day) => PROFILES.map((profile) => `${day} ${profile}`)))('%s', (key) => {
    if (!golden) return; // just written from this build
    expect(golden[key]).toBeDefined();
    const differences = diffPaths(golden[key], resolved[key]);
    expect(differences).toEqual([]);
  });
});
