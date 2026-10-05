import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fitLabel, useTheme } from '../../theme';
import ActionButton from '../../components/ActionButton';
import EdgeFade from '../../components/EdgeFade';
import Icon from '../../components/Icon';
import SegmentedControl from '../../components/SegmentedControl';
import { calendarMonth, dateOfIso, DayMarks, isoDate, monthRibbon, shiftMonth } from '../../view-models/calendar';
import { DayCard } from '../../view-models/dayCard';
import {
  keyDates,
  liturgicalWheel,
  liturgicalYearOf,
  milestoneRow,
  upcomingMilestones,
  yearOverview,
} from '../../view-models/liturgicalYear';
import MonthRibbon from './MonthRibbon';
import MonthGrid from './MonthGrid';
import DayPreviewCard from './DayPreviewCard';
import { MonthKey, YearKey } from './CalendarKey';
import YearMonths from './YearMonths';
import LiturgicalYearWheel, { MilestoneList } from './LiturgicalYearWheel';

// Calendari: a screen of its own, over the home like the settings, with the liturgical year
// painted on it. Three tabs on top:
// - Mes: every day on its liturgical colour, as strong as its rank, and under the month what the
//   day touched is, before going to it. Another month is a drag sideways or a touch on the row
//   of months. At the bottom, always in sight, «Avui» and «Selecciona».
// - Any: the twelve months in small, a square of colour per day, with arrows from year to year;
//   a touch opens the month.
// - Any litúrgic: the year as a wheel from Advent, today marked, with the dates that come next.
// Days outside the database cannot be chosen. Back, with the arrow of the top bar.
//
// What it paints comes from its controller: the colours of the years (marks) and what the home
// would show of a day (previews). It says which years and which days it is about to show.
export interface CalendarScreenProps {
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  marks?: DayMarks;
  previews?: Record<string, DayCard>;
  onNeedYears?: (years: number[]) => void;
  onNeedPreviews?: (dates: Date[]) => void;
  onToday: () => void;
  onChange: (date: Date) => void;
}

type Tab = 'month' | 'year' | 'wheel';

const TABS = [
  { value: 'month' as const, label: 'Mes' },
  { value: 'year' as const, label: 'Any' },
  { value: 'wheel' as const, label: 'Any litúrgic' },
];

// The sides of the screen, as on the home; the row of months goes over them to the edges
const SIDE = 16;
const FADE_HEIGHT = 24;
// The wheel grows with the screen up to here: on a tablet it would be too big
const WHEEL_MAX_WIDTH = 420;
const NO_MARKS: DayMarks = {};
const NO_PREVIEWS: Record<string, DayCard> = {};

// The title of a solemnity under the wheel: its celebration, or the day itself (Easter Sunday)
const titleOf = (card: DayCard | undefined) => (card ? card.celebration?.title || card.title : null);

