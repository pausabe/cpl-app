import React, { createContext, ReactNode, useContext } from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextProps, TextStyle } from 'react-native';

// Inside a text that is already being selected there is no second view: the parts of a line in
// two colours (Rubric, the «Al·leluia» of the Glòria) are pieces of the same text.
const InsideSelectableText = createContext(false);

// A piece of prayer text that can be selected by the piece, on iOS too.
//
// `selectable` gives Android what everybody expects: a long press takes a word and the handles
// drag the selection as far as wanted. iOS gets nothing of the sort, because React Native only
// puts a «Copia» there which copies the whole block, and a single verse cannot be taken out of
// it. What does behave the usual way on iOS is a UITextView, and a TextInput that cannot be
// edited is one, so on iOS the prayer text is written into one of those. The selection still
// cannot go from one block to the next: iOS does not carry a selection into another view.
//
// Without `selectable` it is a plain Text, so the screens can go on using it for everything.
export default function PrayerText({ selectable, style, children, ...rest }: TextProps) {
  const inside = useContext(InsideSelectableText);
  // A heading stays a Text: that is how screen readers jump from one part of the prayer to the
  // next, and a TextInput is not a heading for them.
  const asTextView = Platform.OS === 'ios' && selectable === true && !inside && rest.accessibilityRole === undefined;

  if (!asTextView) {
    return (
      <Text selectable={selectable} style={style} {...rest}>
        {children}
      </Text>
    );
  }

  return (
    <InsideSelectableText.Provider value={true}>
      <TextInput
        key={measuredWith(style, children)}
        editable={false}
        multiline={true}
        scrollEnabled={false}
        // It is prayer to be read, not a field to be filled in: screen readers say the text and
        // not «camp de text»
        accessibilityRole="text"
        style={[styles.text, style]}
        {...(rest as TextInputProps)}
      >
        {children}
      </TextInput>
    </InsideSelectableText.Provider>
  );
}

// React Native measures a text view of iOS with the text it showed before the last change, not
// with the one it has just been given: it keeps that text in the view's state and only updates it
// after laying the view out (BaseTextInputShadowNode). Making the text smaller in the «Aa» sheet
// left each paragraph as tall as it was with the bigger size, with a space under it, until the
// prayer was opened again; another psalm in the same place would keep the height of the last one.
// So the view is made anew whenever what it is measured with changes: the words, and the size and
// line height of each piece. The colour (the dark mode) does not change it.
function measuredWith(style: StyleProp<TextStyle>, children: ReactNode): string {
  const parts: string[] = [];
  const metrics = (pieceStyle: StyleProp<TextStyle>) => {
    const { fontSize, lineHeight } = StyleSheet.flatten(pieceStyle) ?? {};
    parts.push(`[${fontSize ?? ''}/${lineHeight ?? ''}]`);
  };
  const walk = (nodes: ReactNode) =>
    React.Children.forEach(nodes, (child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        parts.push(String(child));
      } else if (React.isValidElement<TextProps>(child)) {
        metrics(child.props.style);
        walk(child.props.children);
      }
    });
  metrics(style);
  walk(children);
  return hashOf(parts.join(''));
}

// A short key for a long text (djb2)
function hashOf(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  return (hash >>> 0).toString(36);
}

const styles = StyleSheet.create({
  // A TextInput of several lines leaves a space of its own on top; the prayer sets its own
  // spacing (Gap), and with this it takes exactly the room the same Text took.
  text: { padding: 0 },
});
