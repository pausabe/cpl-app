import * as DatabaseUpdaterService from '../../src/Services/DatabaseUpdaterService';

jest.mock(
    '../../src/Services/DatabaseDataService',
    () => ({
        getDatabaseVersion: jest.fn(() => 6)
    })
);
jest.mock(
    '../../src/Services/DatabaseManagerService',
    () => ({
        executeQueryAsync: jest.fn(() => true)
    })
);

describe('Database Updater user cases', () => {
    test('Simple update', async () => {
        await DatabaseUpdaterService.UpdateDatabase();
        // TODO: check expected queries created
    });
});