import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

// «Nou», next to something new: a row of Configuració until it is touched (controllers/newBadges),
// and the hint of the headphones (TourOverlay)
export default function NewBadge({ testID }: { testID?: string }) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <View testID={testID} style={[styles.badge, { backgroundColor: colors.newBadge }]}>
      <Text maxFontSizeMultiplier={theme.maxFontScaleForLabels} style={[styles.text, { color: colors.accentText }]}>
        Nou
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
