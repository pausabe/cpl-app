// Sheets, dialogs, buttons and the rest of the controls shared by the screens.
import React from 'react';
import { Text } from 'react-native';
import { screen, fireEvent, act } from '@testing-library/react-native';
import { renderWithTheme, withTheme, styleOf } from '../helpers/renderWithTheme';
import BottomSheet, { closesWhenReleased } from '../../src/components/BottomSheet';
import Dialog from '../../src/components/Dialog';
import ActionButton from '../../src/components/ActionButton';
import HeaderButton from '../../src/components/HeaderButton';
import SegmentedControl from '../../src/components/SegmentedControl';
import SwitchRow from '../../src/components/SwitchRow';
import Card from '../../src/components/Card';
import HourIcon from '../../src/components/HourIcon';
import Icon from '../../src/components/Icon';
import EdgeToEdgeScrollView from '../../src/components/EdgeToEdgeScrollView';

describe('BottomSheet', () => {
  test('shows its content when it is open, and nothing when it is closed', () => {
    const { rerender } = renderWithTheme(
      <BottomSheet visible={true} onClose={() => {}} accessibilityLabel="Sant Mateu">
        <Text>La vida del sant</Text>
      </BottomSheet>,
    );
    expect(screen.getByText('La vida del sant')).toBeTruthy();
    rerender(
      withTheme(
        <BottomSheet visible={false} onClose={() => {}} accessibilityLabel="Sant Mateu">
          <Text>La vida del sant</Text>
        </BottomSheet>,
      ),
    );
    expect(screen.queryByText('La vida del sant')).toBeNull();
  });

  test('it closes when touched outside', () => {
    const onClose = jest.fn();
    renderWithTheme(
      <BottomSheet visible={true} onClose={onClose} accessibilityLabel="Full" testID="full">
        <Text>Text</Text>
      </BottomSheet>,
    );
    // Hidden from screen readers (the sheet is modal): they close it with its own button
    fireEvent.press(screen.getByTestId('full-backdrop', { includeHiddenElements: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('it closes with the Android back button', () => {
    const onClose = jest.fn();
    renderWithTheme(
      <BottomSheet visible={true} onClose={onClose} accessibilityLabel="Full">
        <Text>Text</Text>
      </BottomSheet>,
    );
    const modal = screen.UNSAFE_getByType(require('react-native').Modal);
    modal.props.onRequestClose();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('it takes at most 80 % of the height', () => {
    renderWithTheme(
      <BottomSheet visible={true} onClose={() => {}} accessibilityLabel="Full" testID="full">
        <Text>Text</Text>
      </BottomSheet>,
    );
    const { height } = require('react-native').Dimensions.get('window');
    expect(styleOf(screen.getByTestId('full')).maxHeight).toBeCloseTo(height * 0.8, 0);
  });

  test('a web page goes edge to edge in it, at 92 % of the height', () => {
    renderWithTheme(
      <BottomSheet visible={true} tall={true} onClose={() => {}} accessibilityLabel="Web" testID="web">
        <Text>Web</Text>
      </BottomSheet>,
    );
    const { height } = require('react-native').Dimensions.get('window');
    expect(styleOf(screen.getByTestId('web'))).toMatchObject({ height: height * 0.92, paddingHorizontal: 0 });
  });

  // A finger on the top of the sheet: it goes down dy points in ms milliseconds, and lets go
  function pull(handle, dy, ms) {
    const touch = (y, t) => ({
      touchActive: true,
      startPageX: 100,
      startPageY: 500,
      startTimeStamp: 0,
      currentPageX: 100,
      currentPageY: y,
      currentTimeStamp: t,
      previousPageX: 100,
      previousPageY: 500,
      previousTimeStamp: 0,
    });
    const event = (y, t, active) => ({
      nativeEvent: { touches: active ? [{}] : [], changedTouches: [{}], pageX: 100, pageY: y, timestamp: t },
      touchHistory: {
        numberActiveTouches: active ? 1 : 0,
        indexOfSingleActiveTouch: 0,
        mostRecentTimeStamp: t,
        touchBank: [{ ...touch(y, t), touchActive: active }],
      },
    });
    act(() => {
      handle.props.onResponderGrant(event(500, 0, true));
      handle.props.onResponderMove(event(500 + dy, ms, true));
      handle.props.onResponderRelease(event(500 + dy, ms, false));
    });
  }

  test('it closes when pulled down from the top; pulled less than enough, it goes back', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    renderWithTheme(
      <BottomSheet visible={true} onClose={onClose} accessibilityLabel="Full" testID="full">
        <Text>Text</Text>
      </BottomSheet>,
    );
    const handle = screen.getByTestId('full-handle', { includeHiddenElements: true });

    pull(handle, 40, 400);
    act(() => jest.advanceTimersByTime(1000));
    expect(onClose).not.toHaveBeenCalled();

    pull(handle, 160, 400);
    act(() => jest.advanceTimersByTime(1000));
    expect(onClose).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  test('flung down, it closes even if it has moved little', () => {
    expect(closesWhenReleased(30, 1.5)).toBe(true);
    expect(closesWhenReleased(120, 0)).toBe(true);
    expect(closesWhenReleased(40, 0.2)).toBe(false);
  });
});

describe('EdgeToEdgeScrollView', () => {
  // The test phone has the 34 points of the home indicator at the bottom (METRICS)
  test('the content runs under the home indicator and ends with its height free', () => {
    renderWithTheme(
      <EdgeToEdgeScrollView testID="scroll" contentContainerStyle={{ paddingTop: 18, paddingBottom: 40 }}>
        <Text>Laudes</Text>
      </EdgeToEdgeScrollView>,
    );
    const scroll = screen.getByTestId('scroll');
    expect(styleOf({ props: { style: scroll.props.contentContainerStyle } })).toMatchObject({
      paddingTop: 18,
      paddingBottom: 74,
    });
    expect(scroll.props.scrollIndicatorInsets).toEqual({ bottom: 34 });
  });

  test('without a padding of its own, it ends with just the height of the home indicator', () => {
    renderWithTheme(
      <EdgeToEdgeScrollView testID="scroll">
        <Text>Configuració</Text>
      </EdgeToEdgeScrollView>,
    );
    const scroll = screen.getByTestId('scroll');
    expect(styleOf({ props: { style: scroll.props.contentContainerStyle } }).paddingBottom).toBe(34);
  });
});

describe('Dialog', () => {
  test('a card in the middle; touching outside or back closes it', () => {
    const onDismiss = jest.fn();
    renderWithTheme(
      <Dialog visible={true} onDismiss={onDismiss} accessibilityLabel="Avís">
        <Text>Ja estem a dimarts</Text>
      </Dialog>,
    );
    expect(screen.getByText('Ja estem a dimarts')).toBeTruthy();
    screen.UNSAFE_getByType(require('react-native').Modal).props.onRequestClose();
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe('ActionButton', () => {
  test('filled or outlined, with a second line that is read out too', () => {
    const onPress = jest.fn();
    renderWithTheme(<ActionButton label="Sí, la d’ahir" sublabel="Dilluns, 21 de setembre" onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Sí, la d’ahir. Dilluns, 21 de setembre' });
    expect(styleOf(button)).toMatchObject({ backgroundColor: '#007B80', minHeight: 60 });
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalled();

    renderWithTheme(<ActionButton label="No, la d’avui" variant="outlined" onPress={() => {}} />);
    expect(styleOf(screen.getByRole('button'))).toMatchObject({ borderColor: '#00696D', minHeight: 52 });
  });
});

test('the header buttons have a name, fit the bar of the iPhone and are touched with 56 of margin', () => {
  const onPress = jest.fn();
  renderWithTheme(<HeaderButton accessibilityLabel="Calendari" icon="calendar" onPress={onPress} />);
  const button = screen.getByRole('button', { name: 'Calendari' });
  // 44 high, the bar of iOS, and 6 more on each side to touch it
  expect(styleOf(button).height).toBe(44);
  expect(button.props.hitSlop).toBe(6);
  fireEvent.press(button);
  expect(onPress).toHaveBeenCalled();

  renderWithTheme(<HeaderButton accessibilityLabel="Mida del text i tema" text="Aa" testID="aa" onPress={() => {}} />);
  // The pill leaves 5 above and below inside the 44 of the bar, with its own border
  expect(styleOf(screen.getByTestId('aa-pill'))).toMatchObject({ height: 34, borderWidth: 1.5 });
});

test('on iOS 26 the system puts the Aa button in a capsule of glass: the pill carries no border there', () => {
  const { Platform } = require('react-native');
  jest.spyOn(Platform, 'Version', 'get').mockReturnValue('26.0');
  renderWithTheme(<HeaderButton accessibilityLabel="Mida del text i tema" text="Aa" testID="aa" onPress={() => {}} />);
  expect(styleOf(screen.getByTestId('aa-pill'))).toMatchObject({ height: 34, borderWidth: 0 });
  jest.restoreAllMocks();
});

describe('SegmentedControl', () => {
  const segments = [
    { value: 'normal', label: 'Avui' },
    { value: 'vespers', label: 'Vespertina', sublabel: 'Tots Sants' },
  ];

  test('one option chosen, and the second line in the name', () => {
    const onChange = jest.fn();
    renderWithTheme(
      <SegmentedControl segments={segments} value="vespers" onChange={onChange} accessibilityLabel="Quina missa" />,
    );
    expect(screen.getByRole('radio', { name: 'Vespertina, Tots Sants' }).props.accessibilityState.checked).toBe(true);
    expect(screen.getByRole('radio', { name: 'Avui' }).props.accessibilityState.checked).toBe(false);
    fireEvent.press(screen.getByText('Avui'));
    expect(onChange).toHaveBeenCalledWith('normal');
  });
});

describe('SwitchRow', () => {
  test('the whole row toggles the switch, and says what it does', () => {
    const onChange = jest.fn();
    renderWithTheme(
      <SwitchRow
        label="Celebrar la memòria"
        caption="Si no l’actives, avui es resa la fèria."
        value={false}
        onValueChange={onChange}
      />,
    );
    const row = screen.getByRole('switch', { name: 'Celebrar la memòria. Si no l’actives, avui es resa la fèria.' });
    expect(row.props.accessibilityHint).toBeUndefined();
    expect(row.props.accessibilityState.checked).toBe(false);
    expect(screen.getByText('Si no l’actives, avui es resa la fèria.')).toBeTruthy();
    fireEvent.press(row);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  test('the switch goes in the middle of the row on iOS too, where React Native puts it at the top', () => {
    renderWithTheme(<SwitchRow label="Himnes en llatí" value={false} onValueChange={() => {}} />);
    const { Switch } = require('react-native');
    const flat = styleOf(screen.UNSAFE_getByType(Switch).children[0]);
    expect(flat.alignSelf).toBe('center');
  });
});

test('Card: a surface with a border', () => {
  renderWithTheme(
    <Card testID="card">
      <Text>Missa</Text>
    </Card>,
    { dark: true },
  );
  expect(styleOf(screen.getByTestId('card'))).toMatchObject({
    backgroundColor: '#18201F',
    borderColor: '#2A3534',
    borderRadius: 16,
  });
});

test('one icon for each hour, and no icon is read out', () => {
  for (const hour of ['ofici', 'laudes', 'tercia', 'sexta', 'nona', 'vespres', 'completes']) {
    renderWithTheme(<HourIcon hour={hour} color="#00696D" />);
    expect(screen.getByTestId(`hour-icon-${hour}`, { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByTestId(`hour-icon-${hour}`)).toBeNull();
  }
  for (const name of [
    'calendar',
    'settings',
    'back',
    'chevronRight',
    'chevronDown',
    'mail',
    'card',
    'check',
    'close',
  ]) {
    renderWithTheme(<Icon name={name} color="#000" />);
    expect(screen.toJSON()).toBeTruthy();
  }
});
