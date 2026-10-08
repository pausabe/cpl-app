// While the prayer is read aloud the screen follows the voice: the paragraph being read, or the
// strophe of a psalm or a hymn, is marked, and the scroll brings it into sight unless the user has
// just moved the text with a finger.
import React from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithTheme, styleOf, withTheme } from '../helpers/renderWithTheme';
import { shownText } from '../helpers/prayerText';
import EdgeToEdgeScrollView from '../../src/components/EdgeToEdgeScrollView';
import Gap from '../../src/components/Gap';
import PrayerFlow from '../../src/components/PrayerFlow';
import PrayerText from '../../src/components/PrayerText';
import SectionTitle from '../../src/components/SectionTitle';
import { FollowScrollContext, SpeechFollow } from '../../src/components/SpeechFollow';
import { palettes } from '../../src/theme/colors';

const PSALM = 'Primera estrofa,\nvers dos.\n\nSegona estrofa,\nvers dos.\n\nTercera estrofa.';

// The scroll of the screen is the same one all along, as in the app
function prayer(follow, scroll = { bringIntoSight: jest.fn() }) {
  return (
    <FollowScrollContext.Provider value={scroll}>
      <SpeechFollow.Provider value={follow}>
        <PrayerFlow>
          <SectionTitle>{'Salmòdia'}</SectionTitle>
          <PrayerText selectable={true}>{PSALM}</PrayerText>
          <Gap />
          <PrayerText selectable={true}>{'Glòria al Pare.'}</PrayerText>
        </PrayerFlow>
      </SpeechFollow.Provider>
    </FollowScrollContext.Provider>
  );
}

// What the marked boxes show, each one once
function marked() {
  const shown = screen
    .UNSAFE_queryAllByType(View)
    .filter((view) => styleOf(view).backgroundColor === palettes.light.listenHighlight)
    .map((view) => shownText(view));
  return [...new Set(shown)];
}

test('the strophe being read is marked, and only that one', () => {
  renderWithTheme(prayer({ paragraph: 1, strophe: 1 }));
  expect(marked()).toEqual(['Segona estrofa,\nvers dos.']);
});

test('a paragraph of a single piece is marked whole', () => {
  renderWithTheme(prayer({ paragraph: 2, strophe: 0 }));
  expect(marked()).toEqual(['Glòria al Pare.']);
  screen.rerender(withTheme(prayer({ paragraph: 0, strophe: 0 })));
  expect(marked()).toEqual(['Salmòdia']);
});

test('each strophe is still all there, in its order', () => {
  renderWithTheme(prayer({ paragraph: 1, strophe: 0 }));
  const shown = screen.UNSAFE_queryAllByType(TextInput).map((input) => shownText(input));
  expect(shown).toEqual([
    'Primera estrofa,\nvers dos.',
    'Segona estrofa,\nvers dos.',
    'Tercera estrofa.',
    'Glòria al Pare.',
  ]);
});

test('the scroll is asked to bring the piece into sight when the voice moves on, not before', () => {
  const scroll = { bringIntoSight: jest.fn() };
  renderWithTheme(prayer({ paragraph: 1, strophe: 0 }, scroll));
  expect(scroll.bringIntoSight).toHaveBeenCalledTimes(1);
  screen.rerender(withTheme(prayer({ paragraph: 1, strophe: 0 }, scroll)));
  expect(scroll.bringIntoSight).toHaveBeenCalledTimes(1);
  screen.rerender(withTheme(prayer({ paragraph: 1, strophe: 2 }, scroll)));
  expect(scroll.bringIntoSight).toHaveBeenCalledTimes(2);
});

test('when the voice stops, the prayer is sewn again into one text that can be selected', () => {
  renderWithTheme(prayer({ paragraph: 1, strophe: 0 }));
  screen.rerender(withTheme(prayer(null)));
  expect(marked()).toEqual([]);
  expect(screen.UNSAFE_queryAllByType(TextInput)).toHaveLength(1);
});

describe('the scroll of the screen', () => {
  let follow;
  function Probe() {
    follow = React.useContext(FollowScrollContext);
    return null;
  }

  function scrollOf() {
    const scroll = screen.UNSAFE_getByType(ScrollView).instance;
    scroll.getInnerViewRef = jest.fn(() => 'content');
    scroll.scrollTo = jest.fn();
    return scroll;
  }

  const at = (y) => ({ measureLayout: (relativeTo, onSuccess) => onSuccess(0, y) });

  test('brings the piece a little below the top', () => {
    renderWithTheme(
      <EdgeToEdgeScrollView testID="prayer-scroll">
        <Probe />
      </EdgeToEdgeScrollView>,
    );
    const scroll = scrollOf();
    act(() => follow.bringIntoSight(at(900)));
    expect(scroll.scrollTo).toHaveBeenCalledWith({ y: 790, animated: true });
    // The first lines are not pulled above the top
    act(() => follow.bringIntoSight(at(40)));
    expect(scroll.scrollTo).toHaveBeenLastCalledWith({ y: 0, animated: true });
  });

  test('lets the user be for a while after they move the text', () => {
    jest.useFakeTimers({ now: 1_000_000 });
    try {
      renderWithTheme(
        <EdgeToEdgeScrollView testID="prayer-scroll">
          <Probe />
        </EdgeToEdgeScrollView>,
      );
      const scroll = scrollOf();
      fireEvent(screen.getByTestId('prayer-scroll'), 'scrollBeginDrag', { nativeEvent: {} });
      act(() => follow.bringIntoSight(at(900)));
      expect(scroll.scrollTo).not.toHaveBeenCalled();
      jest.setSystemTime(1_000_000 + 7000);
      act(() => follow.bringIntoSight(at(900)));
      expect(scroll.scrollTo).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });
});
