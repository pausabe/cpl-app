import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

// A fade from transparent to a colour: what scrolls under a bar that stays at the bottom
// disappears into it instead of being cut, and a row that scrolls sideways fades at its ends.
// It lets touches through.
interface EdgeFadeProps {
  color: string;
  // The depth of the fade: its height at the bottom, its width at a side
  height: number;
  // At the bottom (the default), or over the left or the right end of a row
  side?: 'bottom' | 'left' | 'right';
}

export default function EdgeFade({ color, height, side = 'bottom' }: EdgeFadeProps) {
  const id = `fade-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
  const across = side !== 'bottom';
  // The gradient goes towards the edge: down, to the left or to the right
  const direction = side === 'bottom' ? { x2: '0', y2: '1' } : side === 'right' ? { x2: '1', y2: '0' } : null;
  return (
    <View
      pointerEvents="none"
      style={[
        across ? [styles.side, side === 'left' ? styles.left : styles.right, { width: height }] : styles.fade,
        across ? null : { height },
      ]}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={across ? height : '100%'} height={across ? '100%' : height}>
        <Defs>
          {direction ? (
            <LinearGradient id={id} x1="0" y1="0" x2={direction.x2} y2={direction.y2}>
              <Stop offset="0" stopColor={color} stopOpacity="0" />
              <Stop offset="1" stopColor={color} stopOpacity="1" />
            </LinearGradient>
          ) : (
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={color} stopOpacity="1" />
              <Stop offset="1" stopColor={color} stopOpacity="0" />
            </LinearGradient>
          )}
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fade: {
    width: '100%',
  },
  side: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  left: {
    left: 0,
  },
  right: {
    right: 0,
  },
});
