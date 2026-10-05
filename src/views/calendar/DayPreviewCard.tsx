import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { longDate } from '../../view-models/catalanText';
import { DayCard } from '../../view-models/dayCard';

// The day touched, before changing to it: what the home will say of it, on its colour. The date
// is there at once; the rest as soon as the day has been worked out. An optional memorial that
// is not celebrated goes grey, as on the home.
interface DayPreviewCardProps {
  date: Date;
  card: DayCard | undefined;
}

export default function DayPreviewCard({ date, card }: DayPreviewCardProps) {
  const theme = useTheme();
  const { colors } = theme;
  const scale = theme.maxFontScaleForLabels;
  const liturgical = card ? theme.liturgical(card.colorCode) : null;
  const celebration = card?.celebration ?? null;
  return (
    <View
      testID="calendar-preview"
      accessibilityLiveRegion="polite"
      style={[
        styles.card,
        { backgroundColor: liturgical ? liturgical.tint : colors.chipBackground, borderRadius: theme.radius.card },
      ]}
    >
      <Text
        maxFontSizeMultiplier={scale}
        style={[styles.date, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
      >
        {longDate(date)}
      </Text>
      {card ? (
        <Text maxFontSizeMultiplier={scale} style={[styles.season, { color: colors.text2 }]}>
          {card.title}
        </Text>
      ) : null}
      {celebration && liturgical ? (
        <>
          <Text
            maxFontSizeMultiplier={scale}
            style={[styles.type, { color: celebration.muted ? colors.text2 : liturgical.accent }]}
          >
            {celebration.typeLabel}
          </Text>
          <Text
            maxFontSizeMultiplier={scale}
            numberOfLines={3}
            style={[
              styles.title,
              { color: celebration.muted ? colors.text2 : colors.text, fontFamily: theme.fonts.serifSemiBold },
            ]}
          >
            {celebration.title}
          </Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // As tall as a day with a celebration on one line, so that the screen does not jump from one day
  // to the next
  card: {
    minHeight: 100,
    paddingTop: 11,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  date: {
    fontSize: 17,
    lineHeight: 22,
  },
  season: {
    marginTop: 2,
    fontSize: 13.5,
    lineHeight: 18,
  },
  type: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 21,
  },
});
