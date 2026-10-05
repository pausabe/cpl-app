import React, { useLayoutEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { PreviewCard } from '../../view-models/calendar';

// The day touched, before going to it: what the home will say of it, on the colour of the day.
// What the year already says is there at once; the name of the celebration, the only thing that
// has to be worked out, has its place kept by a soft bar and comes in fading, so that from one day
// to the next nothing goes blank nor jumps. An optional memorial that is not celebrated goes grey,
// as on the home.
interface DayPreviewCardProps {
  preview: PreviewCard;
}

const FADE_IN = 180;

export default function DayPreviewCard({ preview }: DayPreviewCardProps) {
  const theme = useTheme();
  const { colors } = theme;
  const scale = theme.maxFontScaleForLabels;
  const liturgical = preview.colorCode ? theme.liturgical(preview.colorCode) : null;
  const [opacity] = useState(() => new Animated.Value(1));
  // The day whose name was waited for: only then does the name fade in, and not when it was known.
  // Before the screen is drawn, so that a name already known is never drawn hidden for a moment.
  const waitedFor = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (preview.waiting) {
      waitedFor.current = preview.dateText;
      opacity.setValue(0);
      return;
    }
    if (preview.celebrationTitle && waitedFor.current === preview.dateText) {
      Animated.timing(opacity, { toValue: 1, duration: FADE_IN, useNativeDriver: true }).start();
    } else {
      opacity.setValue(1);
    }
    waitedFor.current = null;
  }, [preview.dateText, preview.waiting, preview.celebrationTitle, opacity]);

  const ink = preview.muted ? colors.text2 : colors.text;
  return (
    <View
      testID="calendar-preview"
      accessibilityLiveRegion="polite"
      style={[
        styles.card,
        {
          backgroundColor: liturgical ? liturgical.calendar.day : colors.chipBackground,
          borderRadius: theme.radius.card,
        },
      ]}
    >
      <Text
        maxFontSizeMultiplier={scale}
        style={[styles.date, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
      >
        {preview.dateText}
      </Text>
      {preview.title ? (
        <Text maxFontSizeMultiplier={scale} style={[styles.season, { color: colors.text2 }]}>
          {preview.title}
        </Text>
      ) : null}
      {preview.typeLabel && liturgical ? (
        <>
          <Text
            maxFontSizeMultiplier={scale}
            style={[styles.type, { color: preview.muted ? colors.text2 : liturgical.accent }]}
          >
            {preview.typeLabel}
          </Text>
          {preview.waiting ? (
            <View
              testID="calendar-preview-waiting"
              accessibilityElementsHidden={true}
              importantForAccessibility="no-hide-descendants"
              style={[styles.waiting, { backgroundColor: colors.text, opacity: 0.1 }]}
            />
          ) : (
            <Animated.Text
              maxFontSizeMultiplier={scale}
              numberOfLines={3}
              style={[styles.title, { color: ink, fontFamily: theme.fonts.serifSemiBold, opacity }]}
            >
              {preview.celebrationTitle}
            </Animated.Text>
          )}
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
  // Where the name will be: as tall as its line
  waiting: {
    marginTop: 5,
    marginBottom: 3,
    height: 15,
    width: '62%',
    borderRadius: 6,
  },
});
