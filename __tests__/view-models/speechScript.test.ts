// Who says each piece of an hour read aloud, and what is said: the rules Pau chose by ear on
// 8 October 2026 (view-models/speech/script.ts), with made-up words in the places of the real ones.
import { createHash } from 'crypto';
import {
  MAX_PIECE_CHARS,
  pieceKey,
  speechScript,
  splitWords,
  spoken,
  PAUSES,
  VOICES,
} from '../../src/view-models/speech/script';
import { sha256 } from '../../src/view-models/speech/sha256';
import type { SpeechParagraph } from '../../src/view-models/speech/paragraph';

const R = (text: string, italic = false) => ({ look: 'R' as const, italic, text });
const T = (text: string, italic = false) => ({ look: 'T' as const, italic, text });
const OUR_FATHER = 'Pare nostre, que esteu en el cel:\nsigui santificat el vostre nom;';

const script = (hour: string, paragraphs: SpeechParagraph[]) =>
  speechScript(hour, paragraphs, OUR_FATHER).map((p) => [p.role, p.text]);

describe('sha256', () => {
  test('gives the standard digest, for ASCII and for Catalan letters', () => {
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    // The same as Node's crypto, byte for byte in UTF-8
    const text = 'Al·leluia, Déu d’Israel! «Glòria» — 2C 12, 9b-10';
    expect(sha256(text)).toBe(createHash('sha256').update(text, 'utf8').digest('hex'));
  });

  test('names a piece by its voice and its words', () => {
    expect(pieceKey(VOICES.cor1, 'Un text.')).toHaveLength(24);
    expect(pieceKey(VOICES.cor1, 'Un text.')).not.toBe(pieceKey(VOICES.cor2, 'Un text.'));
  });
});

describe('the words as they are said', () => {
  test('one line, without the pause marks of the psalms nor the stray spaces', () => {
    expect(spoken('Lloeu el Senyor,  *\nnacions totes; †\n  aclameu-lo .')).toBe(
      'Lloeu el Senyor, nacions totes; aclameu-lo.',
    );
    expect(spoken('—\ti la segona part')).toBe('i la segona part');
  });

  test('of a response inside a canticle, only the response: the «R.» is not read', () => {
    expect(spoken('tots els seus servents (R. Al·leluia.)\ni els qui el temen')).toBe(
      'tots els seus servents (Al·leluia.) i els qui el temen',
    );
  });
});

describe('a psalm', () => {
  const psalm: SpeechParagraph[] = [
    [R('SALMÒDIA')],
    [R('Ant. 1.'), T(' Antífona del salm.')],
    [R('Salm 21 - II\nUn títol del salm')],
    [T('Frase sota el títol (Mt 1, 1)', true)],
    [T('Primera estrofa,\nprimera línia.\n\nSegona estrofa.\n\nTercera estrofa.')],
    [T('Glòria.', true)],
    [R('Ant. 1.'), T(' Antífona del salm.')],
  ];

  test('whoever says the antiphon starts the psalm, and the choirs alternate the strophes', () => {
    expect(script('Laudes', psalm)).toEqual([
      ['lector', 'Salmòdia.'],
      ['cor1', 'Antífona del salm.'],
      ['lector', 'Salm 21, segona part. Un títol del salm.'],
      ['cor1', 'Primera estrofa, primera línia.'],
      ['cor2', 'Segona estrofa.'],
      ['cor1', 'Tercera estrofa.'],
      ['cor1', "Glòria al Pare i al Fill i a l'Esperit Sant."],
      ['cor2', 'Com era al principi, ara i sempre i pels segles dels segles. Amén.'],
      ['cor1', 'Antífona del salm.'],
    ]);
  });

  test('the silences are the script’s, not the audio’s', () => {
    const pieces = speechScript('Laudes', psalm, OUR_FATHER);
    expect(pieces[1].pause).toBe(PAUSES.antiphon);
    expect(pieces[3].pause).toBe(PAUSES.strophe);
    expect(pieces[6].pause).toBe(PAUSES.half);
    expect(pieces.every((p) => p.key === pieceKey(p.voice, p.text))).toBe(true);
  });
});