export default function CalendarScreen({
  value,
  minimumDate,
  maximumDate,
  marks = NO_MARKS,
  previews = NO_PREVIEWS,
  onNeedYears,
  onNeedPreviews,
  onToday,
  onChange,
}: CalendarScreenProps) {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const scale = theme.maxFontScaleForLabels;
  // Today, by its day: what the calendar marks does not change with the hour
  const todayKey = isoDate(new Date());
  const today = useMemo(() => dateOfIso(todayKey), [todayKey]);
  // The day shown at home, by its day and not by the object that brings it
  const valueKey = isoDate(value);
  const [tab, setTab] = useState<Tab>('month');
  const [selected, setSelected] = useState(() => dateOfIso(valueKey));
  const [shown, setShown] = useState({ year: value.getFullYear(), month: value.getMonth() });
  const [overviewYear, setOverviewYear] = useState(value.getFullYear());
  const [wheelYear, setWheelYear] = useState(() => liturgicalYearOf(value));
  // What the bar at the bottom covers: the scroll leaves that much room at its end
  const [footerHeight, setFooterHeight] = useState(FADE_HEIGHT + 52 + insets.bottom + 12);
  const onFooterLayout = (event: LayoutChangeEvent) => setFooterHeight(Math.ceil(event.nativeEvent.layout.height));

  // If the home changes its day underneath (another day began), the calendar goes to it
  useEffect(() => {
    const day = dateOfIso(valueKey);
    setSelected(day);
    setShown({ year: day.getFullYear(), month: day.getMonth() });
  }, [valueKey]);

  const todayWheel = liturgicalYearOf(today);
  const wheelIsToday = tab === 'wheel' && wheelYear === todayWheel;

  // The years about to be shown: the month's (and the next or the one before at the ends of the
  // year, ready for a drag), the year's, or the two of the liturgical year, and those of today
  // for what comes next
  const years =
    tab === 'month'
      ? [shown.year, ...(shown.month === 0 ? [shown.year - 1] : shown.month === 11 ? [shown.year + 1] : [])]
      : tab === 'year'
        ? [overviewYear]
        : [wheelYear, wheelYear + 1, ...(wheelIsToday ? [today.getFullYear(), today.getFullYear() + 1] : [])];
  const yearsKey = [...new Set(years)]
    .filter(
      (year) =>
        (!minimumDate || year >= minimumDate.getFullYear()) && (!maximumDate || year <= maximumDate.getFullYear()),
    )
    .sort((a, b) => a - b)
    .join(',');
  useEffect(() => {
    if (yearsKey) onNeedYears?.(yearsKey.split(',').map(Number));
  }, [yearsKey, onNeedYears]);

  // Only the tab shown is worked out, and again only when what it depends on changes
  const month = useMemo(
    () =>
      tab === 'month'
        ? calendarMonth({ ...shown, selected, today, minimum: minimumDate, maximum: maximumDate, marks })
        : null,
    [tab, shown, selected, today, minimumDate, maximumDate, marks],
  );
  const ribbon = useMemo(
    () => (tab === 'month' ? monthRibbon({ ...shown, today, minimum: minimumDate, maximum: maximumDate }) : null),
    [tab, shown, today, minimumDate, maximumDate],
  );
  const overview = useMemo(
    () =>
      tab === 'year'
        ? yearOverview({ year: overviewYear, marks, today, shown, minimum: minimumDate, maximum: maximumDate })
        : null,
    [tab, overviewYear, marks, today, shown, minimumDate, maximumDate],
  );
  const wheel = useMemo(
    () =>
      tab === 'wheel'
        ? liturgicalWheel({ startYear: wheelYear, marks, today, minimum: minimumDate, maximum: maximumDate })
        : null,
    [tab, wheelYear, marks, today, minimumDate, maximumDate],
  );
  const milestones = useMemo(
    () => (tab === 'wheel' ? (wheelIsToday ? upcomingMilestones(marks, today, 3) : keyDates(wheelYear, marks)) : []),
    [tab, wheelIsToday, marks, today, wheelYear],
  );

  // The days whose card is about to be shown: the one chosen, and the solemnities under the wheel
  const daysKey = [selected, ...milestones.filter((m) => m.kind === 'solemnity').map((m) => m.date)]
    .map(isoDate)
    .join(',');
  useEffect(() => {
    onNeedPreviews?.(daysKey.split(',').map(dateOfIso));
  }, [daysKey, onNeedPreviews]);

  const showMonth = (year: number, monthIndex: number) => {
    setShown({ year, month: monthIndex });
    setTab('month');
  };

  // Each tab opens on the year of the one before: the month of October 2026 is the year 2026 and
  // the liturgical year 2025–2026; today's year, today's liturgical year; and back
  const changeTab = (next: Tab) => {
    const around = (year: number, monthIndex: number) =>
      year === today.getFullYear() && (tab !== 'month' || monthIndex === today.getMonth())
        ? today
        : new Date(year, monthIndex, 15);
    if (next === 'year') {
      setOverviewYear(tab === 'wheel' ? (wheelYear === todayWheel ? today.getFullYear() : wheelYear + 1) : shown.year);
    } else if (next === 'wheel') {
      setWheelYear(liturgicalYearOf(tab === 'year' ? around(overviewYear, 5) : around(shown.year, shown.month)));
    }
    setTab(next);
  };

  const pickMilestone = (date: Date) => {
    setSelected(date);
    showMonth(date.getFullYear(), date.getMonth());
  };

  const arrow = (label: string, icon: 'back' | 'chevronRight', enabled: boolean, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      style={({ pressed }) => [styles.arrow, { opacity: !enabled ? 0.3 : pressed ? 0.6 : 1 }]}
    >
      <Icon name={icon} size={24} color={colors.accentText} strokeWidth={2.2} />
    </Pressable>
  );

  const title = (text: string, size: number) => (
    <Text
      testID="calendar-title"
      accessibilityRole="header"
      accessibilityLiveRegion="polite"
      maxFontSizeMultiplier={scale}
      {...fitLabel(text)}
      style={[styles.title, { fontSize: size, color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
    >
      {text}
    </Text>
  );

  const stepper = (
    text: string,
    unit: string,
    canGoBack: boolean,
    canGoForward: boolean,
    step: (delta: number) => void,
  ) => (
    <View style={styles.stepper}>
      {arrow(`${unit} anterior`, 'back', canGoBack, () => step(-1))}
      {title(text, 24)}
      {arrow(`${unit} següent`, 'chevronRight', canGoForward, () => step(1))}
    </View>
  );

  const body =
    month && ribbon ? (
      <>
        <View style={styles.header}>{title(month.title, 24)}</View>
        <MonthRibbon
          months={ribbon}
          onPick={(year, monthIndex) => setShown({ year, month: monthIndex })}
          bleed={SIDE}
        />
        <MonthGrid
          month={month}
          onPick={setSelected}
          onSwipe={(delta) => setShown(shiftMonth(shown.year, shown.month, delta))}
        />
        {/* Green until the year is loaded, the colour of most of the year: the key is always there */}
        <MonthKey color={month.color ?? 'V'} />
        <DayPreviewCard date={selected} card={previews[isoDate(selected)]} />
      </>
    ) : overview ? (
      <>
        {stepper(overview.title, 'Any', overview.canGoBack, overview.canGoForward, (delta) =>
          setOverviewYear(overviewYear + delta),
        )}
        <YearMonths overview={overview} columns={3} onPick={showMonth} />
        <YearKey />
      </>
    ) : wheel ? (
      <>
        {stepper(wheel.title, 'Any litúrgic', wheel.canGoBack, wheel.canGoForward, (delta) =>
          setWheelYear(wheelYear + delta),
        )}
        <LiturgicalYearWheel
          wheel={wheel}
          maxWidth={WHEEL_MAX_WIDTH}
          onPickDay={(date) => showMonth(date.getFullYear(), date.getMonth())}
        />
        <YearKey />
        <MilestoneList
          title={wheelIsToday ? 'Properament' : 'Dates principals'}
          rows={milestones.map((m) => milestoneRow(m, m.kind === 'solemnity' ? titleOf(previews[m.key]) : null))}
          onPick={pickMilestone}
        />
      </>
    ) : null;

  const column = [styles.column, { maxWidth: theme.layout.homeMaxWidth }];
  return (
    <View testID="calendar" style={[styles.screen, { backgroundColor: colors.sheet }]}>
      <View style={[column, styles.tabs]}>
        <SegmentedControl
          segments={TABS}
          value={tab}
          onChange={changeTab}
          accessibilityLabel="Com es mostra el calendari"
          testID="calendar-tabs"
        />
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: tab === 'month' ? footerHeight : insets.bottom + 24 }}
        automaticallyAdjustContentInsets={false}
        indicatorStyle={theme.scrollIndicator}
        scrollIndicatorInsets={{ bottom: tab === 'month' ? footerHeight : insets.bottom }}
      >
        <View style={[column, styles.body]}>{body}</View>
      </ScrollView>
      {/* The day touched is gone to from here, whatever has been scrolled */}
      {tab === 'month' ? (
        <View testID="calendar-footer" style={styles.footer} pointerEvents="box-none" onLayout={onFooterLayout}>
          <EdgeFade color={colors.sheet} height={FADE_HEIGHT} />
          <View
            style={[
              styles.actions,
              column,
              { backgroundColor: colors.sheet, paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <ActionButton label="Avui" variant="outlined" onPress={onToday} style={styles.action} />
            <ActionButton label="Selecciona" onPress={() => onChange(selected)} style={styles.action} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  column: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: SIDE,
  },
  tabs: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  body: {
    paddingTop: 10,
    gap: 14,
  },
  header: {
    minHeight: 40,
    justifyContent: 'center',
  },
  stepper: {
    minHeight: 44,
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
  title: {
    flexShrink: 1,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  action: {
    flex: 1,
  },
});
