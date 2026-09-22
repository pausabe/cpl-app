import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../Theme';
import Icon from '../../Components/Icon';
import SwitchRow from '../../Components/SwitchRow';
import {DayCard as DayCardModel} from '../../ViewModels/DayCard';

// The card of the day, on the soft colour of the liturgical colour: where and when, what is
// celebrated, the week, and the optional memorial and the saint's story when there are.
//
// The colour is only the background (and the type of celebration): no dot or name. White is
// ivory and gold, and next to the word «Blanc» it looked yellow. The screen reader still hears
// it, with the place.
interface DayCardProps {
    day: DayCardModel;
    onOptionalMemoryChange: (enabled: boolean) => void;
    onReadMore: () => void;
}

export default function DayCard({day, onOptionalMemoryChange, onReadMore}: DayCardProps) {
    const theme = useTheme();
    const {colors} = theme;
    const liturgical = theme.liturgical(day.colorCode);
    const accent = day.muted ? colors.text2 : liturgical.accent;
    const scale = theme.maxFontScaleForLabels;

    return (
        <View testID="day-card" style={[styles.card, {backgroundColor: liturgical.tint, borderRadius: theme.radius.dayCard}]}>
            <Text
                maxFontSizeMultiplier={scale}
                accessibilityLabel={`${day.place}. Color litúrgic: ${day.colorName}`}
                style={[styles.small, {color: colors.text2}]}>
                {day.place}
            </Text>
            <Text accessibilityRole="header" style={[styles.date, {color: colors.text, fontFamily: theme.fonts.serifSemiBold}]}>
                {day.dateText}
            </Text>
            {day.typeLabel ? (
                <Text maxFontSizeMultiplier={scale} style={[styles.type, {color: accent}]}>{day.typeLabel}</Text>
            ) : null}
            <Text style={[styles.title, {color: day.muted ? colors.text2 : colors.text, fontFamily: theme.fonts.serifSemiBold}]}>
                {day.title}
            </Text>
            {day.meta ? <Text style={[styles.meta, {color: colors.text2}]}>{day.meta}</Text> : null}
            {day.optionalMemory ? (
                <SwitchRow
                    testID="optional-memory"
                    label="Celebrar la memòria"
                    labelWeight="600"
                    caption={day.optionalMemory.caption}
                    value={day.optionalMemory.enabled}
                    onValueChange={onOptionalMemoryChange}
                    style={[styles.memory, {borderTopColor: colors.rule}]}/>
            ) : null}
            {day.description ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityHint={day.title}
                    onPress={onReadMore}
                    style={({pressed}) => [styles.readMore, {minHeight: theme.touch.min, opacity: pressed ? 0.6 : 1}]}>
                    <Text maxFontSizeMultiplier={scale} style={[styles.readMoreText, {color: liturgical.accent}]}>Llegeix-ne més</Text>
                    <Icon name="chevronRight" size={16} color={liturgical.accent}/>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        paddingTop: 13,
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    small: {
        fontSize: 13,
    },
    date: {
        marginTop: 4,
        fontSize: 23,
        lineHeight: 28,
    },
    type: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    title: {
        marginTop: 3,
        fontSize: 18,
        lineHeight: 23,
    },
    meta: {
        marginTop: 5,
        fontSize: 14,
        lineHeight: 19,
    },
    memory: {
        marginTop: 10,
        paddingVertical: 6,
        borderTopWidth: 1,
    },
    readMore: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
    },
    readMoreText: {
        fontSize: 14,
        fontWeight: '700',
    },
});
