import React, {Component} from 'react';
import {
    AppRegistry,
    Text,
    View,
    Platform
} from 'react-native';
import HR from '../../../Components/HRComponent';
import GLOBAL from '../../../Utils/GlobalKeys';
import GF from '../../../Utils/GlobalFunctions';
import * as Logger from '../../../Utils/Logger';
import GlobalFunctions from "../../../Utils/GlobalFunctions";
import {CurrentHoursLiturgy, CurrentLiturgyDayInformation, CurrentSettings} from "../../../Services/DataService";
import {SpecificLiturgyTimeType} from "../../../Services/CelebrationTimeEnums";

export default class VespersComponent extends Component {
    constructor(props) {
        super(props);
    
        this.styles = {
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
    }

    render() {
        try {
            const gloriaStringIntro = "Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.";
            const aux_sigueu = 'Sigueu amb nosaltres, Déu nostre.';
            const aux_senyor_veniu = 'Senyor, veniu a ajudar-nos.';
            // TODO: encapsulate
            const aux_isAleluia = CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentAshes &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentWeeks &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PalmSunday &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.HolyWeek &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentTriduum;

            return (
                <View>
                    <Text selectable={true} style={this.styles.red}>{'V. '}
                        <Text selectable={true} style={this.styles.black}>{aux_sigueu}</Text>
                    </Text>
                    <Text selectable={true} style={this.styles.red}>{'R. '}
                        <Text selectable={true} style={this.styles.black}>{aux_senyor_veniu}</Text>
                    </Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.black}>{gloriaStringIntro}
                        {aux_isAleluia ?
                            <Text selectable={true} style={this.styles.black}>{' Al·leluia.'}</Text> : null
                        }
                    </Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{'HIMNE'}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    {this.himne()}
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{'SALMÒDIA'}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    {this.salmodia()}
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{'LECTURA BREU'}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    {this.lecturaBreu()}
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{'RESPONSORI BREU'}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    {this.responsori()}
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{'CÀNTIC DE MARIA'}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    {this.chant()}
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{'PREGÀRIES'}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    {this.prayers()}
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{'ORACIÓ'}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    {this.finalPrayer()}
                    <Text selectable={true} style={this.styles.red}>{'R.'}
                        <Text selectable={true} style={this.styles.black}>{' Amén.'}</Text>
                    </Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{'CONCLUSIÓ'}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{'V.'}
                        <Text selectable={true}
                              style={this.styles.black}>{' Que el Senyor ens beneeixi i ens guardi de tot mal, i ens dugui a la vida eterna.'}</Text>
                    </Text>
                    <Text selectable={true} style={this.styles.red}>{'R.'}
                        <Text selectable={true} style={this.styles.black}>{' Amén.'}</Text>
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
        salm = salm.replace(/    [*]/g, '');
        salm = salm.replace(/   [*]/g, '');
        salm = salm.replace(/  [*]/g, '');
        salm = salm.replace(/ [*]/g, '');
        salm = salm.replace(/    [†]/g, '');
        salm = salm.replace(/   [†]/g, '');
        salm = salm.replace(/  [†]/g, '');
        salm = salm.replace(/ [†]/g, '');
        return salm;
    }

    himne() {
        const aux_himne = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.Anthem);
        return (<Text selectable={true} style={this.styles.black}>{aux_himne}</Text>);
    }

    salmodia() {
        const aux_ant1 = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.FirstPsalm.Antiphon);
        const aux_titol1 = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.FirstPsalm.Title);
        let aux_com1 = "";
        if (CurrentHoursLiturgy.Vespers.FirstPsalm.Comment !== '-')
            aux_com1 = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.FirstPsalm.Comment);
        const aux_salm1 = this.salm(GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.FirstPsalm.Psalm));
        const aux_ant2 = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.SecondPsalm.Antiphon);
        const aux_titol2 = GlobalFunctions.canticSpace(GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.SecondPsalm.Title));
        let aux_com2 = "";
        if (CurrentHoursLiturgy.Vespers.SecondPsalm.Comment !== '-')
            aux_com2 = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.SecondPsalm.Comment);
        const aux_salm2 = this.salm(GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.SecondPsalm.Psalm));
        const aux_ant3 = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.ThirdPsalm.Antiphon);
        const aux_titol3 = GlobalFunctions.canticSpace(GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.ThirdPsalm.Title));
        let aux_com3 = "";
        if (CurrentHoursLiturgy.Vespers.ThirdPsalm.Comment !== '-')
            aux_com3 = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.ThirdPsalm.Comment);
        const aux_salm3 = this.salm(GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.ThirdPsalm.Psalm));

        return (
            <View>
                <Text selectable={true} style={this.styles.red}>{'Ant. 1.'}
                    <Text selectable={true} style={this.styles.black}> {aux_ant1}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redCenter}>{aux_titol1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {CurrentHoursLiturgy.Vespers.FirstPsalm.Comment !== '-' ?
                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View style={{flex: 2}}>
                        <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com1}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}</View></View> : null}
                <Text selectable={true} style={this.styles.black}>{aux_salm1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {CurrentHoursLiturgy.Vespers.FirstPsalm.HasGloryPrayer ?
                    <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
                    :
                    <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Ant. 1.'}
                    <Text selectable={true} style={this.styles.black}> {aux_ant1}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Ant. 2.'}
                    <Text selectable={true} style={this.styles.black}> {aux_ant2}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redCenter}>{aux_titol2}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {CurrentHoursLiturgy.Vespers.SecondPsalm.Comment !== '-' ?
                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View style={{flex: 2}}>
                        <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com2}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}</View></View> : null}
                <Text selectable={true} style={this.styles.black}>{aux_salm2}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {CurrentHoursLiturgy.Vespers.SecondPsalm.HasGloryPrayer ?
                    <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
                    :
                    <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Ant. 2.'}
                    <Text selectable={true} style={this.styles.black}> {aux_ant2}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Ant. 3.'}
                    <Text selectable={true} style={this.styles.black}> {aux_ant3}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redCenter}>{aux_titol3}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {CurrentHoursLiturgy.Vespers.com3 !== '-' ?
                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View style={{flex: 2}}>
                        <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com3}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}</View></View> : null}
                <Text selectable={true} style={this.styles.black}>{aux_salm3}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {CurrentHoursLiturgy.Vespers.ThirdPsalm.HasGloryPrayer ?
                    <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
                    :
                    <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Ant. 3.'}
                    <Text selectable={true} style={this.styles.black}> {aux_ant3}</Text>
                </Text>
            </View>
        );
    }

    lecturaBreu() {
        const aux_vers = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.ShortReading.Quote);
        const aux_lectura_breu = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.ShortReading.ShortReading);
        return (
            <View>
                <Text selectable={true} style={this.styles.red}>{aux_vers}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.black}>{aux_lectura_breu}</Text>
            </View>
        )
    }

    responsori() {
        if (CurrentHoursLiturgy.Vespers.ShortResponsory.HasSpecialAntiphon) {
            const aux_ant = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.ShortResponsory.SpecialAntiphon);
            return (
                <View>
                    <Text selectable={true} style={this.styles.red}>{'Ant.'}
                        <Text selectable={true} style={this.styles.black}> {aux_ant}</Text>
                    </Text>
                </View>
            )
        }
        else {
            const aux_resp_1_2 = GlobalFunctions.respTogether(GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.ShortResponsory.FirstPart), GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.ShortResponsory.SecondPart));
            const aux_resp_2 = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.ShortResponsory.SecondPart);
            const aux_resp_3 = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.ShortResponsory.ThirdPart);
            const aux_gloria_half = "Glòria al Pare i al Fill i a l'Esperit Sant.";

            // TODO: duplicated code
            return (
                <View>
                    <Text selectable={true} style={this.styles.red}>{'V. '}
                        <Text selectable={true} style={this.styles.black}>{aux_resp_1_2}</Text>
                    </Text>
                    <Text selectable={true} style={this.styles.red}>{'R. '}
                        <Text selectable={true} style={this.styles.black}>{aux_resp_1_2}</Text>
                    </Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{'V. '}
                        <Text selectable={true} style={this.styles.black}>{aux_resp_3}</Text>
                    </Text>
                    <Text selectable={true} style={this.styles.red}>{'R. '}
                        <Text selectable={true} style={this.styles.black}>{aux_resp_2}</Text>
                    </Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{'V. '}
                        <Text selectable={true} style={this.styles.black}>{aux_gloria_half}</Text>
                    </Text>
                    <Text selectable={true} style={this.styles.red}>{'R. '}
                        <Text selectable={true} style={this.styles.black}>{aux_resp_1_2}</Text>
                    </Text>
                </View>
            )
        }
    }

    chant() {
        const aux_ant = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.EvangelicalAntiphon);
        const aux_titol = "Càntic\nLc 1, 68-79\nEl Messies i el seu Precursor";
        const aux_salm = this.salm(CurrentHoursLiturgy.Vespers.EvangelicalChant);
        const aux_gloria = "Glòria.";

        // TODO: duplicated code
        return (
            <View>
                <Text selectable={true} style={this.styles.red}>{'Ant. '}
                    <Text selectable={true} style={this.styles.black}>{aux_ant}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redCenter}>{aux_titol}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.black}>{aux_salm}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.blackItalic}>{aux_gloria}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Ant. '}
                    <Text selectable={true} style={this.styles.black}>{aux_ant}</Text>
                </Text>
            </View>
        );
    }

    convertN(pregs, papa, bisbe) {
        if (pregs.search("papa N.") !== -1) {
            pregs = pregs.replace("papa N.", "papa " + papa);
        } else if (pregs.search("Papa N.") !== -1) {
            pregs = pregs.replace("Papa N.", "papa " + papa);
        }
        if (pregs.search("bisbe N.") !== -1) {
            pregs = pregs.replace("bisbe N.", "bisbe " + bisbe);
        }
        return pregs;
    }

    prayers() {
        let allPregs = GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.Prayers);

        if (allPregs === null || allPregs === undefined || allPregs === '' || allPregs === '-')
            return (<Text selectable={true} style={this.styles.black}>{"-"}</Text>);

        allPregs = this.convertN(allPregs, CurrentHoursLiturgy.ConcreteNamesInPrayers.Pope, CurrentHoursLiturgy.ConcreteNamesInPrayers.Bishop);

        if (allPregs.match(/—/g, "")) var numGuio = allPregs.match(/—/g, "").length;
        else return (<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
        if (allPregs.match(/\n/g, "")) var numEnter = allPregs.match(/\n/g, "").length;
        else return (<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);

        if (numEnter !== numGuio * 3 + 3) {//every prayer have 3 spaces and intro have 3 more
            return (<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
        } else {
            var introPregs = allPregs.split(":")[0];
            if (allPregs.search(introPregs + ':') !== -1) {
                var pregsNoIntro = allPregs.replace(introPregs + ':', '');
                if (pregsNoIntro !== '') {
                    while (pregsNoIntro.charAt(0) === '\n' || pregsNoIntro.charAt(0) === ' ') {
                        pregsNoIntro = pregsNoIntro.substring(1, pregsNoIntro.length);
                    }
                }
            } else {
                Logger.Log(Logger.LogKeys.Screens, "pregaries", "InfoLog. something incorrect. Pregaries 1");
                return (<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
            }

            var respPregs = pregsNoIntro.split("\n")[0];
            if (pregsNoIntro.search(respPregs + '\n\n') !== -1) {
                var pregaries = pregsNoIntro.replace(respPregs + '\n\n', '');
            } else {
                Logger.Log(Logger.LogKeys.Screens, "pregaries", "InfoLog. something incorrect. Pregaries 2");
                return (<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
            }

            if (pregaries.search(": Pare nostre.") !== -1) {
                pregaries = pregaries.replace(": Pare nostre.", ':');
            } else {
                Logger.Log(Logger.LogKeys.Screens, "pregaries", "InfoLog. something incorrect. Pregaries 3");
                return (<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
            }

            var pregsFinalPart = pregaries.split("—")[numGuio].split(".\n\n")[1];
            if (pregaries.search('\n\n' + pregsFinalPart) !== -1) {
                pregaries = pregaries.replace('\n\n' + pregsFinalPart, '');
            } else {
                Logger.Log(Logger.LogKeys.Screens, "pregaries", "InfoLog. something incorrect. Pregaries 4");
                return (<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
            }
        }

        const aux_intencions = "Aquí es poden afegir altres intencions.";

        // TODO: duplicated code
        return (
            <View>
                <Text selectable={true} style={this.styles.black}>{introPregs}{':'}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.blackItalic}>{respPregs}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.black}>{pregaries}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redItalic}>{aux_intencions}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.black}>{pregsFinalPart}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.blackItalic}>{"Pare nostre."}</Text>
            </View>
        );
    }

    finalPrayer() {
        const aux_oracio = GlobalFunctions.completeOracio(GlobalFunctions.rs(CurrentHoursLiturgy.Vespers.FinalPrayer), false);
        return (<Text selectable={true} style={this.styles.black}>{aux_oracio}</Text>);
    }
}

AppRegistry.registerComponent('VespersComponent', () => VespersComponent);
