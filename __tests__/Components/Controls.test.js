// Sheets, dialogs, buttons and the rest of the controls shared by the screens.
import React from 'react';
import { Text } from 'react-native';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme, withTheme, styleOf } from '../helpers/renderWithTheme';
import BottomSheet from '../../src/Components/BottomSheet';
import Dialog from '../../src/Components/Dialog';
import ActionButton from '../../src/Components/ActionButton';
import HeaderButton from '../../src/Components/HeaderButton';
import SegmentedControl from '../../src/Components/SegmentedControl';
import SwitchRow from '../../src/Components/SwitchRow';
import Card from '../../src/Components/Card';
import HourIcon from '../../src/Components/HourIcon';
import Icon from '../../src/Components/Icon';

describe('BottomSheet', () => {
  test('mostra el contingut quan és obert, i res quan és tancat', () => {
    const { rerender } = renderWithTheme(
      <BottomSheet visible={true} onClose={() => {}} accessibilityLabel="Sant Mateu"><Text>La vida del sant</Text></BottomSheet>);
    expect(screen.getByText('La vida del sant')).toBeTruthy();
    rerender(withTheme(<BottomSheet visible={false} onClose={() => {}} accessibilityLabel="Sant Mateu"><Text>La vida del sant</Text></BottomSheet>));
    expect(screen.queryByText('La vida del sant')).toBeNull();
  });

  test('es tanca tocant fora', () => {
    const onClose = jest.fn();
    renderWithTheme(<BottomSheet visible={true} onClose={onClose} accessibilityLabel="Full" testID="full"><Text>Text</Text></BottomSheet>);
    // Hidden from screen readers (the sheet is modal): they close it with its own button
    fireEvent.press(screen.getByTestId('full-backdrop', { includeHiddenElements: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('es tanca amb el botó enrere d’Android', () => {
    const onClose = jest.fn();
    renderWithTheme(<BottomSheet visible={true} onClose={onClose} accessibilityLabel="Full"><Text>Text</Text></BottomSheet>);
    const modal = screen.UNSAFE_getByType(require('react-native').Modal);
    modal.props.onRequestClose();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('ocupa com a màxim el 80 % de l’alçada', () => {
    renderWithTheme(<BottomSheet visible={true} onClose={() => {}} accessibilityLabel="Full" testID="full"><Text>Text</Text></BottomSheet>);
    const { height } = require('react-native').Dimensions.get('window');
    expect(styleOf(screen.getByTestId('full')).maxHeight).toBeCloseTo(height * 0.8, 0);
  });
});

describe('Dialog', () => {
  test('una targeta al mig; tocar fora o enrere la tanca', () => {
    const onDismiss = jest.fn();
    renderWithTheme(<Dialog visible={true} onDismiss={onDismiss} accessibilityLabel="Avís"><Text>Ja estem a dimarts</Text></Dialog>);
    expect(screen.getByText('Ja estem a dimarts')).toBeTruthy();
    screen.UNSAFE_getByType(require('react-native').Modal).props.onRequestClose();
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe('ActionButton', () => {
  test('ple o de contorn, amb una segona línia que també es llegeix', () => {
    const onPress = jest.fn();
    renderWithTheme(<ActionButton label="Sí, la d’ahir" sublabel="Dilluns, 21 de setembre" onPress={onPress}/>);
    const button = screen.getByRole('button', { name: 'Sí, la d’ahir. Dilluns, 21 de setembre' });
    expect(styleOf(button)).toMatchObject({ backgroundColor: '#007B80', minHeight: 60 });
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalled();

    renderWithTheme(<ActionButton label="No, la d’avui" variant="outlined" onPress={() => {}}/>);
    expect(styleOf(screen.getByRole('button'))).toMatchObject({ borderColor: '#00696D', minHeight: 52 });
  });
});

test('els botons de la capçalera tenen nom i fan 48 d’alt', () => {
  const onPress = jest.fn();
  renderWithTheme(<HeaderButton accessibilityLabel="Calendari" icon="calendar" onPress={onPress}/>);
  const button = screen.getByRole('button', { name: 'Calendari' });
  expect(styleOf(button).height).toBe(48);
  fireEvent.press(button);
  expect(onPress).toHaveBeenCalled();

  renderWithTheme(<HeaderButton accessibilityLabel="Mida del text i mode fosc" text="Aa" onPress={() => {}}/>);
  expect(screen.getByText('Aa')).toBeTruthy();
});

describe('SegmentedControl', () => {
  const segments = [{ value: 'normal', label: 'Avui' }, { value: 'vespers', label: 'Vespertina', sublabel: 'Tots Sants' }];

  test('una opció triada, i la segona línia al nom', () => {
    const onChange = jest.fn();
    renderWithTheme(<SegmentedControl segments={segments} value="vespers" onChange={onChange} accessibilityLabel="Quina missa"/>);
    expect(screen.getByRole('radio', { name: 'Vespertina, Tots Sants' }).props.accessibilityState.checked).toBe(true);
    expect(screen.getByRole('radio', { name: 'Avui' }).props.accessibilityState.checked).toBe(false);
    fireEvent.press(screen.getByText('Avui'));
    expect(onChange).toHaveBeenCalledWith('normal');
  });
});

describe('SwitchRow', () => {
  test('tota la fila canvia l’interruptor, i diu què fa', () => {
    const onChange = jest.fn();
    renderWithTheme(<SwitchRow label="Celebrar la memòria" caption="Si no l’actives, avui es resa la fèria." value={false} onValueChange={onChange}/>);
    const row = screen.getByRole('switch', { name: 'Celebrar la memòria' });
    expect(row.props.accessibilityState.checked).toBe(false);
    expect(screen.getByText('Si no l’actives, avui es resa la fèria.')).toBeTruthy();
    fireEvent.press(row);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

test('Card: superfície amb vora', () => {
  renderWithTheme(<Card testID="card"><Text>Missa</Text></Card>, { dark: true });
  expect(styleOf(screen.getByTestId('card'))).toMatchObject({ backgroundColor: '#18201F', borderColor: '#2A3534', borderRadius: 16 });
});

test('una icona per a cada hora, i cap icona no es llegeix', () => {
  for (const hour of ['ofici', 'laudes', 'tercia', 'sexta', 'nona', 'vespres', 'completes']) {
    renderWithTheme(<HourIcon hour={hour} color="#00696D"/>);
    expect(screen.getByTestId(`hour-icon-${hour}`, { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByTestId(`hour-icon-${hour}`)).toBeNull();
  }
  for (const name of ['calendar', 'settings', 'back', 'chevronRight', 'chevronDown', 'mail', 'card', 'check', 'close']) {
    renderWithTheme(<Icon name={name} color="#000"/>);
    expect(screen.toJSON()).toBeTruthy();
  }
});
