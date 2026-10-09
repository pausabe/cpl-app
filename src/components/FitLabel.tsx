import React, { useState } from 'react';
import { LayoutChangeEvent, StyleProp, StyleSheet, Text, TextProps, TextStyle, View } from 'react-native';

// A label in a box of fixed width (an hour, a segment, a reading, a button): a word keeps to one
// line, a name of more words can take two, and before a word is broken or cut the label gets
// smaller, down to 70 %. On a phone 320 px wide "Laudes" came out as "Lau / des".
//
// The size is worked out here, the same on both systems, and not with adjustsFontSizeToFit: on
// iOS (new architecture) React Native does not read minimumFontScale, so the only floor is 4 pt,
// and whenever iOS drew the label in a box narrower than it, it went down to that floor:
// «Vespres» and «Completes» on the home, tiny, in 9.2.4 and 9.2.5 (Pau's iPhone).
export const MIN_LABEL_SCALE = 0.7;

// How much smaller the label is drawn: as much as the room asks, never below the floor. Until
// both are measured, at its size.
export function labelScale(room: number, needed: number, minimum = MIN_LABEL_SCALE): number {
  if (room <= 0 || needed <= 0 || needed <= room) return 1;
  return Math.max(minimum, room / needed);
}

interface FitLabelProps extends Omit<TextProps, 'children' | 'numberOfLines' | 'style'> {
  children: string;
  style?: StyleProp<TextStyle>;
  minimumScale?: number;
}

export default function FitLabel({
  children: label,
  style,
  minimumScale = MIN_LABEL_SCALE,
  maxFontSizeMultiplier,
  allowFontScaling,
  ...textProps
}: FitLabelProps) {
  const words = label.split(' ').filter(Boolean);
  const numberOfLines = words.length > 1 ? 2 : 1;
  const [room, setRoom] = useState(0);
  const [needed, setNeeded] = useState(0);
  const scale = labelScale(room, needed, minimumScale);
  const fontSize = StyleSheet.flatten(style)?.fontSize ?? DEFAULT_FONT_SIZE;
  const scaling = { maxFontSizeMultiplier, allowFontScaling };
  const measure = (set: (width: number) => void) => (event: LayoutChangeEvent) => set(event.nativeEvent.layout.width);

  return (
    <View style={styles.box}>
      {/* At its full size and out of sight, in the label's place: the room it has there,
          whatever size it is drawn at */}
      <Text
        testID="fit-label-room"
        {...scaling}
        {...HIDDEN}
        numberOfLines={numberOfLines}
        onLayout={measure(setRoom)}
        style={[style, styles.invisible]}
      >
        {label}
      </Text>
      {/* Its widest word at its full size, with no width to keep to: the room it needs */}
      <View {...HIDDEN} pointerEvents="none" style={styles.unbounded}>
        <View testID="fit-label-needed" onLayout={measure(setNeeded)}>
          {words.map((word, index) => (
            <Text key={index} {...scaling} numberOfLines={1} style={style}>
              {word}
            </Text>
          ))}
        </View>
      </View>
      <View pointerEvents="box-none" style={styles.drawn}>
        <Text
          {...textProps}
          {...scaling}
          numberOfLines={numberOfLines}
          style={[style, scale < 1 ? { fontSize: fontSize * scale } : null]}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

// What React Native draws a Text at when its style has no size
const DEFAULT_FONT_SIZE = 14;

// Out of reach of VoiceOver and TalkBack: they hear the label once, from the one drawn
const HIDDEN = {
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no-hide-descendants',
} as const;

const styles = StyleSheet.create({
  box: {
    flexShrink: 1,
    minWidth: 0,
  },
  invisible: {
    opacity: 0,
  },
  unbounded: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 10000,
    alignItems: 'flex-start',
    opacity: 0,
  },
  drawn: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
