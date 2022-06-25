import React, { Component } from 'react';
import {
  AppRegistry,
  Text,
  View,
  Platform,
  TouchableOpacity
} from 'react-native';
import HR from '../../../../Components/HRComponent';
import GLOBAL from '../../../../Utils/GlobalKeys';
import GF from '../../../../Utils/GlobalFunctions';
import SettingsService from '../../../../Services/SettingsService';
import * as Logger from '../../../../Utils/Logger';
import { GlobalData, HoursLiturgy } from '../../../../Services/DataService';

export default class CompletesDisplay extends Component {
  componentDidMount(){
  }

  componentWillUnmount(){
  }

  constructor(props){
    super(props);
    this.styles = {
      black: GF.getStyle("GENERIC", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      blackBold: GF.getStyle("GENERIC_BOLD", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      blackItalic: GF.getStyle("GENERIC_ITALIC", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      blackSmallItalicRight: GF.getStyle("GENERIC_SMALL_ITALIC_RIGHT", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      blackJustified: GF.getStyle("GENERIC_JUSTIFIED", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      red: GF.getStyle("ACCENT", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      redItalic: GF.getStyle("ACCENT_ITALIC", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      redCenter: GF.getStyle("ACCENT_CENTER", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      redCenterBold: GF.getStyle("ACCENT_CENTER_BOLD", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      redSmallItalicRight: GF.getStyle("ACCENT_SMALL_ITALIC_RIGHT", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      hiddenPrayerButton: GF.getStyle("HIDDEN_PRAYER_BUTTON", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      prayerTabButton: GF.getStyle("PRAYER_TAB_BUTTON", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      prayerTabButtonBold: GF.getStyle("PRAYER_TAB_BUTTON_BOLD", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
    };

    var auxNumAntMare = GlobalData.numAntMare;

    if(GlobalData.tempsespecific === 'Pasqua' && auxNumAntMare !== '5'){
      auxNumAntMare = '5';
      props.setNumAntMare('5');
      SettingsService.setSettingNumAntMare('5');
    }
    else if(!(GlobalData.tempsespecific === 'Pasqua') && auxNumAntMare === '5'){
      auxNumAntMare = '1';
      props.setNumAntMare('1');
      SettingsService.setSettingNumAntMare('1');
    }

    this.state = {
      numAntMare: auxNumAntMare
    }

    this.COMPLETES = HoursLiturgy.completes;
    this.superTestMode = props.superTestMode;
    this.testErrorCB = props.testErrorCB;
    this.setNumAntMare = props.setNumAntMare;

  }

  _onAntMarePress(numAntMare){
    this.setState({numAntMare: numAntMare});
    this.setNumAntMare(numAntMare);
    SettingsService.setSettingNumAntMare(numAntMare);
  }

  antMareComp(numAntMare){
    var ant1Style = this.styles.prayerTabButton;
    var ant2Style = this.styles.prayerTabButton;
    var ant3Style = this.styles.prayerTabButton;
    var ant4Style = this.styles.prayerTabButton;
    var ant5Style = this.styles.prayerTabButton;

    switch (numAntMare) {
      case '1':
        antMare = GF.rs(this.COMPLETES.antMare1, this.superTestMode, this.testErrorCB.bind(this));
        ant1Style = this.styles.prayerTabButtonBold;
        break;
      case '2':
        antMare = GF.rs(this.COMPLETES.antMare2, this.superTestMode, this.testErrorCB.bind(this));
        ant2Style = this.styles.prayerTabButtonBold;
        break;
      case '3':
        antMare = GF.rs(this.COMPLETES.antMare3, this.superTestMode, this.testErrorCB.bind(this));
        ant3Style = this.styles.prayerTabButtonBold;
        break;
      case '4':
        antMare = GF.rs(this.COMPLETES.antMare4, this.superTestMode, this.testErrorCB.bind(this));
        ant4Style = this.styles.prayerTabButtonBold;
        break;
      case '5':
        antMare = GF.rs(this.COMPLETES.antMare5, this.superTestMode, this.testErrorCB.bind(this));
        ant5Style = this.styles.prayerTabButtonBold;
        break;
    }

    return(
      <View>
        <View style={{alignItems: 'center'}}>
          <View style={{flexDirection: 'row',paddingVertical: 10}}>
            {!(GlobalData.tempsespecific === 'Pasqua')?
              <TouchableOpacity onPress={this._onAntMarePress.bind(this,'1')}>
                <Text style={ant1Style}>{"Ant. 1  "}</Text>
              </TouchableOpacity>
            :
              null
            }
            {!(GlobalData.tempsespecific === 'Pasqua')?
              <TouchableOpacity onPress={this._onAntMarePress.bind(this,'2')}>
                <Text style={ant2Style}>{"  Ant. 2  "}</Text>
              </TouchableOpacity>
            :
              null
            }
            {!(GlobalData.tempsespecific === 'Pasqua')?
              <TouchableOpacity onPress={this._onAntMarePress.bind(this,'3')}>
                <Text style={ant3Style}>{"  Ant. 3  "}</Text>
              </TouchableOpacity>
            :
              null
            }
            {!(GlobalData.tempsespecific === 'Pasqua')?
              <TouchableOpacity onPress={this._onAntMarePress.bind(this,'4')}>
                <Text style={ant4Style}>{"  Ant. 4"}</Text>
              </TouchableOpacity>
            :
              null
            }
          </View>
        </View>

        <Text selectable={true} style={this.styles.black}>{antMare}</Text>
      </View>
    );
  }

  render() {
    try {
      if(this.COMPLETES !== null){
        const gloriaStringIntro = "Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.";
        var is_special_initial_message = GlobalData.LT === GLOBAL.Q_TRIDU && GlobalData.date.getDay() === 6;
        var aux_special_initial_message = "Avui, només han de dir aquestes Completes els qui no participen en la Vetlla pasqual.";
        var aux_sigueu = "Sigueu amb nosaltres, Déu nostre.";
        var aux_veniu = "Senyor, veniu a ajudar-nos.";
        var is_aleluia = GlobalData.LT !== GLOBAL.Q_CENDRA && GlobalData.LT !== GLOBAL.Q_SETMANES
          && GlobalData.LT !== GLOBAL.Q_DIUM_RAMS && GlobalData.LT !== GLOBAL.Q_SET_SANTA
          && GlobalData.LT !== GLOBAL.Q_TRIDU;
        var aux_lloable = "És lloable que aquí es faci examen de consciència.";
        var aux_acte_pen = this.COMPLETES.actePen;
        var aux_himne = GF.rs(this.COMPLETES.himne, this.superTestMode, this.testErrorCB.bind(this));
        var is_dos_salms = this.COMPLETES.dosSalms === "1";
        var has_distint_ant = this.COMPLETES.antifones;
        var aux_ant1 = GF.rs(this.COMPLETES.ant1, this.superTestMode, this.testErrorCB.bind(this));
        var aux_titol1 = GF.rs(this.COMPLETES.titol1, this.superTestMode, this.testErrorCB.bind(this));
        var has_com1 = this.COMPLETES.com1 !== '-';
        var aux_com1 = has_com1? GF.rs(this.COMPLETES.com1, this.superTestMode, this.testErrorCB.bind(this)) : "";
        var aux_salm1 = this.salm(GF.rs(this.COMPLETES.salm1, this.superTestMode, this.testErrorCB.bind(this)));
        if(is_dos_salms){
          var aux_ant2 = has_distint_ant? GF.rs(this.COMPLETES.ant2, this.superTestMode, this.testErrorCB.bind(this)) : "";
          var aux_titol2 = GF.rs(this.COMPLETES.titol2, this.superTestMode, this.testErrorCB.bind(this));
          var has_com2 = this.COMPLETES.com2 !== '-';
          var aux_com2 = has_com2? GF.rs(this.COMPLETES.com2, this.superTestMode, this.testErrorCB.bind(this)) : "";
          var aux_salm2 = this.salm(GF.rs(this.COMPLETES.salm2, this.superTestMode, this.testErrorCB.bind(this)));
        }
        var aux_vers = GF.rs(this.COMPLETES.vers, this.superTestMode, this.testErrorCB.bind(this));
        var aux_lectura_breu = GF.rs(this.COMPLETES.lecturaBreu, this.superTestMode, this.testErrorCB.bind(this));
        var is_normal_resp = this.COMPLETES.antRespEspecial === "-";
        if(is_normal_resp){
          var aux_resp_1_2 = GF.respTogether(GF.rs(this.COMPLETES.respBreu1, this.superTestMode, this.testErrorCB.bind(this)),GF.rs(this.COMPLETES.respBreu2, this.superTestMode, this.testErrorCB.bind(this)));
          var aux_resp_3 = GF.rs(this.COMPLETES.respBreu3, this.superTestMode, this.testErrorCB.bind(this));
          var aux_resp_2 = GF.rs(this.COMPLETES.respBreu2, this.superTestMode, this.testErrorCB.bind(this));
        }
        else{
          var aux_ant_special = GF.rs(this.COMPLETES.antRespEspecial, this.superTestMode, this.testErrorCB.bind(this));
        }
        var aux_gloria_half = " Glòria al Pare i al Fill i a l'Esperit Sant.";
        var aux_ant_cantic = GF.rs(this.COMPLETES.antCantic, this.superTestMode, this.testErrorCB.bind(this));
        var aux_titol_cantic = "Càntic\nLc 2, 29-32\nCrist, llum de les nacions i glòria d'Israel";
        var aux_cantic = this.salm(GF.rs(this.COMPLETES.cantic, this.superTestMode, this.testErrorCB.bind(this)));
        var aux_gloria_cantic = "Glòria.";
        var aux_oracio = GF.rs(this.COMPLETES.oracio, this.superTestMode, this.testErrorCB.bind(this));
        var aux_fi_benaurada = "Que el Senyor totpoderós ens concedeixi una nit tranquil·la i una fi benaurada.";
        var aux_benediccio = 'Que el Senyor ens beneeixi i ens guardi de tot mal, i ens dugui a la vida eterna.';
        var aux_antifona_final = "Antífona final de la Mare de Déu";

        return (
          <View>
            {is_special_initial_message?
              <View>
                <Text selectable={true} style={this.styles.redCenter}>{aux_special_initial_message}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <HR/>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
              </View>
              :
              null
            }
            <Text selectable={true} style={this.styles.red}>{"V. "}
              <Text selectable={true} style={this.styles.black}>{aux_sigueu}</Text>
            </Text>
            <Text selectable={true} style={this.styles.red}>{"R. "}
              <Text selectable={true} style={this.styles.black}>{aux_veniu}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.black}>{gloriaStringIntro}
            {is_aleluia ?
              <Text selectable={true} style={this.styles.black}>{" Al·leluia."}</Text> : null
            }
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.redCenter}>{aux_lloable}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.black}>{aux_acte_pen}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{"HIMNE"}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.black}>{aux_himne}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{"SALMÒDIA"}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            {is_dos_salms ?
              <View>
                {has_distint_ant ?
                  <Text selectable={true} style={this.styles.red}>{"Ant. 1. "}
                    <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
                  </Text>
                :
                  <Text selectable={true} style={this.styles.red}>{"Ant. "}
                    <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
                  </Text>
                }
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.redCenter}>{aux_titol1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                {has_com1 ?
                  <View style={{flexDirection: 'row'}}><View style={{flex:1}}/><View style={{flex:2}}>
                  <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com1}</Text>
                  {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}</View></View> : null}
                <Text selectable={true} style={this.styles.black}>{aux_salm1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                {this.COMPLETES.gloria1 == "1"?
                <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
                :
                <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                {has_distint_ant ?
                  <View>
                    <Text selectable={true} style={this.styles.red}>{"Ant. 1. "}
                      <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
                    </Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                    <Text selectable={true} style={this.styles.red}>{"Ant. 2. "}
                      <Text selectable={true} style={this.styles.black}>{aux_ant2}</Text>
                    </Text>
                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                  </View>
                : null
                }
                <Text selectable={true} style={this.styles.redCenter}>{aux_titol2}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                {has_com2 !== '-' ?
                  <View style={{flexDirection: 'row'}}><View style={{flex:1}}/><View style={{flex:2}}>
                  <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com2}</Text>
                  {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}</View></View> : null}
                <Text selectable={true} style={this.styles.black}>{aux_salm2}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                {this.COMPLETES.gloria2 == "1"?
                <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
                :
                <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                {has_distint_ant ?
                  <View>
                    <Text selectable={true} style={this.styles.red}>{"Ant. 2. "}
                      <Text selectable={true} style={this.styles.black}>{aux_ant2}</Text>
                    </Text>
                  </View>
                :
                  <View>
                    <Text selectable={true} style={this.styles.red}>{"Ant. "}
                      <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
                    </Text>
                  </View>
                }
              </View>
            :
              <View>
                <Text selectable={true} style={this.styles.red}>{"Ant. "}
                  <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.redCenter}>{aux_titol1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                {has_com1 !== '-' ?
                  <View style={{flexDirection: 'row'}}><View style={{flex:1}}/><View style={{flex:2}}>
                  <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com1}</Text>
                  {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}</View></View> : null}
                <Text selectable={true} style={this.styles.black}>{aux_salm1}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                {this.COMPLETES.gloria1 == "1"?
                <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
                :
                <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Ant. "}
                  <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
                </Text>
              </View>
            }
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{"LECTURA BREU"}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{aux_vers}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.black}>{aux_lectura_breu}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{"RESPONSORI BREU"}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            {is_normal_resp ?
              <View>
                <Text selectable={true} style={this.styles.red}>{"V. "}
                  <Text selectable={true} style={this.styles.black}>{aux_resp_1_2}</Text>
                </Text>
                <Text selectable={true} style={this.styles.red}>{"R. "}
                  <Text selectable={true} style={this.styles.black}>{aux_resp_1_2}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"V. "}
                  <Text selectable={true} style={this.styles.black}>{aux_resp_3}</Text>
                </Text>
                <Text selectable={true} style={this.styles.red}>{"R. "}
                  <Text selectable={true} style={this.styles.black}>{aux_resp_2}</Text>
                </Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"V. "}
                  <Text selectable={true} style={this.styles.black}>{aux_gloria_half}</Text>
                </Text>
                <Text selectable={true} style={this.styles.red}>{"R. "}
                  <Text selectable={true} style={this.styles.black}>{aux_resp_1_2}</Text>
                </Text>
              </View>
            :
              <View>
                <Text selectable={true} style={this.styles.red}>{"Ant. "}
                  <Text selectable={true} style={this.styles.black}>{aux_ant_special}</Text>
                </Text>
              </View>
            }
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{"CÀNTIC DE SIMEÓ"}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{"Ant. "}
              <Text selectable={true} style={this.styles.black}>{aux_ant_cantic}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.redCenter}>{aux_titol_cantic}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.black}>{aux_cantic}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.blackItalic}>{aux_gloria_cantic}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{"Ant. "}
              <Text selectable={true} style={this.styles.black}>{aux_ant_cantic}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{"ORACIÓ"}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.blackBold}>{"Preguem."}</Text>
            <Text selectable={true} style={this.styles.black}>{aux_oracio}</Text>
            <Text selectable={true} style={this.styles.red}>{"R. "}
              <Text selectable={true} style={this.styles.black}>{"Amén."}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{"CONCLUSIÓ"}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{"V. "}
              <Text selectable={true} style={this.styles.black}>{aux_fi_benaurada}</Text>
            </Text>
            <Text selectable={true} style={this.styles.red}>{"R. "}
              <Text selectable={true} style={this.styles.black}>{"Amén."}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.redCenter}>{aux_antifona_final}</Text>
            {this.antMareComp(this.state.numAntMare)}
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            {Platform.OS === 'android' ? null : <Text />}
          </View>
        );
      }
      else{
        Logger.LogError(Logger.LogKeys.Screens, "render", new Error("wierd error......."));
        return null;
      }
    } catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "render", error);
      if(this.superTestMode) this.testErrorCB();
      return(null);
    }
  }

  salm(salm){
    if(!salm) return "";

    if(true){
      salm = salm.replace(/    [*]/g,'');
      salm = salm.replace(/   [*]/g,'');
      salm = salm.replace(/  [*]/g,'');
      salm = salm.replace(/ [*]/g,'');
      salm = salm.replace(/    [†]/g,'');
      salm = salm.replace(/   [†]/g,'');
      salm = salm.replace(/  [†]/g,'');
      salm = salm.replace(/ [†]/g,'');
    }
    return salm;
  }

}

AppRegistry.registerComponent('CompletesDisplay', () => CompletesDisplay);
