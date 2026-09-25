import React from 'react';
import { Text, TextStyle } from 'react-native';
import PrayerText from './PrayerText';
import { PrayerTextStyles, prayerTextStyles, useTheme } from '../theme';

// A line that starts with a rubric in red, V., R. or Ant., and goes on in black. The label and
// the text are written exactly as given, spaces included. The text in black is a piece of the
// line, not a text of its own: that way the whole line is selected in one go.
export interface RubricProps {
  label: React.ReactNode;
  children?: React.ReactNode;
  labelStyle?: TextStyle;
  textStyle?: TextStyle;
}

// The line as a piece of a longer text, for when it is sewn together with the paragraphs around
// it (PrayerFlow)
export function rubricSpans(props: RubricProps, styles: PrayerTextStyles): React.ReactElement {
  return (
    <Text style={props.labelStyle ?? styles.red}>
      {props.label}
      <Text style={props.textStyle ?? styles.black}>{props.children}</Text>
    </Text>
  );
}

export default function Rubric(props: RubricProps) {
  const styles = prayerTextStyles(useTheme());
  return (
    <PrayerText selectable={true} style={props.labelStyle ?? styles.red}>
      {props.label}
      <Text style={props.textStyle ?? styles.black}>{props.children}</Text>
    </PrayerText>
  );
}
