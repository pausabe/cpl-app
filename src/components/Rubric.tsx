import React from 'react';
import { Text, TextStyle } from 'react-native';
import { prayerTextStyles, useTheme } from '../theme';

// A line that starts with a rubric in red, V., R. or Ant., and goes on in black. The label and
// the text are written exactly as given, spaces included.
interface RubricProps {
  label: React.ReactNode;
  children?: React.ReactNode;
  labelStyle?: TextStyle;
  textStyle?: TextStyle;
}

export default function Rubric({ label, children, labelStyle, textStyle }: RubricProps) {
  const styles = prayerTextStyles(useTheme());
  return (
    <Text selectable={true} style={labelStyle ?? styles.red}>
      {label}
      <Text selectable={true} style={textStyle ?? styles.black}>
        {children}
      </Text>
    </Text>
  );
}
