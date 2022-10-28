import React, {Component} from 'react';
import {
    AppRegistry,
    Text,
    View,
    Platform,
    TouchableOpacity
} from 'react-native';
import HR from '../../../Components/HRComponent';
import GlobalFunctions from '../../../Utils/GlobalFunctions';
import SettingsService from '../../../Services/SettingsService';
import * as Logger from '../../../Utils/Logger';
// TODO: view shouldn't know these "current" variables. Controller should be in charge to prepare it all
// TODO: actually, it seems that these "views" are view + controller. When I separe it, it will make more sense
import {CurrentSettings, CurrentHoursLiturgy, CurrentLiturgyDayInformation} from '../../../Services/DataService';
import {SpecificLiturgyTimeType} from "../../../Services/CelebrationTimeEnums";

export default class LaudesComponent extends Component {
    constructor(props) {
        // TODO: duplicated code
        super(props);

        let auxNumSalmInv = CurrentSettings.InvitationPsalmOption;

        if (!GlobalFunctions.salmInvExists(auxNumSalmInv, props.titols)) {
            auxNumSalmInv = '94';
            props.setNumSalmInv('94');
            SettingsService.setSettingNumSalmInv('94');
        }

        this.state = {
            invitatori: false,
            numSalmInv: auxNumSalmInv,
        }

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

        this.setNumSalmInv = props.setNumSalmInv;
        this.titols = props.titols;
    }

    onSalmInvPress(numSalm) {
        this.setState({numSalmInv: numSalm});
        this.setNumSalmInv(numSalm);
        SettingsService.setSettingNumSalmInv(numSalm);
    }

