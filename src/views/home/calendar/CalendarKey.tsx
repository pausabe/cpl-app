import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LiturgicalColorCode, useTheme } from '../../../theme';

// What the colours mean, under the month, the year and the wheel. Under the month, two lines: the
// four liturgical colours, each with its tones from soft to strong, and what makes a day of that
// colour stronger, from the weekday to the solemnity, in the colour most days of the month have.
// A screen reader does not need it: every day says its rank, and the home its colour.
const SWATCH = 14;

// In the order of the year: most days green, then white, purple and red
const COLORS: { code: LiturgicalColorCode; label: string }[] = [
  { code: 'V', label: 'Verd' },
  { code: 'B', label: 'Blanc' },
  { code: 'M', label: 'Morat' },
  { code: 'R', label: 'Vermell' },
];

export function MonthKey({ color }: { color: LiturgicalColorCode }) {
  const theme = useTheme();
  const { colors } = theme;
  const tones = theme.liturgical(color).calendar;
  return (
    <View testID="calendar-key" style={styles.lines}>
      <Row>
        {COLORS.map(({ code, label }) => {
          const ramp = theme.liturgical(code).calendar;
          return (
            <Item key={code} label={label}>
              <View style={[styles.ramp, { borderColor: colors.border }]}>
                <View style={[styles.step, { backgroundColor: ramp.day }]} />
                <View style={[styles.step, { backgroundColor: ramp.feast }]} />
                <View style={[styles.step, { backgroundColor: ramp.solemnity }]} />
              </View>
            </Item>
          );
        })}
      </Row>
      <Row>
        <Item label="Fèria">
          <View style={[styles.swatch, { backgroundColor: tones.day }]} />
        </Item>
        <Item label="Memòria">
          <View style={[styles.swatch, styles.memory, { backgroundColor: tones.day }]}>
            <View style={[styles.dot, { backgroundColor: tones.solemnity }]} />
          </View>
        </Item>
        <Item label="Festa">
          <View style={[styles.swatch, { backgroundColor: tones.feast }]} />
        </Item>
        <Item label="Solemnitat">
          <View style={[styles.swatch, { backgroundColor: tones.solemnity }]} />
        </Item>
        <Item label="Avui">
          <View style={[styles.swatch, { borderWidth: 2, borderColor: colors.accentText }]} />
        </Item>
      </Row>
    </View>
  );
}

// The squares of the year and of the wheel: the middle tone of each colour, and the strong one for
// a solemnity
export function YearKey() {
  const theme = useTheme();
  return (
    <Row testID="calendar-year-key">
      {COLORS.map(({ code, label }) => (
        <Item key={code} label={label}>
          <View style={[styles.square, { backgroundColor: theme.liturgical(code).calendar.square }]} />
        </Item>
      ))}
      <Item label="Solemnitat">
        <View style={styles.pair}>
          <View style={[styles.square, { backgroundColor: theme.liturgical('B').calendar.solemnity }]} />
          <View style={[styles.square, { backgroundColor: theme.liturgical('M').calendar.solemnity }]} />
        </View>
      </Item>
    </Row>
  );
}

function Row({ children, testID }: { children: React.ReactNode; testID?: string }) {
  return (
    <View
      testID={testID}
      style={styles.row}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      {children}
    </View>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.item}>
      {children}
      <Text maxFontSizeMultiplier={theme.maxFontScaleForLabels} style={[styles.label, { color: theme.colors.text2 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lines: {
    gap: 7,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  label: {
    fontSize: 12.5,
  },
  swatch: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: 4,
  },
  // The three tones of a colour, joined: the soft one has a thin edge, white is almost the sheet
  ramp: {
    flexDirection: 'row',
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  step: {
    width: 9,
    height: SWATCH,
  },
  memory: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  square: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  pair: {
    flexDirection: 'row',
    gap: 2,
  },
});
