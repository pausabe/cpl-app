// Text sizes and fonts.
//
// The prayer text follows the user's setting: ten steps of 3 px from 15 px, 21 px by default
// (step 3). The rest of the app is sized for a 16 px base and grows with the system font.
export const PRAYER_TEXT_SIZES = [15, 18, 21, 24, 27, 30, 33, 36, 39, 42];
export const DEFAULT_TEXT_SIZE_SETTING = '3';
export const MIN_TEXT_SIZE_SETTING = 1;
export const MAX_TEXT_SIZE_SETTING = PRAYER_TEXT_SIZES.length;

// The setting is stored as text ("3"), and some callers have it as a number.
export function textSizeStep(setting: unknown): number {
    const step = parseInt(String(setting), 10);
    if (isNaN(step)) return parseInt(DEFAULT_TEXT_SIZE_SETTING, 10);
    return Math.min(MAX_TEXT_SIZE_SETTING, Math.max(MIN_TEXT_SIZE_SETTING, step));
}

// What was GlobalViewFunctions.convertTextSize: the size of the prayer text for a setting.
export function convertTextSize(setting: unknown): number {
    return PRAYER_TEXT_SIZES[textSizeStep(setting) - 1];
}

// Literata, only for the date and title of the day and for the titles of sheets and dialogs.
// Loaded with expo-font under these names (see Theme/fonts.ts).
export const fontFamilies = {
    serifSemiBold: 'Literata-SemiBold',
    serifItalic: 'Literata-Italic',
};

// The rest of the app, on a 16 px base
export const uiText = {
    tiny: 12,
    caption: 13,
    label: 12.5,
    small: 14,
    button: 15,
    body: 16,
    tile: 16.5,
    large: 17,
    dayTitle: 18,
    sheetTitle: 22,
    dialogTitle: 21,
    date: 23,
    headerTitle: 20,
};

// Labels on buttons and tiles grow with the system font only up to here, so that the grid of
// the hours does not fall apart. The prayer text has no limit.
export const MAX_FONT_SCALE_FOR_LABELS = 1.5;
