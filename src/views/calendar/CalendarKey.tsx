import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LiturgicalColorCode, useTheme } from '../../theme';
import { DayRank } from '../../view-models/calendar';
import RankLetter from './RankLetter';

// What the calendar says, under the month, the year and the wheel. Under the month, three things,
// each one apart: the background is the season; the letter is the celebration (M, F, S); and the
// colour of the letter is the colour of the celebration. A weekday has no letter, and today is
// plain to see: neither needs a word. A screen reader does not need any of it: every day says its
// rank, and the home its colour.
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

// The liturgical colours a celebration can have, by their name
const COLORS: { code: LiturgicalColorCode; label: string }[] = [
  { code: 'B', label: 'Blanc' },
  { code: 'V', label: 'Verd' },
  { code: 'M', label: 'Morat' },
  { code: 'R', label: 'Vermell' },
];

export function MonthKey() {
  const theme = useTheme();
  const { colors } = theme;
  const heading = (text: string) => (
    <Text maxFontSizeMultiplier={theme.maxFontScaleForLabels} style={[styles.heading, { color: colors.text3 }]}>
      {text}
    </Text>
  );
  return (
    <View testID="calendar-key" style={styles.lines} {...hidden}>
      {heading('El fons: el temps')}
      <Columns>
        {SEASONS.map(({ code, label }) => (
          <Item key={code} label={label} column={true}>
            <View
              style={[styles.day, { backgroundColor: theme.liturgical(code).calendar.day, borderColor: colors.border }]}
            />
          </Item>
        ))}
      </Columns>
      {heading('La lletra: la celebració')}
      <Row>
        {RANKS.map(({ rank, label }) => (
          <Item key={label} label={label}>
            <RankLetter rank={rank} color={colors.text2} size={17} />
          </Item>
        ))}
      </Row>
      <Row>
        <Text maxFontSizeMultiplier={theme.maxFontScaleForLabels} style={[styles.label, { color: colors.text2 }]}>
          Color de la celebració:
        </Text>
        {COLORS.map(({ code, label }) => (
          <Item key={code} label={label}>
            <View style={[styles.dot, { backgroundColor: theme.liturgical(code).calendar.mark }]} />
          </Item>
        ))}
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
  heading: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  square: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
});
