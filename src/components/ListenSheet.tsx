import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fontFamilies, useTheme } from '../theme';
import BottomSheet from './BottomSheet';
import SegmentedControl from './SegmentedControl';
import ActionButton from './ActionButton';
import Icon from './Icon';

// Everything of the hour being read aloud: where it is, the parts back and forth, the pace, and
// stopping. The voice is synthetic and the sheet says so (Azure asks it of whoever uses its voices).
export type ListenSpeedChoice = 'slow' | 'normal' | 'fast';

const SPEEDS: { value: ListenSpeedChoice; label: string }[] = [
  { value: 'slow', label: 'Lenta' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Ràpida' },
];

interface ListenSheetProps {
  visible: boolean;
  onClose: () => void;
  // «Laudes»
  hour: string;
  // The part being said, and how far the hour is («2:51 de 13:00»)
  part: string;
  time: string;
  // 0 to 1
  progress: number;
  playing: boolean;
  // Why the phone's own voice is reading, if it is
  notice: string | null;
  speed: ListenSpeedChoice;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSpeed: (speed: ListenSpeedChoice) => void;
  onStop: () => void;
}

export default function ListenSheet(props: ListenSheetProps) {
  const { visible, onClose, hour, part, time, progress, playing, notice, speed } = props;
  const theme = useTheme();
  const { colors } = theme;
  const control = (name: 'previous' | 'next', label: string, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.jump, pressed && styles.pressed]}
    >
      <Icon name={name} size={30} color={colors.text} />
    </Pressable>
  );
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel={`Escoltant ${hour}`} testID="listen-sheet">
      <View style={styles.content}>
        <Text accessibilityRole="header" style={[styles.heading, { color: colors.text }]}>
          {`Escoltant ${hour}`}
        </Text>
        <Text numberOfLines={2} style={[styles.part, { color: colors.text2 }]}>
          {part}
        </Text>
        <View style={[styles.track, { backgroundColor: colors.chipBackground }]}>
          <View
            style={[styles.fill, { backgroundColor: colors.accentFill, width: `${Math.round(progress * 100)}%` }]}
          />
        </View>
        <Text style={[styles.time, { color: colors.text3 }]}>{time}</Text>
        <View style={styles.controls}>
          {control('previous', 'Part anterior', props.onPrevious)}
          <Pressable
            testID="listen-sheet-toggle"
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Pausa' : 'Continua escoltant'}
            onPress={props.onToggle}
            style={({ pressed }) => [styles.big, { backgroundColor: colors.accentFill }, pressed && styles.pressed]}
          >
            <Icon name={playing ? 'pause' : 'play'} size={28} color={colors.onAccent} />
          </Pressable>
          {control('next', 'Part següent', props.onNext)}
        </View>
        {notice ? <Text style={[styles.notice, { color: colors.text2 }]}>{notice}</Text> : null}
        <Text accessibilityRole="header" style={[styles.label, { color: colors.text }]}>
          Velocitat
        </Text>
        <SegmentedControl
          segments={SPEEDS}
          value={speed}
          onChange={props.onSpeed}
          accessibilityLabel="Velocitat"
          minHeight={theme.touch.comfortable}
        />
        <View style={styles.buttons}>
          <ActionButton label="Atura" variant="outlined" onPress={props.onStop} style={styles.button} />
          <ActionButton label="Fet" onPress={onClose} style={styles.button} />
        </View>
        <Text style={[styles.disclosure, { color: colors.text3 }]}>Veu sintètica</Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  heading: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 21,
  },
  part: {
    fontSize: 15,
    marginTop: -6,
  },
  track: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: 5,
  },
  time: {
    fontSize: 13,
    marginTop: -6,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 34,
  },
  jump: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  big: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: {
    fontSize: 14.5,
    textAlign: 'center',
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  button: {
    flex: 1,
  },
  disclosure: {
    fontSize: 12.5,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
