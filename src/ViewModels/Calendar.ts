import {dayAndMonth, lowerFirst, monthName, weekdayName} from './CatalanText';

// The month grid of the calendar: weeks from Monday to Sunday, the day chosen, today, and the
// days outside the database left out.

// Monday first, as in a Catalan calendar
export const WEEKDAY_INITIALS = ['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'];

export interface CalendarDay {
    date: Date;
    day: number;
    // "dimarts, 15 de setembre": what a screen reader says for the day
    label: string;
    selected: boolean;
    today: boolean;
    // Outside the dates the database has
    disabled: boolean;
}

export interface CalendarMonth {
    year: number;
    month: number;
    // "setembre de 2026"
    title: string;
    // Rows of seven; a blank before the first day and after the last
    weeks: Array<Array<CalendarDay | null>>;
    canGoBack: boolean;
    canGoForward: boolean;
}

export interface CalendarInput {
    year: number;
    month: number;
    selected?: Date | null;
    today: Date;
    minimum?: Date | null;
    maximum?: Date | null;
}

const dayKey = (date: Date) => date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
const monthKey = (year: number, month: number) => year * 12 + month;

export function sameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
    return !!a && !!b && dayKey(a) === dayKey(b);
}

export function monthTitle(year: number, month: number): string {
    return `${monthName(month)} de ${year}`;
}

export function shiftMonth(year: number, month: number, delta: number): {year: number; month: number} {
    const index = monthKey(year, month) + delta;
    return {year: Math.floor(index / 12), month: ((index % 12) + 12) % 12};
}

export function dayLabel(date: Date): string {
    return `${lowerFirst(weekdayName(date.getDay()))}, ${dayAndMonth(date)}`;
}

export function isSelectable(date: Date, minimum?: Date | null, maximum?: Date | null): boolean {
    if (minimum && dayKey(date) < dayKey(minimum)) return false;
    if (maximum && dayKey(date) > dayKey(maximum)) return false;
    return true;
}

export function calendarMonth({year, month, selected, today, minimum, maximum}: CalendarInput): CalendarMonth {
    const first = new Date(year, month, 1);
    const blanksBefore = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<CalendarDay | null> = Array(blanksBefore).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        cells.push({
            date,
            day,
            label: dayLabel(date),
            selected: sameDay(date, selected),
            today: sameDay(date, today),
            disabled: !isSelectable(date, minimum, maximum),
        });
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: Array<Array<CalendarDay | null>> = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    return {
        year,
        month,
        title: monthTitle(year, month),
        weeks,
        canGoBack: !minimum || monthKey(year, month) > monthKey(minimum.getFullYear(), minimum.getMonth()),
        canGoForward: !maximum || monthKey(year, month) < monthKey(maximum.getFullYear(), maximum.getMonth()),
    };
}
