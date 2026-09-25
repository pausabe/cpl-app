import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { fitLabel, useTheme } from '../../theme';
import HourIcon from '../../components/HourIcon';
import { HourTile } from '../../view-models/hours';
import SectionLabel from './SectionLabel';

// The seven hours in three rows (Ofici de lectura · Laudes / Tèrcia · Sexta · Nona / Vespres ·
// Completes). The one of now is filled, and says "Ara" next to the name when there is room for
// it. The rows grow when there is room, up to a limit.
interface HoursGridProps {
  hours: HourTile[];
  onOpen: (tile: HourTile) => void;
}

const ROWS: string[][] = [
  ['ofici', 'laudes'],
  ['tercia', 'sexta', 'nona'],
  ['vespres', 'completes'],
];
export const MAX_HOURS_HEIGHT = 380;
const MIN_TILE_HEIGHT = 56;
const BADGE_GAP = 8;

export default function HoursGrid({ hours, onOpen }: HoursGridProps) {
  const byKey = new Map(hours.map((tile) => [tile.key as string, tile]));
  return (
    <View style={styles.section}>
      <SectionLabel>Litúrgia de les Hores</SectionLabel>
      <View style={styles.grid}>
        {ROWS.map((row, index) => (
          <View key={index} style={styles.row}>
            {row.map((key) => {
              const tile = byKey.get(key);
              return tile ? <Tile key={key} tile={tile} compact={row.length === 3} onOpen={onOpen} /> : null;
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

function Tile({ tile, compact, onOpen }: { tile: HourTile; compact: boolean; onOpen: (tile: HourTile) => void }) {
  const theme = useTheme();
  const { colors } = theme;
  const now = tile.isNow;
  const foreground = now ? colors.onAccent : colors.text;
  const scale = theme.maxFontScaleForLabels;

  // "Ara" only next to the name, and only if both fit on the line at their full size. The minor
  // hours, three to a row, never have room for it on a phone; on a narrow one Laudes neither.
  // Then the filled tile says it alone, and the screen reader still hears "Ara".
  const withBadge = now && !compact;
  const [room, setRoom] = useState({ line: 0, needed: 0 });
  const badgeFits = withBadge && room.line > 0 && room.needed > 0 && room.needed <= room.line;
  const measureLine = (event: LayoutChangeEvent) => {
    const line = event.nativeEvent.layout.width;
    setRoom((current) => (current.line === line ? current : { ...current, line }));
  };
  const measureNeeded = (event: LayoutChangeEvent) => {
    const needed = event.nativeEvent.layout.width;
    setRoom((current) => (current.needed === needed ? current : { ...current, needed }));
  };
  const badge = (testID?: string) => (
    <View testID={testID} style={styles.badge}>
      <Text maxFontSizeMultiplier={scale} style={[styles.badgeText, { color: colors.accentFill }]}>
        Ara
      </Text>
    </View>
  );
  return (
    <Pressable
      testID={`hour-${tile.key}`}
      accessibilityRole="button"
      accessibilityLabel={tile.label}
      accessibilityValue={now ? { text: 'Ara' } : undefined}
      accessibilityHint={tile.subtitle ?? undefined}
      onPress={() => onOpen(tile)}
      style={({ pressed }) => [
        styles.tile,
        compact ? styles.compact : styles.wide,
        {
          borderRadius: theme.radius.tile,
          backgroundColor: now ? colors.accentFill : colors.surface,
          borderColor: now ? colors.accentFill : colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <HourIcon hour={tile.key} color={now ? colors.onAccent : colors.accentText} />
      <View style={compact ? styles.compactLabels : styles.labels}>
        <View testID={`hour-${tile.key}-title`} style={styles.titleLine} onLayout={withBadge ? measureLine : undefined}>
          <Text
            maxFontSizeMultiplier={scale}
            {...fitLabel(tile.label)}
            style={[styles.label, { color: foreground, fontWeight: now ? '700' : '500' }]}
          >
            {tile.label}
          </Text>
          {badgeFits ? badge('hour-now-badge') : null}
        </View>
        {tile.subtitle ? (
          <Text
            maxFontSizeMultiplier={scale}
            numberOfLines={1}
            style={[styles.subtitle, { color: now ? colors.onAccent : colors.rubric }]}
          >
            {tile.subtitle}
          </Text>
        ) : null}
      </View>
      {withBadge ? (
        // The name and "Ara" side by side at their full size, out of sight and out of
        // reach: how much room the two need
        <View
          testID={`hour-${tile.key}-measure`}
          pointerEvents="none"
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
          onLayout={measureNeeded}
          style={styles.measure}
        >
          <Text maxFontSizeMultiplier={scale} numberOfLines={1} style={[styles.label, { fontWeight: '700' }]}>
            {tile.label}
          </Text>
          {badge()}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    flexGrow: 1,
    flexShrink: 0,
    maxHeight: MAX_HOURS_HEIGHT,
    gap: 8,
  },
  grid: {
    flexGrow: 1,
    gap: 8,
  },
  row: {
    flexGrow: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: MIN_TILE_HEIGHT,
  },
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 6,
  },
  wide: {
    paddingLeft: 12,
    paddingRight: 10,
    gap: 10,
  },
  compact: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    gap: 8,
  },
  labels: {
    flex: 1,
    minWidth: 0,
  },
  compactLabels: {
    flexShrink: 1,
    minWidth: 0,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: BADGE_GAP,
  },
  measure: {
    position: 'absolute',
    left: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: BADGE_GAP,
    opacity: 0,
  },
  label: {
    fontSize: 16.5,
    lineHeight: 19,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 15,
  },
  badge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
