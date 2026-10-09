import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import HourIcon from './HourIcon';
import type { HourKey } from '../view-models/hours';

// The widget «L’hora d’ara» drawn inside the app, for the tour of what is new: whoever has never
// put a widget on the home screen sees what it is before going to look for it. The same as the
// real one (targets/widgets, modules/cpl-widgets), at the size of the small one of the iPhone.
interface WidgetPreviewProps {
  hour: HourKey;
  name: string;
  date: string;
  now: boolean;
}

export const WIDGET_PREVIEW_SIZE = 150;

export default function WidgetPreview({ hour, name, date, now }: WidgetPreviewProps) {
  const theme = useTheme();
  const { colors } = theme;
  const long = name.includes(' ');
  return (
    <View
      testID="widget-preview"
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
      style={[styles.widget, { backgroundColor: colors.accentFill }]}
    >
      <View style={styles.top}>
        <HourIcon hour={hour} color={colors.onAccent} size={28} />
        {now ? <Text style={[styles.now, { color: colors.onAccent }]}>ARA</Text> : null}
      </View>
      <Text
        maxFontSizeMultiplier={1}
        numberOfLines={2}
        style={[
          styles.name,
          { color: colors.onAccent, fontFamily: theme.fonts.serifSemiBold, fontSize: long ? 20 : 26 },
        ]}
      >
        {name}
      </Text>
      <Text maxFontSizeMultiplier={1} numberOfLines={1} style={[styles.date, { color: colors.onAccent }]}>
        {date}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    width: WIDGET_PREVIEW_SIZE,
    height: WIDGET_PREVIEW_SIZE,
    borderRadius: 26,
    padding: 14,
    alignSelf: 'center',
    marginVertical: 4,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  now: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.9,
    opacity: 0.85,
  },
  name: {
    marginTop: 'auto',
    lineHeight: 28,
  },
  date: {
    fontSize: 12.5,
    marginTop: 4,
    opacity: 0.92,
  },
});
