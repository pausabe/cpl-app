import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import Icon, { IconName } from './Icon';

// A button of the top bar: an icon (calendar, settings) or the "Aa" of the text size. It is
// 44 high, the height of the bar on iOS, and takes touches 6 beyond that. The "Aa" pill is 34
// high: at 40 it touched the bottom of the bar on the iPhone. It is 42 wide: at 50 there was
// room for another letter on each side.
//
// From iOS 26 the system draws a capsule of glass around every button of the bar (the top bar is
// the native one): there the "Aa" goes without its own border, or it would have two, and without
// a width or margin of its own, so its capsule is as wide as those of the calendar and settings.
interface HeaderButtonProps {
  accessibilityLabel: string;
  onPress: () => void;
  icon?: IconName;
  text?: string;
  testID?: string;
}

export default function HeaderButton({ accessibilityLabel, onPress, icon, text, testID }: HeaderButtonProps) {
  const theme = useTheme();
  const color = theme.colors.onHeader;
  const inSystemCapsule = Platform.OS === 'ios' && parseInt(String(Platform.Version), 10) >= 26;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        text && !inSystemCapsule ? styles.withPill : null,
        pressed ? styles.pressed : null,
      ]}
    >
      {icon ? <Icon name={icon} size={27} color={color} /> : null}
      {text ? (
        <View
          testID={testID ? `${testID}-pill` : undefined}
          style={[
            styles.pill,
            inSystemCapsule ? null : [styles.pillBordered, { borderColor: 'rgba(255,255,255,0.55)' }],
          ]}
        >
          <Text maxFontSizeMultiplier={1.2} style={[styles.text, { color }]}>
            {text}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  // The "Aa" pill does not touch the edge of the screen
  withPill: {
    marginRight: 8,
  },
  pressed: {
    opacity: 0.6,
  },
  pill: {
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBordered: {
    width: 42,
    borderWidth: 1.5,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
  },
});
