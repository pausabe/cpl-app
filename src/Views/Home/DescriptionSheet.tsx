import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../Theme';
import BottomSheet from '../../Components/BottomSheet';
import ActionButton from '../../Components/ActionButton';
import { DayCard } from '../../ViewModels/DayCard';

// The story of the saint of the day, in a sheet that comes up: the screen below stays still, and
// a long text scrolls inside. It closes with "Tanca", touching outside, or the back button.
interface DescriptionSheetProps {
  day: DayCard;
  visible: boolean;
  onClose: () => void;
}

export default function DescriptionSheet({ day, visible, onClose }: DescriptionSheetProps) {
  const theme = useTheme();
  const { colors } = theme;
  const accent = theme.liturgical(day.colorCode).accent;
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel={day.title} testID="description-sheet">
      {day.typeLabel ? <Text style={[styles.type, { color: accent }]}>{day.typeLabel}</Text> : null}
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
      >
        {day.title}
      </Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text selectable={true} style={[styles.description, { color: colors.text }]}>
          {day.description}
        </Text>
      </ScrollView>
      <ActionButton label="Tanca" onPress={onClose} style={styles.close} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  type: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 4,
    fontSize: 22,
    lineHeight: 28,
  },
  scroll: {
    marginTop: 12,
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  description: {
    fontSize: 17,
    lineHeight: 26,
  },
  close: {
    marginTop: 16,
  },
});
