// The prayer sewn into one text, so that a selection can go from one paragraph to the next: a
// selection never leaves the view it started in, so the paragraphs that follow one another have
// to be a single text. What breaks it (a line across, a button, a row of its own) starts a new
// one, and what no selection can reach is taken by «Copia-ho tot».
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(() => Promise.resolve()) }));

import React from 'react';
import { Platform, Text, TextInput, View } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { renderWithTheme, styleOf } from '../helpers/renderWithTheme';
import { getPrayerText, shownText } from '../helpers/prayerText';
import ContinueButton from '../../src/components/ContinueButton';
import Gap from '../../src/components/Gap';
import HR from '../../src/components/HRComponent';
import PrayerFlow from '../../src/components/PrayerFlow';
import PrayerText from '../../src/components/PrayerText';
import Rubric from '../../src/components/Rubric';
import SectionTitle from '../../src/components/SectionTitle';

const texts = () => screen.UNSAFE_queryAllByType(TextInput);

const onPlatform = (os, body) => {
  const real = Platform.OS;
  Platform.OS = os;
  try {
    body();
  } finally {
    Platform.OS = real;
  }
};

test('two paragraphs with a space between them are one text, with the space written inside', () => {
  renderWithTheme(
    <PrayerFlow>
      <PrayerText selectable={true}>{'Lectura primera'}</PrayerText>
      <Gap />
      <PrayerText selectable={true}>{'Del llibre del profeta Isaïes'}</PrayerText>
    </PrayerFlow>,
  );
  expect(texts()).toHaveLength(1);
  // In reading order, and the space is an empty line inside the same text
  expect(shownText(texts()[0])).toBe('Lectura primera\n\nDel llibre del profeta Isaïes');
  // The empty line takes the same room the Gap took
  const gap = screen
    .getAllByTestId('prayer-gap')
    .map(styleOf)
    .find((style) => style.lineHeight);
  expect(gap.lineHeight).toBe(19);
});

test('the reading and the responsory that follows it are selected in one go', () => {
  renderWithTheme(
    <PrayerFlow>
      <PrayerText selectable={true}>{'En aquell temps, Jesús digué als seus deixebles…'}</PrayerText>
      <Gap />
      <PrayerText selectable={true}>{'Responsori'}</PrayerText>
      <PrayerText selectable={true}>{'Jn 15, 12'}</PrayerText>
      <Rubric label={'R. '}>{'Estimeu-vos els uns als altres.'}</Rubric>
    </PrayerFlow>,
  );
  expect(texts()).toHaveLength(1);
  expect(shownText(texts()[0])).toContain('Jesús digué');
  expect(shownText(texts()[0])).toContain('R. Estimeu-vos els uns als altres.');
});

test('a rubric keeps its two colours inside the sewn text', () => {
  renderWithTheme(
    <PrayerFlow>
      <Rubric label={'V. '}>{'Sigueu amb nosaltres, Déu nostre.'}</Rubric>
      <Rubric label={'R. '}>{'Senyor, veniu a ajudar-nos.'}</Rubric>
    </PrayerFlow>,
  );
  expect(texts()).toHaveLength(1);
  expect(styleOf(screen.getByText('Sigueu amb nosaltres, Déu nostre.')).color).toBe('#182322');
  expect(getPrayerText(/V\. Sigueu amb nosaltres, Déu nostre\.\nR\. Senyor, veniu a ajudar-nos\./)).toBeTruthy();
});

test('a line across breaks the text; the title of a part goes with what comes after it', () => {
  renderWithTheme(
    <PrayerFlow>
      <PrayerText selectable={true}>{'Amén.'}</PrayerText>
      <PrayerText selectable={true}>{'Al·leluia.'}</PrayerText>
      <HR />
      <SectionTitle>{'HIMNE'}</SectionTitle>
      <PrayerText selectable={true}>{'Oh Déu, veniu'}</PrayerText>
      <PrayerText selectable={true}>{'en auxili nostre.'}</PrayerText>
    </PrayerFlow>,
  );
  expect(texts()).toHaveLength(2);
  expect(shownText(texts()[0])).toBe('Amén.\nAl·leluia.');
  // The title is selected together with the hymn, and the room it left below it is now inside
  expect(shownText(texts()[1])).toBe('HIMNE\n\nOh Déu, veniu\nen auxili nostre.');
  // The price: sewn into the text, it is no longer a heading for screen readers
  expect(screen.queryByRole('header', { name: 'HIMNE' })).toBeNull();
});

