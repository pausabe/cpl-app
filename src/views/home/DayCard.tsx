import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import Icon from '../../components/Icon';
import SwitchRow from '../../components/SwitchRow';
import { DayCard as DayCardModel } from '../../view-models/dayCard';

// The card of the day, on the soft colour of the liturgical colour: where and when, the day in
// its season and, under a line, the celebration when there is one, with the saint's story and
// the switch of the optional memorial. Everything about the saint stays together, and the week
// no longer sits between the memorial and its switch. A day with more than one optional memorial
// says what is prayed (the weekday or the memorial chosen) and, instead of the switch, a row that
// opens the sheet to choose (MemorialSheet).
//
// The colour is only the background (and the type of celebration): no dot or name. White is
// ivory and gold, and next to the word «Blanc» it looked yellow. The screen reader still hears
// it, with the place.
interface DayCardProps {
  day: DayCardModel;
  onOptionalMemoryChange: (enabled: boolean) => void;
  onChooseMemorial: () => void;
  onReadMore: () => void;
}

export default function DayCard({ day, onOptionalMemoryChange, onChooseMemorial, onReadMore }: DayCardProps) {
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
          {celebration.memorials ? (
            <Pressable
              testID="memorials-choice"
              accessibilityRole="button"
              accessibilityLabel={`${celebration.memorials.action}. ${celebration.memorials.names}`}
              onPress={onChooseMemorial}
              style={({ pressed }) => [
                styles.choice,
                {
                  minHeight: theme.touch.comfortable,
                  borderRadius: theme.radius.tile,
                  backgroundColor: colors.surface,
                  borderColor: colors.rule,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View style={styles.choiceTexts}>
                <Text maxFontSizeMultiplier={scale} style={[styles.choiceAction, { color: colors.text }]}>
                  {celebration.memorials.action}
                </Text>
                <Text maxFontSizeMultiplier={scale} style={[styles.choiceNames, { color: colors.text2 }]}>
                  {celebration.memorials.names}
                </Text>
              </View>
              <Icon name="chevronRight" size={18} color={liturgical.accent} />
            </Pressable>
          ) : null}
          {/* Always the last thing of the card, with the switch or without it. It is only as tall
              as its text, like the other lines: the touch reaches beyond it (hitSlop), and at the
              bottom it stays inside the card's padding, where Android still takes it. */}
          {celebration.description ? (
            <Pressable
              accessibilityRole="button"
              accessibilityHint={celebration.title}
              onPress={onReadMore}
              hitSlop={READ_MORE_SLOP}
              style={({ pressed }) => [styles.readMore, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Text maxFontSizeMultiplier={scale} style={[styles.readMoreText, { color: liturgical.accent }]}>
                Llegeix-ne més
              </Text>
              <Icon name="chevronRight" size={16} color={liturgical.accent} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const READ_MORE_SLOP = { top: 12, bottom: 12, left: 16, right: 16 };

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
  // A row of its own, white like the tiles: it opens the sheet to choose the memorial
  choice: {
    marginTop: 10,
    marginBottom: 2,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  choiceTexts: {
    flex: 1,
    gap: 1,
  },
  choiceAction: {
    fontSize: 16,
    fontWeight: '600',
  },
  choiceNames: {
    fontSize: 13,
    lineHeight: 18,
  },
  readMore: {
    marginTop: 6,
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
