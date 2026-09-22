import React from 'react';
import {Pressable, StyleProp, StyleSheet, Switch, Text, View, ViewStyle} from 'react-native';
import {useTheme} from '../Theme';

// A setting that is on or off, with a line that says what it does. The whole row can be
// touched, not only the switch.
interface SwitchRowProps {
    label: string;
    caption?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    style?: StyleProp<ViewStyle>;
    labelWeight?: '400' | '600';
    labelSize?: number;
    testID?: string;
}

export default function SwitchRow({label, caption, value, onValueChange, style, labelWeight = '400', labelSize = 16, testID}: SwitchRowProps) {
    const theme = useTheme();
    const {colors} = theme;
    return (
        <Pressable
            testID={testID}
            accessibilityRole="switch"
            accessibilityState={{checked: value}}
            accessibilityLabel={label}
            accessibilityHint={caption}
            onPress={() => onValueChange(!value)}
            style={[styles.row, {minHeight: theme.touch.comfortable}, style]}>
            <View style={styles.texts}>
                <Text style={[styles.label, {color: colors.text, fontWeight: labelWeight, fontSize: labelSize}]}>{label}</Text>
                {caption ? <Text style={[styles.caption, {color: colors.text2}]}>{caption}</Text> : null}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                style={styles.switch}
                trackColor={{true: colors.accentFill, false: colors.switchOff}}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.switchOff}
                accessibilityElementsHidden={true}
                importantForAccessibility="no-hide-descendants"/>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    texts: {
        flex: 1,
        gap: 1,
    },
    label: {
        fontSize: 16,
    },
    caption: {
        fontSize: 13,
    },
    // React Native puts alignSelf: 'flex-start' on the iOS switch, which then sat at the top of
    // the row instead of in the middle (Android does not do it)
    switch: {
        alignSelf: 'center',
    },
});
