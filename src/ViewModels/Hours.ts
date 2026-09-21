import {SpecificLiturgyTimeType} from '../Services/CelebrationTimeEnums';
import {hasContent} from './content';

// The seven hours on the home, with the one of now marked.
export type HourKey = 'ofici' | 'laudes' | 'tercia' | 'sexta' | 'nona' | 'vespres' | 'completes';

// The prayer screen (LHDisplay) knows each hour by these names
export type HourScreenType = 'Ofici' | 'Laudes' | 'Tèrcia' | 'Sexta' | 'Nona' | 'Vespres' | 'Completes';

export interface HourTile {
    key: HourKey;
    // On the tile and in the header of the prayer
    label: string;
    screenType: HourScreenType;
    isNow: boolean;
    // Under "Vespres": the first Vespers of tomorrow's solemnity
    subtitle: string | null;
}

const HOURS: Array<[HourKey, string, HourScreenType]> = [
    ['ofici', 'Ofici de lectura', 'Ofici'],
    ['laudes', 'Laudes', 'Laudes'],
    ['tercia', 'Tèrcia', 'Tèrcia'],
    ['sexta', 'Sexta', 'Sexta'],
    ['nona', 'Nona', 'Nona'],
    ['vespres', 'Vespres', 'Vespres'],
    ['completes', 'Completes', 'Completes'],
];

// The hour of now, by the clock: the same bands the Hours tab has always used to put one in
// bold (HoursLiturgyButtonsComponent). The Office of Readings has none.
export function currentHour(hour: number): HourKey | null {
    if (hour > 5 && hour < 9) return 'laudes';
    if (hour > 8 && hour < 12) return 'tercia';
    if (hour > 11 && hour < 15) return 'sexta';
    if (hour > 14 && hour < 18) return 'nona';
    if (hour > 17 && hour <= 23) return 'vespres';
    if (hour >= 0 && hour < 2) return 'completes';
    return null;
}

// The title of the first Vespers, as the Hours tab showed it: not on Easter Sunday.
export function vespersSubtitle(vespersTitle: string, specificLiturgyTime: string): string | null {
    return hasContent(vespersTitle) && specificLiturgyTime !== SpecificLiturgyTimeType.EasterSunday
        ? vespersTitle
        : null;
}

export interface HoursInput {
    vespersTitle: string;
    specificLiturgyTime: string;
    // Hour of the day now, 0 to 23
    hour: number;
}

export function buildHours({vespersTitle, specificLiturgyTime, hour}: HoursInput): HourTile[] {
    const now = currentHour(hour);
    return HOURS.map(([key, label, screenType]) => ({
        key,
        label,
        screenType,
        isNow: key === now,
        subtitle: key === 'vespres' ? vespersSubtitle(vespersTitle, specificLiturgyTime) : null,
    }));
}