test('on iOS a centred title is sewn to the verses around it, and stays centred', () => {
  onPlatform('ios', () => {
    renderWithTheme(
      <PrayerFlow>
        <PrayerText selectable={true}>{'Ant. Lloeu el Senyor'}</PrayerText>
        <PrayerText selectable={true} style={{ textAlign: 'center' }}>
          {'Salm 94'}
        </PrayerText>
        <PrayerText selectable={true}>{'Veniu, celebrem el Senyor amb crits de festa'}</PrayerText>
      </PrayerFlow>,
    );
    expect(texts()).toHaveLength(1);
    // The whole thing is one selection, and the title keeps its own alignment as a paragraph
    expect(shownText(texts()[0])).toBe('Ant. Lloeu el Senyor\nSalm 94\nVeniu, celebrem el Senyor amb crits de festa');
    expect(styleOf(screen.getByText('Salm 94')).textAlign).toBe('center');
    expect(styleOf(texts()[0]).textAlign).toBeUndefined();
  });
});

test('on Android a change of alignment starts another text: there the whole text is aligned at once', () => {
  onPlatform('android', () => {
    renderWithTheme(
      <PrayerFlow>
        <PrayerText selectable={true}>{'Ant. Lloeu el Senyor'}</PrayerText>
        <PrayerText selectable={true} style={{ textAlign: 'center' }}>
          {'Salm 94'}
        </PrayerText>
        <PrayerText selectable={true} style={{ textAlign: 'center' }}>
          {'Invitació a lloar Déu'}
        </PrayerText>
      </PrayerFlow>,
    );
    // There the prayer is a selectable Text, as it has always been: the antiphon on one side
    // and the two centred lines sewn on the other
    const sewn = screen.UNSAFE_queryAllByType(Text).filter((text) => text.props.selectable === true);
    expect(sewn).toHaveLength(2);
    expect(shownText(sewn[0])).toBe('Ant. Lloeu el Senyor');
    expect(shownText(sewn[1])).toBe('Salm 94\nInvitació a lloar Déu');
    expect(styleOf(sewn[1]).textAlign).toBe('center');
  });
});

test('a View that only holds things together does not break the text; one with a style does', () => {
  renderWithTheme(
    <PrayerFlow>
      <PrayerText selectable={true}>{'Estrofa primera'}</PrayerText>
      <View>
        <Gap />
        <PrayerText selectable={true}>{'Estrofa segona'}</PrayerText>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <PrayerText selectable={true}>{'A part'}</PrayerText>
      </View>
    </PrayerFlow>,
  );
  expect(texts()).toHaveLength(2);
  expect(shownText(texts()[0])).toBe('Estrofa primera\n\nEstrofa segona');
  expect(shownText(texts()[1])).toBe('A part');
});

test('a paragraph on its own is drawn just as it was written', () => {
  renderWithTheme(
    <PrayerFlow>
      <PrayerText selectable={true} testID="alone">
        {'Amén.'}
      </PrayerText>
      <HR />
    </PrayerFlow>,
  );
  expect(screen.getByTestId('alone').type).toBe('TextInput');
  expect(shownText(screen.getByTestId('alone'))).toBe('Amén.');
});

test('what is not prayer text goes through untouched', () => {
  renderWithTheme(
    <PrayerFlow>
      <Text testID="plain">{'Laudes'}</Text>
      <PrayerText selectable={true} accessibilityRole="header">
        {'Sant Mateu'}
      </PrayerText>
    </PrayerFlow>,
  );
  expect(texts()).toHaveLength(0);
  expect(screen.getByTestId('plain')).toBeTruthy();
  expect(screen.getByRole('header', { name: 'Sant Mateu' })).toBeTruthy();
});

test('«Copia-ho tot» takes everything the screen says, titles included and buttons left out', () => {
  renderWithTheme(
    <PrayerFlow>
      <SectionTitle>{'LECTURA BREU'}</SectionTitle>
      <PrayerText selectable={true}>{'Rm 13, 11'}</PrayerText>
      <Gap />
      <PrayerText selectable={true}>{'Germans, ja sabeu en quin moment vivim.'}</PrayerText>
      <HR />
      <SectionTitle uppercase={false}>{'Credo'}</SectionTitle>
      <ContinueButton label="Continua amb el Càntic" onPress={() => {}} />
      <Rubric label={'R. '}>{'Amén.'}</Rubric>
    </PrayerFlow>,
  );
  fireEvent.press(screen.getByRole('button', { name: 'Copia-ho tot' }));
  expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
    'LECTURA BREU\nRm 13, 11\n\nGermans, ja sabeu en quin moment vivim.\nCredo\nR. Amén.',
  );
  // And it says it has copied
  expect(screen.getByRole('button', { name: 'Copiat' })).toBeTruthy();
});
