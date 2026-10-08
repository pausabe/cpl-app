import React, { ReactNode, useContext, useEffect, useRef } from 'react';
import { StyleSheet, Text, TextStyle, View } from 'react-native';
import PrayerText from './PrayerText';
import { speechParagraphElements } from './speechParagraphs';
import { FollowScrollContext, FollowedPiece } from './SpeechFollow';
import { strophes } from '../view-models/speech/script';
import { useTheme } from '../theme';

// The prayer while it is read aloud: each paragraph on its own, and the strophes of a psalm or a
// hymn each on its own too, so that the one being read can be marked and kept in sight. It is
// drawn as the paragraphs were drawn before they were sewn together for selecting (PrayerFlow):
// the same elements, with the same styles and spaces; only, while it is read, a selection cannot
// go from one paragraph to the next.

function flatten(style: unknown): TextStyle {
  if (!style) return {};
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flatten));
  return style as TextStyle;
}

function Unit({ current, gap, children }: { current: boolean; gap?: number; children: ReactNode }) {
  const theme = useTheme();
  const scroll = useContext(FollowScrollContext);
  const ref = useRef<View>(null);
  useEffect(() => {
    if (current) scroll?.bringIntoSight(ref.current);
  }, [current, scroll]);
  return (
    <View
      ref={ref}
      style={[
        styles.unit,
        gap ? { marginBottom: gap } : null,
        current ? { backgroundColor: theme.colors.listenHighlight } : null,
      ]}
    >
      {children}
    </View>
  );
}

function FollowedParagraph({
  element,
  paragraph,
  follow,
}: {
  element: React.ReactElement;
  paragraph: number;
  follow: FollowedPiece;
}) {
  const props = element.props as Record<string, any>;
  const plain = (element.type === PrayerText || element.type === Text) && typeof props.children === 'string';
  const parts = plain ? strophes(props.children) : [];
  if (parts.length > 1) {
    // The blank line that held the strophes apart, now between their boxes
    const gap = flatten(props.style).lineHeight ?? 24;
    return (
      <View>
        {parts.map((text, i) => (
          <Unit
            key={i}
            current={follow.paragraph === paragraph && follow.strophe === i}
            gap={i < parts.length - 1 ? gap : undefined}
          >
            {React.cloneElement(element, undefined, text)}
          </Unit>
        ))}
      </View>
    );
  }
  return <Unit current={follow.paragraph === paragraph}>{element}</Unit>;
}

export default function ListeningFlow({ children, follow }: { children: ReactNode; follow: FollowedPiece }) {
  const theme = useTheme();
  const { elements } = speechParagraphElements(children, theme.colors.rubric);
  const index = new Map(elements.map((element, i) => [element, i]));

  const decorate = (node: ReactNode): ReactNode =>
    React.Children.map(node, (child) => {
      if (!React.isValidElement(child)) return child;
      const props = child.props as Record<string, any>;
      if (child.type === React.Fragment) return <>{decorate(props.children)}</>;
      if (child.type === View) return React.cloneElement(child, undefined, decorate(props.children));
      const paragraph = index.get(child);
      if (paragraph === undefined) return child;
      return <FollowedParagraph element={child} paragraph={paragraph} follow={follow} />;
    });

  return <>{decorate(children)}</>;
}

const styles = StyleSheet.create({
  // The mark goes a little beyond the text on each side, without moving it
  unit: {
    marginHorizontal: -6,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
});
