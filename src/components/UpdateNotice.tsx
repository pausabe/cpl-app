import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import Icon from './Icon';

// One quiet line that there is something new, with the way to it and a cross to put it away. It
// does not cover anything nor ask for an answer: whoever does not want it just carries on.
interface UpdateNoticeProps {
  text: string;
  action: string;
  dismissLabel: string;
  onOpen: () => void;
  onDismiss: () => void;
}

export default function UpdateNotice({ text, action, dismissLabel, onOpen, onDismiss }: UpdateNoticeProps) {
  const theme = useTheme();
  const label = { maxFontSizeMultiplier: theme.maxFontScaleForLabels };
  return (
    <View testID="update-notice" style={styles.row}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${text} ${action}`}
        onPress={onOpen}
        style={({ pressed }) => [styles.open, { minHeight: theme.touch.min, opacity: pressed ? 0.6 : 1 }]}
      >
        <Text {...label} style={[styles.text, { color: theme.colors.text2 }]}>
          {text} <Text style={[styles.action, { color: theme.colors.accentText }]}>{action}</Text>
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={dismissLabel}
        onPress={onDismiss}
        hitSlop={8}
        style={({ pressed }) => [
          styles.dismiss,
          { minHeight: theme.touch.min, minWidth: theme.touch.min, opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Icon name="close" size={16} color={theme.colors.text2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  open: {
    flexShrink: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
  },
  action: {
    fontWeight: '600',
  },
  dismiss: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
