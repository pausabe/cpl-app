import {buildMass, massChoiceToStore, resolveMassChoice, storedMassChoice, MassInput} from '../../src/ViewModels/Mass';
import {palmSundayGospel} from '../../src/ViewModels/PalmSundayGospel';

const dayMass = (quote: string, comment: string, secondReading = '-', title = '') => ({
  Title: title,
  SecondReading: {Reading: secondReading},
  Gospel: {Quote: quote, Comment: comment},
});
const ordinary = (): MassInput => ({
  Today: dayMass('Lc 8,19-21', 'La meva mare i els meus familiars són els qui escolten la paraula de Déu i la compleixen'),
  HasVespers: false,
  Vespers: dayMass('', ''),
});
const TODAY = {Date: new Date(2026, 8, 22, 9), SpecificLiturgyTime: 'O_ORDINAR', YearType: 'A'};
const TOMORROW = {SpecificLiturgyTime: 'O_ORDINAR'};

describe('bloc de la missa', () => {
  test('un dia feiner: la frase de l’Evangeli i tres lectures', () => {
    const block = buildMass({today: TODAY, tomorrow: TOMORROW, mass: ordinary(), choice: 'normal'});
    expect(block.label).toBe('Missa');
    expect(block.selector).toBeNull();
    expect(block.gospel).toEqual({
      caption: 'Evangeli · Lc 8,19-21',
      phrase: 'La meva mare i els meus familiars són els qui escolten la paraula de Déu i la compleixen',
      opens: 'Evangeli',
    });
    expect(block.readings.map((r) => [r.label, r.opens])).toEqual([
      ['Primera lectura', '1Lect'], ['Salm', 'Salm'], ['Evangeli', 'Evangeli']]);
    expect(block.params).toEqual({need_lectura2: false, useVespersTexts: false});
  });

  test('diumenge: també la segona lectura', () => {
    const mass = ordinary();
    mass.Today.SecondReading.Reading = 'Germans, per tot el …';
    const block = buildMass({today: TODAY, tomorrow: TOMORROW, mass, choice: 'normal'});
    expect(block.readings.map((r) => r.label)).toEqual(['Primera lectura', 'Salm', 'Segona lectura', 'Evangeli']);
    expect(block.params.need_lectura2).toBe(true);
  });

  test('amb missa vespertina, el selector i, triada, la frase i les lectures d’aquella missa', () => {
    const mass: MassInput = {
      Today: dayMass('Lc 14,1.7-11', 'Tothom qui s’enalteix serà humiliat, però el qui s’humilia serà enaltit'),
      HasVespers: true,
      Vespers: dayMass('Mt 5,1-12a', 'Alegreu-vos i feu festa,\nperquè la vostra recompensa és gran en el cel', 'Estimats, mireu…', 'Tots Sants'),
    };
    const today = buildMass({today: TODAY, tomorrow: TOMORROW, mass, choice: 'normal'});
    expect(today.selector).toEqual({choice: 'normal', vespersTitle: 'Tots Sants'});
    expect(today.gospel.caption).toBe('Evangeli · Lc 14,1.7-11');
    expect(today.readings).toHaveLength(3);

    const evening = buildMass({today: TODAY, tomorrow: TOMORROW, mass, choice: 'vespers'});
    expect(evening.selector).toEqual({choice: 'vespers', vespersTitle: 'Tots Sants'});
    expect(evening.gospel).toEqual({
      caption: 'Tots Sants · Evangeli · Mt 5,1-12a',
      phrase: 'Alegreu-vos i feu festa, perquè la vostra recompensa és gran en el cel',
      opens: 'Evangeli',
    });
    expect(evening.readings).toHaveLength(4);
    expect(evening.params).toEqual({need_lectura2: true, useVespersTexts: true});
  });

  test('Diumenge de Rams: la frase i el botó de la benedicció', () => {
    const mass = ordinary();
    mass.Today = dayMass('Mt 26,14–27,66', '-', 'Jesucrist, que era de condició divina…', 'Diumenge de Rams');
    const block = buildMass({
      today: {Date: new Date(2026, 2, 29), SpecificLiturgyTime: 'Q_DIUM_RAMS', YearType: 'A'},
      tomorrow: {SpecificLiturgyTime: 'Q_SETMANES'}, mass, choice: 'normal',
    });
    expect(block.gospel).toEqual({caption: 'Benedicció dels Rams · Mt 21,1-11', phrase: 'Beneït el qui ve en nom del Senyor', opens: 'Rams'});
    expect(block.extra).toEqual({label: 'Benedicció dels Rams', opens: 'Rams'});
    expect(block.readings.map((r) => r.label)).toEqual(['Primera lectura', 'Salm', 'Segona lectura', 'Evangeli']);
  });

  test('Dissabte Sant: la Vetlla Pasqual, amb dos botons', () => {
    const mass = ordinary();
    mass.Today = dayMass('Mt 28,1-10', 'Ha ressuscitat i anirà davant vostre a Galilea', 'En aquells dies…');
    const block = buildMass({
      today: {Date: new Date(2026, 3, 4), SpecificLiturgyTime: 'Q_TRIDU', YearType: 'A'},
      tomorrow: {SpecificLiturgyTime: 'Q_DIUM_PASQUA'}, mass, choice: 'normal',
    });
    expect(block.label).toBe('Vetlla Pasqual');
    expect(block.gospel).toEqual({caption: 'Evangeli · Mt 28,1-10', phrase: 'Ha ressuscitat i anirà davant vostre a Galilea', opens: 'VetllaPasquaEvangeli'});
    expect(block.readings.map((r) => [r.label, r.opens])).toEqual([
      ['Lectures i salms', 'VetllaPasquaLecturesSalms'], ['Evangeli', 'VetllaPasquaEvangeli']]);
  });

  test('sense frase a la base de dades (Divendres Sant), només la cita', () => {
    const mass = ordinary();
    mass.Today = dayMass('Jo 18,1–19,42', '-');
    const block = buildMass({today: {...TODAY, SpecificLiturgyTime: 'Q_TRIDU'}, tomorrow: {SpecificLiturgyTime: 'Q_TRIDU'}, mass, choice: 'normal'});
    expect(block.gospel.caption).toBe('Evangeli · Jo 18,1–19,42');
    expect(block.gospel.phrase).toBeNull();
  });
});

