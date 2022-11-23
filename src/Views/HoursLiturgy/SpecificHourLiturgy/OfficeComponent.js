import React, {Component} from 'react';
import {
    AppRegistry,
    Text,
    View,
    Platform,
    TouchableOpacity
} from 'react-native';
import HR from '../../../Components/HRComponent';
import GlobalKeys from '../../../Utils/GlobalKeys';
import GlobalViewFunctions from '../../../Utils/GlobalViewFunctions';
import SettingsService from '../../../Services/SettingsService';
import * as Logger from '../../../Utils/Logger';
import {CurrentHoursLiturgy, CurrentLiturgyDayInformation, CurrentSettings} from "../../../Services/DataService";
import {SpecificLiturgyTimeType} from "../../../Services/CelebrationTimeEnums";

export default class OfficeComponent extends Component {
    constructor(props) {
        super(props);
        let auxNumSalmInv = CurrentSettings.InvitationPsalmOption;

        if (!GlobalViewFunctions.salmInvExists(auxNumSalmInv, props.titols)) {
            auxNumSalmInv = '94';
            props.setNumSalmInv('94');
            SettingsService.setSettingNumSalmInv('94');
        }

        this.state = {
            invitatori: props.superTestMode,
            numSalmInv: auxNumSalmInv,
        }

        this.styles = {
            black: GlobalViewFunctions.getStyle("GENERIC", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            blackBold: GlobalViewFunctions.getStyle("GENERIC_BOLD", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            blackItalic: GlobalViewFunctions.getStyle("GENERIC_ITALIC", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            blackSmallItalicRight: GlobalViewFunctions.getStyle("GENERIC_SMALL_ITALIC_RIGHT", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            blackJustified: GlobalViewFunctions.getStyle("GENERIC_JUSTIFIED", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            red: GlobalViewFunctions.getStyle("ACCENT", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            redItalic: GlobalViewFunctions.getStyle("ACCENT_ITALIC", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            redCenter: GlobalViewFunctions.getStyle("ACCENT_CENTER", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            redCenterBold: GlobalViewFunctions.getStyle("ACCENT_CENTER_BOLD", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            redSmallItalicRight: GlobalViewFunctions.getStyle("ACCENT_SMALL_ITALIC_RIGHT", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            hiddenPrayerButton: GlobalViewFunctions.getStyle("HIDDEN_PRAYER_BUTTON", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            prayerTabButton: GlobalViewFunctions.getStyle("PRAYER_TAB_BUTTON", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            prayerTabButtonBold: GlobalViewFunctions.getStyle("PRAYER_TAB_BUTTON_BOLD", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
        };

        this.setNumSalmInv = props.setNumSalmInv;
        this.titols = props.titols;
    }

    render() {
        try {
            if (CurrentLiturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
                var aux_vetlla = "La Vetlla pasqual substitueix avui l'Ofici de lectura.";
                var aux_participen = "Els qui no participen en la solemne Vetlla pasqual n'escolliran almenys quatre lectures, amb els corresponents salms responsorials i oracions. Les lectures més adients són les que segueixen."
                var aux_comença = "L'Ofici comença directament per les lectures.";

                return (
                    <View>
                        <Text selectable={true} style={this.styles.redCenter}>{aux_vetlla}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.redCenter}>{aux_participen}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.redCenter}>{aux_comença}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        {this.lecturesDiumPasqua()}
                        {this.himneOhDeu()}
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{'ORACIÓ'}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.blackBold}>{'Preguem.'}</Text>
                        {this.finalPrayer()}
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{'CONCLUSIÓ'}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{'V. '}
                            <Text selectable={true} style={this.styles.black}>{'Beneïm el Senyor.'}</Text>
                        </Text>
                        <Text selectable={true} style={this.styles.red}>{'R. '}
                            <Text selectable={true} style={this.styles.black}>{'Donem gràcies a Déu.'}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        {Platform.OS === 'android' ? null : <Text/>}
                    </View>
                );
            }
            else {
                return (
                    <View>
                        {this.introduction()}
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true}
                              style={this.styles.red}>{"HIMNE"}{(CurrentLiturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary && CurrentHoursLiturgy.Office.IsDarkAnthem) ? " (nit)" : " (dia)"}</Text>
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
                        <Text selectable={true} style={this.styles.red}>{'VERS'}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        {this.vers()}
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{'LECTURES'}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        {this.lectures()}
                        {this.himneOhDeu()}
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{'ORACIÓ'}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.blackBold}>{'Preguem.'}</Text>
                        {this.finalPrayer()}
                        <Text selectable={true} style={this.styles.red}>{'R. '}
                            <Text selectable={true} style={this.styles.black}>{'Amén.'}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{'CONCLUSIÓ'}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{'V. '}
                            <Text selectable={true} style={this.styles.black}>{'Beneïm el Senyor.'}</Text>
                        </Text>
                        <Text selectable={true} style={this.styles.red}>{'R. '}
                            <Text selectable={true} style={this.styles.black}>{'Donem gràcies a Déu.'}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        {Platform.OS === 'android' ? null : <Text/>}
                    </View>
                );
            }
        } catch (error) {
            Logger.LogError(Logger.LogKeys.Screens, "remder", error);
            if (this.superTestMode) this.testErrorCB();
            return null;
        }
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
        const antifona = GlobalViewFunctions.rs(CurrentHoursLiturgy.Invitation.InvitationAntiphon);
        const gloriaString = "Glòria al Pare i al Fill    \ni a l’Esperit Sant.\nCom era al principi, ara i sempre    \ni pels segles dels segles. Amén.";

        return (
            <View>
                <View style={{alignItems: 'center'}}>
                    <View style={{flexDirection: 'row', paddingVertical: 10}}>
                        <TouchableOpacity onPress={this.onSalmInvPress.bind(this, '94')}>
                            <Text style={style94}>{"Salm 94  "}</Text>
                        </TouchableOpacity>
                        {GlobalViewFunctions.salmInvExists('99', this.titols) ?
                            <TouchableOpacity onPress={this.onSalmInvPress.bind(this, '99')}>
                                <Text style={style99}>{"  Salm 99  "}</Text>
                            </TouchableOpacity>
                            :
                            null
                        }
                        {GlobalViewFunctions.salmInvExists('66', this.titols) ?
                            <TouchableOpacity onPress={this.onSalmInvPress.bind(this, '66')}>
                                <Text style={style66}>{"  Salm 66  "}</Text>
                            </TouchableOpacity>
                            :
                            null
                        }
                        {GlobalViewFunctions.salmInvExists('23', this.titols) ?
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

    // TODO: [UI Refactor] duplicated code
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

    // TODO: [UI Refactor] duplicated code
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

    // TODO: [UI Refactor] duplicated code
    introduction() {
        const gloriaStringIntro = "Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.";
        const showInvitatory = this.state.invitatori;

        if (showInvitatory) {
            const aux_obriume = 'Obriu-me els llavis, Senyor.';
            const aux_proclamare = 'I proclamaré la vostra lloança.';

            return (
                <View>
                    {this.invitatoriButtons()}
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
            // TODO: [UI Refactor] encapsulate
            const aux_isAleluia = CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentAshes &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentWeeks &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PalmSunday &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.HolyWeek &&
                CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentTriduum;

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

    // TODO: [UI Refactor] duplicated code
    himne() {
        const aux_himne = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.Anthem);
        return (<Text selectable={true} style={this.styles.black}>{aux_himne}</Text>);
    }

    // TODO: [UI Refactor] at this point I will stop mention duplication. Is all super duplicated and all Views need a complete refactor
    salmodia() {
        const aux_ant1 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstPsalm.Antiphon);
        const aux_titol1 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstPsalm.Title);
        let aux_com1 = "";
        if (CurrentHoursLiturgy.Office.FirstPsalm.Comment !== '-')
            aux_com1 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstPsalm.Comment);
        const aux_salm1 = this.salm(GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstPsalm.Psalm));
        const aux_ant2 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondPsalm.Antiphon);
        const aux_titol2 = GlobalViewFunctions.canticSpace(GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondPsalm.Title));
        let aux_com2 = "";
        if (CurrentHoursLiturgy.Office.SecondPsalm.Comment !== '-')
            aux_com2 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondPsalm.Comment);
        const aux_salm2 = this.salm(GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondPsalm.Psalm));
        const aux_ant3 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.ThirdPsalm.Antiphon);
        const aux_titol3 = GlobalViewFunctions.canticSpace(GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.ThirdPsalm.Title));
        let aux_com3 = "";
        if (CurrentHoursLiturgy.Office.ThirdPsalm.Comment !== '-')
            aux_com3 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.ThirdPsalm.Comment);
        const aux_salm3 = this.salm(GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.ThirdPsalm.Psalm));

        return (
            <View>
                <Text selectable={true} style={this.styles.red}>{'Ant. 1.'}
                    <Text selectable={true} style={this.styles.black}> {aux_ant1}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redCenter}>{aux_titol1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {CurrentHoursLiturgy.Office.FirstPsalm.Comment !== '-' ?
                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View style={{flex: 2}}>
                        <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com1}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}</View></View> : null}
                <Text selectable={true} style={this.styles.black}>{aux_salm1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {CurrentHoursLiturgy.Office.FirstPsalm.HasGloryPrayer ?
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
                {CurrentHoursLiturgy.Office.SecondPsalm.Comment !== '-' ?
                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View style={{flex: 2}}>
                        <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com2}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}</View></View> : null}
                <Text selectable={true} style={this.styles.black}>{aux_salm2}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {CurrentHoursLiturgy.Office.SecondPsalm.HasGloryPrayer ?
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
                {CurrentHoursLiturgy.Office.com3 !== '-' ?
                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View style={{flex: 2}}>
                        <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com3}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}</View></View> : null}
                <Text selectable={true} style={this.styles.black}>{aux_salm3}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                {CurrentHoursLiturgy.Office.ThirdPsalm.HasGloryPrayer ?
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

    vers() {
        const aux_respV = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.Responsory.Versicle);
        const aux_respR = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.Responsory.Response);

