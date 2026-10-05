import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LiturgicalColorCode, useTheme } from '../../../theme';

// What the colours mean, in a line under the month and under the year. A screen reader does not
// need it: every day says its rank, and every month its name.
const SWATCH = 14;

export function MonthKey({ color }: { color: LiturgicalColorCode }) {
  const theme = useTheme();
  const { colors } = theme;
  const tones = theme.liturgical(color).calendar;
  return (
    <Row>
      <Item label="Solemnitat">
        <View style={[styles.swatch, { backgroundColor: tones.solemnity }]} />
      </Item>
      <Item label="Festa">
        <View style={[styles.swatch, { backgroundColor: tones.feast }]} />
      </Item>
      <Item label="Memòria">
        <View style={[styles.swatch, styles.memory, { backgroundColor: tones.day }]}>
          <View style={[styles.dot, { backgroundColor: tones.solemnity }]} />
        </View>
      </Item>
      <Item label="Avui">
        <View style={[styles.swatch, { borderWidth: 2, borderColor: colors.accentText }]} />
      </Item>
    </Row>
  );
}

const COLORS: { code: LiturgicalColorCode; label: string }[] = [
  { code: 'M', label: 'Morat' },
  { code: 'B', label: 'Blanc' },
  { code: 'V', label: 'Verd' },
  { code: 'R', label: 'Vermell' },
];

export function YearKey() {
  const theme = useTheme();
  return (
    <Row>
      {COLORS.map(({ code, label }) => (
        <Item key={code} label={label}>
          <View style={[styles.square, { backgroundColor: theme.liturgical(code).calendar.square }]} />
        </Item>
      ))}
      <Item label="Solemnitat">
        <View style={styles.pair}>
          <View style={[styles.square, { backgroundColor: theme.liturgical('M').calendar.solemnity }]} />
          <View style={[styles.square, { backgroundColor: theme.liturgical('B').calendar.solemnity }]} />
        </View>
      </Item>
    </Row>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.row} accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 12.5,
  },
  swatch: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: 4,
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
