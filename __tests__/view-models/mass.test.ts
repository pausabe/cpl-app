import {
  buildMass,
  massChoiceToStore,
  resolveMassChoice,
  storedMassChoice,
  MassInput,
} from '../../src/view-models/mass';
import { palmSundayGospel } from '../../src/view-models/palmSundayGospel';

const dayMass = (quote: string, comment: string, secondReading = '-', title = '') => ({
  title: title,
  secondReading: { reading: secondReading },
  gospel: { quote: quote, comment: comment },
});
const ordinary = (): MassInput => ({
  today: dayMass(
    'Lc 8,19-21',
    'La meva mare i els meus familiars són els qui escolten la paraula de Déu i la compleixen',
  ),
  hasVespers: false,
  vespers: dayMass('', ''),
});
const TODAY = { date: new Date(2026, 8, 22, 9), specificLiturgyTime: 'O_ORDINAR', yearType: 'A' };
const TOMORROW = { specificLiturgyTime: 'O_ORDINAR' };

describe('Mass block', () => {
  test('a weekday: the phrase of the Gospel and three readings', () => {
    const block = buildMass({ today: TODAY, tomorrow: TOMORROW, mass: ordinary(), choice: 'normal' });
    expect(block.label).toBe('Missa');
    expect(block.selector).toBeNull();
    expect(block.gospel).toEqual({
      caption: 'Evangeli · Lc 8,19-21',
      phrase: 'La meva mare i els meus familiars són els qui escolten la paraula de Déu i la compleixen',
      opens: 'Evangeli',
    });
    expect(block.readings.map((r) => [r.label, r.opens])).toEqual([
      ['Primera lectura', '1Lect'],
      ['Salm', 'Salm'],
      ['Evangeli', 'Evangeli'],
    ]);
    expect(block.params).toEqual({ needSecondReading: false, useVespersTexts: false });
  });

  test('Sunday: the second reading too', () => {
    const mass = ordinary();
    mass.today.secondReading.reading = 'Germans, per tot el …';
    const block = buildMass({ today: TODAY, tomorrow: TOMORROW, mass, choice: 'normal' });
    expect(block.readings.map((r) => r.label)).toEqual(['Primera lectura', 'Salm', 'Segona lectura', 'Evangeli']);
    expect(block.params.needSecondReading).toBe(true);
  });

  test('with an evening Mass, the selector and, once chosen, the phrase and the readings of that Mass', () => {
    const mass: MassInput = {
      today: dayMass('Lc 14,1.7-11', 'Tothom qui s’enalteix serà humiliat, però el qui s’humilia serà enaltit'),
      hasVespers: true,
      vespers: dayMass(
        'Mt 5,1-12a',
        'Alegreu-vos i feu festa,\nperquè la vostra recompensa és gran en el cel',
        'Estimats, mireu…',
        'Tots Sants',
      ),
    };
    const today = buildMass({ today: TODAY, tomorrow: TOMORROW, mass, choice: 'normal' });
    expect(today.selector).toEqual({ choice: 'normal', vespersTitle: 'Tots Sants' });
    expect(today.gospel.caption).toBe('Evangeli · Lc 14,1.7-11');
    expect(today.readings).toHaveLength(3);

    const evening = buildMass({ today: TODAY, tomorrow: TOMORROW, mass, choice: 'vespers' });
    expect(evening.selector).toEqual({ choice: 'vespers', vespersTitle: 'Tots Sants' });
    expect(evening.gospel).toEqual({
      caption: 'Tots Sants · Evangeli · Mt 5,1-12a',
      phrase: 'Alegreu-vos i feu festa, perquè la vostra recompensa és gran en el cel',
      opens: 'Evangeli',
    });
    expect(evening.readings).toHaveLength(4);
    expect(evening.params).toEqual({ needSecondReading: true, useVespersTexts: true });
  });

  test('Palm Sunday: the phrase and the button of the blessing', () => {
    const mass = ordinary();
    mass.today = dayMass('Mt 26,14–27,66', '-', 'Jesucrist, que era de condició divina…', 'Diumenge de Rams');
    const block = buildMass({
      today: { date: new Date(2026, 2, 29), specificLiturgyTime: 'Q_DIUM_RAMS', yearType: 'A' },
      tomorrow: { specificLiturgyTime: 'Q_SETMANES' },
      mass,
      choice: 'normal',
    });
    expect(block.gospel).toEqual({
      caption: 'Benedicció dels Rams · Mt 21,1-11',
      phrase: 'Beneït el qui ve en nom del Senyor',
      opens: 'Rams',
    });
    expect(block.extra).toEqual({ label: 'Benedicció dels Rams', opens: 'Rams' });
    expect(block.readings.map((r) => r.label)).toEqual(['Primera lectura', 'Salm', 'Segona lectura', 'Evangeli']);
  });

  test('Holy Saturday: the Easter Vigil, with two buttons', () => {
    const mass = ordinary();
    mass.today = dayMass('Mt 28,1-10', 'Ha ressuscitat i anirà davant vostre a Galilea', 'En aquells dies…');
    const block = buildMass({
      today: { date: new Date(2026, 3, 4), specificLiturgyTime: 'Q_TRIDU', yearType: 'A' },
      tomorrow: { specificLiturgyTime: 'Q_DIUM_PASQUA' },
      mass,
      choice: 'normal',
    });
    expect(block.label).toBe('Vetlla Pasqual');
    expect(block.gospel).toEqual({
      caption: 'Evangeli · Mt 28,1-10',
      phrase: 'Ha ressuscitat i anirà davant vostre a Galilea',
      opens: 'VetllaPasquaEvangeli',
    });
    expect(block.readings.map((r) => [r.label, r.opens])).toEqual([
      ['Lectures i salms', 'VetllaPasquaLecturesSalms'],
      ['Evangeli', 'VetllaPasquaEvangeli'],
    ]);
  });

  test('with no phrase in the database (Good Friday), only the reference', () => {
    const mass = ordinary();
    mass.today = dayMass('Jo 18,1–19,42', '-');
    const block = buildMass({
      today: { ...TODAY, specificLiturgyTime: 'Q_TRIDU' },
      tomorrow: { specificLiturgyTime: 'Q_TRIDU' },
      mass,
      choice: 'normal',
    });
    expect(block.gospel.caption).toBe('Evangeli · Jo 18,1–19,42');
    expect(block.gospel.phrase).toBeNull();
  });
});

