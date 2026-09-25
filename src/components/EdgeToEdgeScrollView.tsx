import React from 'react';
import { ScrollView, ScrollViewProps, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

// The scroll of a whole screen, down to the bottom edge. iOS no longer has a bar there, only the
// home indicator over the content, and the gesture bar of Android is the same: the text goes on
// under them instead of stopping above an empty strip. The end of the scroll leaves their height
// free, so that the last line can be read above them, and on iOS the scroll indicator stops
// above the home indicator.
export default function EdgeToEdgeScrollView({ contentContainerStyle, ...props }: ScrollViewProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const ownPadding = StyleSheet.flatten(contentContainerStyle)?.paddingBottom;
  const paddingBottom = (typeof ownPadding === 'number' ? ownPadding : 0) + insets.bottom;
  return (
    <ScrollView
      automaticallyAdjustContentInsets={false}
      indicatorStyle={theme.scrollIndicator}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      {...props}
      contentContainerStyle={[contentContainerStyle, { paddingBottom }]}
    />
  );
}
