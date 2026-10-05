import React, { useEffect } from 'react';
import * as LiturgyStore from './liturgyStore';
import * as CalendarStore from './calendarStore';
import CalendarScreen from '../views/calendar/CalendarScreen';
import { isoDate } from '../view-models/calendar';

// Calendari. It paints with what the calendar store has, and asks it for the years and the days
// the screen is about to show. A day chosen goes back to the home, which loads it as always: the
// home is the only one that changes the day shown.
export default function CalendarController({ navigation }: { navigation: any }) {
  const { day, database } = LiturgyStore.useLiturgy();
  const { marks, previews } = CalendarStore.useCalendarData();

  // Whatever changed since the home last asked, it is known before the first year is asked for
  useEffect(() => CalendarStore.prepare(), []);

  const goTo = (date: Date) => navigation.popTo('Home', { showDate: isoDate(date) });

  if (!day.today.date) return null;
  return (
    <CalendarScreen
      value={day.today.date}
      minimumDate={database.minimumSelectableDate}
      maximumDate={database.maximumSelectableDate}
      marks={marks}
      previews={previews}
      onNeedYears={CalendarStore.needYears}
      onNeedPreviews={CalendarStore.needPreviews}
      onToday={() => goTo(new Date())}
      onChange={goTo}
    />
  );
}
