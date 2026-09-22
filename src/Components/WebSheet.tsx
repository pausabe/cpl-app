import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import { useTheme } from '../Theme';
import BottomSheet from './BottomSheet';

// A page of the web in a sheet that comes up over the home, like the other sheets of the app:
// the contact page (Missatge) and, on Android, the donation one. The page is the web's own;
// around it, the title and "Tanca". It closes also by pulling it down by the top. Without a
// connection, it says so.
interface WebSheetProps {
  visible: boolean;
  title: string;
  url: string;
  onClose: () => void;
  testID?: string;
}

export default function WebSheet({ visible, title, url, onClose, testID }: WebSheetProps) {
  const theme = useTheme();
  const { colors } = theme;
  const state = (content: React.ReactNode) => (
    <View style={[styles.state, { backgroundColor: colors.sheet }]}>{content}</View>
  );
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel={title} testID={testID} tall={true}>
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <Text
          accessibilityRole="header"
          maxFontSizeMultiplier={theme.maxFontScaleForLabels}
          numberOfLines={1}
          style={[styles.title, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
        >
          {title}
        </Text>
        <Pressable
          testID={testID ? `${testID}-close` : undefined}
          accessibilityRole="button"
          onPress={onClose}
          hitSlop={8}
          style={({ pressed }) => [styles.close, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text
            maxFontSizeMultiplier={theme.maxFontScaleForLabels}
            style={[styles.closeText, { color: colors.accentText }]}
          >
            Tanca
          </Text>
        </Pressable>
      </View>
      <WebView
        source={{ uri: url }}
        startInLoadingState={true}
        renderLoading={() => state(<ActivityIndicator size="large" color={colors.text3} />)}
        renderError={() =>
          state(<Text style={[styles.error, { color: colors.text }]}>És necessari tenir una connexió a internet</Text>)
        }
        style={[styles.web, { backgroundColor: colors.sheet }]}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 20,
    paddingRight: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
  },
  close: {
    minHeight: 44,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 17,
    fontWeight: '600',
  },
  web: {
    flex: 1,
  },
  state: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  error: {
    fontSize: 17,
    textAlign: 'center',
  },
});