        return (
            <View>
                <Text selectable={true} style={this.styles.red}>{'V. '}
                    <Text selectable={true} style={this.styles.black}>{aux_respV}</Text>
                </Text>
                <Text selectable={true} style={this.styles.red}>{'R. '}
                    <Text selectable={true} style={this.styles.black}>{aux_respR}</Text>
                </Text>
            </View>
        );
    }

    lectures() {
        try {
            const aux_referencia1 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstReading.Reference);
            const aux_titol_lectura1 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstReading.Title);
            const aux_has_cita1 = CurrentHoursLiturgy.Office.FirstReading.Quote !== '-';
            const aux_cita1 = aux_has_cita1 ? GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstReading.Quote) : "";
            const aux_lectura1 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstReading.Reading);
            const aux_has_citaResp1 = CurrentHoursLiturgy.Office.FirstReading.Responsory.Quote !== '-';
            const aux_cita_resp1 = aux_has_citaResp1 ? GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstReading.Responsory.Quote) : "";
            const aux_resp1_1_2 = GlobalViewFunctions.respTogether(GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstReading.Responsory.FirstPart), GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstReading.Responsory.SecondPart));
            const aux_resp1_2 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstReading.Responsory.SecondPart);
            const aux_resp1_3 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstReading.Responsory.ThirdPart);
            const aux_referencia2 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondReading.Reference);
            const aux_titol_lectura2 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondReading.Title);
            const aux_has_cita2 = CurrentHoursLiturgy.Office.SecondReading.Quote != null && CurrentHoursLiturgy.Office.SecondReading.Quote !== '-';
            const aux_cita2 = aux_has_cita2 ? GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondReading.Quote) : "";
            const aux_lectura2 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondReading.Reading);
            const aux_has_vers2 = CurrentHoursLiturgy.Office.SecondReading.Responsory.Quote !== '-';
            const aux_vers2 = aux_has_vers2 ? GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondReading.Responsory.Quote) : "";
            const aux_resp2_1_2 = GlobalViewFunctions.respTogether(GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondReading.Responsory.FirstPart), GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondReading.Responsory.SecondPart));
            const aux_resp2_2 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondReading.Responsory.SecondPart);
            const aux_resp2_3 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondReading.Responsory.ThirdPart);

            return (
                <View>
                    <Text selectable={true} style={this.styles.red}>{'Lectura primera'}</Text>
                    <Text selectable={true} style={this.styles.black}>{aux_referencia1}</Text>
                    {aux_has_cita1 ? <Text selectable={true} style={this.styles.red}>{aux_cita1}</Text> : null}
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.redCenterBold}>{aux_titol_lectura1}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.blackJustified}>{aux_lectura1}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{'Responsori'}</Text>
                    {aux_has_citaResp1 ? <Text selectable={true} style={this.styles.red}>{aux_cita_resp1}</Text> : null}
                    <Text selectable={true} style={this.styles.red}>{'R. '}
                        <Text selectable={true} style={this.styles.black}>{aux_resp1_1_2}</Text>
                    </Text>
                    <Text selectable={true} style={this.styles.red}>{'V. '}
                        <Text selectable={true} style={this.styles.black}>{aux_resp1_3}</Text>
                    </Text>
                    <Text selectable={true} style={this.styles.red}>{'R. '}
                        <Text selectable={true} style={this.styles.black}>{aux_resp1_2}</Text>
                    </Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{'Lectura segona'}</Text>
                    <Text selectable={true} style={this.styles.black}>{aux_referencia2}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.redCenterBold}>{aux_titol_lectura2}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.blackJustified}>{aux_lectura2}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{'Responsori'}</Text>
                    {aux_has_vers2 ? <Text selectable={true} style={this.styles.red}>{aux_vers2}</Text> : null}
                    <Text selectable={true} style={this.styles.red}>{'R. '}
                        <Text selectable={true} style={this.styles.black}>{aux_resp2_1_2}</Text>
                    </Text>
                    <Text selectable={true} style={this.styles.red}>{'V. '}
                        <Text selectable={true} style={this.styles.black}>{aux_resp2_3}</Text>
                    </Text>
                    <Text selectable={true} style={this.styles.red}>{'R. '}
                        <Text selectable={true} style={this.styles.black}>{aux_resp2_2}</Text>
                    </Text>
                </View>
            )
        } catch (error) {
            Logger.LogError(Logger.LogKeys.Screens, "lectures", error);
            return null;
        }
    }

    lecturesDiumPasqua() {
        const aux_referencia1 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstReading.Reference);
        const aux_titol_lectura1 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstReading.Title);
        const aux_has_cita1 = CurrentHoursLiturgy.Office.FirstReading.Quote !== '-';
        const aux_cita1 = aux_has_cita1 ? GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstReading.Quote) : "";
        const aux_lectura1 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstReading.Reading);

        const aux_ant1 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstPsalm.Antiphon);
        const aux_titol1 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstPsalm.Title);
        const aux_salm1 = this.salm(GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstPsalm.Psalm));
        const aux_gloria1 = "Glòria.";
        const aux_oracio1 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FirstPsalm.Prayer);

        const aux_referencia2 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondReading.Reference);
        const aux_titol_lectura2 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondReading.Title);
        const aux_has_cita2 = CurrentHoursLiturgy.Office.SecondReading.Quote !== '-';
        const aux_cita2 = aux_has_cita2 ? GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondReading.Quote) : "";
        const aux_lectura2 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondReading.Reading);

        const aux_ant2 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondPsalm.Antiphon);
        const aux_titol2 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondPsalm.Title);
        const aux_salm2 = this.salm(GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondPsalm.Psalm));
        const aux_gloria2 = "Glòria.";
        const aux_oracio2 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.SecondPsalm.Prayer);

        const aux_referencia3 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.ThirdReading.Reference);
        const aux_titol_lectura3 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.ThirdReading.Title);
        const aux_has_cita3 = CurrentHoursLiturgy.Office.ThirdReading.Quote !== '-';
        const aux_cita3 = aux_has_cita3 ? GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.ThirdReading.Quote) : "";
        const aux_lectura3 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.ThirdReading.Reading);

        const aux_ant3 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.ThirdPsalm.Antiphon);
        const aux_titol3 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.ThirdPsalm.Title);
        const aux_salm3 = this.salm(GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.ThirdPsalm.Psalm));
        const aux_gloria3 = "Glòria.";
        const aux_oracio3 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.ThirdPsalm.Prayer);

        const aux_referencia4 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FourthReading.Reference);
        const aux_titol_lectura4 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FourthReading.Title);
        const aux_has_cita4 = CurrentHoursLiturgy.Office.FourthReading.Quote !== '-';
        const aux_cita4 = aux_has_cita4 ? GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FourthReading.Quote) : "";
        const aux_lectura4 = GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FourthReading.Reading);

        return (
            <View>
                <Text selectable={true} style={this.styles.red}>{'Lectura primera'}</Text>
                <Text selectable={true} style={this.styles.black}>{aux_referencia1}</Text>
                {aux_has_cita1 ? <Text selectable={true} style={this.styles.red}>{aux_cita1}</Text> : null}
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redCenterBold}>{aux_titol_lectura1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.blackJustified}>{aux_lectura1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Ant. '}
                    <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redCenter}>{aux_titol1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.black}>{aux_salm1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.blackItalic}>{aux_gloria1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Ant. '}
                    <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.blackBold}>{'Preguem.'}</Text>
                <Text selectable={true} style={this.styles.black}>{aux_oracio1}</Text>
                <Text selectable={true} style={this.styles.red}>{'R. '}
                    <Text selectable={true} style={this.styles.black}>{'Amén.'}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Lectura segona'}</Text>
                <Text selectable={true} style={this.styles.black}>{aux_referencia2}</Text>
                {aux_has_cita2 ? <Text selectable={true} style={this.styles.red}>{aux_cita2}</Text> : null}
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redCenterBold}>{aux_titol_lectura2}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.blackJustified}>{aux_lectura2}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Ant. '}
                    <Text selectable={true} style={this.styles.black}>{aux_ant2}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redCenter}>{aux_titol2}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.black}>{aux_salm2}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.blackItalic}>{aux_gloria2}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Ant. '}
                    <Text selectable={true} style={this.styles.black}>{aux_ant2}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.blackBold}>{'Preguem.'}</Text>
                <Text selectable={true} style={this.styles.black}>{aux_oracio2}</Text>
                <Text selectable={true} style={this.styles.red}>{'R. '}
                    <Text selectable={true} style={this.styles.black}>{'Amén.'}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Lectura tercera'}</Text>
                <Text selectable={true} style={this.styles.black}>{aux_referencia3}</Text>
                {aux_has_cita3 ? <Text selectable={true} style={this.styles.red}>{aux_cita3}</Text> : null}
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redCenterBold}>{aux_titol_lectura3}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.blackJustified}>{aux_lectura3}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Ant. '}
                    <Text selectable={true} style={this.styles.black}>{aux_ant3}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redCenter}>{aux_titol3}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.black}>{aux_salm3}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.blackItalic}>{aux_gloria3}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Ant. '}
                    <Text selectable={true} style={this.styles.black}>{aux_ant3}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.red}>{'Lectura quarta'}</Text>
                <Text selectable={true} style={this.styles.black}>{aux_referencia4}</Text>
                {aux_has_cita4 ? <Text selectable={true} style={this.styles.red}>{aux_cita4}</Text> : null}
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.redCenterBold}>{aux_titol_lectura4}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                <Text selectable={true} style={this.styles.blackJustified}>{aux_lectura4}</Text>
            </View>
        )
    }

    himneOhDeu() {
        if (CurrentHoursLiturgy.Office.TeDeumInformation.Enabled) {
            const aux0 = CurrentHoursLiturgy.Office.TeDeumInformation.Anthem.split("\n\n[")[0];
            const aux1 = CurrentHoursLiturgy.Office.TeDeumInformation.Anthem.split("\n\n[")[1];
            const himnePart1 = aux0;
            const himnePart2 = aux1.split("]")[0];
            return (
                <View>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <HR/>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.red}>{"HIMNE"}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                    <Text selectable={true} style={this.styles.black}>{himnePart1}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : null}
                    <Text selectable={true}
                          style={this.styles.redItalic}>{"Aquesta última part es pot ometre:\n"}</Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : null}
                    <Text selectable={true} style={this.styles.black}>{himnePart2}</Text>
                </View>
            )
        }
    }

    finalPrayer() {
        const aux_oracio = GlobalViewFunctions.completeOracio(GlobalViewFunctions.rs(CurrentHoursLiturgy.Office.FinalPrayer), false);
        return (<Text selectable={true} style={this.styles.black}>{aux_oracio}</Text>);
    }
}

AppRegistry.registerComponent('OfficeComponent', () => OfficeComponent);
