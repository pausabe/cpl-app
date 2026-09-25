import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

// A big button for the main action of a sheet or a dialog: filled ("Tanca", "Sí, la d'ahir") or
// outlined ("No, la d'avui"). It can carry a second line, like the date of each choice.
interface ActionButtonProps {
  label: string;
  sublabel?: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined';
  // While it is waiting for something it cannot be pressed, and says so
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

export default function ActionButton({
  label,
  sublabel,
  onPress,
  variant = 'filled',
  disabled = false,
  style,
  accessibilityLabel,
  testID,
}: ActionButtonProps) {
  const theme = useTheme();
  const { colors } = theme;
  const filled = variant === 'filled';
  const color = filled ? colors.onAccent : colors.accentText;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (sublabel ? `${label}. ${sublabel}` : label)}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { minHeight: sublabel ? theme.touch.dialogButton : theme.touch.large, borderRadius: theme.radius.tile },
        filled ? { backgroundColor: colors.accentFill } : { borderWidth: 1.5, borderColor: colors.accentText },
        pressed || disabled ? styles.pressed : null,
        style,
      ]}
    >
      <Text maxFontSizeMultiplier={theme.maxFontScaleForLabels} style={[styles.label, { color }]}>
        {label}
      </Text>
      {sublabel ? (
        <Text maxFontSizeMultiplier={theme.maxFontScaleForLabels} style={[styles.sublabel, { color }]}>
          {sublabel}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  sublabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
