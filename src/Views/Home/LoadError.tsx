import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../Theme';

// When the liturgy cannot be loaded: say so, instead of a blank screen
export default function LoadError({message}: {message: string}) {
    const theme = useTheme();
    return (
        <View style={[styles.screen, {backgroundColor: theme.colors.homeBackground}]}>
            <Text style={[styles.text, {color: theme.colors.text}]}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    text: {
        fontSize: 17,
        lineHeight: 24,
        textAlign: 'center',
    },
});
