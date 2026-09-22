// The pieces the prayer screens are made of: spaces, section titles, rubrics, selectors and the
// buttons that show more text.
import React from 'react';
import { Text } from 'react-native';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme, styleOf } from '../helpers/renderWithTheme';
import Gap from '../../src/Components/Gap';
import SectionTitle from '../../src/Components/SectionTitle';
import Rubric from '../../src/Components/Rubric';
import ChoiceChips from '../../src/Components/ChoiceChips';
import ContinueButton from '../../src/Components/ContinueButton';
import HR from '../../src/Components/HRComponent';

describe('Gap', () => {
  test('el mateix espai entre paràgrafs, que creix amb la mida del text', () => {
    renderWithTheme(<Gap testID="gap" />, { textSize: '3' });
    expect(styleOf(screen.getByTestId('gap')).height).toBe(19);
    renderWithTheme(<Gap testID="gap" />, { textSize: '10' });
    expect(styleOf(screen.getByTestId('gap')).height).toBe(38);
  });

  test('mig espai, o un de concret', () => {
    renderWithTheme(<Gap size="small" testID="gap" />);
    expect(styleOf(screen.getByTestId('gap')).height).toBe(10);
    renderWithTheme(<Gap size={7} testID="gap" />);
    expect(styleOf(screen.getByTestId('gap')).height).toBe(7);
  });
});

describe('SectionTitle', () => {
  test('vermell de rúbrica, més petit i en negreta, i els lectors de pantalla el tracten com a títol', () => {
    renderWithTheme(<SectionTitle>{'HIMNE'}</SectionTitle>);
    const title = screen.getByRole('header', { name: 'HIMNE' });
    expect(styleOf(title)).toMatchObject({
      color: '#B3261E',
      fontSize: 15,
      fontWeight: '700',
      textTransform: 'uppercase',
    });
  });

  test('en mode fosc, el vermell clar', () => {
    renderWithTheme(<SectionTitle>{'ORACIÓ'}</SectionTitle>, { dark: true });
    expect(styleOf(screen.getByText('ORACIÓ')).color).toBe('#F28B82');
  });
});

describe('Rubric', () => {
  test('l’etiqueta en vermell i el text en negre, tal com s’escriuen', () => {
    renderWithTheme(<Rubric label={'V. '}>{'Sigueu amb nosaltres, Déu nostre.'}</Rubric>);
    const line = screen.getByText('V. Sigueu amb nosaltres, Déu nostre.');
    expect(styleOf(line).color).toBe('#B3261E');
    expect(styleOf(screen.getByText('Sigueu amb nosaltres, Déu nostre.')).color).toBe('#182322');
  });

  test('els espais del text es mantenen', () => {
    renderWithTheme(<Rubric label={'Ant. 1.'}> {'Lloeu el Senyor'}</Rubric>);
    expect(screen.getByText('Ant. 1. Lloeu el Senyor')).toBeTruthy();
  });
});

describe('ChoiceChips', () => {
  const options = [
    { value: '94', label: 'Salm 94' },
    { value: '99', label: 'Salm 99' },
    { value: '66', label: 'Salm 66' },
  ];

  test('una pastilla per opció, amb la triada marcada', () => {
    renderWithTheme(
      <ChoiceChips options={options} value="99" onChange={() => {}} accessibilityLabel="Salm invitatori" />,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Salm 99' }).props.accessibilityState.checked).toBe(true);
    expect(screen.getByRole('radio', { name: 'Salm 94' }).props.accessibilityState.checked).toBe(false);
    // The group is not one element (its pills are), but it has a name
    expect(screen.getByLabelText('Salm invitatori').props.accessibilityRole).toBe('radiogroup');
  });

  test('tocar-ne una la tria', () => {
    const onChange = jest.fn();
    renderWithTheme(
      <ChoiceChips options={options} value="94" onChange={onChange} accessibilityLabel="Salm invitatori" />,
    );
    fireEvent.press(screen.getByText('Salm 66'));
    expect(onChange).toHaveBeenCalledWith('66');
  });

  test('fan com a mínim 44 d’alt', () => {
    renderWithTheme(<ChoiceChips options={options} value="94" onChange={() => {}} accessibilityLabel="Salm" />);
    expect(styleOf(screen.getByRole('radio', { name: 'Salm 94' })).minHeight).toBeGreaterThanOrEqual(44);
  });
});

describe('ContinueButton', () => {
  test('un botó amb el mateix text d’abans', () => {
    const onPress = jest.fn();
    renderWithTheme(<ContinueButton label="Continua amb el Salm" showArrow onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Continua amb el Salm' });
    expect(styleOf(button).minHeight).toBe(48);
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalled();
  });

  test('sense fletxa, 44 d’alt', () => {
    renderWithTheme(<ContinueButton label="Començar amb l'invitatori" onPress={() => {}} />);
    expect(styleOf(screen.getByRole('button')).minHeight).toBe(44);
  });
});

test('la línia entre parts pren el color del tema', () => {
  renderWithTheme(<HR testID="hr" />);
  expect(styleOf(screen.getByTestId('hr')).borderBottomColor).toBe('#DCE6E5');
  renderWithTheme(<HR testID="hr" margin_horizontal={20} />, { dark: true });
  expect(styleOf(screen.getByTestId('hr'))).toMatchObject({ borderBottomColor: '#26302F', marginHorizontal: 20 });
});
