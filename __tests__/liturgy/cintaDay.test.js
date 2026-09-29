// Our Lady of la Cinta, in Tortosa, is on the Saturday before the first Sunday of September. When
// 1 September is a Sunday (2019, 2024, 2030…), that Saturday is 31 August, and the app looked for it
// on 7 September instead [CPL-LIT-005].
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));

const { PROFILES, loadDay } = require('../helpers/liturgyDay');

PROFILES.tortosaCity = { diocesis: 'Tortosa', lloc: 'Ciutat' };

const title = async (day, profile) => (await loadDay(day, profile)).celebration.title;

describe('Our Lady of la Cinta', () => {
  it('is on 31 August when 1 September is a Sunday, in the diocese and in the city', async () => {
    expect(await title('2024-08-31', 'tortosa')).toBe('Mare de Déu de la Cinta');
    expect(await title('2024-08-31', 'tortosaCity')).toBe('Mare de Déu de la Cinta');
  });

  it('is not on the Saturday after it', async () => {
    expect(await title('2024-09-07', 'tortosa')).not.toBe('Mare de Déu de la Cinta');
  });

  it('is still on the Saturday before the first Sunday the other years', async () => {
    expect(await title('2025-09-06', 'tortosa')).toBe('Mare de Déu de la Cinta');
    expect(await title('2026-09-05', 'tortosaCity')).toBe('Mare de Déu de la Cinta');
  });
});
