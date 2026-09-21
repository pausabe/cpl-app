import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {useTheme} from '../../Theme';

// "LITÚRGIA DE LES HORES", "MISSA": small capitals above each block of the home
export default function SectionLabel({children}: {children: string}) {
    const theme = useTheme();
    return (
        <Text
            accessibilityRole="header"
            maxFontSizeMultiplier={theme.maxFontScaleForLabels}
            style={[styles.label, {color: theme.colors.text3}]}>
            {children}
        </Text>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 12.5,
        fontWeight: '700',
        letterSpacing: 0.9,
        textTransform: 'uppercase',
        paddingHorizontal: 2,
    },
});
