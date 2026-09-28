// What the prayer screens do to the texts of the database before showing them, rule by rule. The
// golden of the screens checks them on real days; this says what each one is for.
import {
  canBeInvitatoryPsalm,
  canticleTitle,
  completePrayer,
  hasAlleluia,
  intercessionsOf,
  responsoryTogether,
  trimmedText,
  withConcreteNames,
  withoutPsalmMarks,
  withoutStraySpaces,
} from '../../src/utils/prayerText';
import { SpecificLiturgyTimeType } from '../../src/services/celebrationTimeEnums';

describe('the spaces the database leaves at the ends of a text', () => {
  test('at the end, one space or line break goes, and only one', () => {
    expect(withoutStraySpaces('Amén. ')).toBe('Amén.');
    expect(withoutStraySpaces('Amén.\n')).toBe('Amén.');
    expect(withoutStraySpaces('Amén.  ')).toBe('Amén. ');
  });

  test('at the start, every space goes: after «Ant. » it would be a second one', () => {
    expect(withoutStraySpaces(' Realment el Senyor ha ressuscitat, al·leluia.')).toBe(
      'Realment el Senyor ha ressuscitat, al·leluia.',
    );
    expect(withoutStraySpaces('  Escolteu, Senyor, i allibereu-me. ')).toBe('Escolteu, Senyor, i allibereu-me.');
    expect(trimmedText(' Al·leluia.')).toBe('Al·leluia.');
  });

  test('nothing stays nothing in the hours, and becomes an empty text in the readings', () => {
    expect(withoutStraySpaces(undefined)).toBeUndefined();
    expect(withoutStraySpaces('')).toBe('');
    expect(trimmedText(undefined)).toBe('');
    expect(trimmedText('Mt 9,9-13 ')).toBe('Mt 9,9-13');
  });
});

test('a canticle gets its reference on a line of its own', () => {
  expect(canticleTitle('Càntic\tDn 3, 57-88.56\nLloança de les criatures')).toBe(
    'Càntic\nDn 3, 57-88.56\nLloança de les criatures',
  );
  expect(canticleTitle('Salm 62, 2-9')).toBe('Salm 62, 2-9');
});

test('the psalms lose the marks of the pauses and the spaces before them', () => {
  expect(withoutPsalmMarks('Oh Déu, vós sou el meu Déu,    *\nus cerco de matinada. †\nsense aigua.')).toBe(
    'Oh Déu, vós sou el meu Déu,\nus cerco de matinada.\nsense aigua.',
  );
  expect(withoutPsalmMarks(undefined)).toBeNull();
});

test('the Al·leluia of the opening is left out from Ash Wednesday to the end of the Triduum', () => {
  expect(hasAlleluia(SpecificLiturgyTimeType.Ordinary)).toBe(true);
  expect(hasAlleluia(SpecificLiturgyTimeType.EasterWeeks)).toBe(true);
  expect(hasAlleluia(SpecificLiturgyTimeType.LentAshes)).toBe(false);
  expect(hasAlleluia(SpecificLiturgyTimeType.LentWeeks)).toBe(false);
  expect(hasAlleluia(SpecificLiturgyTimeType.PalmSunday)).toBe(false);
  expect(hasAlleluia(SpecificLiturgyTimeType.HolyWeek)).toBe(false);
  expect(hasAlleluia(SpecificLiturgyTimeType.PaschalTriduum)).toBe(false);
});

test('an invitatory psalm that is already a psalm of the day is not offered', () => {
  const titles = ['Salm 23\nEntrada del Senyor al seu temple', undefined, 'Salm 62, 2-9'];
  expect(canBeInvitatoryPsalm('23', titles)).toBe(false);
  expect(canBeInvitatoryPsalm('94', titles)).toBe(true);
});

describe('the conclusion of the final prayer', () => {
  test('the long one at the hours, the short one at the minor hours', () => {
    const prayer = 'Guardeu-nos avui, Senyor. Per nostre Senyor Jesucrist.';
    expect(completePrayer(prayer, false)).toBe(
      "Guardeu-nos avui, Senyor. Per nostre Senyor Jesucrist, el vostre Fill, que amb vós viu i regna en la unitat de l'Esperit Sant, Déu, pels segles dels segles.",
    );
    expect(completePrayer(prayer, true)).toBe('Guardeu-nos avui, Senyor. Per Crist Senyor nostre.');
  });

  test('addressed to the Son, and speaking of him', () => {
    expect(completePrayer('Veniu, Senyor. Vós, que viviu i regneu.', true)).toBe(
      'Veniu, Senyor. Vós, que viviu i regneu pels segles dels segles.',
    );
    expect(completePrayer('Escolteu-nos. Ell, que amb vós viu i regna.', false)).toBe(
      "Escolteu-nos. Ell, que amb vós viu i regna en la unitat de l'Esperit Sant, Déu, pels segles dels segles.",
    );
  });

  test('the soft hyphens go when the conclusion is written in; otherwise the prayer is left alone', () => {
    expect(completePrayer('Pro­tegiu-nos. Per nostre Senyor Jesucrist.', true)).toBe(
      'Protegiu-nos. Per Crist Senyor nostre.',
    );
    expect(completePrayer('Pro­tegiu-nos.', true)).toBe('Pro­tegiu-nos.');
    expect(completePrayer(undefined, true)).toBe('');
  });
});

