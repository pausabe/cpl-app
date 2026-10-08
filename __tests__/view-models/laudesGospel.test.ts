import { laudesGospel } from '../../src/view-models/laudesGospel';
import { palmSundayGospel } from '../../src/view-models/palmSundayGospel';

const GOSPEL = {
  quote: 'Lc 11,5-13',
  comment: 'Demaneu, i Déu us donarà',
  title: 'Lectura de l’evangeli segons sant Lluc',
  gospel: 'En aquell temps, Jesús digué als seus deixebles…',
};
const ORDINARY = { specificLiturgyTime: 'O_ORDINAR', yearType: 'C' };

test('a weekday: the Gospel of the Mass of the day, as it is', () => {
  expect(laudesGospel({ today: ORDINARY, tomorrow: ORDINARY, gospel: GOSPEL })).toBe(GOSPEL);
});

test('Palm Sunday: the Gospel of the blessing of the palms, as on the home, not the Passion', () => {
  const blessing = palmSundayGospel('A')!;
  const passion = { quote: 'Mt 26,14–27,66', comment: '-', title: 'Passió', gospel: 'En aquell temps…' };
  expect(
    laudesGospel({
      today: { specificLiturgyTime: 'Q_DIUM_RAMS', yearType: 'A' },
      tomorrow: { specificLiturgyTime: 'Q_SET_SANTA' },
      gospel: passion,
    }),
  ).toEqual({ quote: 'Mt 21,1-11', comment: blessing.phrase, title: blessing.title, gospel: blessing.text });
});

test('Holy Saturday: none, the Gospel of the Vigil belongs to Easter', () => {
  expect(
    laudesGospel({
      today: { specificLiturgyTime: 'Q_TRIDU', yearType: 'A' },
      tomorrow: { specificLiturgyTime: 'Q_DIUM_PASQUA' },
      gospel: GOSPEL,
    }),
  ).toBeNull();
});

test('a Mass without a Gospel in the database: none', () => {
  for (const gospel of ['-', '', '  ', undefined]) {
    expect(
      laudesGospel({ today: ORDINARY, tomorrow: ORDINARY, gospel: { ...GOSPEL, gospel: gospel as string } }),
    ).toBeNull();
  }
});
