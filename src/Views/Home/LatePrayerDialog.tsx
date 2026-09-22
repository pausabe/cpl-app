import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../../Theme';
import Dialog from '../../Components/Dialog';
import ActionButton from '../../Components/ActionButton';
import { LatePrayerTexts } from '../../ViewModels/Notices';

// Between midnight and 3 h: yesterday's liturgy (to finish the day's prayer) or today's?
interface LatePrayerDialogProps {
  visible: boolean;
  texts: LatePrayerTexts;
  onYesterday: () => void;
  onToday: () => void;
}

export default function LatePrayerDialog({ visible, texts, onYesterday, onToday }: LatePrayerDialogProps) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <Dialog visible={visible} onDismiss={onToday} accessibilityLabel="La litúrgia d’ahir" testID="late-prayer">
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
      >
        {texts.title}
      </Text>
      <Text style={[styles.question, { color: colors.text2 }]}>{texts.question}</Text>
      <ActionButton label={texts.yes.label} sublabel={texts.yes.date} onPress={onYesterday} style={styles.first} />
      <ActionButton label={texts.no.label} sublabel={texts.no.date} onPress={onToday} variant="outlined" />
    </Dialog>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 21,
    lineHeight: 26,
  },
  question: {
    fontSize: 16,
    lineHeight: 23,
  },
  first: {
    marginTop: 8,
  },
});
