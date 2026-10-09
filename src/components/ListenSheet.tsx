import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fontFamilies, useTheme } from '../theme';
import BottomSheet from './BottomSheet';
import ActionButton from './ActionButton';
import Icon from './Icon';

// Everything of the hour being read aloud: where it is, the parts to go to (one by one, or any of
// them from the list), the pace, and stopping.

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
  // The parts of the hour, and which one is being said
  parts: { index: number; title: string }[];
  currentPart: number;
  // Percentage of the normal pace, and its limits
  speed: number;
  minSpeed: number;
  maxSpeed: number;
  speedStep: number;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onPart: (index: number) => void;
  onSpeed: (speed: number) => void;
  onStop: () => void;
}

export default function ListenSheet(props: ListenSheetProps) {
  const { visible, onClose, hour, part, time, progress, playing, parts, currentPart, speed } = props;
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
  const step = (sign: 1 | -1) => {
    const next = speed + sign * props.speedStep;
    const disabled = next < props.minSpeed || next > props.maxSpeed;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={sign > 0 ? 'Més de pressa' : 'Més a poc a poc'}
        accessibilityState={{ disabled }}
        disabled={disabled}
        hitSlop={8}
        onPress={() => props.onSpeed(next)}
        style={({ pressed }) => [
          styles.stepper,
          { borderColor: colors.border, backgroundColor: colors.chipBackground },
          disabled && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.stepperText, { color: colors.text }]}>{sign > 0 ? '+' : '−'}</Text>
      </Pressable>
    );
  };
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
        {parts.length > 1 ? (
          <>
            <Text accessibilityRole="header" style={[styles.label, { color: colors.text }]}>
              Parts
            </Text>
            <ScrollView style={[styles.parts, { borderColor: colors.border }]} nestedScrollEnabled>
              {parts.map((p) => {
                const current = p.index === currentPart;
                return (
                  <Pressable
                    key={p.index}
                    testID={`listen-part-${p.index}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: current }}
                    accessibilityLabel={`Ves a ${p.title}`}
                    onPress={() => props.onPart(p.index)}
                    style={({ pressed }) => [
                      styles.partRow,
                      { borderBottomColor: colors.divider },
                      current && { backgroundColor: colors.chipBackground },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.partText,
                        { color: current ? colors.accentText : colors.text },
                        current && styles.partCurrent,
                      ]}
                    >
                      {p.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        ) : null}
        <View style={styles.speedRow}>
          <Text accessibilityRole="header" style={[styles.label, { color: colors.text }]}>
            Velocitat
          </Text>
          <View style={styles.stepperRow}>
            {step(-1)}
            <Text style={[styles.speed, { color: colors.text }]}>{`${speed} %`}</Text>
            {step(1)}
          </View>
        </View>
        <View style={styles.buttons}>
          <ActionButton label="Atura" variant="outlined" onPress={props.onStop} style={styles.button} />
          <ActionButton label="Fet" onPress={onClose} style={styles.button} />
        </View>
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
  label: {
    fontSize: 17,
    fontWeight: '700',
  },
  parts: {
    maxHeight: 220,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    marginTop: -4,
  },
  partRow: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  partText: {
    fontSize: 15.5,
  },
  partCurrent: {
    fontWeight: '700',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: -2,
  },
  speed: {
    fontSize: 17,
    fontWeight: '600',
    minWidth: 62,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  button: {
    flex: 1,
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.6,
  },
});
