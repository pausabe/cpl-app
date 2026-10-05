import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LiturgicalColorCode, useTheme } from '../../theme';

// What the calendar says that cannot be seen: under the year in small, the colours of the seasons,
// which are not named there. The month needs no key: its seasons are named over it, and the letter
// of a celebration (M, F, S) is read on the card of the day as soon as it is touched. A screen
// reader does not need it: every day says its rank.

// The seasons by their colour, two to a line
const SEASONS: { code: LiturgicalColorCode; label: string }[] = [
  { code: 'V', label: "Durant l'any" },
  { code: 'M', label: 'Advent i Quaresma' },
  { code: 'B', label: 'Nadal i Pasqua' },
  { code: 'R', label: 'Tridu pasqual' },
];

// The squares of the year: the middle tone of each season
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
  square: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
});
