import React from 'react';
import {Modal, Pressable, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useTheme} from '../Theme';

// A card in the middle of the screen, over a dark veil: the midnight notice, the calendar.
interface DialogProps {
    visible: boolean;
    // Touching outside or the back button on Android
    onDismiss: () => void;
    accessibilityLabel: string;
    children?: React.ReactNode;
    maxWidth?: number;
    // Padding and spacing of the card, when the content needs its own
    style?: StyleProp<ViewStyle>;
    testID?: string;
}

export default function Dialog({visible, onDismiss, accessibilityLabel, children, maxWidth, style, testID}: DialogProps) {
    const theme = useTheme();
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onDismiss}
            statusBarTranslucent={true}
            navigationBarTranslucent={true}>
            <View style={styles.root}>
                <Pressable
                    style={[StyleSheet.absoluteFill, {backgroundColor: theme.colors.backdrop}]}
                    onPress={onDismiss}
                    accessible={false}/>
                <View
                    testID={testID}
                    accessibilityViewIsModal={true}
                    accessibilityLabel={accessibilityLabel}
                    style={[styles.card, {
                        maxWidth: maxWidth ?? theme.layout.dialogMaxWidth,
                        backgroundColor: theme.colors.sheet,
                        borderRadius: theme.radius.sheet,
                    }, style]}>
                    {children}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    card: {
        width: '100%',
        paddingTop: 22,
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 10,
    },
});
