import React, {useEffect, useState} from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useTheme} from '../../Theme';
import Dialog from '../../Components/Dialog';

// Choosing another day. On iOS, the calendar in a card with "Cancel·la", "Avui" and "Canvia" in
// the colours of the app; on Android, the system's own date dialog.
interface CalendarPickerProps {
    visible: boolean;
    value: Date;
    minimumDate?: Date;
    maximumDate?: Date;
    onCancel: () => void;
    onToday: () => void;
    onChange: (date: Date) => void;
}

export default function CalendarPicker(props: CalendarPickerProps) {
    if (!props.visible) return null;
    return Platform.OS === 'ios' ? <IOSCalendar {...props}/> : <AndroidCalendar {...props}/>;
}

function AndroidCalendar({value, minimumDate, maximumDate, onCancel, onChange}: CalendarPickerProps) {
    return (
        <DateTimePicker
            mode="date"
            display="default"
            value={value}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={(event, date) => {
                if (event.type === 'set' && date) onChange(date);
                else onCancel();
            }}/>
    );
}

function IOSCalendar({visible, value, minimumDate, maximumDate, onCancel, onToday, onChange}: CalendarPickerProps) {
    const theme = useTheme();
    const {colors} = theme;
    const [selected, setSelected] = useState(value);
    useEffect(() => setSelected(value), [value, visible]);

    const button = (label: string, onPress: () => void, bold = false) => (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({pressed}) => [styles.button, {opacity: pressed ? 0.6 : 1}]}>
            <Text maxFontSizeMultiplier={theme.maxFontScaleForLabels} style={[styles.buttonText, {color: colors.accentText, fontWeight: bold ? '700' : '400'}]}>
                {label}
            </Text>
        </Pressable>
    );

    return (
        <Dialog visible={visible} onDismiss={onCancel} accessibilityLabel="Tria un dia" maxWidth={380} testID="calendar">
            <DateTimePicker
                mode="date"
                display="inline"
                locale="ca-ES"
                value={selected}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                accentColor={colors.accentFill}
                themeVariant={theme.dark ? 'dark' : 'light'}
                onChange={(event, date) => date && setSelected(date)}/>
            <View style={[styles.buttons, {borderTopColor: colors.rule}]}>
                {button('Cancel·la', onCancel)}
                {button('Avui', onToday)}
                {button('Canvia', () => onChange(selected), true)}
            </View>
        </Dialog>
    );
}

const styles = StyleSheet.create({
    buttons: {
        flexDirection: 'row',
        borderTopWidth: 1,
        marginTop: 4,
    },
    button: {
        flex: 1,
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 17,
    },
});