describe('the two first parts of a responsory, as one sentence', () => {
  test('the second goes on in lower case', () => {
    expect(responsoryTogether('Obriu-me els llavis,', 'I proclamaré la vostra lloança.')).toBe(
      'Obriu-me els llavis, i proclamaré la vostra lloança.',
    );
  });

  test('unless the first ends a sentence or the second starts with a name that keeps its capital', () => {
    expect(responsoryTogether('Ho dic.', 'Amb vós.')).toBe('Ho dic. Amb vós.');
    expect(responsoryTogether('Us lloem,', 'Senyor, per sempre.')).toBe('Us lloem, Senyor, per sempre.');
    expect(responsoryTogether('Pregueu per nosaltres,', 'Maria.')).toBe('Pregueu per nosaltres, Maria.');
  });

  test('a second part that started with a space in the database also goes on in lower case', () => {
    expect(
      responsoryTogether('Déu m\u2019ha fet apòstol,', withoutStraySpaces(' I la gràcia que ell m\u2019ha donat.')),
    ).toBe('Déu m\u2019ha fet apòstol, i la gràcia que ell m\u2019ha donat.');
  });

  test('with a part missing there is nothing to join', () => {
    expect(responsoryTogether('Obriu-me els llavis,', undefined)).toBe('');
  });
});

test('the pope and the bishop by their names', () => {
  expect(withConcreteNames('Pel papa N. i pel bisbe N.', 'Lleó', 'Joan')).toBe('Pel papa Lleó i pel bisbe Joan');
  expect(withConcreteNames('Papa N., bisbe de Roma', 'Lleó', 'Joan')).toBe('papa Lleó, bisbe de Roma');
});

describe('the intercessions, taken apart', () => {
  const PRAYERS =
    "Preguem el Senyor dient:\nEscolta'ns, Senyor.\n\n" +
    'Feu-nos fidels al papa N.,\n—\tperquè us servim.\n\n' +
    'Acolliu els difunts,\n—\tque reposin en vós.\n\n' +
    'Preguem ara com Jesús ens va ensenyar: Pare nostre.';
  const NAMES = { pope: 'Lleó', bishop: 'Joan' };

  test('at Lauds, only the closing sentence goes after the other intentions', () => {
    expect(intercessionsOf(PRAYERS, 'laudes', NAMES)).toEqual({
      kind: 'parts',
      intro: 'Preguem el Senyor dient',
      response: "Escolta'ns, Senyor.",
      intercessions:
        'Feu-nos fidels al papa Lleó,\n—\tperquè us servim.\n\nAcolliu els difunts,\n—\tque reposin en vós.',
      finalPart: 'Preguem ara com Jesús ens va ensenyar:',
    });
  });

  test('at Vespers the last intercession, for the dead, goes there too', () => {
    expect(intercessionsOf(PRAYERS, 'vespers', NAMES)).toEqual({
      kind: 'parts',
      intro: 'Preguem el Senyor dient',
      response: "Escolta'ns, Senyor.",
      intercessions: 'Feu-nos fidels al papa Lleó,\n—\tperquè us servim.',
      finalPart: 'Acolliu els difunts,\n—\tque reposin en vós.\n\nPreguem ara com Jesús ens va ensenyar:',
    });
  });

  test('Vespers also take the Pare nostre after two spaces; Lauds show that text whole', () => {
    const twoSpaces = PRAYERS.replace(': Pare nostre.', ':  Pare nostre.');
    expect(intercessionsOf(twoSpaces, 'vespers', NAMES).kind).toBe('parts');
    expect(intercessionsOf(twoSpaces, 'laudes', NAMES)).toEqual({
      kind: 'text',
      text: twoSpaces.replace('papa N.', 'papa Lleó'),
    });
  });

  test('a text without the shape expected is shown whole, and no text is a dash', () => {
    expect(intercessionsOf('Preguem per tothom.', 'laudes', NAMES)).toEqual({
      kind: 'text',
      text: 'Preguem per tothom.',
    });
    expect(intercessionsOf(PRAYERS.replace('\n\n', '\n'), 'laudes', NAMES).kind).toBe('text');
    expect(intercessionsOf('-', 'vespers', NAMES)).toEqual({ kind: 'text', text: '-' });
    expect(intercessionsOf(undefined, 'vespers', NAMES)).toEqual({ kind: 'text', text: '-' });
  });
});
