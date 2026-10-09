import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import FitLabel from './FitLabel';
import Card from './Card';
import Icon from './Icon';

// A card on top of the home that there is something new, with a button to it and a cross to put
// it away. It is meant to be seen: whoever stays on an old app stays without the fixes for good.
// It does not cover anything nor ask for an answer, so whoever does not want it just carries on.
interface UpdateNoticeProps {
  title: string;
  text: string;
  action: string;
  dismissLabel: string;
  onOpen: () => void;
  onDismiss: () => void;
}

export default function UpdateNotice({ title, text, action, dismissLabel, onOpen, onDismiss }: UpdateNoticeProps) {
  const theme = useTheme();
  const { colors } = theme;
  const scale = theme.maxFontScaleForLabels;
  return (
    <Card testID="update-notice" style={[styles.card, { borderColor: colors.accentFill }]}>
      <View style={styles.top}>
        <View style={styles.words}>
          <Text accessibilityRole="header" maxFontSizeMultiplier={scale} style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
          <Text maxFontSizeMultiplier={scale} style={[styles.text, { color: colors.text2 }]}>
            {text}
          </Text>
        </View>
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
          <Icon name="close" size={18} color={colors.text2} />
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onOpen}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.accentFill,
            borderRadius: theme.radius.pill,
            minHeight: theme.touch.comfortable,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <FitLabel maxFontSizeMultiplier={scale} style={[styles.action, { color: colors.onAccent }]}>
          {action}
        </FitLabel>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    paddingTop: 14,
    paddingRight: 8,
    paddingBottom: 16,
    paddingLeft: 16,
    gap: 12,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  words: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  text: {
    fontSize: 14,
    lineHeight: 19,
  },
  dismiss: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
  },
  button: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  action: {
    fontSize: 15,
    fontWeight: '700',
  },
});
