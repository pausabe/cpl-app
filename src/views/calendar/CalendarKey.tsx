import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LiturgicalColorCode, useTheme } from '../../theme';
import { DayRank } from '../../view-models/calendar';
import RankMark from './RankMark';

// What the calendar says, under the month, the year and the wheel. The colour says only the
// liturgical season; under the month, the candles say the rank of a day, from the weekday (none)
// to the solemnity, alone and in the colour most days of the month have, as they are on the days.
// A screen reader does not need it: every day says its rank, and the home its colour.
const SWATCH = 16;

// The seasons by their colour, two to a line
const SEASONS: { code: LiturgicalColorCode; label: string }[] = [
  { code: 'V', label: "Durant l'any" },
  { code: 'M', label: 'Advent i Quaresma' },
  { code: 'B', label: 'Nadal i Pasqua' },
  { code: 'R', label: 'Tridu pasqual' },
];

const RANKS: { rank: DayRank; label: string }[] = [
  { rank: 'memory', label: 'Memòria' },
  { rank: 'feast', label: 'Festa' },
  { rank: 'solemnity', label: 'Solemnitat' },
];

export function MonthKey({ color }: { color: LiturgicalColorCode }) {
  const theme = useTheme();
  const { colors } = theme;
  const tones = theme.liturgical(color).calendar;
  // The colour of a season: the soft tone of its days, with a thin edge (white is almost the
  // background)
  const day = (tone: string) => <View style={[styles.day, { backgroundColor: tone, borderColor: colors.border }]} />;
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
        <Text maxFontSizeMultiplier={theme.maxFontScaleForLabels} style={[styles.label, { color: colors.text2 }]}>
          Fèria, sense marca
        </Text>
        {RANKS.map(({ rank, label }) => (
          <Item key={label} label={label}>
            <RankMark rank={rank} color={tones.mark} size={18} />
          </Item>
        ))}
        <Item label="Avui">
          <View style={[styles.today, { borderColor: colors.accentText }]} />
        </Item>
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
    alignItems: 'center',
    columnGap: 14,
    rowGap: 8,
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
  },
  // Today's outline, alone, as on the day
  today: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: 5,
    borderWidth: 2,
  },
  square: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
});
