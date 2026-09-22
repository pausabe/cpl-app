import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../Theme';

// The space between two paragraphs of a prayer, always the same: it replaces the empty lines
// (an empty Text on iOS and a line break on Android) that made the spaces uneven.
export type GapSize = 'paragraph' | 'small' | number;

export default function Gap({ size = 'paragraph', testID }: { size?: GapSize; testID?: string }) {
  const theme = useTheme();
  const height =
    typeof size === 'number' ? size : size === 'small' ? Math.round(theme.prayer.gap / 2) : theme.prayer.gap;
  return <View testID={testID} style={{ height }} accessible={false} importantForAccessibility="no" />;
}
