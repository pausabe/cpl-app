import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

// Pills to choose one option inside a prayer: the invitatory psalm, the Marian antiphon, the
// Gospel of Easter. The one chosen is filled.
export interface Choice<T extends string> {
  value: T;
  label: string;
}

interface ChoiceChipsProps<T extends string> {
  options: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}

export default function ChoiceChips<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: ChoiceChipsProps<T>) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.chip,
              { minHeight: theme.touch.min, borderRadius: theme.touch.min / 2 },
              selected
                ? { backgroundColor: colors.accentFill, borderColor: colors.accentFill }
                : { backgroundColor: 'transparent', borderColor: colors.border },
              pressed ? styles.pressed : null,
            ]}
          >
            <Text
              maxFontSizeMultiplier={theme.maxFontScaleForLabels}
              style={[
                styles.label,
                { color: selected ? colors.onAccent : colors.text, fontWeight: selected ? '700' : '600' },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 10,
  },
  chip: {
    minWidth: 72,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
