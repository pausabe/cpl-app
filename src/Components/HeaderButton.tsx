import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../Theme';
import Icon, {IconName} from './Icon';

// A button of the top bar: an icon (calendar, settings) or the "Aa" of the text size. 48 × 48,
// so that it is easy to hit.
interface HeaderButtonProps {
    accessibilityLabel: string;
    onPress: () => void;
    icon?: IconName;
    text?: string;
    testID?: string;
}

export default function HeaderButton({accessibilityLabel, onPress, icon, text, testID}: HeaderButtonProps) {
    const theme = useTheme();
    const color = theme.colors.onHeader;
    return (
        <Pressable
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            hitSlop={4}
            onPress={onPress}
            style={({pressed}) => [styles.button, text ? styles.withText : null, pressed ? styles.pressed : null]}>
            {icon ? <Icon name={icon} size={27} color={color}/> : null}
            {text ? (
                <View style={[styles.pill, {borderColor: 'rgba(255,255,255,0.55)'}]}>
                    <Text maxFontSizeMultiplier={1.2} style={[styles.text, {color}]}>{text}</Text>
                </View>
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        minWidth: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
    },
    // The "Aa" pill does not touch the edge of the screen
    withText: {
        marginRight: 8,
    },
    pressed: {
        opacity: 0.6,
    },
    pill: {
        width: 52,
        height: 40,
        borderRadius: 20,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 19,
        fontWeight: '700',
    },
});
