import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../Theme';
import Icon, {IconName} from '../../Components/Icon';

// Message and Donation, at the bottom and quiet. They do what they always did.
export default function HomeFooter({onMessage, onDonation}: {onMessage: () => void; onDonation: () => void}) {
    return (
        <View style={styles.row}>
            <FooterButton icon="mail" label="Missatge" onPress={onMessage}/>
            <FooterButton icon="card" label="Donatiu lliure" onPress={onDonation}/>
        </View>
    );
}

function FooterButton({icon, label, onPress}: {icon: IconName; label: string; onPress: () => void}) {
    const theme = useTheme();
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={onPress}
            style={({pressed}) => [styles.button, {minHeight: theme.touch.min, opacity: pressed ? 0.6 : 1}]}>
            <Icon name={icon} size={20} color={theme.colors.text2}/>
            <Text maxFontSizeMultiplier={theme.maxFontScaleForLabels} style={[styles.label, {color: theme.colors.text2}]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
    },
    label: {
        fontSize: 15,
        fontWeight: '500',
    },
});
