import React, {Component} from 'react';
import {
    AppRegistry,
    Text,
    View,
    Platform
} from 'react-native';
import HR from '../../../Components/HRComponent';
import GlobalFunctions from '../../../Utils/GlobalFunctions';
import * as Logger from '../../../Utils/Logger';
import {SpecificHour} from "../../../Models/HoursLiturgy/Hours";
import {CurrentLiturgyDayInformation, CurrentSettings} from "../../../Services/DataService";
import {SpecificLiturgyTimeType} from "../../../Services/CelebrationTimeEnums";
import {StringManagement} from "../../../Utils/StringManagement";

let specificHour: SpecificHour;
let styles;

export default class HoursComponent extends Component {
    constructor(props) {
        super(props);

        styles = {
            black: GlobalFunctions.getStyle("GENERIC", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            blackBold: GlobalFunctions.getStyle("GENERIC_BOLD", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            blackItalic: GlobalFunctions.getStyle("GENERIC_ITALIC", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            blackSmallItalicRight: GlobalFunctions.getStyle("GENERIC_SMALL_ITALIC_RIGHT", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            blackJustified: GlobalFunctions.getStyle("GENERIC_JUSTIFIED", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            red: GlobalFunctions.getStyle("ACCENT", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            redItalic: GlobalFunctions.getStyle("ACCENT_ITALIC", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            redCenter: GlobalFunctions.getStyle("ACCENT_CENTER", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            redCenterBold: GlobalFunctions.getStyle("ACCENT_CENTER_BOLD", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            redSmallItalicRight: GlobalFunctions.getStyle("ACCENT_SMALL_ITALIC_RIGHT", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            hiddenPrayerButton: GlobalFunctions.getStyle("HIDDEN_PRAYER_BUTTON", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            prayerTabButton: GlobalFunctions.getStyle("PRAYER_TAB_BUTTON", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            prayerTabButtonBold: GlobalFunctions.getStyle("PRAYER_TAB_BUTTON_BOLD", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
        };

        specificHour = this.props.HORA_MENOR;
    }

    render() {
        try {

            const gloriaStringIntro = "Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.";
            const aux_isAleluia = CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentAshes &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentWeeks &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PalmSunday &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.HolyWeek &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentTriduum;

            return (
                <View>
                    <Text selectable={true} style={styles.red}>{'V. '}
                        <Text selectable={true} style={styles.black}>{'Sigueu amb nosaltres, Déu nostre.'}</Text>
                    </Text>
                    <Text selectable={true} style={styles.red}>{'R. '}
                        <Text selectable={true} style={styles.black}>{'Senyor, veniu a ajudar-nos.'}</Text>
                    </Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={styles.black}>{gloriaStringIntro}
                        {aux_isAleluia ?
                            <Text selectable={true} style={styles.black}>{" Al·leluia."}</Text> : null
                        }
                    </Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={styles.red}>{'HIMNE'}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    {this.himne()}
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={styles.red}>{'SALMÒDIA'}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    {this.salmodia()}
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={styles.red}>{'LECTURA BREU'}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    {this.lecturaBreuResp()}
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={styles.red}>{'ORACIÓ'}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={styles.blackBold}>{'Preguem.'}</Text>
                    {this.finalPrayer()}
                    <Text selectable={true} style={styles.red}>{'R. '}
                        <Text selectable={true} style={styles.black}>{'Amén.'}</Text>
                    </Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={styles.red}>{'CONCLUSIÓ'}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={styles.red}>{'V. '}
                        <Text selectable={true} style={styles.black}>{'Beneïm el Senyor.'}</Text>
                    </Text>
                    <Text selectable={true} style={styles.red}>{'R. '}
                        <Text selectable={true} style={styles.black}>{'Donem gràcies a Déu.'}</Text>
                    </Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    {Platform.OS === 'android' ? null : <Text/>}
                </View>
            );
        } catch (error) {
            Logger.LogError(Logger.LogKeys.Screens, "render", error);
            return null;
        }
    }

    salm(salm) {
        if (!salm) return null;
        salm = salm.replace(/ {4}[*]/g, '');
        salm = salm.replace(/ {3}[*]/g, '');
        salm = salm.replace(/ {2}[*]/g, '');
        salm = salm.replace(/ [*]/g, '');
        salm = salm.replace(/ {4}[†]/g, '');
        salm = salm.replace(/ {3}[†]/g, '');
        salm = salm.replace(/ {2}[†]/g, '');
        salm = salm.replace(/ [†]/g, '');
        return salm;
    }

    himne() {
        const aux_himne = GlobalFunctions.rs(specificHour.Anthem);
        return (<Text selectable={true} style={styles.black}>{aux_himne}</Text>);
    }

    salmodia() {
        const aux_antifones = specificHour.HasMultipleAntiphons;
        const aux_ant1 = aux_antifones ? GlobalFunctions.rs(specificHour.FirstPsalm.Antiphon) : "";
        const aux_ant = !aux_antifones ? GlobalFunctions.rs(specificHour.UniqueAntiphon) : "";
        const aux_titol1 = GlobalFunctions.rs(specificHour.FirstPsalm.Title);
        const aux_has_com1 = StringManagement.HasLiturgyContent(specificHour.FirstPsalm.Comment);
        const aux_com1 = aux_has_com1 ? GlobalFunctions.rs(specificHour.FirstPsalm.Comment) : "";
        const aux_salm1 = this.salm(GlobalFunctions.rs(specificHour.FirstPsalm.Psalm));
        const aux_ant2 = aux_antifones ? GlobalFunctions.rs(specificHour.SecondPsalm.Antiphon) : "";
        const aux_titol2 = GlobalFunctions.rs(specificHour.SecondPsalm.Title);
        const aux_has_com2 = StringManagement.HasLiturgyContent(specificHour.SecondPsalm.Comment);
        const aux_com2 = aux_has_com2 ? GlobalFunctions.rs(specificHour.SecondPsalm.Comment) : "";
        const aux_salm2 = this.salm(GlobalFunctions.rs(specificHour.SecondPsalm.Psalm));
        const aux_ant3 = aux_antifones ? GlobalFunctions.rs(specificHour.ThirdPsalm.Antiphon) : "";
        const aux_titol3 = GlobalFunctions.rs(specificHour.ThirdPsalm.Title);
        const aux_has_com3 = StringManagement.HasLiturgyContent(specificHour.ThirdPsalm.Comment);
        const aux_com3 = aux_has_com3 ? GlobalFunctions.rs(specificHour.ThirdPsalm.Comment) : "";
        const aux_salm3 = this.salm(GlobalFunctions.rs(specificHour.ThirdPsalm.Psalm));

        return (
            <View>
                {aux_antifones ?
                    <View>
                        <Text selectable={true} style={styles.red}>{'Ant. 1. '}
                            <Text selectable={true} style={styles.black}>{aux_ant1}</Text>
                        </Text>
                    </View>
                    :
                    <View>
                        <Text selectable={true} style={styles.red}>{'Ant. '}
                            <Text selectable={true} style={styles.black}>{aux_ant}</Text>
                        </Text>
                    </View>
                }
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={styles.redCenter}>{aux_titol1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {aux_has_com1 ?
                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View style={{flex: 2}}>
                        <Text selectable={true} style={styles.blackSmallItalicRight}>{aux_com1}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}</View></View> : null}
                <Text selectable={true} style={styles.black}>{aux_salm1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {specificHour.FirstPsalm.HasGloryPrayer ?
                    <Text selectable={true} style={styles.blackItalic}>{"Glòria."}</Text>
                    :
                    <Text selectable={true} style={styles.redItalic}>{"S'omet el Glòria."}</Text>}
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {aux_antifones ?
                    <View>
                        <Text selectable={true} style={styles.red}>{'Ant. 1. '}
                            <Text selectable={true} style={styles.black}>{aux_ant1}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={styles.red}>{'Ant. 2. '}
                            <Text selectable={true} style={styles.black}>{aux_ant2}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    </View>
                    : null}
                <Text selectable={true} style={styles.redCenter}>{aux_titol2}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {aux_has_com2 ?
                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View style={{flex: 2}}>
                        <Text selectable={true} style={styles.blackSmallItalicRight}>{aux_com2}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}</View></View> : null}
                <Text selectable={true} style={styles.black}>{aux_salm2}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {specificHour.SecondPsalm.HasGloryPrayer ?
                    <Text selectable={true} style={styles.blackItalic}>{"Glòria."}</Text>
                    :
                    <Text selectable={true} style={styles.redItalic}>{"S'omet el Glòria."}</Text>}
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {aux_antifones ?
                    <View>
                        <Text selectable={true} style={styles.red}>{'Ant. 2. '}
                            <Text selectable={true} style={styles.black}>{aux_ant2}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={styles.red}>{'Ant. 3. '}
                            <Text selectable={true} style={styles.black}>{aux_ant3}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    </View>
                    : null}
                <Text selectable={true} style={styles.redCenter}>{aux_titol3}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {aux_has_com3 ?
                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View style={{flex: 2}}>
                        <Text selectable={true} style={styles.blackSmallItalicRight}>{aux_com3}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}</View></View> : null}
                <Text selectable={true} style={styles.black}>{aux_salm3}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {specificHour.ThirdPsalm.HasGloryPrayer ?
                    <Text selectable={true} style={styles.blackItalic}>{"Glòria."}</Text>
                    :
                    <Text selectable={true} style={styles.redItalic}>{"S'omet el Glòria."}</Text>}
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {aux_antifones ?
                    <View>
                        <Text selectable={true} style={styles.red}>{'Ant. 3. '}
                            <Text selectable={true} style={styles.black}>{aux_ant3}</Text>
                        </Text>
                    </View>
                    :
                    <View>
                        <Text selectable={true} style={styles.red}>{'Ant. '}
                            <Text selectable={true} style={styles.black}>{aux_ant}</Text>
                        </Text>
                    </View>
                }
            </View>
        );
    }

    lecturaBreuResp() {
        const aux_vers = GlobalFunctions.rs(specificHour.ShortReading.Quote);
        const aux_lecturaBreu = GlobalFunctions.rs(specificHour.ShortReading.ShortReading);
        const aux_respV = GlobalFunctions.rs(specificHour.Responsory.Versicle);
        const aux_respR = GlobalFunctions.rs(specificHour.Responsory.Response);

        return (
            <View>
                <Text selectable={true} style={styles.red}>{aux_vers}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={styles.black}>{aux_lecturaBreu}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={styles.red}>{'V. '}
                    <Text selectable={true} style={styles.black}>{aux_respV}</Text>
                </Text>
                <Text selectable={true} style={styles.red}>{'R. '}
                    <Text selectable={true} style={styles.black}>{aux_respR}</Text>
                </Text>
            </View>
        )
    }

    finalPrayer() {
        const aux_oracio = GlobalFunctions.completeOracio(GlobalFunctions.rs(specificHour.FinalPrayer), true);
        return (<Text selectable={true} style={styles.black}>{aux_oracio}</Text>);
    }
}

AppRegistry.registerComponent('HoursComponent', () => HoursComponent);
