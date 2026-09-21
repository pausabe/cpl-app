import React from 'react';
import {Text, TextStyle} from 'react-native';
import {prayerTextStyles, useTheme} from '../Theme';

// HIMNE, SALMÒDIA, ORACIÓ…: in the rubric red, a little smaller and spaced out. Screen readers
// hear it as a heading, so they can jump from one part of the prayer to the next.
interface SectionTitleProps {
    children: React.ReactNode;
    // The titles of the hours are already written in capitals; those of the Mass are not
    uppercase?: boolean;
    style?: TextStyle;
}

export default function SectionTitle({children, uppercase = true, style}: SectionTitleProps) {
    const theme = useTheme();
    return (
        <Text
            selectable={true}
            accessibilityRole="header"
            style={[prayerTextStyles(theme).sectionTitle, uppercase ? {textTransform: 'uppercase'} : null, style]}>
            {children}
        </Text>
    );
}
