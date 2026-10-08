import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

// A sheet that comes up from the bottom over the screen, which stays still underneath. It closes
// by touching outside it, by pulling it down by the top (where the handle is), with the back
// button on Android, or with whatever the content offers ("Tanca", "Fet"). It takes 80 % of the
// height at most: a long content scrolls inside it. A web page takes 92 %, edge to edge (tall).
// A sheet with something to write in it (avoidKeyboard) sits above the keyboard while it is up,
// as tall as the room left.
interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  accessibilityLabel: string;
  children?: React.ReactNode;
  testID?: string;
  tall?: boolean;
  avoidKeyboard?: boolean;
}

// How tall the keyboard is while it is up, 0 while it is not
function useKeyboardHeight(enabled: boolean): number {
  const [keyboard, setKeyboard] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const shown = Keyboard.addListener(show, (event) => setKeyboard(event.endCoordinates.height));
    const hidden = Keyboard.addListener(hide, () => setKeyboard(0));
    return () => {
      shown.remove();
      hidden.remove();
      setKeyboard(0);
    };
  }, [enabled]);
  return keyboard;
}

const TALL_HEIGHT_RATIO = 0.92;
const PADDING = 20;

// Let go after pulling it down this far, or thrown down, it closes; otherwise it goes back up
export function closesWhenReleased(distance: number, velocity: number): boolean {
  return distance > 90 || velocity > 0.9;
}

export default function BottomSheet({
  visible,
  onClose,
  accessibilityLabel,
  children,
  testID,
  tall = false,
  avoidKeyboard = false,
}: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const keyboard = useKeyboardHeight(avoidKeyboard && visible);
  const rise = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.Value(0)).current;
  // The gesture is created once: it reads these when it is let go
  const latest = useRef({ onClose, height });
  latest.current = { onClose, height };

  // Before the first frame: opened again, it starts from below and not where it was
  useLayoutEffect(() => {
    if (visible) {
      rise.setValue(0);
      drag.setValue(0);
      Animated.timing(rise, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    }
  }, [visible]);

  // The top of the sheet follows the finger down
  const pull = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 2,
      onPanResponderMove: (_, gesture) => drag.setValue(Math.max(0, gesture.dy)),
      onPanResponderRelease: (_, gesture) => {
        if (closesWhenReleased(gesture.dy, gesture.vy)) {
          Animated.timing(drag, { toValue: latest.current.height, duration: 180, useNativeDriver: true }).start(() =>
            latest.current.onClose(),
          );
        } else {
          Animated.spring(drag, { toValue: 0, bounciness: 0, useNativeDriver: true }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(drag, { toValue: 0, bounciness: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  const padding = tall ? 0 : PADDING;
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
    >
      <View style={[styles.root, keyboard ? { paddingBottom: keyboard } : null]}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.backdrop }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Tanca"
          testID={testID ? `${testID}-backdrop` : undefined}
        />
        <Animated.View
          testID={testID}
          accessibilityViewIsModal={true}
          accessibilityLabel={accessibilityLabel}
          style={[
            styles.sheet,
            {
              ...(tall
                ? { height: height * TALL_HEIGHT_RATIO }
                : {
                    maxHeight: keyboard
                      ? height - keyboard - insets.top - 12
                      : height * theme.layout.sheetMaxHeightRatio,
                  }),
              maxWidth: theme.layout.sheetMaxWidth,
              backgroundColor: theme.colors.sheet,
              borderTopLeftRadius: theme.radius.sheet,
              borderTopRightRadius: theme.radius.sheet,
              paddingHorizontal: padding,
              paddingBottom: tall ? insets.bottom : keyboard ? 12 : Math.max(insets.bottom, 12) + 18,
              opacity: rise,
              transform: [
                {
                  translateY: Animated.add(rise.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }), drag),
                },
              ],
            },
          ]}
        >
          {/* Where the sheet is pulled down from: the whole width, with the handle */}
          <View
            testID={testID ? `${testID}-handle` : undefined}
            style={[styles.grab, { marginHorizontal: -padding }]}
            {...pull.panHandlers}
          >
            <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    overflow: 'hidden',
  },
  // As tall as the space the handle had above and below it
  grab: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
});
