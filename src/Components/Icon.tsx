import React from 'react';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

// Line icons, drawn in the colour they are given. Decorative: whoever uses them names the
// button, not the icon.
export type IconName =
    'calendar' | 'settings' | 'back' | 'chevronRight' | 'chevronDown' | 'mail' | 'card' | 'check' | 'close';

interface IconProps {
    name: IconName;
    size?: number;
    color: string;
    strokeWidth?: number;
}

export default function Icon({name, size = 24, color, strokeWidth}: IconProps) {
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
    };
    switch (name) {
        case 'calendar':
            return (
                <Svg {...common} strokeWidth={strokeWidth ?? 1.8}>
                    <Rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/>
                    <Path d="M3 9.5h18M8 2.5v4M16 2.5v4M7.5 13.5h2M11 13.5h2M14.5 13.5h2M7.5 17h2M11 17h2"/>
                </Svg>
            );
        case 'settings':
            return (
                <Svg {...common} strokeWidth={strokeWidth ?? 1.7}>
                    <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <Circle cx="12" cy="12" r="3"/>
                </Svg>
            );
        case 'back':
            return (
                <Svg {...common} strokeWidth={strokeWidth ?? 2.2}>
                    <Path d="M15 5.5L8.5 12l6.5 6.5"/>
                </Svg>
            );
        case 'chevronRight':
            return (
                <Svg {...common} strokeWidth={strokeWidth ?? 2.4}>
                    <Path d="M9 5.5l6.5 6.5L9 18.5"/>
                </Svg>
            );
        case 'chevronDown':
            return (
                <Svg {...common} strokeWidth={strokeWidth ?? 2}>
                    <Path d="M6 9.5l6 6 6-6"/>
                </Svg>
            );
        case 'mail':
            return (
                <Svg {...common} strokeWidth={strokeWidth ?? 1.8}>
                    <Rect x="3" y="5" width="18" height="14" rx="2.5"/>
                    <Path d="M3.5 7l8.5 6 8.5-6"/>
                </Svg>
            );
        case 'card':
            return (
                <Svg {...common} strokeWidth={strokeWidth ?? 1.8}>
                    <Rect x="2.5" y="5" width="19" height="14" rx="2.5"/>
                    <Path d="M2.5 10h19M6.5 15h4"/>
                </Svg>
            );
        case 'check':
            return (
                <Svg {...common} strokeWidth={strokeWidth ?? 2.4}>
                    <Path d="M5 12.5l4.5 4.5L19 7.5"/>
                </Svg>
            );
        case 'close':
            return (
                <Svg {...common} strokeWidth={strokeWidth ?? 2.2}>
                    <Path d="M6 6l12 12M18 6L6 18"/>
                </Svg>
            );
    }
}
