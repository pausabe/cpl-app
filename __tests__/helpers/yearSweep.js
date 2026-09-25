// Every day of a year, each one with a different diocese and settings combination (it
// rotates through all of them), resolved the way the app does when it opens. Two checks:
//
//  - no day may start failing: the golden stores which days threw, and why;
//  - no day may change: each part of the day (the Office, Laudes, … the Mass) is reduced to
//    a hash and compared with the golden. A hash can't show the text, only where it moved;
//    LiturgyGolden.test.js has the full text for the days that matter most.
const { PROFILES, loadDay, isoDateOf } = require('./liturgyDay');
const { sha256, readGolden, writeGolden } = require('./golden');

const PROFILE_NAMES = Object.keys(PROFILES);

function fingerprint(state) {
  const parts = {
    dayInformation: state.dayInformation,
    celebration: state.celebration,
    settings: state.settings,
    massToday: state.mass.today,
    massVespers: state.mass.vespers ?? null,
  };
  for (const [hour, value] of Object.entries(state.hours)) parts[`hours.${hour}`] = value;
  const out = {};
  for (const [name, value] of Object.entries(parts)) out[name] = sha256(JSON.stringify(value ?? null)).slice(0, 16);
  return out;
}

function describeYearSweep(year) {
  describe(`sweep of every day of ${year}`, () => {
    const results = {};
    let golden;

    beforeAll(async () => {
      golden = readGolden(`year-${year}`);
      let index = 0;
      for (let date = new Date(year, 0, 1); date.getFullYear() === year; date.setDate(date.getDate() + 1)) {
        const day = isoDateOf(date);
        const profile = PROFILE_NAMES[index++ % PROFILE_NAMES.length];
        try {
          results[day] = { profile, parts: fingerprint(await loadDay(day, profile)) };
        } catch (error) {
          results[day] = { profile, error: String(error) };
        }
      }
      if (!golden) writeGolden(`year-${year}`, results);
    }, 600000);

    const months = Array.from({ length: 12 }, (_, m) => m);
    test.each(months)(`month %i: no day fails or changes against the golden`, (month) => {
      if (!golden) return;
      const changed = [];
      for (const [day, result] of Object.entries(results)) {
        if (Number(day.slice(5, 7)) !== month + 1) continue;
        const before = golden[day];
        if (!before) {
          changed.push(`${day}: not in the golden`);
          continue;
        }
        if (before.error !== result.error) {
          changed.push(`${day} (${result.profile}): error «${before.error ?? 'none'}» → «${result.error ?? 'none'}»`);
          continue;
        }
        for (const part of Object.keys({ ...before.parts, ...result.parts })) {
          if (before.parts?.[part] !== result.parts?.[part]) changed.push(`${day} (${result.profile}): ${part}`);
        }
      }
      expect(changed).toEqual([]);
    });
  });
}

module.exports = { describeYearSweep };
