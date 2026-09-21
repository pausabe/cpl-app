// Spaces, corners and sizes shared by every screen.
export const space = {
    xxs: 2,
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
    xxl: 24,
};

export const radius = {
    chip: 12,
    tile: 14,
    card: 16,
    dayCard: 18,
    sheet: 22,
    pill: 999,
};

// Everything that can be touched is at least this tall
export const touch = {
    min: 44,
    comfortable: 48,
    large: 52,
    dialogButton: 60,
};

export const layout = {
    // The home is one centred column on a tablet
    homeMaxWidth: 560,
    // Lines of prayer text stop growing here, on a tablet
    readingMaxWidth: 680,
    sheetMaxWidth: 600,
    dialogMaxWidth: 360,
    // Share of the screen a sheet may take, at most
    sheetMaxHeightRatio: 0.8,
};
