import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {fitLabel, useTheme} from '../../Theme';
import Dialog from '../../Components/Dialog';
import Icon from '../../Components/Icon';
import {calendarMonth, CalendarDay, shiftMonth, WEEKDAY_INITIALS} from '../../ViewModels/Calendar';

// Choosing another day: a month in a card, the same on Android and on iOS, in Catalan and in
// the colours of the app. A day is chosen with a touch and applied with "Canvia"; "Avui" goes
// back to today at once. Days outside the database cannot be chosen.
interface CalendarDialogProps {
    visible: boolean;
    value: Date;
    minimumDate?: Date;
    maximumDate?: Date;
    onCancel: () => void;
    onToday: () => void;
    onChange: (date: Date) => void;
}

export default function CalendarDialog({visible, value, minimumDate, maximumDate, onCancel, onToday, onChange}: CalendarDialogProps) {
    const theme = useTheme();
    const {colors} = theme;
    const scale = theme.maxFontScaleForLabels;
    const [selected, setSelected] = useState(value);
    const [shown, setShown] = useState({year: value.getFullYear(), month: value.getMonth()});

    // Every time it opens, at the day being shown
    useEffect(() => {
        if (!visible) return;
        setSelected(value);
        setShown({year: value.getFullYear(), month: value.getMonth()});
    }, [visible, value]);

    const month = calendarMonth({...shown, selected, today: new Date(), minimum: minimumDate, maximum: maximumDate});
    const go = (delta: number) => setShown(shiftMonth(shown.year, shown.month, delta));

    const arrow = (label: string, icon: 'back' | 'chevronRight', enabled: boolean, delta: number) => (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{disabled: !enabled}}
            disabled={!enabled}
            onPress={() => go(delta)}
            style={({pressed}) => [styles.arrow, {opacity: !enabled ? 0.3 : pressed ? 0.6 : 1}]}>
            <Icon name={icon} size={22} color={colors.accentText} strokeWidth={2.2}/>
        </Pressable>
    );

    const dayCell = (day: CalendarDay | null, index: number) => {
        if (!day) return <View key={`blank-${index}`} style={styles.cell}/>;
        const background = day.selected ? colors.accentFill : 'transparent';
        const color = day.selected ? colors.onAccent : day.disabled ? colors.text3 : day.today ? colors.accentText : colors.text;
        return (
            <View key={day.day} style={styles.cell}>
                <Pressable
                    testID={`calendar-day-${day.day}`}
                    accessibilityRole="button"
                    accessibilityLabel={day.label}
                    accessibilityState={{selected: day.selected, disabled: day.disabled}}
                    disabled={day.disabled}
                    onPress={() => setSelected(day.date)}
                    style={({pressed}) => [
                        styles.day,
                        {backgroundColor: background, opacity: day.disabled ? 0.35 : pressed ? 0.7 : 1},
                        day.today && !day.selected ? {borderWidth: 1.5, borderColor: colors.accentText} : null,
                    ]}>
                    <Text
                        maxFontSizeMultiplier={1.3}
                        style={[styles.dayText, {color, fontWeight: day.selected || day.today ? '700' : '400'}]}>
                        {day.day}
                    </Text>
                </Pressable>
            </View>
        );
    };

    const action = (label: string, onPress: () => void, bold = false) => (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({pressed}) => [styles.action, {opacity: pressed ? 0.6 : 1}]}>
            <Text
                maxFontSizeMultiplier={scale}
                {...fitLabel(label)}
                style={[styles.actionText, {color: colors.accentText, fontWeight: bold ? '700' : '400'}]}>
                {label}
            </Text>
        </Pressable>
    );

    return (
        <Dialog visible={visible} onDismiss={onCancel} accessibilityLabel="Tria un dia" maxWidth={380} style={styles.card} testID="calendar">
            <View style={styles.header}>
                {arrow('Mes anterior', 'back', month.canGoBack, -1)}
                <Text
                    accessibilityRole="header"
                    accessibilityLiveRegion="polite"
                    maxFontSizeMultiplier={scale}
                    style={[styles.title, {color: colors.text, fontFamily: theme.fonts.serifSemiBold}]}>
                    {month.title}
                </Text>
                {arrow('Mes següent', 'chevronRight', month.canGoForward, 1)}
            </View>
            <View style={styles.row} accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
                {WEEKDAY_INITIALS.map((initial) => (
                    <Text key={initial} maxFontSizeMultiplier={1.3} style={[styles.weekday, {color: colors.text3}]}>{initial}</Text>
                ))}
            </View>
            <View style={styles.grid}>
                {month.weeks.map((week, row) => (
                    <View key={row} style={styles.row}>
                        {week.map((day, column) => dayCell(day, row * 7 + column))}
                    </View>
                ))}
            </View>
            <View style={[styles.actions, {borderTopColor: colors.rule}]}>
                {action('Cancel·la', onCancel)}
                {action('Avui', onToday)}
                {action('Canvia', () => onChange(selected), true)}
            </View>
        </Dialog>
    );
}

const styles = StyleSheet.create({
    card: {
        paddingTop: 16,
        paddingHorizontal: 14,
        paddingBottom: 10,
        gap: 6,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    arrow: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 19,
    },
    grid: {
        gap: 2,
    },
    row: {
        flexDirection: 'row',
    },
    weekday: {
        flex: 1,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
    },
    cell: {
        flex: 1,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    day: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayText: {
        fontSize: 17,
    },
    actions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        marginTop: 4,
    },
    action: {
        flex: 1,
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        fontSize: 17,
    },
});
