import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

// A fade from transparent to a colour: what scrolls under a bar that stays at the bottom
// disappears into it instead of being cut. It lets touches through.
interface EdgeFadeProps {
  color: string;
  height: number;
}

export default function EdgeFade({ color, height }: EdgeFadeProps) {
  const id = `fade-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
  return (
    <View
      pointerEvents="none"
      style={[styles.fade, { height }]}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width="100%" height={height}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0" />
            <Stop offset="1" stopColor={color} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height={height} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fade: {
    width: '100%',
  },
});
