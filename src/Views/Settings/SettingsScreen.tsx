import React, {useEffect, useRef, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import {convertTextSize, MAX_TEXT_SIZE_SETTING, MIN_TEXT_SIZE_SETTING, useTheme} from '../../Theme';
import Card from '../../Components/Card';
import Icon from '../../Components/Icon';
import OptionSheet from '../../Components/OptionSheet';
import SegmentedControl from '../../Components/SegmentedControl';
import SwitchRow from '../../Components/SwitchRow';
import UpdateStatus from '../../Components/UpdateStatusComponent';
import {DarkModeChoice} from '../../Components/TextSettingsSheet';

// Configuració: the same six options as always, in three groups. Everything comes from its
// controller (Controllers/SettingsController), which also saves the changes.

export interface SettingsValues {
    textSizeStep: number;
    darkMode: DarkModeChoice;
    useLatin: boolean;
    diocese: string;
    place: string;
    showVideos: boolean;
}

export interface SettingsInfo {
    appVersion: string;
    databaseVersion: string;
    // Behind ten touches on the approval text, with the logs
    technical: string[];
    logs: string;
}

export interface SettingsScreenProps {
    values: SettingsValues | null;
    dioceses: string[];
    places: string[];
    info: SettingsInfo;
    onTextSizeChange: (step: number) => void;
    onDarkModeChange: (choice: DarkModeChoice) => void;
    onLatinChange: (enabled: boolean) => void;
    onDioceseChange: (diocese: string) => void;
    onPlaceChange: (place: string) => void;
    onShowVideosChange: (enabled: boolean) => void;
}

const APPROVAL = "Text oficial de la Comissió Interdiocesana de Litúrgia de la Conferència Episcopal Tarraconense, aprovat pels bisbes de les diòcesis de parla catalana i confirmat per la Congregació per al Culte Diví i la Disciplina dels Sagraments: Prot. N. 312/15, 27 d'abril de 2016";
const TOUCHES_FOR_TECHNICAL_DATA = 10;

const DARK_MODE_SEGMENTS: {value: DarkModeChoice; label: string}[] = [
    {value: 'Automàtic', label: 'Automàtic'},
    {value: 'Activat', label: 'Activat'},
    {value: 'Desactivat', label: 'Desactivat'},
];

export default function SettingsScreen(props: SettingsScreenProps) {
    const theme = useTheme();
    const {colors} = theme;
    const {values, info} = props;
    const [sheet, setSheet] = useState<'diocese' | 'place' | null>(null);
    const [previewStep, setPreviewStep] = useState<number | null>(null);
    const [touches, setTouches] = useState(0);
    const technicalVisible = touches >= TOUCHES_FOR_TECHNICAL_DATA;

    const step = previewStep ?? values?.textSizeStep ?? 3;
    useEffect(() => setPreviewStep(null), [values?.textSizeStep]);

    const divider = <View style={[styles.divider, {backgroundColor: colors.divider}]}/>;
    const groupLabel = (label: string, first = false) => (
        <Text accessibilityRole="header" style={[styles.groupLabel, {color: colors.text3}, first ? null : styles.groupSpacing]}>{label}</Text>
    );
    const pickerRow = (label: string, value: string, onPress: () => void, help?: string) => (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${value}`}
            accessibilityHint={help}
            onPress={onPress}
            style={({pressed}) => [styles.pickerRow, {minHeight: theme.touch.large}, pressed ? {backgroundColor: colors.chipBackground} : null]}>
            <View style={styles.pickerLine}>
                <Text style={[styles.rowLabel, {color: colors.text, flex: 1}]}>{label}</Text>
                <Text style={[styles.rowLabel, {color: colors.text2}]}>{value}</Text>
                <Icon name="chevronDown" size={20} color={colors.text2}/>
            </View>
            {help ? <Text style={[styles.help, {color: colors.text3}]}>{help}</Text> : null}
        </Pressable>
    );

    return (
        <SafeAreaView edges={['bottom']} style={[styles.screen, {backgroundColor: colors.settingsBackground}]}>
            <ScrollView>
                <View testID="settings-column" style={[styles.content, {maxWidth: theme.layout.homeMaxWidth}]}>
                    {values ? (
                        <View style={styles.groups}>
                            {groupLabel('Lectura', true)}
                            <Card radius={theme.radius.tile}>
                                <View style={styles.block}>
                                    <Text style={[styles.rowLabel, {color: colors.text}]}>Mida del text</Text>
                                    <View style={styles.sliderRow}>
                                        <Text style={[styles.sliderA, {color: colors.text2}]}>A</Text>
                                        <Slider
                                            testID="text-size-slider"
                                            accessibilityLabel="Mida del text"
                                            accessibilityValue={{text: `Mida ${step} de ${MAX_TEXT_SIZE_SETTING}`}}
                                            style={styles.slider}
                                            minimumValue={MIN_TEXT_SIZE_SETTING}
                                            maximumValue={MAX_TEXT_SIZE_SETTING}
                                            step={1}
                                            value={values.textSizeStep}
                                            minimumTrackTintColor={colors.accentFill}
                                            maximumTrackTintColor={colors.track}
                                            thumbTintColor={colors.accentFill}
                                            onValueChange={(value) => setPreviewStep(Math.round(value))}
                                            onSlidingComplete={(value) => props.onTextSizeChange(Math.round(value))}/>
                                        <Text style={[styles.sliderABig, {color: colors.text2}]}>A</Text>
                                    </View>
                                    <View style={[styles.preview, {backgroundColor: colors.preview}]}>
                                        <Text
                                            testID="text-size-preview"
                                            style={{fontSize: convertTextSize(step), lineHeight: Math.round(convertTextSize(step) * 1.35), color: colors.text}}>
                                            <Text style={{color: colors.rubric}}>V.</Text>
                                            {' Obriu-me els llavis, Senyor.'}
                                        </Text>
                                    </View>
                                </View>
                                {divider}
                                <View style={styles.block}>
                                    <Text style={[styles.rowLabel, {color: colors.text}]}>Mode fosc</Text>
                                    <SegmentedControl
                                        accessibilityLabel="Mode fosc"
                                        segments={DARK_MODE_SEGMENTS}
                                        value={values.darkMode}
                                        onChange={props.onDarkModeChange}/>
                                </View>
                                {divider}
                                <SwitchRow
                                    label="Himnes en llatí"
                                    labelSize={17}
                                    value={values.useLatin}
                                    onValueChange={props.onLatinChange}
                                    style={styles.switchRow}/>
                            </Card>

                            {groupLabel('Calendari')}
                            <Card radius={theme.radius.tile}>
                                {pickerRow('Diòcesi', values.diocese, () => setSheet('diocese'))}
                                {divider}
                                {pickerRow('Lloc', values.place, () => setSheet('place'),
                                    'Algunes celebracions canvien segons on reses, com la dedicació de la catedral.')}
                            </Card>

                            {groupLabel('Missa')}
                            <Card radius={theme.radius.tile}>
                                <SwitchRow
                                    label="Vídeo de llengua de signes a l’Evangeli"
                                    labelSize={17}
                                    value={values.showVideos}
                                    onValueChange={props.onShowVideosChange}
                                    style={[styles.switchRow, styles.tallSwitchRow]}/>
                            </Card>
                        </View>
                    ) : null}

                    <View style={styles.footer}>
                        <Text onPress={() => setTouches(touches + 1)} style={[styles.footerText, {color: colors.text3}]}>{APPROVAL}</Text>
                        <Text style={[styles.footerText, {color: colors.text3}]}>
                            {`Versió de l'aplicació: ${info.appVersion}\nVersió de la base de dades: ${info.databaseVersion}`}
                        </Text>
                        <UpdateStatus/>
                        {technicalVisible ? (
                            <View testID="technical-data">
                                {info.technical.map((line) => (
                                    <Text key={line} selectable={true} style={[styles.footerText, {color: colors.text3}]}>{line}</Text>
                                ))}
                                <Text selectable={true} style={[styles.logs, {color: colors.text3}]}>{'Logs: \n'}{info.logs}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            </ScrollView>

            {values ? (
                <>
                    <OptionSheet
                        visible={sheet === 'diocese'}
                        title="Diòcesi"
                        options={props.dioceses}
                        value={values.diocese}
                        onClose={() => setSheet(null)}
                        onChoose={(diocese) => {
                            setSheet(null);
                            if (diocese !== values.diocese) props.onDioceseChange(diocese);
                        }}/>
                    <OptionSheet
                        visible={sheet === 'place'}
                        title="Lloc"
                        options={props.places}
                        value={values.place}
                        onClose={() => setSheet(null)}
                        onChoose={(place) => {
                            setSheet(null);
                            if (place !== values.place) props.onPlaceChange(place);
                        }}/>
                </>
            ) : null}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    // As wide as the home at most, so that on a tablet the two screens line up
    content: {
        width: '100%',
        alignSelf: 'center',
        paddingTop: 14,
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    groups: {
        gap: 8,
    },
    groupLabel: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.9,
        textTransform: 'uppercase',
        paddingHorizontal: 4,
    },
    groupSpacing: {
        paddingTop: 8,
    },
    block: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 8,
    },
    rowLabel: {
        fontSize: 17,
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sliderA: {
        fontSize: 15,
    },
    sliderABig: {
        fontSize: 26,
    },
    slider: {
        flex: 1,
        height: 40,
    },
    preview: {
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    divider: {
        height: 1,
        marginLeft: 16,
    },
    switchRow: {
        minHeight: 54,
        paddingHorizontal: 16,
    },
    tallSwitchRow: {
        minHeight: 60,
        paddingVertical: 8,
    },
    pickerRow: {
        justifyContent: 'center',
        paddingVertical: 12,
        paddingLeft: 16,
        paddingRight: 12,
        gap: 3,
    },
    pickerLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    help: {
        fontSize: 14,
        lineHeight: 19,
        paddingRight: 28,
    },
    footer: {
        paddingTop: 18,
        paddingHorizontal: 8,
        gap: 8,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        lineHeight: 17,
        textAlign: 'center',
    },
    logs: {
        fontSize: 11,
        textAlign: 'left',
        marginTop: 8,
    },
});
