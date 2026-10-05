import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fitLabel, useTheme } from '../../theme';
import ActionButton from '../../components/ActionButton';
import BottomSheet from '../../components/BottomSheet';
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
import MonthRibbon from './calendar/MonthRibbon';
import MonthGrid from './calendar/MonthGrid';
import DayPreviewCard from './calendar/DayPreviewCard';
import { MonthKey, YearKey } from './calendar/CalendarKey';
import YearMonths from './calendar/YearMonths';
import LiturgicalYearWheel, { MilestoneList } from './calendar/LiturgicalYearWheel';

// Choosing another day: a month in a sheet that comes up from the bottom, like everything else
// the reader asks for, painted with the liturgical year. Every day is on its colour, as strong as
// its rank, and under the month the day touched says what it is before changing to it. A day is
// chosen with a touch and applied with "Canvia"; "Avui" goes back to today at once. Another month
// is a drag sideways or a touch on the row of months; the title of the month opens the whole
// year, in twelve small months or as the wheel of the liturgical year, with arrows from year to
// year. Days outside the database cannot be chosen. It closes by pulling it down, touching
// outside, or the back button on Android.
//
// What it paints comes from its controller: the colours of the years (marks) and what the home
// would show of a day (previews). It says which years and which days it is about to show.
interface CalendarSheetProps {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  marks?: DayMarks;
  previews?: Record<string, DayCard>;
  onNeedYears?: (years: number[]) => void;
  onNeedPreviews?: (dates: Date[]) => void;
  onClose: () => void;
  onToday: () => void;
  onChange: (date: Date) => void;
}

type Mode = 'month' | 'year';
type YearTab = 'months' | 'wheel';

// The content does not grow wider than this: on a tablet the sheet is much wider than a month
const CONTENT_MAX_WIDTH = 420;
// The side padding of the sheet, which the row of months goes over to reach the edges
const SHEET_PADDING = 20;
const NO_MARKS: DayMarks = {};
const NO_PREVIEWS: Record<string, DayCard> = {};

const TABS = [
  { value: 'months' as const, label: 'Mesos' },
  { value: 'wheel' as const, label: 'Any litúrgic' },
];

// The title of a solemnity under the wheel: its celebration, or the day itself (Easter Sunday)
const titleOf = (card: DayCard | undefined) => (card ? card.celebration?.title || card.title : null);

