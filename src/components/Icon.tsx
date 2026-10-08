import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

// Line icons, drawn in the colour they are given. Decorative: whoever uses them names the
// button, not the icon.
export type IconName =
  | 'calendar'
  | 'settings'
  | 'back'
  | 'chevronRight'
  | 'chevronDown'
  | 'chevronUp'
  | 'mail'
  | 'card'
  | 'check'
  | 'close'
  | 'headphones'
  | 'play'
  | 'pause'
  | 'next'
  | 'previous';

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}

export default function Icon({ name, size = 24, color, strokeWidth }: IconProps) {
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
          <Rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
          <Path d="M3 9.5h18M8 2.5v4M16 2.5v4M7.5 13.5h2M11 13.5h2M14.5 13.5h2M7.5 17h2M11 17h2" />
        </Svg>
      );
    case 'settings':
      return (
        <Svg {...common} strokeWidth={strokeWidth ?? 1.7}>
          <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <Circle cx="12" cy="12" r="3" />
        </Svg>
      );
    case 'back':
      return (
        <Svg {...common} strokeWidth={strokeWidth ?? 2.2}>
          <Path d="M15 5.5L8.5 12l6.5 6.5" />
        </Svg>
      );
    case 'chevronRight':
      return (
        <Svg {...common} strokeWidth={strokeWidth ?? 2.4}>
          <Path d="M9 5.5l6.5 6.5L9 18.5" />
        </Svg>
      );
    case 'chevronDown':
      return (
        <Svg {...common} strokeWidth={strokeWidth ?? 2}>
          <Path d="M6 9.5l6 6 6-6" />
        </Svg>
      );
    case 'chevronUp':
      return (
        <Svg {...common} strokeWidth={strokeWidth ?? 2}>
          <Path d="M6 14.5l6-6 6 6" />
        </Svg>
      );
    case 'mail':
      return (
        <Svg {...common} strokeWidth={strokeWidth ?? 1.8}>
          <Rect x="3" y="5" width="18" height="14" rx="2.5" />
          <Path d="M3.5 7l8.5 6 8.5-6" />
        </Svg>
      );
    case 'card':
      return (
        <Svg {...common} strokeWidth={strokeWidth ?? 1.8}>
          <Rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <Path d="M2.5 10h19M6.5 15h4" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...common} strokeWidth={strokeWidth ?? 2.4}>
          <Path d="M5 12.5l4.5 4.5L19 7.5" />
        </Svg>
      );
    case 'close':
      return (
        <Svg {...common} strokeWidth={strokeWidth ?? 2.2}>
          <Path d="M6 6l12 12M18 6L6 18" />
        </Svg>
      );
    case 'headphones':
      return (
        <Svg {...common} strokeWidth={strokeWidth ?? 1.8}>
          <Path d="M3.5 17v-4.5a8.5 8.5 0 0 1 17 0V17" />
          <Path d="M20.5 18.5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3.5 18.5a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-3z" />
        </Svg>
      );
    // Play, pause and the jumps are filled: they are read at a glance, often from a car
    case 'play':
      return (
        <Svg {...common} stroke="none">
          <Path fill={color} d="M7 4.6v14.8a1 1 0 0 0 1.5.87l12.4-7.4a1 1 0 0 0 0-1.73L8.5 3.73A1 1 0 0 0 7 4.6z" />
        </Svg>
      );
    case 'pause':
      return (
        <Svg {...common} stroke="none">
          <Rect fill={color} x="5.5" y="4" width="4.6" height="16" rx="1.3" />
          <Rect fill={color} x="13.9" y="4" width="4.6" height="16" rx="1.3" />
        </Svg>
      );
    case 'next':
      return (
        <Svg {...common} stroke="none">
          <Path fill={color} d="M5 5.4v13.2a.9.9 0 0 0 1.4.75l9.5-6.6a.9.9 0 0 0 0-1.5L6.4 4.65A.9.9 0 0 0 5 5.4z" />
          <Rect fill={color} x="17" y="4.6" width="2.6" height="14.8" rx="1" />
        </Svg>
      );
    case 'previous':
      return (
        <Svg {...common} stroke="none">
          <Path fill={color} d="M19 5.4v13.2a.9.9 0 0 1-1.4.75l-9.5-6.6a.9.9 0 0 1 0-1.5l9.5-6.6A.9.9 0 0 1 19 5.4z" />
          <Rect fill={color} x="4.4" y="4.6" width="2.6" height="14.8" rx="1" />
        </Svg>
      );
  }
}
