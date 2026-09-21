import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../Theme';
import Icon from './Icon';

// «Començar amb l'invitatori», «Continua amb el Salm»…: what shows more of the prayer, at the
// same place and with the same words as always, but now it looks like a button.
interface ContinueButtonProps {
    label: string;
    onPress: () => void;
    // An arrow down: the text goes on below
    showArrow?: boolean;
}

export default function ContinueButton({label, onPress, showArrow = false}: ContinueButtonProps) {
    const theme = useTheme();
    const {colors} = theme;
    const height = showArrow ? theme.touch.comfortable : theme.touch.min;
    return (
        <View style={styles.wrapper}>
            <Pressable
                accessibilityRole="button"
                onPress={onPress}
                style={({pressed}) => [
                    styles.button,
                    {minHeight: height, borderRadius: height / 2, borderColor: colors.accentText},
                    showArrow ? styles.large : null,
                    pressed ? {backgroundColor: colors.chipBackground} : null,
                ]}>
                <Text
                    maxFontSizeMultiplier={theme.maxFontScaleForLabels}
                    style={[styles.label, {color: colors.accentText, fontSize: showArrow ? 17 : 16}]}>
                    {label}
                </Text>
                {showArrow ? <Icon name="chevronDown" size={18} color={colors.accentText} strokeWidth={2.4}/> : null}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        marginVertical: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 18,
        borderWidth: 1.5,
    },
    large: {
        paddingHorizontal: 20,
    },
    label: {
        fontWeight: '600',
        textAlign: 'center',
    },
});
