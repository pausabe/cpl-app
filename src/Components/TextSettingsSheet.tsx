import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { convertTextSize, MAX_TEXT_SIZE_SETTING, MIN_TEXT_SIZE_SETTING, useTheme } from '../Theme';
import BottomSheet from './BottomSheet';
import SegmentedControl from './SegmentedControl';
import ActionButton from './ActionButton';

// The "Aa" sheet of the prayer: the text size and the theme, without leaving the prayer. Same
// settings as in Configuració.
//
// The theme is stored as the dark mode always was (Automàtic / Activat / Desactivat), so that
// nobody loses their choice; it is shown as Automàtic / Clar / Fosc.
export type DarkModeChoice = 'Automàtic' | 'Activat' | 'Desactivat';

export const THEME_SEGMENTS: { value: DarkModeChoice; label: string }[] = [
  { value: 'Automàtic', label: 'Automàtic' },
  { value: 'Desactivat', label: 'Clar' },
  { value: 'Activat', label: 'Fosc' },
];

interface TextSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  // 1 to 10
  textSizeStep: number;
  onTextSizeChange: (step: number) => void;
  darkMode: DarkModeChoice;
  onDarkModeChange: (choice: DarkModeChoice) => void;
}

export default function TextSettingsSheet(props: TextSettingsSheetProps) {
  const { visible, onClose, textSizeStep, onTextSizeChange, darkMode, onDarkModeChange } = props;
  const theme = useTheme();
  const { colors } = theme;
  const smaller = Math.max(MIN_TEXT_SIZE_SETTING, textSizeStep - 1);
  const bigger = Math.min(MAX_TEXT_SIZE_SETTING, textSizeStep + 1);
  const sizeButton = (label: string, accessibilityLabel: string, step: number, fontSize: number, disabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => onTextSizeChange(step)}
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

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Mida del text i tema" testID="text-settings">
      <View style={styles.content}>
        <Text accessibilityRole="header" style={[styles.heading, { color: colors.text }]}>
          Mida del text
        </Text>
        <View style={styles.sizeRow}>
          {sizeButton('A−', 'Text més petit', smaller, 17, textSizeStep <= MIN_TEXT_SIZE_SETTING)}
          <View style={styles.preview}>
            <Text
              accessibilityElementsHidden={true}
              importantForAccessibility="no"
              style={{ fontSize: convertTextSize(textSizeStep), color: colors.text }}
            >
              Aa
            </Text>
          </View>
          {sizeButton('A+', 'Text més gran', bigger, 23, textSizeStep >= MAX_TEXT_SIZE_SETTING)}
        </View>
        <Text
          style={[styles.sizeLabel, { color: colors.text3 }]}
        >{`Mida ${textSizeStep} de ${MAX_TEXT_SIZE_SETTING}`}</Text>
        <Text accessibilityRole="header" style={[styles.heading, styles.darkHeading, { color: colors.text }]}>
          Tema
        </Text>
        <SegmentedControl
          segments={THEME_SEGMENTS}
          value={darkMode}
          onChange={onDarkModeChange}
          accessibilityLabel="Tema"
          minHeight={theme.touch.comfortable}
        />
        <ActionButton label="Fet" onPress={onClose} style={styles.done} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
  },
  darkHeading: {
    marginTop: 4,
  },
  sizeRow: {
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
  sizeLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  done: {
    marginTop: 6,
  },
});
