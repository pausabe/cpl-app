import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme';
import BottomSheet from '../../components/BottomSheet';
import ActionButton from '../../components/ActionButton';
import { WHATS_NEW } from '../../view-models/notices';

// Once, the first time 9.0.0 opens: where the hours and the readings are now.
export default function WhatsNewSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Novetats" testID="whats-new">
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
      >
        {WHATS_NEW.title}
      </Text>
      <Text style={[styles.body, { color: colors.text }]}>{WHATS_NEW.body}</Text>
      <ActionButton label={WHATS_NEW.button} onPress={onClose} style={styles.button} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 6,
    fontSize: 22,
    lineHeight: 28,
  },
  body: {
    marginTop: 10,
    fontSize: 17,
    lineHeight: 25,
  },
  button: {
    marginTop: 18,
  },
});
