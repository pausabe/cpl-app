// Regression test for CPL-LIT-002 (see migration-to-saints/cpl-bugs/CPL-LIT-002.md).
//
// When 8 December falls on a Sunday of Advent, the Sunday takes precedence and the
// solemnity of the Immaculate Conception moves to Monday the 9th. cpl-app's calendar table
// had the solemnity nailed to the 8th every year, so on those years it prayed the
// Immaculate on the Sunday, dropped the 2nd Sunday of Advent entirely, and left the 9th as
// a plain optional memorial with ferial psalmody.
//
// This is a DATA fix, not a code fix: the correction lives in db-fixes/CPL-LIT-002.sql and
// is applied to src/Assets/db/cpl-app.db. That database is gitignored and comes from the
// Deployment website, so a freshly downloaded copy will NOT have the fix. This test is what
// tells you so — if it fails, run the .sql over the new database again.
//
// The affected years are read from the database rather than hardcoded, so the test keeps
// working on a database that covers years this one doesn't (the next occurrence is 2030).

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

jest.mock('../../src/Services/SettingsService', () => {
  const DioceseName = {
    Andorra: 'Andorra', Barcelona: 'Barcelona', Girona: 'Girona', Lleida: 'Lleida',
    Mallorca: 'Mallorca', Menorca: 'Menorca', SantFeliu: 'Sant Feliu de Llobregat',
    Solsona: 'Solsona', Tarragona: 'Tarragona', Terrassa: 'Terrassa', Tortosa: 'Tortosa',
    Urgell: 'Urgell', Vic: 'Vic',
  };
  const PrayingPlace = { Diocese: 'Diòcesi', City: 'Ciutat', Cathedral: 'Catedral' };
  return { __esModule: true, DioceseName, PrayingPlace, default: {} };
});

jest.mock('../../src/Services/DatabaseManagerService', () => {
  const path = require('path');
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(path.resolve(__dirname, '../../src/Assets/db/cpl-app.db'), { readOnly: true });
  return {
    executeQueryAsync: (query) => {
      try {
        return Promise.resolve(db.prepare(query).all());
      } catch (e) {
        return Promise.reject(e);
      }
    },
  };
});

const { resolveDayForComparison } = require('../../migration-to-saints/lib/cpl-day-resolver');

const DB_PATH = path.resolve(__dirname, '../../src/Assets/db/cpl-app.db');

// The years where 8 December is a Sunday of Advent — the only ones where anything moves.
// Read from the calendar table itself, which is also what the .sql keys off.
function transferYears() {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const rows = db
    .prepare(
      `SELECT any AS y FROM anyliturgic
       WHERE mes = '12' AND dia = '8' AND DiadelaSetmana = 'Dg' AND tempsespecific = 'Advent'
       ORDER BY any`
    )
    .all();
  db.close();
  return rows.map((r) => String(r.y));
}

// A year where the 8th is NOT a Sunday, to pin that the fix changed nothing else.
function ordinaryYear() {
  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const row = db
    .prepare(
      `SELECT any AS y FROM anyliturgic
       WHERE mes = '12' AND dia = '8' AND DiadelaSetmana <> 'Dg' ORDER BY any DESC LIMIT 1`
    )
    .all()[0];
  db.close();
  return row ? String(row.y) : null;
}

const laudes = async (date) => (await resolveDayForComparison(date, { hours: ['Laudes'] })).hours.Laudes;
const flat = (v) => String(v).replace(/\s+/g, ' ').trim();

const YEARS = transferYears();

describe('Immaculate Conception transferred off an Advent Sunday (CPL-LIT-002)', () => {
  it('the database covers at least one such year', () => expect(YEARS.length).toBeGreaterThan(0));

  it.each(YEARS)('%s-12-08 is the 2nd Sunday of Advent, not the solemnity', async (year) => {
    const day = await resolveDayForComparison(`${year}-12-08`, { hours: ['Laudes'] });
    expect(day.celebration.title).toBeFalsy();
    expect(day.celebration.celebrationType).toBe('-');
    // Sunday of psalter week II: Ps 117, with the Advent Sunday's own antiphon.
    expect(flat(day.hours.Laudes.primer_salmo_cita)).toMatch(/^Salm 117\b/);
    expect(flat(day.hours.Laudes.primer_salmo_antifona)).toMatch(/^Sió és la nostra ciutat forta/);
  });

  it.each(YEARS)('%s-12-09 carries the solemnity, with its proper psalmody', async (year) => {
    const day = await resolveDayForComparison(`${year}-12-09`, { hours: ['Laudes'] });
    expect(day.celebration.title).toMatch(/Immaculada Concepció/);
    expect(day.celebration.celebrationType).toBe('S');
    // Sunday week I psalmody, as every solemnity takes, and the Immaculate's own antiphon —
    // not the ferial Ps 41 the optional memorial of St Joan Dídac used to leave here.
    expect(flat(day.hours.Laudes.primer_salmo_cita)).toMatch(/^Salm 62\b/);
    expect(flat(day.hours.Laudes.primer_salmo_antifona)).toMatch(/^Oh Mare castíssima/);
  });

  it('a year where the 8th is not a Sunday keeps the solemnity on the 8th', async () => {
    const year = ordinaryYear();
    if (!year) return;
    const day = await resolveDayForComparison(`${year}-12-08`, { hours: ['Laudes'] });
    expect(day.celebration.title).toMatch(/Immaculada Concepció/);
    expect(flat((await laudes(`${year}-12-08`)).primer_salmo_cita)).toMatch(/^Salm 62\b/);
    expect(day.celebration.celebrationType).toBe('S');
  });
});
