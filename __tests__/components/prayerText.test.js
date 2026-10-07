// The prayer text and how it is selected. On Android a selectable Text already gives the
// handles; on iOS it does not, so there the text goes into a text view that cannot be written
// into (a TextInput), which is the one that takes a word on a long press and lets it be dragged.
import React from 'react';
import { Platform, Text } from 'react-native';
import { screen } from '@testing-library/react-native';
import { renderWithTheme, styleOf } from '../helpers/renderWithTheme';
import { getPrayerText } from '../helpers/prayerText';
import PrayerText from '../../src/components/PrayerText';

const onPlatform = (os, body) => {
  const real = Platform.OS;
  Platform.OS = os;
  try {
    body();
  } finally {
    Platform.OS = real;
  }
};

test('on iOS the prayer goes into a text view that can be selected by the piece, not written into', () => {
  onPlatform('ios', () => {
    renderWithTheme(
      <PrayerText selectable={true} testID="prayer" style={{ color: '#182322' }}>
        {'Lloeu el Senyor, tots els pobles'}
      </PrayerText>,
    );
    const prayer = screen.getByTestId('prayer');
    expect(prayer.type).toBe('TextInput');
    expect(prayer.props.editable).toBe(false);
    // It does not scroll on its own: it is as tall as its text, inside the prayer's scroll
    expect(prayer.props.scrollEnabled).toBe(false);
    // And it takes the same room as the Text did, with no space of its own
    expect(styleOf(prayer)).toMatchObject({ padding: 0, color: '#182322' });
    expect(getPrayerText('Lloeu el Senyor, tots els pobles')).toBeTruthy();
  });
});

test('inside another one it is a piece of the same text, so the whole line selects in one go', () => {
  onPlatform('ios', () => {
    renderWithTheme(
      <PrayerText selectable={true} testID="line" style={{ color: '#B3261E' }}>
        {'R. '}
        <PrayerText selectable={true} style={{ color: '#182322' }}>
          {'Amén.'}
        </PrayerText>
      </PrayerText>,
    );
    expect(screen.getByTestId('line').type).toBe('TextInput');
    // The black part is not a text view of its own
    expect(screen.getByText('Amén.').type).toBe('Text');
    expect(getPrayerText('R. Amén.')).toBeTruthy();
  });
});

test('a heading stays a Text, so screen readers keep jumping from one part to the next', () => {
  onPlatform('ios', () => {
    renderWithTheme(
      <PrayerText selectable={true} accessibilityRole="header">
        {'HIMNE'}
      </PrayerText>,
    );
    expect(screen.getByRole('header', { name: 'HIMNE' }).type).toBe('Text');
  });
});

test('what is not selectable is a plain Text', () => {
  onPlatform('ios', () => {
    renderWithTheme(<PrayerText testID="plain">{'Laudes'}</PrayerText>);
    expect(screen.getByTestId('plain').type).toBe('Text');
  });
});

test('on Android it is the selectable Text of always, which already gives the handles', () => {
  onPlatform('android', () => {
    renderWithTheme(
      <PrayerText selectable={true} testID="prayer">
        {'Lloeu el Senyor, tots els pobles'}
      </PrayerText>,
    );
    const prayer = screen.getByTestId('prayer');
    expect(prayer.type).toBe('Text');
    expect(prayer.props.selectable).toBe(true);
  });
});

test('the line of a rubric keeps its two colours', () => {
  onPlatform('ios', () => {
    renderWithTheme(
      <PrayerText selectable={true} testID="line" style={{ color: '#B3261E' }}>
        {'Ant. '}
        <Text style={{ color: '#182322' }}>{'Lloeu el Senyor'}</Text>
      </PrayerText>,
    );
    expect(styleOf(screen.getByTestId('line')).color).toBe('#B3261E');
    expect(styleOf(screen.getByText('Lloeu el Senyor')).color).toBe('#182322');
  });
});

// React Native measures a text view of iOS with the text it showed before the last change, not
// with the one it has just been given: it keeps that text in the view's state and only updates it
// after laying it out (BaseTextInputShadowNode). Making the text smaller in the «Aa» sheet left
// each paragraph as tall as it was with the bigger size, with a space under it, until the prayer
// was opened again. So the view is made anew whenever what it is measured with changes.
describe('the text view is measured with what it shows now', () => {
  const { withTheme } = require('../helpers/renderWithTheme');
  const { prayerTextStyles, useTheme } = require('../../src/theme');

  function Verse({ children = 'Lloeu el Senyor, tots els pobles' }) {
    const styles = prayerTextStyles(useTheme());
    return (
      <PrayerText selectable={true} testID="prayer" style={styles.black}>
        {children}
      </PrayerText>
    );
  }

  test('a smaller text in the «Aa» sheet makes it anew, so it does not keep the height of the bigger one', () => {
    onPlatform('ios', () => {
      const view = renderWithTheme(<Verse />, { textSize: '5' });
      const before = screen.getByTestId('prayer');
      view.rerender(withTheme(<Verse />, { textSize: '4' }));
      const after = screen.getByTestId('prayer');
      expect(styleOf(after).fontSize).toBe(24);
      expect(after).not.toBe(before);
    });
  });

  test('so does other text in the same place (another psalm of the invitatory)', () => {
    onPlatform('ios', () => {
      const view = renderWithTheme(<Verse>{'Veniu, cantem amb joia al Senyor'}</Verse>);
      const before = screen.getByTestId('prayer');
      view.rerender(withTheme(<Verse>{'Que Déu s’apiadi de nosaltres'}</Verse>));
      expect(screen.getByTestId('prayer')).not.toBe(before);
    });
  });

  test('but not what does not change its size: the dark mode keeps the same view', () => {
    onPlatform('ios', () => {
      const view = renderWithTheme(<Verse />);
      const before = screen.getByTestId('prayer');
      view.rerender(withTheme(<Verse />, { dark: true }));
      expect(screen.getByTestId('prayer')).toBe(before);
    });
  });
});
