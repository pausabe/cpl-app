import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LiturgicalColorCode, useTheme } from '../../../theme';

// What the colours mean, under the month, the year and the wheel. Under the month: the four
// liturgical colours, each with its tones from soft to strong and named by what most of its days
// are, and what makes a day of a colour stronger, from the weekday to the solemnity, in the colour
// most days of the month have. A screen reader does not need it: every day says its rank, and the
// home its colour.
const SWATCH = 14;

// A short name each, in two columns. Short means incomplete: white is also the Lord, Our Lady and
// the saints who are not martyrs, and red the Passion and the apostles (General Instruction of
// the Roman Missal, 346), but one line each was preferred.
const COLORS: { code: LiturgicalColorCode; label: string }[] = [
  { code: 'V', label: "Durant l'any" },
  { code: 'M', label: 'Advent i Quaresma' },
  { code: 'B', label: 'Nadal i Pasqua' },
  { code: 'R', label: 'Màrtirs i Pentecosta' },
];

export function MonthKey({ color }: { color: LiturgicalColorCode }) {
  const theme = useTheme();
  const { colors } = theme;
  const tones = theme.liturgical(color).calendar;
  return (
    <View testID="calendar-key" style={styles.lines}>
      <Columns>
        {COLORS.map(({ code, label }) => {
          const ramp = theme.liturgical(code).calendar;
          return (
            <Item key={code} label={label} column={true}>
              <View style={[styles.ramp, { borderColor: colors.border }]}>
                <View style={[styles.step, { backgroundColor: ramp.day }]} />
                <View style={[styles.step, { backgroundColor: ramp.feast }]} />
                <View style={[styles.step, { backgroundColor: ramp.solemnity }]} />
              </View>
            </Item>
          );
        })}
      </Columns>
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
    <View testID="calendar-year-key" style={styles.lines}>
      <Columns>
        {COLORS.map(({ code, label }) => (
          <Item key={code} label={label} column={true}>
            <View style={[styles.square, { backgroundColor: theme.liturgical(code).calendar.square }]} />
          </Item>
        ))}
      </Columns>
      <Row>
        <Item label="Solemnitat">
          <View style={styles.pair}>
            <View style={[styles.square, { backgroundColor: theme.liturgical('B').calendar.solemnity }]} />
            <View style={[styles.square, { backgroundColor: theme.liturgical('M').calendar.solemnity }]} />
          </View>
        </Item>
      </Row>
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
    gap: 7,
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
