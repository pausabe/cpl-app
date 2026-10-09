import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme';
import Dialog from './Dialog';
import ActionButton from './ActionButton';

// The headphones while the prayer cannot be heard yet, or this one cannot be heard now (no
// connection, and its audio is not on the phone): what they say instead of failing
export const LISTEN_SOON = "Aviat podràs escoltar la pregària des d'aquí.";

interface ListenUnavailableDialogProps {
  visible: boolean;
  message: string | null;
  onDismiss: () => void;
  testID?: string;
}

export default function ListenUnavailableDialog({
  visible,
  message,
  onDismiss,
  testID = 'listen-unavailable',
}: ListenUnavailableDialogProps) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <Dialog visible={visible} onDismiss={onDismiss} accessibilityLabel="Escoltar la pregària" testID={testID}>
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
      >
        Escoltar la pregària
      </Text>
      <Text style={[styles.message, { color: colors.text2 }]}>{message ?? LISTEN_SOON}</Text>
      <ActionButton label="D'acord" onPress={onDismiss} style={styles.button} />
    </Dialog>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 21,
    lineHeight: 26,
  },
  message: {
    fontSize: 16,
    lineHeight: 23,
  },
  button: {
    marginTop: 8,
  },
});