test('the invitatory: the cantor says the antiphon, the people repeat it and answer every strophe', () => {
  expect(
    script('Laudes', [
      [R('INVITATORI')],
      [R('V. '), T('Obriu-me els llavis.')],
      [R('R. '), T('I proclamaré.')],
      [R('Ant. '), T('Antífona.')],
      [R('Salm 94\nInvitació')],
      [T('Estrofa u.')],
      [R('Ant. '), T('Antífona.')],
      [T('Estrofa dos.')],
      [R('Ant. '), T('Antífona.')],
    ]),
  ).toEqual([
    ['lector', 'Invitatori.'],
    ['cor1', 'Obriu-me els llavis.'],
    ['cor2', 'I proclamaré.'],
    ['cor1', 'Antífona.'],
    ['cor2', 'Antífona.'],
    ['lector', 'Salm 94. Invitació.'],
    ['cor1', 'Estrofa u.'],
    ['cor2', 'Antífona.'],
    ['cor1', 'Estrofa dos.'],
    ['cor2', 'Antífona.'],
  ]);
});

test('the opening and the end: the presider says the verse and the blessing, the people answer', () => {
  expect(
    script('Tèrcia', [
      [R('V. '), T('Sigueu amb nosaltres.')],
      [R('R. '), T('Senyor, veniu.')],
      [T('Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi. Amén. Al·leluia.')],
      [R('CONCLUSIÓ')],
      [R('V. '), T('Beneïm el Senyor.')],
      [R('R. '), T('Donem gràcies a Déu.')],
    ]),
  ).toEqual([
    ['president', 'Sigueu amb nosaltres.'],
    ['cor2', 'Senyor, veniu.'],
    ['cor1', "Glòria al Pare i al Fill i a l'Esperit Sant."],
    ['cor2', 'Com era al principi, ara i sempre i pels segles dels segles. Amén. Al·leluia.'],
    ['president', 'Beneïm el Senyor.'],
    ['cor2', 'Donem gràcies a Déu.'],
  ]);
});

test('the intercessions: the presider the first part, the people the second, and the Lord’s Prayer whole', () => {
  expect(
    script('Laudes', [
      [R('PREGÀRIES')],
      [T('Invitació del qui presideix:')],
      [T('Resposta del poble.', true)],
      [T('Primera part de la intenció,\n—\tsegona part.\n\nUna altra intenció,\n—\tla seva segona part.')],
      [R('Aquí es poden afegir altres intencions.', true)],
      [T('Pare nostre.', true)],
    ]),
  ).toEqual([
    ['lector', 'Pregàries.'],
    ['president', 'Invitació del qui presideix:'],
    ['cor2', 'Resposta del poble.'],
    ['president', 'Primera part de la intenció,'],
    ['cor2', 'segona part.'],
    ['president', 'Una altra intenció,'],
    ['cor2', 'la seva segona part.'],
    ['lector', 'Aquí es poden afegir altres intencions.'],
    ['cor2', 'Pare nostre, que esteu en el cel: sigui santificat el vostre nom;'],
  ]);
});

test('a short reading: the reader, without its reference', () => {
  expect(script('Laudes', [[R('LECTURA BREU')], [R('2C 12, 9b-10')], [T('Text de la lectura.')]])).toEqual([
    ['lector', 'Lectura breu.'],
    ['lector', 'Text de la lectura.'],
  ]);
});

test('the Gospel at Mass: the acclamation by the choirs, as written, and the Gospel by the presider', () => {
  expect(
    script('Missa', [
      [R('Evangeli')],
      [R('Al·leluia. Jo 12,31b.32')],
      [T('El vers de l’aclamació.')],
      [R('Lc 11,15-26')],
      [T('Resum de l’evangeli', true)],
      [T('Lectura de l’evangeli segons sant Lluc')],
      [T('En aquell temps, el text de l’evangeli.')],
    ]),
  ).toEqual([
    ['lector', 'Evangeli.'],
    ['cor2', 'Al·leluia.'],
    ['cor1', 'El vers de l’aclamació.'],
    ['president', 'Lectura de l’evangeli segons sant Lluc'],
    ['president', 'En aquell temps, el text de l’evangeli.'],
  ]);
});

