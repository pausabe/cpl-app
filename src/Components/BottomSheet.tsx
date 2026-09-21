import React, {useEffect, useRef} from 'react';
import {Animated, Modal, Pressable, StyleSheet, useWindowDimensions, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../Theme';

// A sheet that comes up from the bottom over the screen, which stays still underneath. It closes
// by touching outside it, with the back button on Android, or with whatever the content offers
// ("Tanca", "Fet"). It takes 80 % of the height at most: a long content scrolls inside it.
interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    accessibilityLabel: string;
    children?: React.ReactNode;
    testID?: string;
}

export default function BottomSheet({visible, onClose, accessibilityLabel, children, testID}: BottomSheetProps) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const {height} = useWindowDimensions();
    const rise = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            rise.setValue(0);
            Animated.timing(rise, {toValue: 1, duration: 220, useNativeDriver: true}).start();
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent={true}
            navigationBarTranslucent={true}>
            <View style={styles.root}>
                <Pressable
                    style={[StyleSheet.absoluteFill, {backgroundColor: theme.colors.backdrop}]}
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Tanca"
                    testID={testID ? `${testID}-backdrop` : undefined}/>
                <Animated.View
                    testID={testID}
                    accessibilityViewIsModal={true}
                    accessibilityLabel={accessibilityLabel}
                    style={[styles.sheet, {
                        maxHeight: height * theme.layout.sheetMaxHeightRatio,
                        maxWidth: theme.layout.sheetMaxWidth,
                        backgroundColor: theme.colors.sheet,
                        borderTopLeftRadius: theme.radius.sheet,
                        borderTopRightRadius: theme.radius.sheet,
                        paddingBottom: Math.max(insets.bottom, 12) + 18,
                        opacity: rise,
                        transform: [{translateY: rise.interpolate({inputRange: [0, 1], outputRange: [60, 0]})}],
                    }]}>
                    <View style={[styles.handle, {backgroundColor: theme.colors.border}]}/>
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
        paddingTop: 10,
        paddingHorizontal: 20,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 10,
    },
});
