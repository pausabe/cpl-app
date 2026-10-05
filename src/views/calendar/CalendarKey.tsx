import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LiturgicalColorCode, useTheme } from '../../theme';
import { DayRank } from '../../view-models/calendar';
import RankMark from './RankMark';

// What the calendar says, under the month, the year and the wheel. The colour says only the
// liturgical season; under the month, the marks say the rank of a day, from the weekday (no mark)
// to the solemnity, in the colour most days of the month have. A screen reader does not need it:
// every day says its rank, and the home its colour.
const SWATCH = 16;

// The seasons by their colour, two to a line
const SEASONS: { code: LiturgicalColorCode; label: string }[] = [
  { code: 'V', label: "Durant l'any" },
  { code: 'M', label: 'Advent i Quaresma' },
  { code: 'B', label: 'Nadal i Pasqua' },
  { code: 'R', label: 'Tridu pasqual' },
];

const RANKS: { rank: DayRank | null; label: string }[] = [
  { rank: null, label: 'Fèria' },
  { rank: 'memory', label: 'Memòria' },
  { rank: 'feast', label: 'Festa' },
  { rank: 'solemnity', label: 'Solemnitat' },
];

export function MonthKey({ color }: { color: LiturgicalColorCode }) {
  const theme = useTheme();
  const { colors } = theme;
  const tones = theme.liturgical(color).calendar;
  // A day in small: the soft tone of its season, with a thin edge (white is almost the background)
  const day = (tone: string, children?: React.ReactNode, outline?: string) => (
    <View
      style={[
        styles.day,
        { backgroundColor: tone, borderColor: outline ?? colors.border },
        outline ? styles.today : null,
      ]}
    >
      {children}
    </View>
  );
  return (
    <View testID="calendar-key" style={styles.lines}>
      <Columns>
        {SEASONS.map(({ code, label }) => (
          <Item key={code} label={label} column={true}>
            {day(theme.liturgical(code).calendar.day)}
          </Item>
        ))}
      </Columns>
      <Row>
        {RANKS.map(({ rank, label }) => (
          <Item key={label} label={label}>
            {day(tones.day, rank ? <RankMark rank={rank} color={tones.mark} size={10} /> : null)}
          </Item>
        ))}
        <Item label="Avui">{day(tones.day, null, colors.accentText)}</Item>
      </Row>
    </View>
  );
}

// The squares of the year and the pieces of the wheel: the middle tone of each season
export function YearKey() {
  const theme = useTheme();
  return (
    <View testID="calendar-year-key">
      <Columns>
        {SEASONS.map(({ code, label }) => (
          <Item key={code} label={label} column={true}>
            <View style={[styles.square, { backgroundColor: theme.liturgical(code).calendar.square }]} />
          </Item>
        ))}
      </Columns>
    </View>
  );
}

const hidden = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const;

function Row({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.row} {...hidden}>
      {children}
    </View>
  );
}

// Two to a line, each in half the width, so that the names line up
function Columns({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.columns} {...hidden}>
      {children}
    </View>
  );
}

function Item({ label, children, column = false }: { label: string; children: React.ReactNode; column?: boolean }) {
  const theme = useTheme();
  return (
    <View style={[styles.item, column ? styles.column : null]}>
      {children}
      <Text
        maxFontSizeMultiplier={theme.maxFontScaleForLabels}
        style={[styles.label, column ? styles.columnLabel : null, { color: theme.colors.text2 }]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lines: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 6,
  },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  column: {
    width: '50%',
    paddingRight: 8,
  },
  label: {
    fontSize: 12.5,
  },
  // On a narrow phone a long name goes on to a second line inside its column
  columnLabel: {
    flexShrink: 1,
  },
  day: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: {
    borderWidth: 2,
  },
  square: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
});