test('the Passion in three voices: the chronicler, Christ and the others, without the marks', () => {
  expect(
    script('Missa', [
      [R('Evangeli')],
      [T('Lectura de la passió de nostre Senyor Jesucrist segons sant Marc')],
      [
        T(
          'C. Quan faltaven dos dies, deien: S. «No a la festa». C. Però Jesús digué: + «Deixeu-la estar». C. I se n’anà.',
        ),
      ],
    ]),
  ).toEqual([
    ['lector', 'Evangeli.'],
    ['president', 'Lectura de la passió de nostre Senyor Jesucrist segons sant Marc'],
    ['lector', 'Quan faltaven dos dies, deien:'],
    ['cor2', '«No a la festa».'],
    ['lector', 'Però Jesús digué:'],
    ['president', '«Deixeu-la estar».'],
    ['lector', 'I se n’anà.'],
  ]);
});

test('after the intercessions, the reader leaves room for one’s own: ten seconds of silence', () => {
  const pieces = speechScript(
    'Laudes',
    [
      [R('PREGÀRIES')],
      [T('Pregària per l’Església.\n— Escolteu-nos, Senyor.')],
      [R('Aquí es poden afegir altres intencions.', true)],
      [T('Part final de les pregàries.')],
    ],
    OUR_FATHER,
  );
  const room = pieces.find((p) => p.kind === 'intencions');
  expect(room).toMatchObject({ role: 'lector', text: 'Aquí es poden afegir altres intencions.', pause: 10 });
  expect(pieces[pieces.length - 1].text).toBe('Part final de les pregàries.');
});

test('a response inside a canticle is said by the people, without its «R.»', () => {
  expect(
    script('Laudes', [
      [R('SALMÒDIA')],
      [R('Ant. 1'), T('Beneïu el Senyor.')],
      [
        T(
          'Beneïu el Senyor, totes les obres. R. Canteu-li lloances per sempre.\n\nÀngels del Senyor, beneïu-lo. R. Canteu-li lloances per sempre.',
        ),
      ],
    ]),
  ).toEqual([
    ['lector', 'Salmòdia.'],
    ['cor1', 'Beneïu el Senyor.'],
    ['cor1', 'Beneïu el Senyor, totes les obres.'],
    ['cor2', 'Canteu-li lloances per sempre.'],
    ['cor2', 'Àngels del Senyor, beneïu-lo.'],
    ['cor2', 'Canteu-li lloances per sempre.'],
  ]);
  expect(script('Missa', [[T('R. Guardeu-me, Déu meu, en vós trobo refugi.')]])).toEqual([
    ['cor2', 'Guardeu-me, Déu meu, en vós trobo refugi.'],
  ]);
});

test('a «Cf.» reference is not read, however long', () => {
  expect(
    script('Ofici', [[R('RESPONSORI')], [R('Cf. Mt 7, 24; 1Pe 2, 22; 1S 2, 28; Sir 44, 16-17.')], [T('Text.')]]),
  ).not.toContainEqual(['lector', expect.stringContaining('Cf.')]);
});

describe('a long paragraph', () => {
  const sentence = (n: number) => `Aquesta és la frase número ${n}, que té unes quantes paraules per fer gruix. `;
  const long = Array.from({ length: 30 }, (_, i) => sentence(i))
    .join('')
    .trim();

  test('goes in pieces no longer than the limit, cut where a sentence ends', () => {
    const pieces = splitWords(long);
    expect(pieces.length).toBeGreaterThan(1);
    for (const p of pieces) {
      expect(p.length).toBeLessThanOrEqual(MAX_PIECE_CHARS);
      expect(p.endsWith('.')).toBe(true);
    }
    expect(pieces.join(' ')).toBe(long);
  });

  test('a sentence longer than the limit is cut after a comma', () => {
    const endless = Array.from({ length: 160 }, (_, i) => `clàusula ${i}`).join(', ') + '.';
    const pieces = splitWords(endless);
    expect(pieces.length).toBeGreaterThan(1);
    for (const p of pieces) expect(p.length).toBeLessThanOrEqual(MAX_PIECE_CHARS);
    expect(pieces.join(' ')).toBe(endless);
  });

  test('a short silence between its pieces, and the reading’s own after the last', () => {
    const pieces = speechScript('Ofici', [[R('LECTURES')], [T(long)]], OUR_FATHER);
    const reading = pieces.filter((p) => p.kind === 'lectura');
    expect(reading.length).toBeGreaterThan(1);
    expect(reading.slice(0, -1).every((p) => p.pause === PAUSES.sentence)).toBe(true);
    expect(reading[reading.length - 1].pause).toBe(PAUSES.reading);
  });
});
