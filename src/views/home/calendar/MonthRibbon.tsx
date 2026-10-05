import React, { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme';
import EdgeFade from '../../../components/EdgeFade';
import { RibbonMonth } from '../../../view-models/calendar';

// The months in a row over the grid: one touch goes to any of them, without arrows, and the row
// scrolls on to the year before and the next. The month shown is filled and kept in sight; the
// month of today has a dot.
interface MonthRibbonProps {
  months: RibbonMonth[];
  onPick: (year: number, month: number) => void;
  // How far the row reaches out to the edges of the sheet
  bleed: number;
}

const FADE = 28;

export default function MonthRibbon({ months, onPick, bleed }: MonthRibbonProps) {
  const theme = useTheme();
  const { colors } = theme;
  const scroll = useRef<ScrollView>(null);
  const places = useRef<Record<string, { x: number; width: number }>>({});
  const viewport = useRef(0);
  const selected = months.find((month) => month.selected)?.key;

  // The month shown, in the middle of the row when it can be
  const center = (key: string | undefined, animated: boolean) => {
    const place = key ? places.current[key] : undefined;
    if (!place || !viewport.current) return;
    scroll.current?.scrollTo({ x: Math.max(0, place.x + place.width / 2 - viewport.current / 2), animated });
  };
  useEffect(() => {
    const place = selected ? places.current[selected] : undefined;
    if (!place || !viewport.current) return;
    scroll.current?.scrollTo({ x: Math.max(0, place.x + place.width / 2 - viewport.current / 2), animated: true });
  }, [selected]);

  return (
    <View style={{ marginHorizontal: -bleed }}>
      <ScrollView
        ref={scroll}
        testID="calendar-months"
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, { paddingHorizontal: bleed }]}
        onLayout={(event) => {
          viewport.current = event.nativeEvent.layout.width;
          center(selected, false);
        }}
      >
        {months.map((month) => {
          const color = month.selected ? colors.onAccent : colors.text;
          return (
            <Pressable
              key={month.key}
              testID={`calendar-month-${month.year}-${month.month + 1}`}
              accessibilityRole="button"
              accessibilityLabel={month.current ? `${month.label}, el mes d’avui` : month.label}
              accessibilityState={{ selected: month.selected }}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                places.current[month.key] = { x, width };
                if (month.selected) center(month.key, false);
              }}
              onPress={() => onPick(month.year, month.month)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: month.selected ? colors.accentFill : colors.chipBackground,
                  borderColor: month.selected ? colors.accentFill : colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                maxFontSizeMultiplier={1.3}
                style={[styles.text, { color, fontWeight: month.selected ? '700' : '500' }]}
              >
                {month.text}
              </Text>
              {month.yearText ? (
                <Text maxFontSizeMultiplier={1.3} style={[styles.year, { color }]}>
                  {month.yearText}
                </Text>
              ) : null}
              {month.current ? (
                <View style={[styles.dot, { backgroundColor: month.selected ? colors.onAccent : colors.accentText }]} />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
      <EdgeFade color={colors.sheet} height={FADE} side="left" />
      <EdgeFade color={colors.sheet} height={FADE} side="right" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    minHeight: 40,
    minWidth: 44,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  text: {
    fontSize: 15,
  },
  year: {
    fontSize: 12.5,
    opacity: 0.75,
    fontVariant: ['tabular-nums'],
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
