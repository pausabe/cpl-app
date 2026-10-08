import React, { useMemo, useRef } from 'react';
import { ScrollView, ScrollViewProps, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { FollowScroll, FollowScrollContext } from './SpeechFollow';

// The scroll of a whole screen, down to the bottom edge. iOS no longer has a bar there, only the
// home indicator over the content, and the gesture bar of Android is the same: the text goes on
// under them instead of stopping above an empty strip. The end of the scroll leaves their height
// free, so that the last line can be read above them, and on iOS the scroll indicator stops
// above the home indicator.
//
// While the prayer is read aloud, it brings the piece being read into sight (ListeningFlow), a bit
// below the top. If the user has just moved the text with a finger, it lets them be for a while.
const FOLLOW_FROM_TOP = 110;
const LEAVE_ALONE_MS = 6000;

export default function EdgeToEdgeScrollView({
  contentContainerStyle,
  onScrollBeginDrag,
  children,
  ...props
}: ScrollViewProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const scroll = useRef<ScrollView>(null);
  const draggedAt = useRef(0);
  const ownPadding = StyleSheet.flatten(contentContainerStyle)?.paddingBottom;
  const paddingBottom = (typeof ownPadding === 'number' ? ownPadding : 0) + insets.bottom;
  const follow = useMemo<FollowScroll>(
    () => ({
      bringIntoSight(target) {
        // The box of the content, which the types of ScrollView do not name
        const inner = (
          scroll.current as unknown as { getInnerViewRef?: () => View | null } | null
        )?.getInnerViewRef?.();
        if (!target || !inner || Date.now() - draggedAt.current < LEAVE_ALONE_MS) return;
        try {
          target.measureLayout(
            inner,
            (_x, y) => scroll.current?.scrollTo({ y: Math.max(0, y - FOLLOW_FROM_TOP), animated: true }),
            () => undefined,
          );
        } catch {
          // Out of sight it stays
        }
      },
    }),
    [],
  );
  return (
    <ScrollView
      ref={scroll}
      automaticallyAdjustContentInsets={false}
      indicatorStyle={theme.scrollIndicator}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      {...props}
      onScrollBeginDrag={(event) => {
        draggedAt.current = Date.now();
        onScrollBeginDrag?.(event);
      }}
      contentContainerStyle={[contentContainerStyle, { paddingBottom }]}
    >
      <FollowScrollContext.Provider value={follow}>{children}</FollowScrollContext.Provider>
    </ScrollView>
  );
}
