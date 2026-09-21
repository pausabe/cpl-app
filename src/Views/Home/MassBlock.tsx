import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../Theme';
import Card from '../../Components/Card';
import SegmentedControl from '../../Components/SegmentedControl';
import {MassBlock as MassBlockModel, MassChoice, MassScreenType} from '../../ViewModels/Mass';
import SectionLabel from './SectionLabel';

// The Mass: the phrase of the Gospel, and a button for each reading. With the evening Mass of
// tomorrow's celebration, a selector "Avui | Vespertina" above.
interface MassBlockProps {
    mass: MassBlockModel;
    onOpen: (opens: MassScreenType) => void;
    onChoose: (choice: MassChoice) => void;
}

export default function MassBlock({mass, onOpen, onChoose}: MassBlockProps) {
    const theme = useTheme();
    const {colors} = theme;
    const scale = theme.maxFontScaleForLabels;
    const chip = [styles.chip, {backgroundColor: colors.chipBackground, borderColor: colors.border, minHeight: theme.touch.comfortable}];
    const phraseLabel = [mass.gospel.caption, mass.gospel.phrase].filter(Boolean).join('. ');

    return (
        <View style={styles.section}>
            <SectionLabel>{mass.label}</SectionLabel>
            {mass.selector ? (
                <SegmentedControl
                    testID="mass-choice"
                    accessibilityLabel="Quina missa"
                    minHeight={theme.touch.large}
                    value={mass.selector.choice}
                    onChange={onChoose}
                    segments={[
                        {value: 'normal', label: 'Avui'},
                        {value: 'vespers', label: 'Vespertina', sublabel: mass.selector.vespersTitle || undefined},
                    ]}/>
            ) : null}
            <Card style={styles.card}>
                <Pressable
                    testID="mass-phrase"
                    accessibilityRole="button"
                    accessibilityLabel={phraseLabel}
                    onPress={() => onOpen(mass.gospel.opens)}
                    style={({pressed}) => [styles.phrase, {opacity: pressed ? 0.6 : 1}]}>
                    <Text maxFontSizeMultiplier={scale} style={[styles.caption, {color: colors.text3}]}>{mass.gospel.caption}</Text>
                    {mass.gospel.phrase ? (
                        <Text style={[styles.phraseText, {color: colors.text, fontFamily: theme.fonts.serifItalic}]}>
                            {mass.gospel.phrase}
                        </Text>
                    ) : null}
                </Pressable>
                {mass.extra ? (
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => onOpen(mass.extra!.opens)}
                        style={({pressed}) => [chip, {opacity: pressed ? 0.7 : 1}]}>
                        <Text maxFontSizeMultiplier={scale} style={[styles.chipText, {color: colors.text}]}>{mass.extra.label}</Text>
                    </Pressable>
                ) : null}
                <View style={styles.readings}>
                    {mass.readings.map((reading) => (
                        <Pressable
                            key={reading.opens}
                            accessibilityRole="button"
                            onPress={() => onOpen(reading.opens)}
                            style={({pressed}) => [chip, styles.reading, {opacity: pressed ? 0.7 : 1}]}>
                            <Text maxFontSizeMultiplier={scale} style={[styles.chipText, {color: colors.text}]}>{reading.label}</Text>
                        </Pressable>
                    ))}
                </View>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        flexShrink: 0,
        gap: 8,
    },
    card: {
        paddingTop: 13,
        paddingRight: 14,
        paddingBottom: 14,
        paddingLeft: 16,
        gap: 10,
    },
    phrase: {
        gap: 3,
    },
    caption: {
        fontSize: 13,
    },
    phraseText: {
        fontSize: 17,
        lineHeight: 23,
    },
    readings: {
        flexDirection: 'row',
        gap: 8,
    },
    chip: {
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 5,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reading: {
        flex: 1,
        paddingHorizontal: 4,
    },
    chipText: {
        fontSize: 14.5,
        fontWeight: '600',
        lineHeight: 17,
        textAlign: 'center',
    },
});
