import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fitLabel, useTheme } from '../../theme';
import ActionButton from '../../components/ActionButton';
import BottomSheet from '../../components/BottomSheet';
import Icon from '../../components/Icon';
import {
  calendarMonth,
  CalendarDay,
  monthInYear,
  selectableYears,
  shiftMonth,
  WEEKDAY_INITIALS,
} from '../../view-models/calendar';

// Choosing another day: a month in a sheet that comes up from the bottom, like everything else
// the reader asks for, with the day's card still in sight above it. The same on Android and on
// iOS, in Catalan and in the colours of the app. A day is chosen with a touch and applied with
// "Canvia"; "Avui" goes back to today at once. Days outside the database cannot be chosen. The
// title of the month opens the list of years, to go to another year without going month by
// month. It closes by pulling it down, touching outside, or the back button on Android.
interface CalendarSheetProps {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onClose: () => void;
  onToday: () => void;
  onChange: (date: Date) => void;
}

// The month does not grow wider than this: on a tablet the sheet is much wider than a month
const MONTH_MAX_WIDTH = 380;

export default function CalendarSheet({
  visible,
  value,
  minimumDate,
  maximumDate,
  onClose,
  onToday,
  onChange,
}: CalendarSheetProps) {
  const theme = useTheme();
  const { colors } = theme;
  const scale = theme.maxFontScaleForLabels;
  const [selected, setSelected] = useState(value);
  const [shown, setShown] = useState({ year: value.getFullYear(), month: value.getMonth() });
  const [pickingYear, setPickingYear] = useState(false);

  // Every time it opens, at the day being shown
  useEffect(() => {
    if (!visible) return;
    setSelected(value);
    setShown({ year: value.getFullYear(), month: value.getMonth() });
    setPickingYear(false);
  }, [visible, value]);

  const chooseYear = (year: number) => {
    setShown(monthInYear(year, shown.month, minimumDate, maximumDate));
    setPickingYear(false);
  };

  const month = calendarMonth({ ...shown, selected, today: new Date(), minimum: minimumDate, maximum: maximumDate });
  const go = (delta: number) => setShown(shiftMonth(shown.year, shown.month, delta));

  const arrow = (label: string, icon: 'back' | 'chevronRight', enabled: boolean, delta: number) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={() => go(delta)}
      style={({ pressed }) => [styles.arrow, { opacity: !enabled ? 0.3 : pressed ? 0.6 : 1 }]}
    >
      <Icon name={icon} size={22} color={colors.accentText} strokeWidth={2.2} />
    </Pressable>
  );

  const dayCell = (day: CalendarDay | null, index: number) => {
    if (!day) return <View key={`blank-${index}`} style={styles.cell} />;
    const background = day.selected ? colors.accentFill : 'transparent';
    const color = day.selected
      ? colors.onAccent
      : day.disabled
        ? colors.text3
        : day.today
          ? colors.accentText
          : colors.text;
    return (
      <View key={day.day} style={styles.cell}>
        <Pressable
          testID={`calendar-day-${day.day}`}
          accessibilityRole="button"
          accessibilityLabel={day.label}
          accessibilityState={{ selected: day.selected, disabled: day.disabled }}
          disabled={day.disabled}
          onPress={() => setSelected(day.date)}
          style={({ pressed }) => [
            styles.day,
            { backgroundColor: background, opacity: day.disabled ? 0.35 : pressed ? 0.7 : 1 },
            day.today && !day.selected ? { borderWidth: 1.5, borderColor: colors.accentText } : null,
          ]}
        >
          <Text
            maxFontSizeMultiplier={1.3}
            style={[styles.dayText, { color, fontWeight: day.selected || day.today ? '700' : '400' }]}
          >
            {day.day}
          </Text>
        </Pressable>
      </View>
    );
  };

  const thisYear = new Date().getFullYear();
  const yearCell = (year: number) => {
    const chosen = year === shown.year;
    const current = year === thisYear;
    return (
      <View key={year} style={styles.yearCell}>
        <Pressable
          testID={`calendar-year-${year}`}
          accessibilityRole="button"
          accessibilityLabel={String(year)}
          accessibilityState={{ selected: chosen }}
          onPress={() => chooseYear(year)}
          style={({ pressed }) => [
            styles.year,
            { backgroundColor: chosen ? colors.accentFill : 'transparent', opacity: pressed ? 0.7 : 1 },
            current && !chosen ? { borderWidth: 1.5, borderColor: colors.accentText } : null,
          ]}
        >
          <Text
            maxFontSizeMultiplier={1.3}
            style={[
              styles.yearText,
              {
                color: chosen ? colors.onAccent : current ? colors.accentText : colors.text,
                fontWeight: chosen || current ? '700' : '400',
              },
            ]}
          >
            {year}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Tria un dia" testID="calendar">
      <View style={styles.month}>
        <View style={styles.header}>
          {pickingYear ? <View style={styles.arrow} /> : arrow('Mes anterior', 'back', month.canGoBack, -1)}
          <Pressable
            testID="calendar-title"
            accessibilityRole="button"
            accessibilityLabel={month.title}
            accessibilityHint={pickingYear ? 'Torna als dies del mes' : 'Tria un altre any'}
            accessibilityState={{ expanded: pickingYear }}
            accessibilityLiveRegion="polite"
            onPress={() => setPickingYear(!pickingYear)}
            style={({ pressed }) => [styles.titleButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text
              maxFontSizeMultiplier={scale}
              {...fitLabel(month.title)}
              style={[styles.title, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
            >
              {month.title}
            </Text>
            <Icon name="chevronDown" size={18} color={colors.accentText} strokeWidth={2.2} />
          </Pressable>
          {pickingYear ? <View style={styles.arrow} /> : arrow('Mes següent', 'chevronRight', month.canGoForward, 1)}
        </View>
        {pickingYear ? (
          <ScrollView style={styles.yearList}>
            <View testID="calendar-years" style={styles.years}>
              {selectableYears(shown.year, minimumDate, maximumDate).map(yearCell)}
            </View>
          </ScrollView>
        ) : (
          <>
            <View style={styles.row} accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
              {WEEKDAY_INITIALS.map((initial) => (
                <Text key={initial} maxFontSizeMultiplier={1.3} style={[styles.weekday, { color: colors.text3 }]}>
                  {initial}
                </Text>
              ))}
            </View>
            <View style={styles.grid}>
              {month.weeks.map((week, row) => (
                <View key={row} style={styles.row}>
                  {week.map((day, column) => dayCell(day, row * 7 + column))}
                </View>
              ))}
            </View>
          </>
        )}
        <View style={styles.actions}>
          <ActionButton label="Avui" variant="outlined" onPress={onToday} style={styles.action} />
          <ActionButton label="Canvia" onPress={() => onChange(selected)} style={styles.action} />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  month: {
    width: '100%',
    maxWidth: MONTH_MAX_WIDTH,
    alignSelf: 'center',
    // So that the list of years, and not the month or the buttons, gives way inside the sheet
    flexShrink: 1,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrow: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    flexShrink: 1,
    textAlign: 'center',
    fontSize: 19,
  },
  // With many years in the database, the list scrolls inside the sheet
  yearList: {
    flexGrow: 0,
    flexShrink: 1,
  },
  years: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 6,
  },
  yearCell: {
    width: '33.33%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  year: {
    minWidth: 84,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearText: {
    fontSize: 17,
    fontVariant: ['tabular-nums'],
  },
  grid: {
    gap: 2,
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
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 17,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  action: {
    flex: 1,
  },
});
