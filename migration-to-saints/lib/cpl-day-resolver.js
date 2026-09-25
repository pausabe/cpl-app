// cpl-app's REAL liturgy for one date, flattened into the field vocabulary of saints-app's
// shared index. The work itself lives in `src/liturgy-export`, inside the app, where
// TypeScript reads it: this file is only the door the migration comes through.
//
// It used to hold everything, reaching into `src/Services` and `src/Models` by hand. Then the
// app renamed its files to kebab-case, its exports and its fields to camelCase, and nothing
// noticed — `make lint` ignores this folder and plain JS is invisible to `make types`. Half of
// what broke threw an error; the other half read `undefined` and would have written empty cells
// over good text. Hence the move: now a rename breaks the push that makes it.
//
// This module is plain Node, but it must be loaded from a Jest test file: cpl-app's services
// reach the database through `databaseManagerService` and pull in RN/expo globals that only the
// `jest-expo` preset provides. The caller mocks that seam; everything here runs the app's own
// unmodified logic.
const liturgyExport = require('../../src/liturgy-export');
const { ferialFields } = require('./memorial-ferial');
const { massColumns } = require('./mass-columns');

// The only two Hours saints-app puts behind a memorial/weekday switch, and so the only two
// where "did this field come from the weekday" decides which cell a text goes in. On a memorial
// the stores of the Office of Readings and of Terce, Sext and None REPLACE the record with the
// weekday's instead of carrying both, and write no `<field>_Ferial` twin — see HOURS_CONFIG in
// join-content.test.js. Marking their fields ferial would redirect a cell that was already right.
const HOURS_WITH_A_FERIAL_TAB = new Set(['Laudes', 'Vespers']);

// Everything the comparator, the join, the probe and the inspector need from cpl-app, under the
// names they already call it by.
const {
  EXPORT_HOURS,
  GLORIA_PATRI_SHORT,
  INTERMEDIATE_HOURS,
  MASS_ROLES,
  buildSettings,
  expandResponsory,
  extractHourFields,
  extractMassFields,
  extractOfficeFields,
  hourDataOf,
  massCitation,
  officeCitation,
  parsePrayers,
  psalmAntiphons,
  readingResponsoryParts,
  resolveDay,
  resolveDayFields,
  resolveMass,
  responsoryParts,
} = liturgyExport;

// One date as the comparator wants it: the day, each Hour flattened, and per Hour the fields
// cpl-app took from the weekday rather than from the celebration. On a day where saints-app
// offers both offices that last part is what says which of its two tabs each field should be
// read against (lib/memorial-ferial.js); everywhere else it is just true and unused.
//
// The ferial comparison itself stays on this side: it is a question about the migration, not
// about cpl-app, and it reads nothing but the flattened fields.
async function resolveDayForComparison(dateStr, { diocese = 'Barcelona', prayingPlace = 'Diòcesi', hours = ['Laudes', 'Vespers'] } = {}) {
  const day = await resolveDayFields(dateStr, {
    dioceseName: diocese,
    prayingPlace,
    hours: hours.filter((h) => h !== 'Mass'),
  });
  const out = {
    date: day.date,
    diocese: day.diocese,
    prayingPlace: day.prayingPlace,
    celebration: day.celebration,
    hours: {},
    ferialFields: {},
    invitatory: day.invitatory,
  };
  for (const hour of hours) {
    // The Mass fills BOTH of saints-app's columns on a memorial; which of cpl-app's two Masses
    // goes in which is the index's decision, not ours (lib/mass-columns.js).
    if (hour === 'Mass') {
      out.hours[hour] = day.mass ? massColumns(day.date, day.mass.rendered, day.mass.ferial) : {};
      out.ferialFields[hour] = [];
      continue;
    }
    out.hours[hour] = day.hours[hour];
    out.ferialFields[hour] =
      HOURS_WITH_A_FERIAL_TAB.has(hour) && day.ferialHours[hour]
        ? [...ferialFields(out.hours[hour], day.ferialHours[hour])]
        : [];
  }
  return out;
}

module.exports = {
  EXPORT_HOURS,
  GLORIA_PATRI_SHORT,
  INTERMEDIATE_HOURS,
  MASS_ROLES,
  buildSettings,
  expandResponsory,
  extractHourFields,
  extractMassFields,
  extractOfficeFields,
  hourDataOf,
  massCitation,
  officeCitation,
  parsePrayers,
  psalmAntiphons,
  readingResponsoryParts,
  resolveDay,
  resolveDayFields,
  resolveDayForComparison,
  resolveMass,
  responsoryParts,
};
