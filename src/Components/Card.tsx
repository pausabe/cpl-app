import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {useTheme} from '../Theme';

// A white box with a thin border: the Mass block, the groups of the settings.
interface CardProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    radius?: number;
    testID?: string;
}

export default function Card({children, style, radius, testID}: CardProps) {
    const theme = useTheme();
    return (
        <View testID={testID} style={[{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: radius ?? theme.radius.card,
        }, style]}>
            {children}
        </View>
    );
}
