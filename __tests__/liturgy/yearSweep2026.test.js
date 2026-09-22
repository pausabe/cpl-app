jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));

require('../helpers/yearSweep').describeYearSweep(2026);