export default function CalendarSheet({
  visible,
  value,
  minimumDate,
  maximumDate,
  marks = NO_MARKS,
  previews = NO_PREVIEWS,
  onNeedYears,
  onNeedPreviews,
  onClose,
  onToday,
  onChange,
}: CalendarSheetProps) {
  const theme = useTheme();
  const { colors } = theme;
  const scale = theme.maxFontScaleForLabels;
  // Today, by its day: what the calendar marks does not change with the hour
  const todayKey = isoDate(new Date());
  const today = useMemo(() => dateOfIso(todayKey), [todayKey]);
  const [selected, setSelected] = useState(value);
  const [shown, setShown] = useState({ year: value.getFullYear(), month: value.getMonth() });
  const [mode, setMode] = useState<Mode>('month');
  const [tab, setTab] = useState<YearTab>('months');
  const [overviewYear, setOverviewYear] = useState(value.getFullYear());
  const [wheelYear, setWheelYear] = useState(liturgicalYearOf(value));

  // Every time it opens, at the month of the day being shown (the day, not the object that brings it)
  const valueKey = isoDate(value);
  useEffect(() => {
    if (!visible) return;
    setSelected(dateOfIso(valueKey));
    setShown({ year: dateOfIso(valueKey).getFullYear(), month: dateOfIso(valueKey).getMonth() });
    setMode('month');
    setTab('months');
  }, [visible, valueKey]);

  const todayWheel = liturgicalYearOf(today);
  const wheelIsToday = mode === 'year' && tab === 'wheel' && wheelYear === todayWheel;

  // The years about to be shown: the month's (and the next or the one before at the ends of the
  // year, ready for a drag), the year's, or the two of the liturgical year, and those of today
  // for what comes next
  const years =
    mode === 'month'
      ? [shown.year, ...(shown.month === 0 ? [shown.year - 1] : shown.month === 11 ? [shown.year + 1] : [])]
      : tab === 'months'
        ? [overviewYear]
        : [wheelYear, wheelYear + 1, ...(wheelIsToday ? [today.getFullYear(), today.getFullYear() + 1] : [])];
  const wantedYears = [...new Set(years)]
    .filter(
      (year) =>
        (!minimumDate || year >= minimumDate.getFullYear()) && (!maximumDate || year <= maximumDate.getFullYear()),
    )
    .sort((a, b) => a - b);
  const yearsKey = wantedYears.join(',');
  useEffect(() => {
    if (visible && yearsKey) onNeedYears?.(yearsKey.split(',').map(Number));
  }, [visible, yearsKey, onNeedYears]);

  // Only what is shown is worked out, and again only when what it depends on changes: the sheet
  // is there, closed, behind the home, and the home draws itself again every hour
  const showing: Mode | YearTab = mode === 'month' ? 'month' : tab;
  const month = useMemo(
    () =>
      showing === 'month'
        ? calendarMonth({ ...shown, selected, today, minimum: minimumDate, maximum: maximumDate, marks })
        : null,
    [showing, shown, selected, today, minimumDate, maximumDate, marks],
  );
  const ribbon = useMemo(
    () => (showing === 'month' ? monthRibbon({ ...shown, today, minimum: minimumDate, maximum: maximumDate }) : null),
    [showing, shown, today, minimumDate, maximumDate],
  );
  const overview = useMemo(
    () =>
      showing === 'months'
        ? yearOverview({ year: overviewYear, marks, today, shown, minimum: minimumDate, maximum: maximumDate })
        : null,
    [showing, overviewYear, marks, today, shown, minimumDate, maximumDate],
  );
  const wheel = useMemo(
    () =>
      showing === 'wheel'
        ? liturgicalWheel({ startYear: wheelYear, marks, today, minimum: minimumDate, maximum: maximumDate })
        : null,
    [showing, wheelYear, marks, today, minimumDate, maximumDate],
  );
  const milestones = useMemo(
    () => (showing === 'wheel' ? (wheelIsToday ? upcomingMilestones(marks, today) : keyDates(wheelYear, marks)) : []),
    [showing, wheelIsToday, marks, today, wheelYear],
  );

  // The days whose card is about to be shown: the one chosen, and the solemnities under the wheel
  const wantedDays = [selected, ...milestones.filter((m) => m.kind === 'solemnity').map((m) => m.date)];
  const daysKey = wantedDays.map(isoDate).join(',');
  useEffect(() => {
    if (visible) onNeedPreviews?.(daysKey.split(',').map(dateOfIso));
  }, [visible, daysKey, onNeedPreviews]);

  const showMonth = (year: number, monthIndex: number) => {
    setShown({ year, month: monthIndex });
    setMode('month');
  };

  const openYear = () => {
    setOverviewYear(shown.year);
    setWheelYear(liturgicalYearOf(shown.year === today.getFullYear() ? today : new Date(shown.year, 5, 15)));
    setMode('year');
  };

  // The year of one tab is taken to the other: 2026 is the liturgical year 2025–2026, the one of
  // today when it is today's year, and back
  const changeTab = (next: YearTab) => {
    if (next === 'wheel') {
      setWheelYear(liturgicalYearOf(overviewYear === today.getFullYear() ? today : new Date(overviewYear, 5, 15)));
    } else {
      setOverviewYear(wheelYear === todayWheel ? today.getFullYear() : wheelYear + 1);
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

  const title = (text: string, open: boolean, onPress: () => void, size: number) => (
    <Pressable
      testID="calendar-title"
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityHint={open ? 'Torna al mes' : 'Mostra l’any sencer'}
      accessibilityState={{ expanded: open }}
      accessibilityLiveRegion="polite"
      onPress={onPress}
      style={({ pressed }) => [styles.titleButton, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Text
        maxFontSizeMultiplier={scale}
        {...fitLabel(text)}
        style={[styles.title, { fontSize: size, color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
      >
        {text}
      </Text>
      <Icon name={open ? 'chevronUp' : 'chevronDown'} size={20} color={colors.accentText} strokeWidth={2.2} />
    </Pressable>
  );

  const header = month ? (
    <View style={styles.header}>{title(month.title, false, openYear, 22)}</View>
  ) : overview ? (
    <View style={[styles.header, styles.yearHeader]}>
      {arrow('Any anterior', 'back', overview.canGoBack, () => setOverviewYear(overviewYear - 1))}
      {title(overview.title, true, () => setMode('month'), 24)}
      {arrow('Any següent', 'chevronRight', overview.canGoForward, () => setOverviewYear(overviewYear + 1))}
    </View>
  ) : wheel ? (
    <View style={[styles.header, styles.yearHeader]}>
      {arrow('Any litúrgic anterior', 'back', wheel.canGoBack, () => setWheelYear(wheelYear - 1))}
      {title(wheel.title, true, () => setMode('month'), 24)}
      {arrow('Any litúrgic següent', 'chevronRight', wheel.canGoForward, () => setWheelYear(wheelYear + 1))}
    </View>
  ) : null;

  const body =
    month && ribbon ? (
      <>
        <MonthRibbon months={ribbon} onPick={showMonth} bleed={SHEET_PADDING} />
        <MonthGrid
          month={month}
          onPick={setSelected}
          onSwipe={(delta) => setShown(shiftMonth(shown.year, shown.month, delta))}
        />
        {month.color ? <MonthKey color={month.color} /> : null}
        <DayPreviewCard date={selected} card={previews[isoDate(selected)]} />
      </>
    ) : overview ? (
      <>
        <YearMonths overview={overview} onPick={showMonth} />
        <YearKey />
      </>
    ) : wheel ? (
      <>
        <LiturgicalYearWheel wheel={wheel} onPickDay={(date) => showMonth(date.getFullYear(), date.getMonth())} />
        <MilestoneList
          title={wheelIsToday ? 'Properament' : 'Dates principals'}
          rows={milestones.map((m) => milestoneRow(m, m.kind === 'solemnity' ? titleOf(previews[m.key]) : null))}
          onPick={pickMilestone}
        />
      </>
    ) : null;

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Tria un dia" testID="calendar">
      <View style={styles.content}>
        {header}
        {mode === 'year' ? (
          <SegmentedControl
            segments={TABS}
            value={tab}
            onChange={changeTab}
            accessibilityLabel="Com es mostra l’any"
            testID="calendar-year-tabs"
          />
        ) : null}
        {/* Only the middle gives way and scrolls on a small phone: the title and the buttons stay */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.body}
          indicatorStyle={theme.scrollIndicator}
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
        <View style={styles.actions}>
          <ActionButton label="Avui" variant="outlined" onPress={onToday} style={styles.action} />
          <ActionButton label="Canvia" onPress={() => onChange(selected)} style={styles.action} />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    // So that the middle, and not the title or the buttons, gives way inside the sheet
    flexShrink: 1,
    gap: 10,
  },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearHeader: {
    justifyContent: 'space-between',
  },
  arrow: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleButton: {
    flexShrink: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flexShrink: 1,
    fontVariant: ['tabular-nums'],
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
    marginHorizontal: -SHEET_PADDING,
  },
  body: {
    paddingHorizontal: SHEET_PADDING,
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  action: {
    flex: 1,
  },
});
