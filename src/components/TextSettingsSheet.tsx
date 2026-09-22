import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MAX_TEXT_SIZE_SETTING, useTheme } from '../theme';
import BottomSheet from './BottomSheet';
import SegmentedControl from './SegmentedControl';
import TextSizeControl from './TextSizeControl';
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
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Mida del text i tema" testID="text-settings">
      <View style={styles.content}>
        <Text accessibilityRole="header" style={[styles.heading, { color: colors.text }]}>
          Mida del text
        </Text>
        <TextSizeControl step={textSizeStep} onChange={onTextSizeChange} />
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
  sizeLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  done: {
    marginTop: 6,
  },
});
