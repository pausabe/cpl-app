import React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';
import {HourKey} from '../ViewModels/Hours';

// An arc with the sun at each place of the day: rising at Laudes, at the top at Sexta, setting
// at Vespres. Completes is the moon and the Office of Readings, the book.
const SUN: Partial<Record<HourKey, [number, number]>> = {
    laudes: [3.6, 16.2],
    tercia: [5.6, 12.6],
    sexta: [12, 10],
    nona: [18.4, 12.6],
    vespres: [20.4, 16.2],
};

export const HOUR_ICON_SIZE: Record<HourKey, number> = {
    ofici: 24, laudes: 26, tercia: 22, sexta: 22, nona: 22, vespres: 24, completes: 22,
};

interface HourIconProps {
    hour: HourKey;
    color: string;
    size?: number;
}

export default function HourIcon({hour, color, size = HOUR_ICON_SIZE[hour]}: HourIconProps) {
    const common = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants' as const,
        testID: `hour-icon-${hour}`,
    };
    if (hour === 'ofici') {
        return (
            <Svg {...common} strokeWidth={1.7}>
                <Path d="M12 7.5C10.4 5.9 8 5 3 5v13c5 0 7.4.9 9 2.5 1.6-1.6 4-2.5 9-2.5V5c-5 0-7.4.9-9 2.5zM12 7.5V20"/>
            </Svg>
        );
    }
    if (hour === 'completes') {
        return (
            <Svg {...common} strokeWidth={1.7}>
                <Path d="M19.5 14.2A7.5 7.5 0 1 1 9.8 4.5a6 6 0 0 0 9.7 9.7z"/>
            </Svg>
        );
    }
    const [cx, cy] = SUN[hour]!;
    return (
        <Svg {...common} strokeWidth={1.6}>
            <Path d="M3 19a9 9 0 0 1 18 0" strokeDasharray="1.6 2.4"/>
            <Path d="M1.5 19h21"/>
            <Circle cx={cx} cy={cy} r="2.4" fill={color} stroke="none"/>
        </Svg>
    );
}
