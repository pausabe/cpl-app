import {TextStyle, ViewStyle} from 'react-native';
import {Theme} from './Theme';

// The styles of the prayer and reading texts. The names are the ones the hour screens have
// always used (black, red…): "black" is the text colour and "red" the rubric colour, in light
// and in dark mode.
export interface PrayerTextStyles {
    container: ViewStyle;
    black: TextStyle;
    blackBold: TextStyle;
    blackItalic: TextStyle;
    blackSmallItalicRight: TextStyle;
    // Readings: aligned to the left on both platforms (iOS used to justify them)
    blackJustified: TextStyle;
    red: TextStyle;
    redItalic: TextStyle;
    redCenter: TextStyle;
    redCenterBold: TextStyle;
    redSmallItalicRight: TextStyle;
    sectionTitle: TextStyle;
    // The reference of a reading ("Mt 9,9-13"): rubric, a little heavier
    reference: TextStyle;
    // The phrase that sums up a reading, in italics and a softer colour
    comment: TextStyle;
}

const cache = new WeakMap<Theme, PrayerTextStyles>();

export function prayerTextStyles(theme: Theme): PrayerTextStyles {
    const cached = cache.get(theme);
    if (cached) return cached;

    const {fontSize, lineHeight, sectionTitleSize} = theme.prayer;
    const smallSize = fontSize - 2;
    const smallLineHeight = Math.round(smallSize * lineHeight / fontSize);
    const text: TextStyle = {color: theme.colors.text, fontSize, lineHeight};
    const rubric: TextStyle = {color: theme.colors.rubric, fontSize, lineHeight};

    const styles: PrayerTextStyles = {
        container: {flex: 1, backgroundColor: theme.colors.prayerBackground},
        black: text,
        blackBold: {...text, fontWeight: 'bold'},
        blackItalic: {...text, fontStyle: 'italic'},
        blackSmallItalicRight: {...text, fontSize: smallSize, lineHeight: smallLineHeight, fontStyle: 'italic', textAlign: 'right'},
        blackJustified: {...text, textAlign: 'left'},
        red: rubric,
        redItalic: {...rubric, fontStyle: 'italic'},
        redCenter: {...rubric, textAlign: 'center'},
        redCenterBold: {...rubric, textAlign: 'center', fontWeight: 'bold'},
        redSmallItalicRight: {...rubric, fontSize: smallSize, lineHeight: smallLineHeight, fontStyle: 'italic', textAlign: 'right'},
        reference: {...rubric, fontWeight: '600'},
        comment: {...text, fontStyle: 'italic', color: theme.colors.text2},
        sectionTitle: {
            color: theme.colors.rubric,
            fontSize: sectionTitleSize,
            lineHeight: Math.round(sectionTitleSize * 1.3),
            fontWeight: '700',
            letterSpacing: Math.round(sectionTitleSize * 0.1 * 10) / 10,
            marginBottom: Math.round(sectionTitleSize * 0.6),
        },
    };
    cache.set(theme, styles);
    return styles;
}
