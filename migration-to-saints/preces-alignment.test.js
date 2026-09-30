// MIGRA-020: the intercessions of Wednesday II Vespers. The Latin has five and the fourth has an
// alternative ("vel"); the CPL gives five, the Spanish prints both options, six cells. Paired by
// position, the CPL's intercession for the dead went into the alternative's cell (9573, "Líbranos,
// Señor, de todo peligro") and the dead's own cell (9574) stayed empty. Pau decided on 30-9-2026
// that the alternative's cell stays without Catalan.
//
//   npx jest migration-to-saints/preces-alignment.test.js

jest.mock('../src/services/databaseManagerService', () => require('../__tests__/helpers/mockDatabaseManager'));

const { resolveDayForComparison } = require('./lib/cpl-day-resolver');
const { alignPreces } = require('./lib/preces-alignment');

const CELLS = ['9569', '9570', '9571', '9572', '9573', '9574'];

let cpl;
beforeAll(async () => {
  // Saint Jerome, 30-9-2026: cpl-app prays the weekday's Vespers, Wednesday II.
  const day = await resolveDayForComparison('2026-09-30', { hours: ['Vespers'] });
  cpl = day.hours.Vespers.preces_contenido;
}, 180000);

test('the CPL has five intercessions, the fourth the fair weather and the fifth the dead', () => {
  expect(cpl).toHaveLength(5);
  expect(cpl[3]).toMatch(/^Concediu-nos el bon temps/);
  expect(cpl[4]).toMatch(/^Que els difunts/);
});

test('the dead go in the dead\'s cell, and the alternative\'s cell gets nothing', () => {
  const aligned = alignPreces(CELLS, cpl);
  expect(aligned[3]).toMatch(/^Concediu-nos el bon temps/);
  expect(aligned[4]).toBeUndefined();
  expect(aligned[5]).toMatch(/^Que els difunts/);
});

test('any other list still pairs by position', () => {
  expect(alignPreces(['1', '2', '3'], ['a', 'b'])).toEqual(['a', 'b', undefined]);
  // And the decided list too, if the CPL ever gives a count the decision did not count on.
  expect(alignPreces(CELLS, ['a', 'b', 'c', 'd', 'e', 'f'])).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
});