describe('Avui | Vespertina', () => {
  const base = { todayKey: '31:9:2026', hasVespers: true, tomorrowIsEasterSunday: false, afternoonHour: 18 };

  test('the morning picks the one of today, and from 18 h the evening one; it is saved', () => {
    expect(resolveMassChoice({ ...base, stored: null, hour: 10 })).toEqual({ choice: 'normal', save: true });
    expect(resolveMassChoice({ ...base, stored: null, hour: 18 })).toEqual({ choice: 'vespers', save: true });
  });

  test('with no evening Mass, or if tomorrow is Easter, always the one of today', () => {
    expect(resolveMassChoice({ ...base, hasVespers: false, stored: null, hour: 20 }).choice).toBe('normal');
    expect(resolveMassChoice({ ...base, tomorrowIsEasterSunday: true, stored: null, hour: 20 }).choice).toBe('normal');
  });

  test('the choice of today is remembered all day, and the one of another day does not count', () => {
    expect(resolveMassChoice({ ...base, stored: '31:9:2026_normal', hour: 20 })).toEqual({
      choice: 'normal',
      save: false,
    });
    expect(resolveMassChoice({ ...base, stored: '31:9:2026_vespers', hour: 9 })).toEqual({
      choice: 'vespers',
      save: false,
    });
    expect(resolveMassChoice({ ...base, stored: '30:9:2026_normal', hour: 20 })).toEqual({
      choice: 'vespers',
      save: true,
    });
    expect(storedMassChoice('31:9:2026_undefined', '31:9:2026')).toBeNull();
    expect(storedMassChoice('none', '31:9:2026')).toBeNull();
    expect(massChoiceToStore('31:9:2026', 'vespers')).toBe('31:9:2026_vespers');
  });
});

test('the Gospel of the blessing of the palms, one for each year', () => {
  expect(palmSundayGospel('A')!.reference).toBe('Mt 21,1-11');
  expect(palmSundayGospel('B')!.reference).toBe('Mc 11,1-10');
  expect(palmSundayGospel('C')!.reference).toBe('Lc 19,28-40');
  for (const year of ['A', 'B', 'C']) {
    const gospel = palmSundayGospel(year)!;
    expect(gospel.phrase).toBe('Beneït el qui ve en nom del Senyor');
    expect(gospel.title).toMatch(/^Lectura de l’evangeli segons sant /);
    expect(gospel.text.length).toBeGreaterThan(500);
  }
  expect(palmSundayGospel('X')).toBeNull();
});
