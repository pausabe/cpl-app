import React, { useState } from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../../theme';
import Icon from '../../../components/Icon';
import { dayAtPoint, LiturgicalWheel, MilestoneRow, WHEEL } from '../../../view-models/liturgicalYear';

// The liturgical year as a wheel, from the first Sunday of Advent at the top, clockwise: every
// day in its colour, the solemnities in the strong one, the seasons named around it and today
// marked. A touch on the ring opens that month. Under it, the dates worth going to.
interface LiturgicalYearWheelProps {
  wheel: LiturgicalWheel;
  onPickDay: (date: Date) => void;
}

export default function LiturgicalYearWheel({ wheel, onPickDay }: LiturgicalYearWheelProps) {
  const theme = useTheme();
  const { colors } = theme;
  const [width, setWidth] = useState(WHEEL.width);
  const height = (width * WHEEL.height) / WHEEL.width;
  const scale = width / WHEEL.width;

  const pick = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    const index = dayAtPoint(locationX / scale, locationY / scale, wheel.days);
    if (index === null) return;
    const { first } = wheel;
    onPickDay(new Date(first.getFullYear(), first.getMonth(), first.getDate() + index));
  };

  return (
    <View style={styles.frame} onLayout={(event) => setWidth(Math.min(WHEEL.width, event.nativeEvent.layout.width))}>
      {/* One image for a screen reader, which reaches the months from «Mesos» */}
      <View
        testID="calendar-wheel"
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel={wheel.label}
        style={{ width, height }}
      >
        <Pressable testID="calendar-wheel-ring" onPress={pick} style={StyleSheet.absoluteFill}>
          <Svg width={width} height={height} viewBox={`0 0 ${WHEEL.width} ${WHEEL.height}`}>
            <Circle
              cx={WHEEL.cx}
              cy={WHEEL.cy}
              r={(WHEEL.outer + WHEEL.inner) / 2}
              stroke={colors.divider}
              strokeWidth={WHEEL.outer - WHEEL.inner}
              fill="none"
            />
            {wheel.arcs.map((arc, index) => (
              <Path key={`arc-${index}`} d={arc.d} fill={theme.liturgical(arc.color).calendar.square} />
            ))}
            {wheel.solemnities.map((mark, index) => (
              <Path key={`solemnity-${index}`} d={mark.d} fill={theme.liturgical(mark.color).calendar.solemnity} />
            ))}
            {wheel.cuts.map((cut) => (
              <Path key={cut} d={cut} stroke={colors.sheet} strokeWidth={2.5} />
            ))}
            {wheel.seasons.map((season) => (
              <SvgText
                key={`${season.text}-${season.x}`}
                x={season.x}
                y={season.y}
                textAnchor={season.anchor}
                fontSize={11.5}
                fontWeight="600"
                fill={colors.text2}
              >
                {season.text}
              </SvgText>
            ))}
            {wheel.today ? (
              <>
                <Path d={wheel.today.needle} stroke={colors.accentFill} strokeWidth={3} strokeLinecap="round" />
                <Circle cx={wheel.today.dot.x} cy={wheel.today.dot.y} r={4.5} fill={colors.accentFill} />
                <SvgText
                  x={wheel.today.label.x}
                  y={wheel.today.label.y}
                  textAnchor={wheel.today.label.anchor}
                  fontSize={12}
                  fontWeight="700"
                  fill={colors.accentText}
                >
                  {wheel.today.label.text}
                </SvgText>
              </>
            ) : null}
          </Svg>
          <View
            pointerEvents="none"
            style={[
              styles.middle,
              {
                left: (WHEEL.cx - WHEEL.inner + 10) * scale,
                top: (WHEEL.cy - WHEEL.inner + 10) * scale,
                width: (WHEEL.inner - 10) * 2 * scale,
                height: (WHEEL.inner - 10) * 2 * scale,
              },
            ]}
          >
            <Text
              maxFontSizeMultiplier={1.2}
              style={[styles.yearName, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
            >
              {wheel.yearName}
            </Text>
            {wheel.todayTitle ? (
              <Text maxFontSizeMultiplier={1.2} numberOfLines={3} style={[styles.today, { color: colors.text2 }]}>
                {wheel.todayTitle}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// The dates under the wheel: «Properament» in the year of today, and Ash Wednesday and Easter in
// another one. A touch opens the month with that day chosen.
interface MilestoneListProps {
  title: string;
  rows: MilestoneRow[];
  onPick: (date: Date) => void;
}

export function MilestoneList({ title, rows, onPick }: MilestoneListProps) {
  const theme = useTheme();
  const { colors } = theme;
  const scale = theme.maxFontScaleForLabels;
  if (rows.length === 0) return null;
  return (
    <View style={styles.list}>
      <Text accessibilityRole="header" maxFontSizeMultiplier={scale} style={[styles.section, { color: colors.text3 }]}>
        {title}
      </Text>
      {rows.map((row) => (
        <Pressable
          key={row.key}
          testID={`calendar-milestone-${row.key}`}
          accessibilityRole="button"
          accessibilityLabel={row.label}
          onPress={() => onPick(row.date)}
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: colors.chipBackground, borderRadius: theme.radius.tile, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={[styles.swatch, { backgroundColor: theme.liturgical(row.color).calendar.solemnity }]} />
          <View style={styles.texts}>
            <Text maxFontSizeMultiplier={scale} numberOfLines={2} style={[styles.rowTitle, { color: colors.text }]}>
              {row.title}
            </Text>
            <Text maxFontSizeMultiplier={scale} style={[styles.rowSubtitle, { color: colors.text2 }]}>
              {row.subtitle}
            </Text>
          </View>
          <Icon name="chevronRight" size={20} color={colors.accentText} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
  },
  middle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearName: {
    fontSize: 22,
  },
  today: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
  },
  list: {
    gap: 6,
  },
  section: {
    marginLeft: 2,
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  row: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 10,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15.5,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 13,
  },
});
