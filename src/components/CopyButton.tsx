import React, { useEffect, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../theme';

// «Copia-ho tot»: a line of text, not a big button, because it is there for when it is needed
// and not to be looked at. It puts on the clipboard what it is given and says «Copiat» for a
// moment, which is all the answer it needs.
const SAYS_COPIED_FOR = 2000;

interface CopyButtonProps {
  // What goes to the clipboard. Given as a function, it is only put together when pressed:
  // a whole hour is a lot of text to be joining on every draw.
  text: string | (() => string);
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export default function CopyButton({ text, label = 'Copia-ho tot', style, textStyle, testID }: CopyButtonProps) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), SAYS_COPIED_FOR);
    return () => clearTimeout(timer);
  }, [copied]);

  const shown = copied ? 'Copiat' : label;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={shown}
      hitSlop={{ top: 14, bottom: 14, left: 24, right: 24 }}
      style={[styles.button, style]}
      onPress={() => {
        Clipboard.setStringAsync(typeof text === 'function' ? text() : text).catch(() => undefined);
        setCopied(true);
      }}
    >
      <Text style={[styles.label, { color: colors.accentText }, textStyle]}>{shown}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
