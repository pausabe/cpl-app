import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import Icon from '../../components/Icon';
import SwitchRow from '../../components/SwitchRow';
import { DayCard as DayCardModel } from '../../view-models/dayCard';

// The card of the day, on the soft colour of the liturgical colour: where and when, the day in
// its season and, under a line, the celebration when there is one, with the saint's story and
// the switch of the optional memorial. Everything about the saint stays together, and the week
// no longer sits between the memorial and its switch.
//
// The colour is only the background (and the type of celebration): no dot or name. White is
// ivory and gold, and next to the word «Blanc» it looked yellow. The screen reader still hears
// it, with the place.
interface DayCardProps {
  day: DayCardModel;
  onOptionalMemoryChange: (enabled: boolean) => void;
  onReadMore: () => void;
}

export default function DayCard({ day, onOptionalMemoryChange, onReadMore }: DayCardProps) {
  const theme = useTheme();
  const { colors } = theme;
  const liturgical = theme.liturgical(day.colorCode);
  const scale = theme.maxFontScaleForLabels;
  const { celebration } = day;

  return (
    <View
      testID="day-card"
      style={[styles.card, { backgroundColor: liturgical.tint, borderRadius: theme.radius.dayCard }]}
    >
      <Text
        maxFontSizeMultiplier={scale}
        accessibilityLabel={`${day.place}. Color litúrgic: ${day.colorName}`}
        style={[styles.small, { color: colors.text2 }]}
      >
        {day.place}
      </Text>
      <Text
        accessibilityRole="header"
        style={[styles.date, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
      >
        {day.dateText}
      </Text>
      <Text style={[styles.title, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}>{day.title}</Text>
      {day.meta ? <Text style={[styles.meta, { color: colors.text2 }]}>{day.meta}</Text> : null}
      {celebration ? (
        <View testID="day-celebration" style={[styles.celebration, { borderTopColor: colors.rule }]}>
          <Text
            maxFontSizeMultiplier={scale}
            style={[styles.type, { color: celebration.muted ? colors.text2 : liturgical.accent }]}
          >
            {celebration.typeLabel}
          </Text>
          <Text
            style={[
              styles.title,
              { color: celebration.muted ? colors.text2 : colors.text, fontFamily: theme.fonts.serifSemiBold },
            ]}
          >
            {celebration.title}
          </Text>
          {celebration.description ? (
            <Pressable
              accessibilityRole="button"
              accessibilityHint={celebration.title}
              onPress={onReadMore}
              style={({ pressed }) => [styles.readMore, { minHeight: theme.touch.min, opacity: pressed ? 0.6 : 1 }]}
            >
              <Text maxFontSizeMultiplier={scale} style={[styles.readMoreText, { color: liturgical.accent }]}>
                Llegeix-ne més
              </Text>
              <Icon name="chevronRight" size={16} color={liturgical.accent} />
            </Pressable>
          ) : null}
          {celebration.optionalMemory ? (
            <SwitchRow
              testID="optional-memory"
              label="Celebrar la memòria"
              labelWeight="600"
              caption={celebration.optionalMemory.caption}
              value={celebration.optionalMemory.enabled}
              onValueChange={onOptionalMemoryChange}
              style={styles.memory}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: 13,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  small: {
    fontSize: 13,
  },
  date: {
    marginTop: 4,
    fontSize: 23,
    lineHeight: 28,
  },
  title: {
    marginTop: 3,
    fontSize: 18,
    lineHeight: 23,
  },
  meta: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 19,
  },
  celebration: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  type: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  memory: {
    paddingVertical: 6,
  },
  readMore: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
