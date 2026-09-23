import React, { createContext, useContext } from 'react';
import { Platform, StyleSheet, Text, TextInput, TextInputProps, TextProps } from 'react-native';

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

const styles = StyleSheet.create({
  // A TextInput of several lines leaves a space of its own on top; the prayer sets its own
  // spacing (Gap), and with this it takes exactly the room the same Text took.
  text: { padding: 0 },
});
