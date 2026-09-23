// Turning a position into a diocese: the arithmetic over the table, and the cases where the
// answer has to be no answer at all. A degree of latitude is 111.195 km here, which is what the
// distances of the made up table below are built on.
import { DioceseName } from '../../src/services/SettingsService';
import {
  Municipality,
  municipalitiesInTheTable,
  resolveDiocese,
  resolveDioceseIn,
} from '../../src/services/dioceseLocationService';

// Two municipalities of different dioceses, 22.2 km apart along the same meridian: the border
// between them runs at 41.1, halfway.
const NORTH: Municipality = {
  name: 'North',
  comarca: 'Up',
  latitude: 41.2,
  longitude: 2.0,
  diocese: DioceseName.Girona,
};
const SOUTH: Municipality = {
  name: 'South',
  comarca: 'Down',
  latitude: 41.0,
  longitude: 2.0,
  diocese: DioceseName.Barcelona,
};
const TWO_DIOCESES = [NORTH, SOUTH];

test('a position on top of a municipality takes its diocese', () => {
  expect(resolveDioceseIn(TWO_DIOCESES, SOUTH.latitude, SOUTH.longitude)).toBe(DioceseName.Barcelona);
  expect(resolveDioceseIn(TWO_DIOCESES, NORTH.latitude, NORTH.longitude)).toBe(DioceseName.Girona);
});

test('a position between the two takes the diocese of the closer one', () => {
  expect(resolveDioceseIn(TWO_DIOCESES, 41.05, 2.0)).toBe(DioceseName.Barcelona);
  expect(resolveDioceseIn(TWO_DIOCESES, 41.15, 2.0)).toBe(DioceseName.Girona);
});

// At 41.05 the border is 5.56 km away, so anything under that still has an answer.
test('a margin of error that does not reach the border still answers', () => {
  expect(resolveDioceseIn(TWO_DIOCESES, 41.05, 2.0, 1000)).toBe(DioceseName.Barcelona);
  expect(resolveDioceseIn(TWO_DIOCESES, 41.05, 2.0, 5000)).toBe(DioceseName.Barcelona);
});

test('a margin of error that reaches the border answers nothing rather than guessing', () => {
  expect(resolveDioceseIn(TWO_DIOCESES, 41.05, 2.0, 6000)).toBeNull();
  expect(resolveDioceseIn(TWO_DIOCESES, 41.05, 2.0, 20000)).toBeNull();
});

test('right on the border nothing is answered either', () => {
  expect(resolveDioceseIn(TWO_DIOCESES, 41.1, 2.0, 500)).toBeNull();
});

test('with a single diocese in the table there is no border to doubt', () => {
  expect(resolveDioceseIn([SOUTH], 41.05, 2.0, 20000)).toBe(DioceseName.Barcelona);
});

test('far from every municipality there is nothing to answer', () => {
  // Paris
  expect(resolveDioceseIn(TWO_DIOCESES, 48.8566, 2.3522)).toBeNull();
  expect(resolveDiocese(48.8566, 2.3522)).toBeNull();
});

test('a position that is not a position answers nothing', () => {
  expect(resolveDioceseIn(TWO_DIOCESES, Number.NaN, 2.0)).toBeNull();
  expect(resolveDioceseIn(TWO_DIOCESES, 41.05, undefined as unknown as number)).toBeNull();
});

test('an empty table answers nothing', () => {
  expect(resolveDioceseIn([], 41.05, 2.0)).toBeNull();
});

// A typo in the generated table would otherwise reach the setting, which SettingsService then
// refuses to save, leaving the diocese silently unchanged.
test('a diocese the settings would not accept answers nothing', () => {
  const wrong: Municipality = { name: 'Somewhere', comarca: 'Down', latitude: 41.0, longitude: 2.0, diocese: 'Sogorb' };
  expect(resolveDioceseIn([wrong], 41.0, 2.0)).toBeNull();
});

// Most of the table is still like this, and it has to answer nothing rather than hand over the
// diocese of whichever municipality happens to be nearest.
test('a municipality whose diocese nobody has settled answers nothing', () => {
  const unsettled: Municipality = { name: 'Somewhere', comarca: 'Down', latitude: 41.0, longitude: 2.0, diocese: null };
  expect(resolveDioceseIn([unsettled, NORTH], 41.0, 2.0)).toBeNull();
});

