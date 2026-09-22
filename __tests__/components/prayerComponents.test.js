// The pieces the prayer screens are made of: spaces, section titles, rubrics, selectors and the
// buttons that show more text.
import React from 'react';
import { Text } from 'react-native';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme, styleOf } from '../helpers/renderWithTheme';
import Gap from '../../src/components/Gap';
import SectionTitle from '../../src/components/SectionTitle';
import Rubric from '../../src/components/Rubric';
import ChoiceChips from '../../src/components/ChoiceChips';
import ContinueButton from '../../src/components/ContinueButton';
import HR from '../../src/components/HRComponent';

describe('Gap', () => {
  test('the same space between paragraphs, which grows with the text size', () => {
    renderWithTheme(<Gap testID="gap" />, { textSize: '3' });
    expect(styleOf(screen.getByTestId('gap')).height).toBe(19);
    renderWithTheme(<Gap testID="gap" />, { textSize: '10' });
    expect(styleOf(screen.getByTestId('gap')).height).toBe(38);
  });

  test('half a space, or a specific one', () => {
    renderWithTheme(<Gap size="small" testID="gap" />);
    expect(styleOf(screen.getByTestId('gap')).height).toBe(10);
    renderWithTheme(<Gap size={7} testID="gap" />);
    expect(styleOf(screen.getByTestId('gap')).height).toBe(7);
  });
});

describe('SectionTitle', () => {
  test('rubric red, smaller and in bold, and screen readers treat it as a heading', () => {
    renderWithTheme(<SectionTitle>{'HIMNE'}</SectionTitle>);
    const title = screen.getByRole('header', { name: 'HIMNE' });
    expect(styleOf(title)).toMatchObject({
      color: '#B3261E',
      fontSize: 15,
      fontWeight: '700',
      textTransform: 'uppercase',
    });
  });

  test('in dark mode, the light red', () => {
    renderWithTheme(<SectionTitle>{'ORACIÓ'}</SectionTitle>, { dark: true });
    expect(styleOf(screen.getByText('ORACIÓ')).color).toBe('#F28B82');
  });
});

describe('Rubric', () => {
  test('the label in red and the text in black, just as they are written', () => {
    renderWithTheme(<Rubric label={'V. '}>{'Sigueu amb nosaltres, Déu nostre.'}</Rubric>);
    const line = screen.getByText('V. Sigueu amb nosaltres, Déu nostre.');
    expect(styleOf(line).color).toBe('#B3261E');
    expect(styleOf(screen.getByText('Sigueu amb nosaltres, Déu nostre.')).color).toBe('#182322');
  });

  test('the spaces of the text are kept', () => {
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

  test('one pill per option, with the chosen one marked', () => {
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

  test('touching one of them chooses it', () => {
    const onChange = jest.fn();
    renderWithTheme(
      <ChoiceChips options={options} value="94" onChange={onChange} accessibilityLabel="Salm invitatori" />,
    );
    fireEvent.press(screen.getByText('Salm 66'));
    expect(onChange).toHaveBeenCalledWith('66');
  });

  test('they are at least 44 high', () => {
    renderWithTheme(<ChoiceChips options={options} value="94" onChange={() => {}} accessibilityLabel="Salm" />);
    expect(styleOf(screen.getByRole('radio', { name: 'Salm 94' })).minHeight).toBeGreaterThanOrEqual(44);
  });
});

describe('ContinueButton', () => {
  test('a button with the same text as before', () => {
    const onPress = jest.fn();
    renderWithTheme(<ContinueButton label="Continua amb el Salm" showArrow onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Continua amb el Salm' });
    expect(styleOf(button).minHeight).toBe(48);
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalled();
  });

  test('with no arrow, 44 high', () => {
    renderWithTheme(<ContinueButton label="Començar amb l'invitatori" onPress={() => {}} />);
    expect(styleOf(screen.getByRole('button')).minHeight).toBe(44);
  });
});

test('the line between parts takes the colour of the theme', () => {
  renderWithTheme(<HR testID="hr" />);
  expect(styleOf(screen.getByTestId('hr')).borderBottomColor).toBe('#DCE6E5');
  renderWithTheme(<HR testID="hr" marginHorizontal={20} />, { dark: true });
  expect(styleOf(screen.getByTestId('hr'))).toMatchObject({ borderBottomColor: '#26302F', marginHorizontal: 20 });
});
