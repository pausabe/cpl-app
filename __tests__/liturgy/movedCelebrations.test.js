// A celebration moved for one diocese or for one place only (diocesiMogut has the two letters of the
// diocese, or the code of the place, like BaC) has to be moved there, in the Office and in the Mass,
// and nowhere else [CPL-LIT-006].
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));

const { PROFILES, loadDay } = require('../helpers/liturgyDay');

PROFILES.girona = { diocesis: 'Girona', lloc: 'Diòcesi' };
PROFILES.lleidaDiocese = { diocesis: 'Lleida', lloc: 'Diòcesi' };
PROFILES.barcelonaCathedral = { diocesis: 'Barcelona', lloc: 'Catedral' };

const title = async (day, profile) => (await loadDay(day, profile)).celebration.title;

describe('a celebration moved for one diocese', () => {
  // 8 June 2018 is the Sacred Heart: the Dedication of the cathedral of Tortosa goes to the 9th, in
  // Tortosa only (diaMogut 08-jun, diocesiMogut To)
  it('is moved in that diocese, in the Office and in the Mass', async () => {
    const day = await loadDay('2018-06-09', 'tortosa');
    expect(day.celebration.title).toBe('Dedicació de la Catedral de Tortosa');
    expect(day.mass.today.hasGlory).toBe(true);
  });

  it('does not change the day of the other dioceses', async () => {
    expect(await title('2018-06-09', 'barcelona')).toBe('Cor Immaculat de la Benaurada Verge Maria');
    expect(await title('2018-06-09', 'girona')).toBe('Cor Immaculat de la Benaurada Verge Maria');
  });

  it('is moved where the diocese keeps it as a memorial (St Anastasius, Lleida, 12 May 2025)', async () => {
    expect(await title('2025-05-12', 'lleidaDiocese')).toBe('Sant Anastasi, màrtir');
  });
});

describe('a celebration moved for one place', () => {
  // 3 May 2026 is a Sunday of Easter: the Holy Cross, title of the cathedral of Barcelona, goes to
  // the 4th in the cathedral only (diaMogut 3-may, diocesiMogut BaC)
  it('is moved in that place', async () => {
    expect(await title('2026-05-04', 'barcelonaCathedral')).toBe('Santa Creu');
  });

  it('does not change the day of the rest of the diocese', async () => {
    expect(await title('2026-05-04', 'barcelona')).not.toBe('Santa Creu');
  });
});