test('one not settled next door makes its neighbour cautious', () => {
  const unsettled: Municipality = { name: 'Unsettled', comarca: 'Up', latitude: 41.1, longitude: 2.0, diocese: null };
  // Without it, at 41.05 the border would be 5.56 km off and a 3 km margin would be fine
  expect(resolveDioceseIn([SOUTH, NORTH], 41.05, 2.0, 3000)).toBe(DioceseName.Barcelona);
  expect(resolveDioceseIn([SOUTH, NORTH, unsettled], 41.05, 2.0, 3000)).toBeNull();
});

// --- The table the app ships with ---------------------------------------------------------

const TABLE = municipalitiesInTheTable();
const SETTLED = TABLE.filter((municipality) => municipality.diocese !== null);

test('the table is the whole generated one, not a leftover of a broken run', () => {
  // 947 Catalan municipalities, 53 of Mallorca, 8 of Menorca, the 7 parishes of Andorra and the
  // 33 of Castelló that the diocese of Tortosa reaches
  expect(TABLE.length).toBe(1048);
  // Everything is settled but Esplugues de Llobregat and Sant Joan Despí, which the border runs
  // through and which no table of municipalities can answer for
  expect(TABLE.length - SETTLED.length).toBe(2);
  expect(TABLE.filter((one) => one.diocese === null).map((one) => one.name)).toEqual([
    'Esplugues de Llobregat',
    'Sant Joan Despí',
  ]);
});

// There is a Cabanes and a Figueres in the Alt Empordà and another of each in Castelló. Matching
// the two lists by name alone once put the Castelló ones in the diocese of Girona.
test('the municipalities of Castelló are the ones of Tortosa, and nothing else of that province', () => {
  const castello = TABLE.filter((municipality) => municipality.comarca === 'Castelló');
  expect(castello.length).toBe(33);
  for (const municipality of castello) {
    expect(municipality.diocese).toBe(DioceseName.Tortosa);
  }
  // Vinaròs is of Tortosa, and it is in Castelló
  expect(resolveDiocese(40.4694, 0.4753)).toBe(DioceseName.Tortosa);
});

test('no two municipalities of the table share a name', () => {
  const names = TABLE.map((municipality) => municipality.name);
  expect(new Set(names).size).toBe(names.length);
});

test('standing on a municipality that is settled gives its own diocese', () => {
  for (const municipality of SETTLED) {
    expect(resolveDiocese(municipality.latitude, municipality.longitude)).toBe(municipality.diocese);
  }
});

test('standing on one that is not settled gives nothing', () => {
  for (const municipality of TABLE.filter((one) => one.diocese === null)) {
    expect(resolveDiocese(municipality.latitude, municipality.longitude)).toBeNull();
  }
});

test('the table only names dioceses the settings accept', () => {
  const known = Object.values(DioceseName) as string[];
  for (const municipality of SETTLED) {
    expect(known).toContain(municipality.diocese);
  }
});

test('the table reaches every diocese the app knows', () => {
  const inTheTable = new Set(SETTLED.map((municipality) => municipality.diocese));
  for (const diocese of Object.values(DioceseName)) {
    expect(inTheTable).toContain(diocese);
  }
});

// The see of a diocese is in that diocese by definition, so these can never be wrong and are
// worth pinning: for Urgell and Sant Feliu de Llobregat they are the only settled ones so far.
test('each episcopal see is in its own diocese', () => {
  const sees: [string, DioceseName][] = [
    ['Barcelona', DioceseName.Barcelona],
    ['Girona', DioceseName.Girona],
    ['Lleida', DioceseName.Lleida],
    ['Sant Feliu de Llobregat', DioceseName.SantFeliu],
    ['Solsona', DioceseName.Solsona],
    ['Tarragona', DioceseName.Tarragona],
    ['Terrassa', DioceseName.Terrassa],
    ['Tortosa', DioceseName.Tortosa],
    ["la Seu d'Urgell", DioceseName.Urgell],
    ['Vic', DioceseName.Vic],
    ['Andorra la Vella', DioceseName.Andorra],
    ['Palma', DioceseName.Mallorca],
    ['Ciutadella', DioceseName.Menorca],
  ];
  for (const [name, diocese] of sees) {
    const see = TABLE.find((municipality) => municipality.name === name);
    expect(see).toBeDefined();
    expect(resolveDiocese(see.latitude, see.longitude)).toBe(diocese);
  }
});
