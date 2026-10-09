import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import FitLabel from '../../components/FitLabel';
import { MiniMonth, YearOverview } from '../../view-models/liturgicalYear';

// The twelve months of a year in small, three or four in a row, every day a square in the colour of
// its season: Advent, Christmas, Lent and Easter can be seen at a glance. A touch opens the month. The month the calendar was showing is framed, and the month of today has its
// name in colour and today's square outlined.
interface YearMonthsProps {
  overview: YearOverview;
  columns?: number;
  onPick: (year: number, month: number) => void;
}

export default function YearMonths({ overview, columns = 4, onPick }: YearMonthsProps) {
  const width = `${100 / columns}%` as const;
  return (
    <View testID="calendar-year" style={styles.grid}>
      {overview.months.map((month) => (
        <MiniMonthTile key={month.key} month={month} width={width} onPick={onPick} />
      ))}
    </View>
  );
}

interface MiniMonthTileProps {
  month: MiniMonth;
  width: `${number}%`;
  onPick: (year: number, month: number) => void;
}

function MiniMonthTile({ month, width, onPick }: MiniMonthTileProps) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <View style={[styles.slot, { width }]}>
      <Pressable
        testID={`calendar-year-month-${month.month + 1}`}
        accessibilityRole="button"
        accessibilityLabel={month.label}
        accessibilityState={{ selected: month.shown, disabled: month.disabled }}
        disabled={month.disabled}
        onPress={() => onPick(month.year, month.month)}
        style={({ pressed }) => [
          styles.month,
          {
            borderRadius: theme.radius.chip,
            borderColor: month.shown ? colors.accentFill : 'transparent',
            backgroundColor: month.shown ? colors.homeBackground : 'transparent',
            opacity: month.disabled ? 0.35 : pressed ? 0.6 : 1,
          },
        ]}
      >
        <FitLabel
          maxFontSizeMultiplier={theme.maxFontScaleForLabels}
          minimumScale={0.8}
          style={[
            styles.name,
            { color: month.current ? colors.accentText : colors.text, fontWeight: month.current ? '700' : '600' },
          ]}
        >
          {month.name}
        </FitLabel>
        <View style={styles.squares}>
          {Array.from({ length: month.blanks }, (_, index) => (
            <View key={`blank-${index}`} style={styles.place} />
          ))}
          {month.days.map((day) => {
            const tones = day.color ? theme.liturgical(day.color).calendar : null;
            return (
              <View key={day.key} style={styles.place}>
                <View
                  style={[
                    styles.square,
                    { backgroundColor: tones ? tones.square : colors.divider },
                    day.today ? { borderWidth: 1.5, borderColor: colors.accentText } : null,
                  ]}
                />
              </View>
            );
          })}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },
  slot: {
    padding: 3,
  },
  month: {
    borderWidth: 2,
    paddingTop: 5,
    paddingHorizontal: 4,
    paddingBottom: 6,
    gap: 4,
  },
  name: {
    fontSize: 13,
    paddingLeft: 1,
  },
  squares: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // A seventh of the row, with the gap around the square inside it
  place: {
    width: '14.2857%',
    aspectRatio: 1,
    padding: 0.75,
  },
  square: {
    flex: 1,
    borderRadius: 2,
  },
});