describe('Avui | Vespertina', () => {
  const base = {todayKey: '31:9:2026', hasVespers: true, tomorrowIsEasterSunday: false, afternoonHour: 18};

  test('el matí tria la d’avui, i a partir de les 18 h la vespertina; es desa', () => {
    expect(resolveMassChoice({...base, stored: null, hour: 10})).toEqual({choice: 'normal', save: true});
    expect(resolveMassChoice({...base, stored: null, hour: 18})).toEqual({choice: 'vespers', save: true});
  });

  test('sense missa vespertina, o si demà és Pasqua, sempre la d’avui', () => {
    expect(resolveMassChoice({...base, hasVespers: false, stored: null, hour: 20}).choice).toBe('normal');
    expect(resolveMassChoice({...base, tomorrowIsEasterSunday: true, stored: null, hour: 20}).choice).toBe('normal');
  });

  test('la tria d’avui es recorda tot el dia, i la d’un altre dia no compta', () => {
    expect(resolveMassChoice({...base, stored: '31:9:2026_normal', hour: 20})).toEqual({choice: 'normal', save: false});
    expect(resolveMassChoice({...base, stored: '31:9:2026_vespers', hour: 9})).toEqual({choice: 'vespers', save: false});
    expect(resolveMassChoice({...base, stored: '30:9:2026_normal', hour: 20})).toEqual({choice: 'vespers', save: true});
    expect(storedMassChoice('31:9:2026_undefined', '31:9:2026')).toBeNull();
    expect(storedMassChoice('none', '31:9:2026')).toBeNull();
    expect(massChoiceToStore('31:9:2026', 'vespers')).toBe('31:9:2026_vespers');
  });
});

test('l’evangeli de la benedicció dels rams, un per a cada any', () => {
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
