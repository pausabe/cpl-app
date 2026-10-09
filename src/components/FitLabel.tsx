import React, { useState } from 'react';
import { LayoutChangeEvent, StyleProp, StyleSheet, Text, TextProps, TextStyle, View } from 'react-native';

// A label in a box of fixed size (an hour, a segment, a reading, a button): a word keeps to one
// line, a name of more words can take two, and before a word is broken or cut the label gets
// smaller, down to 70 %. On a phone 320 px wide "Laudes" came out as "Lau / des"; with the
// system's text at its largest, the tile of the hour has room for one line and a half.
//
// The size is worked out here, the same on both systems, and not with adjustsFontSizeToFit: on
// iOS (new architecture) React Native does not read minimumFontScale, so the only floor is 4 pt,
// and whenever iOS drew the label in a box narrower than it, it went down to that floor:
// «Vespres» and «Completes» on the home, tiny, in 9.2.4 and 9.2.5 (Pau's iPhone).
export const MIN_LABEL_SCALE = 0.7;

interface Size {
  width: number;
  height: number;
}

export interface LabelMeasures {
  // The box the label has, as laid out at its full size
  room: Size;
  // At its full size: the whole label on one line, and its widest word
  line: Size;
  word: number;
  words: number;
}

// What a label at its full size does not take into account: rounding to the pixel
const SLACK = 0.5;
// And what it leaves when it is drawn smaller, so that the last line is not cut by a hair
const MARGIN = 0.98;

// How much smaller the label is drawn: on one line, or on two if it has more than a word,
// whichever lets it be bigger; never below the floor. Until everything is measured, at its size.
export function labelScale({ room, line, word, words }: LabelMeasures, minimum = MIN_LABEL_SCALE): number {
  if (room.width <= 0 || room.height <= 0 || line.width <= 0 || line.height <= 0 || word <= 0) return 1;
  const fits = (width: number, height: number) => width <= room.width + SLACK && height <= room.height + SLACK;
  if (fits(line.width, line.height) || (words > 1 && fits(word, 2 * line.height))) return 1;
  const oneLine = Math.min(room.width / line.width, room.height / line.height);
  const twoLines = words > 1 ? Math.min(room.width / word, room.height / (2 * line.height)) : 0;
  return Math.min(1, Math.max(minimum, Math.max(oneLine, twoLines) * MARGIN));
}

interface FitLabelProps extends Omit<TextProps, 'children' | 'numberOfLines' | 'style'> {
  children: string;
  style?: StyleProp<TextStyle>;
  minimumScale?: number;
}

const UNMEASURED: Size = { width: 0, height: 0 };

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
  const [room, setRoom] = useState(UNMEASURED);
  const [line, setLine] = useState(UNMEASURED);
  const [word, setWord] = useState(0);
  const scale = labelScale({ room, line, word, words: words.length }, minimumScale);
  const { fontSize = DEFAULT_FONT_SIZE, lineHeight } = StyleSheet.flatten(style) ?? {};
  const scaling = { maxFontSizeMultiplier, allowFontScaling };
  const size = (set: (size: Size) => void) => (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    set({ width, height });
  };

  return (
    <View style={styles.box}>
      {/* At its full size and out of sight, in the label's place: the room it has there,
          whatever size it is drawn at */}
      <Text
        testID="fit-label-room"
        {...scaling}
        {...HIDDEN}
        numberOfLines={numberOfLines}
        onLayout={size(setRoom)}
        style={[style, styles.invisible]}
      >
        {label}
      </Text>
      {/* At its full size, with no width to keep to: the whole label on one line, and its
          widest word */}
      <View {...HIDDEN} pointerEvents="none" style={styles.unbounded}>
        <Text testID="fit-label-line" {...scaling} numberOfLines={1} onLayout={size(setLine)} style={style}>
          {label}
        </Text>
        <View testID="fit-label-word" onLayout={size(({ width }) => setWord(width))}>
          {words.map((each, index) => (
            <Text key={index} {...scaling} numberOfLines={1} style={style}>
              {each}
            </Text>
          ))}
        </View>
      </View>
      <View pointerEvents="box-none" style={styles.drawn}>
        <Text
          {...textProps}
          {...scaling}
          numberOfLines={numberOfLines}
          style={[
            style,
            scale < 1 ? { fontSize: fontSize * scale, lineHeight: lineHeight ? lineHeight * scale : undefined } : null,
          ]}
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
