// Which places a transfer of anyliturgic is for, and the codes of the days [CPL-LIT-006]
const {
  getDateFromShortDatabaseCode,
  getDateShortDatabaseCode,
  isTransferForPlace,
  normalizeShortDatabaseCode,
  transferPlaces,
} = require('../../src/services/databaseDataHelper');

const place = (dioceseCode, dioceseCode2Letters = dioceseCode.slice(0, 2)) => ({ dioceseCode, dioceseCode2Letters });
const BARCELONA = place('BaD');
const BARCELONA_CATHEDRAL = place('BaC');
const MALLORCA = place('MaD');
const ANDORRA = place('Andorra', 'Andorra');

describe('the places of a transfer', () => {
  it('come from diocesiMogut when Mogut is only a note, as the table has had it', () => {
    expect(transferPlaces('*', '23-abr')).toEqual(['*']);
    expect(transferPlaces('Te', 'Terrasa 10-dic')).toEqual(['Te']);
    expect(transferPlaces('-', '-')).toEqual(['-']);
    expect(transferPlaces('-', '')).toEqual(['-']);
  });

  it('come from Mogut when it says them place by place', () => {
    expect(transferPlaces('*', 'Ba Gi Ll SF So Ta Te To Ur Vi Andorra')).toEqual([
      'Ba',
      'Gi',
      'Ll',
      'SF',
      'So',
      'Ta',
      'Te',
      'To',
      'Ur',
      'Vi',
      'Andorra',
    ]);
    expect(transferPlaces('Me', 'MeV MeC')).toEqual(['MeV', 'MeC']);
  });
});

describe('a transfer', () => {
  it('is for everyone with «*»', () => {
    expect(isTransferForPlace(['*'], MALLORCA)).toBe(true);
  });

  it('is for the whole diocese with its two letters', () => {
    expect(isTransferForPlace(['Ba'], BARCELONA)).toBe(true);
    expect(isTransferForPlace(['Ba'], BARCELONA_CATHEDRAL)).toBe(true);
    expect(isTransferForPlace(['To'], BARCELONA)).toBe(false);
  });

  it('is for one place only with its code', () => {
    expect(isTransferForPlace(['BaC'], BARCELONA_CATHEDRAL)).toBe(true);
    expect(isTransferForPlace(['BaC'], BARCELONA)).toBe(false);
  });

  it('is not for Mallorca when it is for the dioceses of Catalonia and Andorra', () => {
    const catalonia = transferPlaces('*', 'Ba Gi Ll SF So Ta Te To Ur Vi Andorra');
    expect(isTransferForPlace(catalonia, MALLORCA)).toBe(false);
    expect(isTransferForPlace(catalonia, ANDORRA)).toBe(true);
    expect(isTransferForPlace(catalonia, BARCELONA)).toBe(true);
  });

  it('is for no one without a transfer', () => {
    expect(isTransferForPlace(['-'], BARCELONA)).toBe(false);
  });
});

describe('the code of a day', () => {
  it('is written with two digits, as in the santoral', () => {
    expect(normalizeShortDatabaseCode('3-may')).toBe('03-may');
    expect(normalizeShortDatabaseCode('08-jun')).toBe('08-jun');
    expect(normalizeShortDatabaseCode('-')).toBe('-');
    expect(normalizeShortDatabaseCode('')).toBe('-');
  });

  it('is the day it comes from when its celebration has been moved', () => {
    expect(getDateShortDatabaseCode(new Date(2026, 4, 4), '3-may')).toBe('03-may');
    expect(getDateShortDatabaseCode(new Date(2026, 4, 4))).toBe('04-may');
    expect(getDateShortDatabaseCode(new Date(2026, 4, 4), '-')).toBe('04-may');
  });

  it('gives the date back, also in January', () => {
    expect(getDateFromShortDatabaseCode('06-ene', 2027)).toEqual(new Date(2027, 0, 6));
    expect(getDateFromShortDatabaseCode('3-may', 2026)).toEqual(new Date(2026, 4, 3));
    expect(getDateFromShortDatabaseCode('-', 2026)).toBeUndefined();
  });
});
