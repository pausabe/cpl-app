import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { convertTextSize, MAX_TEXT_SIZE_SETTING, MIN_TEXT_SIZE_SETTING, useTheme } from '../theme';

// The text size, with A− and A+ and an "Aa" at the chosen size. The same control in the "Aa"
// sheet of the prayer and in Configuració, so that it is changed the same way everywhere.
interface TextSizeControlProps {
  // 1 to 10
  step: number;
  onChange: (step: number) => void;
}

export default function TextSizeControl({ step, onChange }: TextSizeControlProps) {
  const { colors } = useTheme();
  const sizeButton = (label: string, accessibilityLabel: string, target: number, fontSize: number) => {
    const disabled = target === step;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => onChange(target)}
        style={({ pressed }) => [
          styles.sizeButton,
          { borderColor: colors.border, opacity: disabled ? 0.4 : pressed ? 0.6 : 1 },
        ]}
      >
        <Text maxFontSizeMultiplier={1.3} style={{ fontSize, fontWeight: '700', color: colors.text }}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.row}>
      {sizeButton('A−', 'Text més petit', Math.max(MIN_TEXT_SIZE_SETTING, step - 1), 17)}
      <View style={styles.preview}>
        <Text
          testID="text-size-preview"
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
          style={{ fontSize: convertTextSize(step), color: colors.text }}
        >
          Aa
        </Text>
      </View>
      {sizeButton('A+', 'Text més gran', Math.min(MAX_TEXT_SIZE_SETTING, step + 1), 23)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sizeButton: {
    width: 68,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
