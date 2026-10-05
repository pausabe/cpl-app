// At Terce, Sext and None of a feast the psalms are the weekday's, with the weekday's antiphons, unless the
// feast has antiphons of its own (OGLH 232). The app put the antiphons of the feast's common there; the CPL
// sent the four feasts below as examples [CPL-LIT-007].
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));

const { PROFILES, loadDay } = require('../helpers/liturgyDay');

PROFILES.mallorca = { diocesis: 'Mallorca', lloc: 'Diòcesi' };
PROFILES.barcelonaCathedral = { diocesis: 'Barcelona', lloc: 'Catedral' };
PROFILES.terrassaCathedral = { diocesis: 'Terrassa', lloc: 'Catedral' };

async function minorHours(day, profile) {
  const state = await loadDay(day, profile);
  const { thirdHour, sixthHour, ninthHour } = state.hours.hours;
  return { title: state.celebration.title, hours: [thirdHour, sixthHour, ninthHour] };
}

// The antiphon said at each hour: the hour's own, or the first psalm's when each psalm has its own
const said = (hours) =>
  hours.map((hour) => (hour.hasMultipleAntiphons ? hour.firstPsalm.antiphon : hour.uniqueAntiphon));

describe('the minor hours of a feast', () => {
  it('in Ordinary Time, keep the antiphon of each psalm of the day (Blessed Ramon Llull, Mallorca)', async () => {
    const { title, hours } = await minorHours('2025-11-27', 'mallorca');
    expect(title).toBe('Beat Ramon Llull');
    for (const hour of hours) {
      expect(hour.hasMultipleAntiphons).toBe(true);
      expect(hour.firstPsalm.antiphon).toMatch(/^M’estimo més, Senyor, la llei dels vostres llavis/);
      expect(hour.secondPsalm.antiphon).toMatch(/^Confio en Déu/);
      expect(hour.thirdPsalm.antiphon).toMatch(/^El vostre amor, Senyor, arriba fins al cel/);
    }
  });

  it('in Lent, have the antiphons of Lent (Saint Pacian, Barcelona cathedral)', async () => {
    const { title, hours } = await minorHours('2026-03-09', 'barcelonaCathedral');
    expect(title).toBe('Sant Pacià, bisbe');
    expect(said(hours)).toEqual([
      expect.stringMatching(/^Aquests són dies de penediment/),
      expect.stringMatching(/^Diu el Senyor: No desitjo la mort del pecador/),
      expect.stringMatching(/^Pel poder que Déu ens dóna/),
    ]);
  });

  it('in Easter Time, have the alleluia (Saint Matthias)', async () => {
    const { title, hours } = await minorHours('2025-05-14', 'barcelona');
    expect(title).toBe('Sant Maties, apòstol');
    expect(said(hours)).toEqual(Array(3).fill('Al·leluia, al·leluia, al·leluia.'));
  });

  it('in Advent, have the antiphons of Advent (Dedication of the Cathedral of Terrassa, in the diocese)', async () => {
    const { title, hours } = await minorHours('2025-12-10', 'terrassa');
    expect(title).toBe('Dedicació de la Catedral de Terrassa');
    expect(said(hours)).toEqual([
      expect.stringMatching(/^Els profetes van predir/),
      expect.stringMatching(/^L’àngel Gabriel va saludar Maria/),
      expect.stringMatching(/^Respongué Maria/),
    ]);
  });

  it('keep the antiphons the feast has of its own (the Exaltation of the Holy Cross)', async () => {
    const { title, hours } = await minorHours('2026-09-14', 'barcelona');
    expect(title).toBe('Exaltació de la Santa Creu');
    expect(said(hours)).toEqual([
      expect.stringMatching(/^Crist salvador, salveu-nos pel poder de la creu/),
      expect.stringMatching(/^Salvador del món, salveu-nos/),
      expect.stringMatching(/^Per la vostra creu, salveu-nos/),
    ]);
  });
});

describe('the minor hours of a solemnity', () => {
  it('still take the antiphons of the common (Dedication of the Cathedral of Terrassa, in the cathedral)', async () => {
    const { title, hours } = await minorHours('2025-12-10', 'terrassaCathedral');
    expect(title).toBe('Dedicació de la Catedral de Terrassa');
    expect(said(hours)).toEqual([
      expect.stringMatching(/^El temple del Senyor és sagrat/),
      expect.stringMatching(/^La santedat, Senyor, escau a casa vostra/),
      expect.stringMatching(/^Aquesta és la casa del Senyor/),
    ]);
  });
});
