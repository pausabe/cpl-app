import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from '../theme';
import ActionButton from './ActionButton';
import Icon from './Icon';
import NewBadge from './NewBadge';
import type { TourRect } from './TourTarget';
import type { TourItemIcon } from '../view-models/tour';

// The tour of what is new, over the app: the screen dimmed, a hole where the thing it talks about
// is, and a bubble with a few words that points at it. With nothing to point at, a card in the
// middle. The hole has the round corners of its ring: with four dimmed rectangles around it, its
// corners were square (Pau, 9 October 2026). Big words and big buttons: it is read by older people.

interface TourOverlayProps {
  rect: TourRect | null;
  // The real thing can be touched through the hole (the headphones of the hint)
  holeTouchable?: boolean;
  // «Nou», over the text
  isNew?: boolean;
  title?: string;
  text: string;
  // Under the text, smaller
  detail?: string;
  // At the bottom, smaller still
  footnote?: string;
  // What is coming, one line each (the first card)
  items?: { icon: TourItemIcon; label: string }[];
  // «2 de 3», with a dot per step
  progress: { at: number; of: number } | null;
  // The button that goes on («Som-hi», «Següent», «Fet», «D’acord»)
  primary: string;
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
const MAX_BUBBLE_WIDTH = 440;
const HOLE_PADDING = 6;
const HOLE_RADIUS = 16;
const RING_WIDTH = 3;
// The point of the bubble towards the hole: a square turned, half of it out
const POINT = 16;
const POINT_GAP = 14;
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
  holeTouchable = false,
  isNew = false,
  title,
  text,
  detail,
  footnote,
  items,
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
  // Touches on the dimmed part go nowhere
  const block = { onStartShouldSetResponder: () => true };
  const bubbleWidth = Math.min(width - 2 * MARGIN, MAX_BUBBLE_WIDTH);
  // A card closing the tour has one button, the whole width; a bubble keeps it on the right
  const wideButton = !secondary && !rect;

  const hole = rect
    ? {
        x: Math.max(0, rect.x - HOLE_PADDING),
        y: Math.max(0, rect.y - HOLE_PADDING),
        width: rect.width + 2 * HOLE_PADDING,
        height: rect.height + 2 * HOLE_PADDING,
      }
    : null;
  // The bubble goes on the side of the hole with more room
  const below = hole ? height - (hole.y + hole.height) >= hole.y : false;
  const point = hole
    ? Math.min(Math.max(hole.x + hole.width / 2 - (width - bubbleWidth) / 2 - POINT / 2, 20), bubbleWidth - 20 - POINT)
    : 0;

  const bubble = (
    <View
      testID="tour-bubble"
      accessibilityViewIsModal={true}
      style={[styles.bubble, { backgroundColor: colors.sheet, width: bubbleWidth }]}
    >
      {hole ? (
        <View
          pointerEvents="none"
          style={[
            styles.point,
            { backgroundColor: colors.sheet, left: point },
            below ? { top: -POINT / 2 } : { bottom: -POINT / 2 },
          ]}
        />
      ) : null}
      {progress ? (
        <View style={styles.progress} accessible={true} accessibilityLabel={`Pas ${progress.at} de ${progress.of}`}>
          <View style={styles.dots}>
            {Array.from({ length: progress.of }, (_, i) => (
              <View
                key={i}
                style={[styles.dot, { backgroundColor: i < progress.at ? colors.accentFill : colors.border }]}
              />
            ))}
          </View>
          <Text style={[styles.progressText, { color: colors.text3 }]}>{`${progress.at} de ${progress.of}`}</Text>
        </View>
      ) : null}
      {isNew ? <NewBadge /> : null}
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
      {items ? (
        <View style={styles.items}>
          {items.map((item) => (
            <View key={item.label} style={styles.item}>
              <View style={[styles.itemIcon, { backgroundColor: colors.homeBackground }]}>
                <Icon name={item.icon} size={24} color={colors.accentText} />
              </View>
              <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {detail ? <Text style={[styles.detail, { color: colors.text2 }]}>{detail}</Text> : null}
      {action ? (
        <ActionButton testID="tour-action" variant="outlined" label={action.label} onPress={action.onPress} />
      ) : null}
      {footnote ? <Text style={[styles.footnote, { color: colors.text3 }]}>{footnote}</Text> : null}
      <View style={[styles.buttons, !secondary && styles.buttonsAlone]}>
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
        ) : null}
        <ActionButton
          testID="tour-next"
          label={primary}
          onPress={onPrimary}
          style={wideButton ? styles.primaryWide : styles.primary}
        />
      </View>
    </View>
  );

  if (!hole) {
    return (
      <View testID="tour" style={[StyleSheet.absoluteFill, styles.centre, { backgroundColor: DIM }]} {...block}>
        {bubble}
      </View>
    );
  }

  const radius = Math.min(HOLE_RADIUS, hole.width / 2, hole.height / 2);
  // Touches on the four sides of the hole go nowhere; they are not drawn, the dimming is
  const blocker = (place: object) => <View style={[styles.blocker, place]} {...block} />;
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
          stroke={colors.tourRing}
          strokeWidth={RING_WIDTH}
        />
      </Svg>
      {blocker({ top: 0, left: 0, right: 0, height: hole.y })}
      {blocker({ top: hole.y + hole.height, left: 0, right: 0, bottom: 0 })}
      {blocker({ top: hole.y, left: 0, width: hole.x, height: hole.height })}
      {blocker({ top: hole.y, left: hole.x + hole.width, right: 0, height: hole.height })}
      {/* The hole itself only lets touches through when the step says so */}
      {holeTouchable ? null : blocker({ top: hole.y, left: hole.x, width: hole.width, height: hole.height })}
      <View
        pointerEvents="box-none"
        style={[
          styles.bubbleRow,
          below ? { top: hole.y + hole.height + POINT_GAP } : { bottom: height - hole.y + POINT_GAP },
        ]}
      >
        {bubble}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blocker: {
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
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 10,
  },
  point: {
    position: 'absolute',
    width: POINT,
    height: POINT,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
  text: {
    fontSize: 18,
    lineHeight: 26,
  },
  items: {
    gap: 10,
    paddingTop: 4,
    paddingBottom: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  },
  detail: {
    fontSize: 16,
    lineHeight: 23,
  },
  footnote: {
    fontSize: 14,
    lineHeight: 19,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 12,
  },
  buttonsAlone: {
    justifyContent: 'flex-end',
  },
  secondary: {
    minHeight: 52,
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 17,
  },
  primary: {
    minWidth: 150,
  },
  primaryWide: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
});
