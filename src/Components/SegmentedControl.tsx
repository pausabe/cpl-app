import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {fitLabel, useTheme} from '../Theme';

// Two or three options side by side, one of them chosen: "Avui | Vespertina", the dark mode.
export interface Segment<T extends string> {
    value: T;
    label: string;
    // A second, smaller line: the title of the evening Mass
    sublabel?: string;
}

interface SegmentedControlProps<T extends string> {
    segments: Segment<T>[];
    value: T;
    onChange: (value: T) => void;
    accessibilityLabel: string;
    minHeight?: number;
    testID?: string;
}

export default function SegmentedControl<T extends string>({segments, value, onChange, accessibilityLabel, minHeight, testID}: SegmentedControlProps<T>) {
    const theme = useTheme();
    const {colors} = theme;
    return (
        <View
            testID={testID}
            accessibilityRole="radiogroup"
            accessibilityLabel={accessibilityLabel}
            style={[styles.row, {borderColor: colors.border, borderRadius: theme.radius.tile, backgroundColor: colors.surface}]}>
            {segments.map((segment, index) => {
                const selected = segment.value === value;
                const color = selected ? colors.onAccent : colors.text;
                return (
                    <Pressable
                        key={segment.value}
                        accessibilityRole="radio"
                        accessibilityState={{checked: selected}}
                        accessibilityLabel={segment.sublabel ? `${segment.label}, ${segment.sublabel}` : segment.label}
                        onPress={() => onChange(segment.value)}
                        style={[
                            styles.segment,
                            {minHeight: minHeight ?? theme.touch.min},
                            index > 0 ? {borderLeftWidth: 1, borderLeftColor: colors.border} : null,
                            selected ? {backgroundColor: colors.accentFill} : null,
                        ]}>
                        <Text
                            maxFontSizeMultiplier={theme.maxFontScaleForLabels}
                            {...fitLabel(segment.label)}
                            style={[styles.label, {color}]}>{segment.label}</Text>
                        {segment.sublabel ? (
                            <Text
                                maxFontSizeMultiplier={theme.maxFontScaleForLabels}
                                numberOfLines={1}
                                style={[styles.sublabel, {color}]}>{segment.sublabel}</Text>
                        ) : null}
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        borderWidth: 1,
        overflow: 'hidden',
    },
    segment: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
    },
    sublabel: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
});
