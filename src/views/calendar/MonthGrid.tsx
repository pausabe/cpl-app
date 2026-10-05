import React, { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import {
  CalendarDay,
  CalendarMonth,
  isSidewaysDrag,
  monthAfterSwipe,
  WEEKDAY_INITIALS,
} from '../../view-models/calendar';

// The days of a month, each on its liturgical colour: a solemnity filled with it, a feast in a
// middle tone, a memorial with a dot, the other days soft. Today has an outline and the day
// chosen a ring around it. Dragging the month sideways goes to the next or the one before; the
// row of months does it too, for whoever does not drag.
interface MonthGridProps {
  month: CalendarMonth;
  onPick: (date: Date) => void;
  onSwipe: (delta: -1 | 1) => void;
}

// A day is at most this wide, with its ring; on a narrow phone, a seventh of the width
const MAX_CELL = 50;
// The ring of the day chosen, and the gap between it and the day
const RING = 2.5;
const GAP = 1.5;

export default function MonthGrid({ month, onPick, onSwipe }: MonthGridProps) {
  const theme = useTheme();
  const { colors } = theme;
  const [cell, setCell] = useState(MAX_CELL);
  const width = useRef(0);
  const [shift] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));
  // The gesture is created once: it reads these when it moves and when it is let go
  const latest = useRef({ onSwipe, canGoBack: month.canGoBack, canGoForward: month.canGoForward });
  useEffect(() => {
    latest.current = { onSwipe, canGoBack: month.canGoBack, canGoForward: month.canGoForward };
  }, [onSwipe, month.canGoBack, month.canGoForward]);

  const [swipe] = useState(() => {
    const settle = () => Animated.spring(shift, { toValue: 0, bounciness: 0, useNativeDriver: true }).start();
    return PanResponder.create({
      // Only sideways: a touch chooses a day, and a drag up or down scrolls the screen
      onMoveShouldSetPanResponderCapture: (_, gesture) => isSidewaysDrag(gesture.dx, gesture.dy),
      onPanResponderMove: (_, gesture) => {
        const { canGoBack, canGoForward } = latest.current;
        // At the first or the last month it gives a little and comes back
        const blocked = (gesture.dx > 0 && !canGoBack) || (gesture.dx < 0 && !canGoForward);
        shift.setValue(blocked ? gesture.dx / 4 : gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        const delta = monthAfterSwipe(gesture.dx, gesture.vx, width.current);
        const { canGoBack, canGoForward } = latest.current;
        if (delta === 0 || (delta === 1 && !canGoForward) || (delta === -1 && !canGoBack)) {
          settle();
          return;
        }
        // Out to the side it was pushed, and the new month in from the other one
        Animated.parallel([
          Animated.timing(shift, { toValue: -delta * width.current, duration: 140, useNativeDriver: true }),
          Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }),
        ]).start(() => {
          latest.current.onSwipe(delta);
          shift.setValue(delta * width.current * 0.3);
          Animated.parallel([
            Animated.timing(shift, { toValue: 0, duration: 180, useNativeDriver: true }),
            Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
          ]).start();
        });
      },
      onPanResponderTerminate: settle,
    });
  });

  // The ring of the day chosen: the light teal in dark mode, where the dark one is lost
  const ring = theme.dark ? colors.accentText : colors.accentFill;

  const dayCell = (day: CalendarDay | null, index: number) => {
    if (!day) return <View key={`blank-${index}`} style={[styles.cell, { height: cell }]} />;
    const tones = day.look ? theme.liturgical(day.look.color).calendar : null;
    const rank = day.look?.rank ?? null;
    const background = !tones
      ? colors.chipBackground
      : rank === 'solemnity'
        ? tones.solemnity
        : rank === 'feast'
          ? tones.feast
          : tones.day;
    const color =
      tones && rank === 'solemnity' ? tones.onSolemnity : tones && rank === 'feast' ? tones.feastText : colors.text;
    const strong = rank === 'solemnity' || rank === 'feast' || day.today || day.selected || day.date.getDay() === 0;
    const inner = cell - 2 * (RING + GAP);
    return (
      <View key={day.day} style={[styles.cell, { height: cell }]}>
        <Pressable
          testID={`calendar-day-${day.day}`}
          accessibilityRole="button"
          accessibilityLabel={day.label}
          accessibilityState={{ selected: day.selected, disabled: day.disabled }}
          disabled={day.disabled}
          onPress={() => onPick(day.date)}
          style={({ pressed }) => [
            styles.ring,
            {
              width: cell,
              height: cell,
              borderRadius: cell * 0.3,
              borderColor: day.selected ? ring : 'transparent',
              opacity: day.disabled ? 0.35 : pressed ? 0.7 : 1,
            },
          ]}
        >
          <View
            testID={`calendar-day-${day.day}-fill`}
            style={[
              styles.day,
              { width: inner, height: inner, borderRadius: inner * 0.28, backgroundColor: background },
              day.today ? { borderWidth: 2, borderColor: colors.accentText } : null,
            ]}
          >
            <Text maxFontSizeMultiplier={1.3} style={[styles.dayText, { color, fontWeight: strong ? '700' : '400' }]}>
              {day.day}
            </Text>
            {rank === 'memory' && tones ? (
              <View
                testID={`calendar-day-${day.day}-memory`}
                style={[styles.dot, { backgroundColor: tones.solemnity }]}
              />
            ) : null}
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <View
      onLayout={(event) => {
        width.current = event.nativeEvent.layout.width;
        setCell(Math.min(MAX_CELL, Math.floor(event.nativeEvent.layout.width / 7)));
      }}
    >
      <View style={styles.row} accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
        {WEEKDAY_INITIALS.map((initial) => (
          <Text key={initial} maxFontSizeMultiplier={1.3} style={[styles.weekday, { color: colors.text3 }]}>
            {initial}
          </Text>
        ))}
      </View>
      <Animated.View
        testID="calendar-grid"
        style={[styles.grid, { opacity: fade, transform: [{ translateX: shift }] }]}
        {...swipe.panHandlers}
      >
        {month.weeks.map((week, row) => (
          <View key={row} style={styles.row}>
            {week.map((day, column) => dayCell(day, row * 7 + column))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    marginTop: 6,
    gap: 3,
  },
  row: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: RING,
    padding: GAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 17,
    fontVariant: ['tabular-nums'],
  },
  dot: {
    position: 'absolute',
    bottom: 5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
