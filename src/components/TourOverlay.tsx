import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from '../theme';
import ActionButton from './ActionButton';
import type { TourRect } from './TourTarget';

// The tour of what is new, over the app: the screen dimmed, a hole where the thing it talks about
// is (the real button, which can be touched when the step asks for it), and a bubble with a few
// words. With nothing to point at, a card in the middle. The hole has the round corners of its ring:
// with four dimmed rectangles around it, its corners were square (Pau, 9 October 2026).

interface TourOverlayProps {
  rect: TourRect | null;
  title?: string;
  text: string;
  // «2 de 9»
  progress: string | null;
  // The button of the bubble («Següent», «Som-hi», «Fet»); null when what goes on is touching the hole
  primary: string | null;
  onPrimary: () => void;
  // Leaving the tour (the last step has nothing to leave)
  secondary: string | null;
  onSecondary: () => void;
  // A drawing over the words (the widget of the home screen)
  illustration?: React.ReactNode;
  // A button of the step besides the one that goes on («Posa-la a l’inici»)
  action?: { label: string; onPress: () => void } | null;
}

const MARGIN = 16;
const HOLE_PADDING = 6;
const HOLE_RADIUS = 16;
const RING_WIDTH = 2.5;
const BUBBLE_ROOM = 230;
const DIM = 'rgba(0,0,0,0.62)';
// Bigger than any screen: the drawing cuts what goes beyond its edges
const FAR = 10000;

// The whole screen with a rounded rectangle taken out of it (evenodd: the inner one is a hole)
function dimmedAround(x: number, y: number, w: number, h: number, r: number) {
  const outer = `M0 0H${FAR}V${FAR}H0Z`;
  const inner =
    `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}` +
    `A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}` +
    `V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  return outer + inner;
}

export default function TourOverlay({
  rect,
  title,
  text,
  progress,
  primary,
  onPrimary,
  secondary,
  onSecondary,
  illustration,
  action,
}: TourOverlayProps) {
  const theme = useTheme();
  const { colors } = theme;
  const { width, height } = useWindowDimensions();
  const dim = { backgroundColor: DIM };
  // Touches on the dimmed part go nowhere
  const block = { onStartShouldSetResponder: () => true };

  const bubble = (
    <View
      testID="tour-bubble"
      accessibilityViewIsModal={true}
      style={[styles.bubble, { backgroundColor: colors.sheet, maxWidth: Math.min(width - 2 * MARGIN, 440) }]}
    >
      {progress ? <Text style={[styles.progress, { color: colors.text3 }]}>{progress}</Text> : null}
      {title ? (
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
        >
          {title}
        </Text>
      ) : null}
      {illustration}
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
      {action ? <ActionButton testID="tour-action" label={action.label} onPress={action.onPress} /> : null}
      <View style={styles.buttons}>
        {secondary ? (
          <Pressable
            testID="tour-leave"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onSecondary}
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          >
            <Text style={[styles.secondaryText, { color: colors.text2 }]}>{secondary}</Text>
          </Pressable>
        ) : (
          <View />
        )}
        {primary ? (
          <ActionButton testID="tour-next" label={primary} onPress={onPrimary} style={styles.primary} />
        ) : null}
      </View>
    </View>
  );

  if (!rect) {
    return (
      <View testID="tour" style={[StyleSheet.absoluteFill, dim, styles.centre]} {...block}>
        {bubble}
      </View>
    );
  }

  const hole = {
    x: Math.max(0, rect.x - HOLE_PADDING),
    y: Math.max(0, rect.y - HOLE_PADDING),
    width: rect.width + 2 * HOLE_PADDING,
    height: rect.height + 2 * HOLE_PADDING,
  };
  const radius = Math.min(HOLE_RADIUS, hole.width / 2, hole.height / 2);
  const below = height - (hole.y + hole.height) >= BUBBLE_ROOM || hole.y < BUBBLE_ROOM;
  // Touches on the four sides of the hole go nowhere; they are not drawn, the dimming is
  const blocker = (place: object) => <View style={[styles.dim, place]} {...block} />;
  return (
    <View testID="tour" style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Svg testID="tour-hole" pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Path d={dimmedAround(hole.x, hole.y, hole.width, hole.height, radius)} fill={DIM} fillRule="evenodd" />
        {/* The ring, inside the hole and with its same corners */}
        <Rect
          x={hole.x + RING_WIDTH / 2}
          y={hole.y + RING_WIDTH / 2}
          width={hole.width - RING_WIDTH}
          height={hole.height - RING_WIDTH}
          rx={radius - RING_WIDTH / 2}
          fill="none"
          stroke={colors.accentFill}
          strokeWidth={RING_WIDTH}
        />
      </Svg>
      {blocker({ top: 0, left: 0, right: 0, height: hole.y })}
      {blocker({ top: hole.y + hole.height, left: 0, right: 0, bottom: 0 })}
      {blocker({ top: hole.y, left: 0, width: hole.x, height: hole.height })}
      {blocker({ top: hole.y, left: hole.x + hole.width, right: 0, height: hole.height })}
      {/* The hole itself only lets touches through when the step asks for a touch */}
      {primary ? blocker({ top: hole.y, left: hole.x, width: hole.width, height: hole.height }) : null}
      <View
        pointerEvents="box-none"
        style={[styles.bubbleRow, below ? { top: hole.y + hole.height + 12 } : { bottom: height - hole.y + 12 }]}
      >
        {bubble}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: 'absolute',
  },
  centre: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: MARGIN,
  },
  bubbleRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: MARGIN,
  },
  bubble: {
    width: '100%',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 8,
  },
  progress: {
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 21,
    lineHeight: 27,
  },
  text: {
    fontSize: 16.5,
    lineHeight: 23,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 12,
  },
  secondary: {
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 15.5,
  },
  primary: {
    minWidth: 120,
  },
  pressed: {
    opacity: 0.6,
  },
});
