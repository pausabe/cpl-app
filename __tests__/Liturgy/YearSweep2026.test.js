jest.mock('../../src/Services/DatabaseManagerService', () => require('../helpers/mockDatabaseManager'));

require('../helpers/yearSweep').describeYearSweep(2026);
