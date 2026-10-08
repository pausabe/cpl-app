import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import Icon from './Icon';

// The small player at the foot of the prayer while an hour is being read aloud: play or pause, the
// part being said, how far it is, the jump to the next part, and the cross that stops it and takes
// it away. Touching the rest opens the sheet with everything (ListenSheet).
interface ListenBarProps {
  playing: boolean;
  // The part being said («Salm 50. Oració de penediment») and what goes under it
  title: string;
  subtitle: string;
  // 0 to 1
  progress: number;
  onToggle: () => void;
  onNext: () => void;
  onOpen: () => void;
  onClose: () => void;
}

export default function ListenBar({
  playing,
  title,
  subtitle,
  progress,
  onToggle,
  onNext,
  onOpen,
  onClose,
}: ListenBarProps) {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  return (
    <View
      testID="listen-bar"
      style={[
        styles.bar,
        { backgroundColor: colors.sheet, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 10) },
      ]}
    >
      <View style={[styles.track, { backgroundColor: colors.chipBackground }]}>
        <View style={[styles.fill, { backgroundColor: colors.accentFill, width: `${Math.round(progress * 100)}%` }]} />
      </View>
      <View style={styles.row}>
        <Pressable
          testID="listen-toggle"
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pausa' : 'Continua escoltant'}
          hitSlop={8}
          onPress={onToggle}
          style={({ pressed }) => [styles.toggle, { backgroundColor: colors.accentFill }, pressed && styles.pressed]}
        >
          <Icon name={playing ? 'pause' : 'play'} size={20} color={colors.onAccent} />
        </Pressable>
        <Pressable
          testID="listen-open"
          accessibilityRole="button"
          accessibilityLabel={`${title}. ${subtitle}. Obre el reproductor`}
          onPress={onOpen}
          style={styles.texts}
        >
          <Text numberOfLines={1} maxFontSizeMultiplier={1.4} style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
          <Text numberOfLines={1} maxFontSizeMultiplier={1.4} style={[styles.subtitle, { color: colors.text3 }]}>
            {subtitle}
          </Text>
        </Pressable>
        <Pressable
          testID="listen-next"
          accessibilityRole="button"
          accessibilityLabel="Part següent"
          hitSlop={8}
          onPress={onNext}
          style={({ pressed }) => [styles.next, pressed && styles.pressed]}
        >
          <Icon name="next" size={24} color={colors.text2} />
        </Pressable>
        <Pressable
          testID="listen-close"
          accessibilityRole="button"
          accessibilityLabel="Deixa d'escoltar"
          hitSlop={8}
          onPress={onClose}
          style={({ pressed }) => [styles.next, pressed && styles.pressed]}
        >
          <Icon name="close" size={22} color={colors.text2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  fill: {
    height: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13.5,
    marginTop: 1,
  },
  next: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