    salmInvitatori(numSalm) {
        let salm94 = CurrentHoursLiturgy.Invitation.Psalm94;
        let salm99 = CurrentHoursLiturgy.Invitation.Psalm99;
        let salm66 = CurrentHoursLiturgy.Invitation.Psalm66;
        let salm23 = CurrentHoursLiturgy.Invitation.Psalm23;

        let style94 = this.styles.prayerTabButton;
        let style99 = this.styles.prayerTabButton;
        let style66 = this.styles.prayerTabButton;
        let style23 = this.styles.prayerTabButton;

        let psalmTitle = "";
        let psalmReference = "";
        let psalmText = "";

        switch (numSalm) {
            case '94':
                psalmTitle = "Salm 94\nInvitació a lloar Déu";
                psalmReference = "Mentre repetim aquell «avui», exhortem-nos cada dia els uns als altres (He 3, 13)";
                psalmText = salm94;
                style94 = this.styles.prayerTabButtonBold;
                break;
            case '99':
                psalmTitle = "Salm 99\nInvitació a lloar Déu en el seu temple";
                psalmReference = "El Senyor vol que els redimits cantin himnes de victòria (St. Atanasi)";
                psalmText = salm99;
                style99 = this.styles.prayerTabButtonBold;
                break;
            case '66':
                psalmTitle = "Salm 66\nInvitació als pobles a lloar Déu";
                psalmReference = "Sapigueu que el missatge de la salvació de Déu ha estat enviat a tots els pobles (Fets 28, 28)";
                psalmText = salm66;
                style66 = this.styles.prayerTabButtonBold;
                break;
            case '23':
                psalmTitle = "Salm 23\nEntrada del Senyor al santuari";
                psalmReference = "Les portes del cel s'obriren a Crist quan hi fou endut amb la seva humanitat (St. Ireneu)";
                psalmText = salm23;
                style23 = this.styles.prayerTabButtonBold;
                break;
        }

        const estrofes = psalmText.split("\n\n");
        const antifona = GlobalFunctions.rs(CurrentHoursLiturgy.Invitation.InvitationAntiphon);
        const gloriaString = "Glòria al Pare i al Fill    \ni a l’Esperit Sant.\nCom era al principi, ara i sempre    \ni pels segles dels segles. Amén.";

        return (
            <View>
                <View style={{alignItems: 'center'}}>
                    <View style={{flexDirection: 'row', paddingVertical: 10}}>
                        <TouchableOpacity onPress={this.onSalmInvPress.bind(this, '94')}>
                            <Text style={style94}>{"Salm 94  "}</Text>
                        </TouchableOpacity>
                        {GlobalFunctions.salmInvExists('99', this.titols) ?
                            <TouchableOpacity onPress={this.onSalmInvPress.bind(this, '99')}>
                                <Text style={style99}>{"  Salm 99  "}</Text>
                            </TouchableOpacity>
                            :
                            null
                        }
                        {GlobalFunctions.salmInvExists('66', this.titols) ?
                            <TouchableOpacity onPress={this.onSalmInvPress.bind(this, '66')}>
                                <Text style={style66}>{"  Salm 66  "}</Text>
                            </TouchableOpacity>
                            :
                            null
                        }
                        {GlobalFunctions.salmInvExists('23', this.titols) ?
                            <TouchableOpacity onPress={this.onSalmInvPress.bind(this, '23')}>
                                <Text style={style23}>{"  Salm 23"}</Text>
                            </TouchableOpacity>
                            :
                            null
                        }
                    </View>
                </View>

                <Text selectable={true} style={this.styles.red}>{"Ant. "}
                    <Text selectable={true} style={this.styles.black}>{antifona}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redCenter}>{psalmTitle}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View style={{flex: 2}}>
                    <Text selectable={true} style={this.styles.blackSmallItalicRight}>{psalmReference}</Text></View></View>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.black}>{estrofes[0]}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{"Ant. "}
                    <Text selectable={true} style={this.styles.black}>{antifona}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.black}>{estrofes[1]}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{"Ant. "}
                    <Text selectable={true} style={this.styles.black}>{antifona}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.black}>{estrofes[2]}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{"Ant. "}
                    <Text selectable={true} style={this.styles.black}>{antifona}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.black}>{estrofes[3]}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{"Ant. "}
                    <Text selectable={true} style={this.styles.black}>{antifona}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {estrofes.length > 4 ?
                    <View>
                        <Text selectable={true} style={this.styles.black}>{estrofes[4]}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{"Ant. "}
                            <Text selectable={true} style={this.styles.black}>{antifona}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    </View>
                    : null}
                {estrofes.length > 5 ?
                    <View>
                        <Text selectable={true} style={this.styles.black}>{estrofes[5]}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{"Ant. "}
                            <Text selectable={true} style={this.styles.black}>{antifona}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    </View>
                    : null}
                {estrofes.length > 6 ?
                    <View>
                        <Text selectable={true} style={this.styles.black}>{estrofes[6]}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{"Ant. "}
                            <Text selectable={true} style={this.styles.black}>{antifona}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    </View>
                    : null}
                <Text selectable={true} style={this.styles.black}>{gloriaString}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{"Ant. "}
                    <Text selectable={true} style={this.styles.black}>{antifona}</Text>
                </Text>
            </View>
        );
    }

    render() {
        try {
            return (
                <View>
                    {this.introduction()}
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
                    <Text selectable={true} style={this.styles.red}>{'CÀNTIC DE ZACARIES'}</Text>
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
                    {this.conclusion()}
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    {Platform.OS === 'android' ? null : <Text/>}
                </View>
            );
        } catch (error) {
            Logger.LogError(Logger.LogKeys.Screens, "render", error);
            return null;
        }
    }

    // TODO: duplicated code
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

    // TODO: duplicated code
    invitatoriButtons() {
        return (
            <View>
                <TouchableOpacity onPress={() => this.setState({invitatori: !this.state.invitatori})}>
                    <View style={{alignItems: 'center', paddingVertical: 10}}>
                        <Text
                            style={this.styles.hiddenPrayerButton}>{this.state.invitatori ? "Amagar" : "Començar amb"}{" l'invitatori"}</Text>
                    </View>
                </TouchableOpacity>
                {this.state.invitatori ?
                    <View>
                        <Text selectable={true} style={this.styles.red}>{"INVITATORI"}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    </View>
                    : null
                }
            </View>
        );
    }

    // TODO: duplicated code
    introduction() {
        const gloriaStringIntro = "Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.";
        const showInvitatory = this.state.invitatori ||
            CurrentLiturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_DIUM_PASQUA;

        if (showInvitatory) {
            const aux_obriume = 'Obriu-me els llavis, Senyor.';
            const aux_proclamare = 'I proclamaré la vostra lloança.';

            return (
                // TODO: imporve this method... if else.. not good
                <View>
                    {CurrentLiturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_DIUM_PASQUA ?
                        null :
                        <View>{this.invitatoriButtons()}</View>
                    }
                    <Text selectable={true} style={this.styles.red}>{'V. '}
                        <Text selectable={true} style={this.styles.black}>{aux_obriume}</Text>
                    </Text>
                    <Text selectable={true} style={this.styles.red}>{'R. '}
                        <Text selectable={true} style={this.styles.black}>{aux_proclamare}</Text>
                    </Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    {this.salmInvitatori(this.state.numSalmInv)}
                </View>
            )
        }
        else {
            const aux_sigueu = 'Sigueu amb nosaltres, Déu nostre.';
            const aux_senyor_veniu = 'Senyor, veniu a ajudar-nos.';
            // TODO: encapsulate
            const aux_isAleluia = CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.Q_CENDRA &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.Q_SETMANES &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.Q_DIUM_RAMS &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.Q_SET_SANTA &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.Q_TRIDU;

            return (
                <View>
                    {this.invitatoriButtons()}
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
                </View>
            )
        }
    }

    himne() {
        const aux_himne = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.Anthem);
        return (<Text selectable={true} style={this.styles.black}>{aux_himne}</Text>);
    }

    salmodia() {
        const aux_ant1 = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.FirstPsalm.Antiphon);
        const aux_titol1 = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.FirstPsalm.Title);
        let aux_com1 = "";
        if (CurrentHoursLiturgy.Laudes.FirstPsalm.Comment !== '-')
            aux_com1 = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.FirstPsalm.Comment);
        const aux_salm1 = this.salm(GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.FirstPsalm.Psalm));
        const aux_ant2 = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.SecondPsalm.Antiphon);
        const aux_titol2 = GlobalFunctions.canticSpace(GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.SecondPsalm.Title));
        let aux_com2 = "";
        if (CurrentHoursLiturgy.Laudes.SecondPsalm.Comment !== '-')
            aux_com2 = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.SecondPsalm.Comment);
        const aux_salm2 = this.salm(GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.SecondPsalm.Psalm));
        const aux_ant3 = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.ThirdPsalm.Antiphon);
        const aux_titol3 = GlobalFunctions.canticSpace(GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.ThirdPsalm.Title));
        let aux_com3 = "";
        if (CurrentHoursLiturgy.Laudes.ThirdPsalm.Comment !== '-')
            aux_com3 = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.ThirdPsalm.Comment);
        const aux_salm3 = this.salm(GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.ThirdPsalm.Psalm));

        return (
            <View>
                <Text selectable={true} style={this.styles.red}>{'Ant. 1.'}
                    <Text selectable={true} style={this.styles.black}> {aux_ant1}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redCenter}>{aux_titol1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {CurrentHoursLiturgy.Laudes.FirstPsalm.Comment !== '-' ?
                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View style={{flex: 2}}>
                        <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com1}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}</View></View> : null}
                <Text selectable={true} style={this.styles.black}>{aux_salm1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {CurrentHoursLiturgy.Laudes.FirstPsalm.HasGloryPrayer ?
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
                {CurrentHoursLiturgy.Laudes.SecondPsalm.Comment !== '-' ?
                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View style={{flex: 2}}>
                        <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com2}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}</View></View> : null}
                <Text selectable={true} style={this.styles.black}>{aux_salm2}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {CurrentHoursLiturgy.Laudes.SecondPsalm.HasGloryPrayer ?
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
                {CurrentHoursLiturgy.Laudes.com3 !== '-' ?
                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View style={{flex: 2}}>
                        <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com3}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}</View></View> : null}
                <Text selectable={true} style={this.styles.black}>{aux_salm3}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {CurrentHoursLiturgy.Laudes.ThirdPsalm.HasGloryPrayer ?
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
        const aux_vers = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.ShortReading.Quote);
        const aux_lectura_breu = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.ShortReading.ShortReading);
        return (
            <View>
                <Text selectable={true} style={this.styles.red}>{aux_vers}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.black}>{aux_lectura_breu}</Text>
            </View>
        )
    }

    responsori() {
        if (CurrentHoursLiturgy.Laudes.ShortResponsory.HasSpecialAntiphon) {
            const aux_ant = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.ShortResponsory.SpecialAntiphon);
            return (
                <View>
                    <Text selectable={true} style={this.styles.red}>{'Ant.'}
                        <Text selectable={true} style={this.styles.black}> {aux_ant}</Text>
                    </Text>
                </View>
            )
        }
        else {
            const aux_resp_1_2 = GlobalFunctions.respTogether(GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.ShortResponsory.FirstPart), GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.ShortResponsory.SecondPart));
            const aux_resp_2 = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.ShortResponsory.SecondPart);
            const aux_resp_3 = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.ShortResponsory.ThirdPart);
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
        const aux_ant = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.EvangelicalAntiphon);
        const aux_titol = "Càntic\nLc 1, 68-79\nEl Messies i el seu Precursor";
        const aux_salm = this.salm(CurrentHoursLiturgy.Laudes.EvangelicalChant);
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

    // TODO: duplicated code
    convertN(pregs, papa, bisbe) {
        if (pregs.search("papa N.") !== -1) {
            pregs = pregs.replace("papa N.", "papa " + papa);
        }
        else if (pregs.search("Papa N.") !== -1) {
            pregs = pregs.replace("Papa N.", "papa " + papa);
        }
        if (pregs.search("bisbe N.") !== -1) {
            pregs = pregs.replace("bisbe N.", "bisbe " + bisbe);
        }
        return pregs;
    }

    prayers() {
        let allPregs = GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.Prayers);

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
        const aux_oracio = GlobalFunctions.completeOracio(GlobalFunctions.rs(CurrentHoursLiturgy.Laudes.FinalPrayer), false);
        return (<Text selectable={true} style={this.styles.black}>{aux_oracio}</Text>);
    }

    conclusion() {
        const aux_benediccio = 'Que el Senyor ens beneeixi i ens guardi de tot mal, i ens dugui a la vida eterna.';
        return (
            <View>
                <Text selectable={true} style={this.styles.red}>{'V. '}
                    <Text selectable={true} style={this.styles.black}>{aux_benediccio}</Text>
                </Text>
                <Text selectable={true} style={this.styles.red}>{'R. '}
                    <Text selectable={true} style={this.styles.black}>{'Amén.'}</Text>
                </Text>
            </View>
        )
    }
}

AppRegistry.registerComponent('LaudesComponent', () => LaudesComponent);
