import React, { Component } from 'react';
import {
  AppRegistry,
  Text,
  View,
  Platform,
  Share
} from 'react-native';
import HR from '../../../Components/HRComponent';
import GLOBAL from '../../../Utils/GlobalKeys';
import GF from '../../../Utils/GlobalFunctions';
import * as Logger from '../../../Utils/Logger';
import { GlobalData, HoursLiturgy } from '../../../Services/DataService';

export default class VespersComponent extends Component {
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
  }

  render(){
    try {
      VESPRES = HoursLiturgy.vespres;
      const gloriaStringIntro = "Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.";

      var aux_sigueu = 'Sigueu amb nosaltres, Déu nostre.';
      var aux_senyor_veniu = 'Senyor, veniu a ajudar-nos.';
      var aux_isAleluia = GlobalData.LT !== GLOBAL.Q_CENDRA && GlobalData.LT !== GLOBAL.Q_SETMANES && GlobalData.LT !== GLOBAL.Q_DIUM_RAMS && GlobalData.LT !== GLOBAL.Q_SET_SANTA && GlobalData.LT !== GLOBAL.Q_TRIDU;

      return (
          <View>
            <Text selectable={true} style={this.styles.red}>{'V. '}
              <Text selectable={true} style={this.styles.black}>{aux_sigueu}</Text>
            </Text>
            <Text selectable={true} style={this.styles.red}>{'R. '}
              <Text selectable={true} style={this.styles.black}>{aux_senyor_veniu}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.black}>{gloriaStringIntro}
            {aux_isAleluia ?
              <Text selectable={true} style={this.styles.black}>{' Al·leluia.'}</Text> : null
            }
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{'HIMNE'}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            {this.himne(GlobalData.LT, GlobalData.date.getDay(), GlobalData.setmana, VESPRES)}
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{'SALMÒDIA'}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            {this.salmodia(GlobalData.LT, GlobalData.setmana, GlobalData.date.getDay(), VESPRES)}
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{'LECTURA BREU'}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            {this.lecturaBreu(GlobalData.LT, VESPRES)}
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{'RESPONSORI BREU'}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            {this.responsori(GlobalData.LT, GlobalData.date.getDay(), VESPRES)}
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{'CÀNTIC DE MARIA'}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            {this.cantic(GlobalData.LT, GlobalData.date.getDay(), this.props.ABC, VESPRES)}
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{'PREGÀRIES'}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            {this.pregaries(GlobalData.LT, VESPRES)}
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{'ORACIÓ'}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            {this.oracio(GlobalData.LT, GlobalData.date.getDay(), VESPRES)}
            <Text selectable={true} style={this.styles.red}>{'R.'}
              <Text selectable={true} style={this.styles.black}>{' Amén.'}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <HR/>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{'CONCLUSIÓ'}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{'V.'}
              <Text selectable={true} style={this.styles.black}>{' Que el Senyor ens beneeixi i ens guardi de tot mal, i ens dugui a la vida eterna.'}</Text>
            </Text>
            <Text selectable={true} style={this.styles.red}>{'R.'}
              <Text selectable={true} style={this.styles.black}>{' Amén.'}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            {Platform.OS === 'android' ? null : <Text />}
          </View>
        );
      }
      catch (error) {
        Logger.LogError(Logger.LogKeys.Screens, "render", error);
        if(this.props.superTestMode) this.props.testErrorCB();
        return null;
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

  himne(LT, weekDay, setmana, VESPRES){
    var aux_himne = GF.rs(VESPRES.himne, this.props.superTestMode, this.props.testErrorCB.bind(this));

    return(<Text selectable={true} style={this.styles.black}>{aux_himne}</Text>);
  }

  salmodia(LT, setmana, weekDay, VESPRES){
    var aux_ant1 = GF.rs(VESPRES.ant1, this.props.superTestMode, this.props.testErrorCB.bind(this));
    var aux_titol1 = GF.rs(VESPRES.titol1, this.props.superTestMode, this.props.testErrorCB.bind(this));
    var aux_has_com1 = VESPRES.com1 !== '-';
    var aux_com1 = aux_has_com1? GF.rs(VESPRES.com1, this.props.superTestMode, this.props.testErrorCB.bind(this)) : "";
    var aux_salm1 = this.salm(GF.rs(VESPRES.salm1, this.props.superTestMode, this.props.testErrorCB.bind(this)));
    var aux_ant2 = GF.rs(VESPRES.ant2, this.props.superTestMode, this.props.testErrorCB.bind(this));
    var aux_titol2 = GF.rs(VESPRES.titol2, this.props.superTestMode, this.props.testErrorCB.bind(this));
    var aux_has_com2 = VESPRES.com2 !== '-';
    var aux_com2 = aux_has_com2? GF.rs(VESPRES.com2, this.props.superTestMode, this.props.testErrorCB.bind(this)) : "";
    var aux_salm2 = this.salm(GF.rs(VESPRES.salm2, this.props.superTestMode, this.props.testErrorCB.bind(this)));
    var aux_ant3 = GF.rs(VESPRES.ant3, this.props.superTestMode, this.props.testErrorCB.bind(this));
    var aux_titol3 = GF.rs(VESPRES.titol3, this.props.superTestMode, this.props.testErrorCB.bind(this));
    var aux_salm3 = this.salm(GF.rs(VESPRES.salm3, this.props.superTestMode, this.props.testErrorCB.bind(this)));

    /*this.shareText += 'SALMÒDIA\n\n';
    this.shareText += 'Ant. 1. ' + aux_ant1 + '\n\n';
    this.shareText += aux_titol1 + '\n\n';
    if(aux_has_com1)
      this.shareText += aux_com1 + '\n\n';
    this.shareText += aux_salm1 + '\n\n';
    this.shareText += aux_gloria1 + '\n\n';
    this.shareText += 'Ant. 1. ' + aux_ant1 + '\n\n';
    this.shareText += 'Ant. 2. ' + aux_ant2 + '\n\n';
    this.shareText += aux_titol2 + '\n\n';
    if(aux_has_com2)
      this.shareText += aux_com2 + '\n\n';
    this.shareText += aux_salm2 + '\n\n';
    this.shareText += aux_gloria2 + '\n\n';
    this.shareText += 'Ant. 2. ' + aux_ant2 + '\n\n';
    this.shareText += 'Ant. 3. ' + aux_ant3 + '\n\n';
    this.shareText += aux_titol3 + '\n\n';
    this.shareText += aux_salm3 + '\n\n';
    this.shareText += aux_gloria3 + '\n\n';
    this.shareText += 'Ant. 3. ' + aux_ant3 + '\n\n';*/

    return(
      <View>
        <Text selectable={true} style={this.styles.red}>{'Ant. 1. '}
          <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.redCenter}>{aux_titol1}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {aux_has_com1 ?
          <View style={{flexDirection: 'row'}}><View style={{flex:1}}/><View style={{flex:2}}>
          <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com1}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}</View></View> : null}
        <Text selectable={true} style={this.styles.black}>{aux_salm1}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {VESPRES.gloria1 == "1"?
          <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
          :
          <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{'Ant. 1. '}
          <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{'Ant. 2. '}
          <Text selectable={true} style={this.styles.black}>{aux_ant2}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.redCenter}>{aux_titol2}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {aux_has_com2 ?
          <View style={{flexDirection: 'row'}}><View style={{flex:1}}/><View style={{flex:2}}>
          <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com2}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}</View></View> : null}
        <Text selectable={true} style={this.styles.black}>{aux_salm2}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {VESPRES.gloria2 == "1"?
          <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
          :
          <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{'Ant. 2. '}
          <Text selectable={true} style={this.styles.black}>{aux_ant2}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{'Ant. 3. '}
          <Text selectable={true} style={this.styles.black}>{aux_ant3}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.redCenter}>{aux_titol3}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.black}>{aux_salm3}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {VESPRES.gloria3 == "1"?
          <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
          :
          <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{'Ant. 3. '}
          <Text selectable={true} style={this.styles.black}>{aux_ant3}</Text>
        </Text>
      </View>
    );
  }

  lecturaBreu(LT, VESPRES){
    var aux_vers = GF.rs(VESPRES.vers, this.props.superTestMode, this.props.testErrorCB.bind(this));
    var aux_lectura_breu = GF.rs(VESPRES.lecturaBreu, this.props.superTestMode, this.props.testErrorCB.bind(this));

    /*this.shareText += 'LECTURA BREU\n\n';
    this.shareText += aux_vers + '\n';
    this.shareText += aux_lectura_breu + '\n\n';*/

    return(
      <View>
        <Text selectable={true} style={this.styles.red}>{aux_vers}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.black}>{aux_lectura_breu}</Text>
      </View>
    )
  }

  responsori(LT, weekDay, VESPRES){
    //this.shareText += 'RESPONSORI BREU\n\n';

    if(VESPRES.calAntEspecial){
      var aux_ant = GF.rs(VESPRES.antEspecialVespres, this.props.superTestMode, this.props.testErrorCB.bind(this));
      //this.shareText += 'Ant. ' + aux_ant + '\n\n';

      return(
        <Text selectable={true} style={this.styles.red}>{'Ant. '}
          <Text selectable={true} style={this.styles.black}>{aux_ant}</Text>
        </Text>
      )
    }
    else{
      var aux_resp_1_2 = GF.respTogether(GF.rs(VESPRES.respBreu1, this.props.superTestMode, this.props.testErrorCB.bind(this)),GF.rs(VESPRES.respBreu2, this.props.superTestMode, this.props.testErrorCB.bind(this)));
      var aux_resp_3 = GF.rs(VESPRES.respBreu3, this.props.superTestMode, this.props.testErrorCB.bind(this));
      var aux_resp_2 = GF.rs(VESPRES.respBreu2, this.props.superTestMode, this.props.testErrorCB.bind(this));
      var aux_gloria_half = "Glòria al Pare i al Fill i a l'Esperit Sant.";

      /*this.shareText += 'V. ' + aux_resp_1_2 + '\n';
      this.shareText += 'R. ' + aux_resp_1_2 + '\n\n';
      this.shareText += 'V. ' + aux_resp_3 + '\n';
      this.shareText += 'R. ' + aux_resp_2 + '\n\n';
      this.shareText += 'V. ' + aux_gloria_half + '\n';
      this.shareText += 'R. ' + aux_resp_1_2 + '\n\n';*/

      return(
        <View>
          <Text selectable={true} style={this.styles.red}>{'V. '}
            <Text selectable={true} style={this.styles.black}>{aux_resp_1_2}</Text>
          </Text>
          <Text selectable={true} style={this.styles.red}>{'R. '}
            <Text selectable={true} style={this.styles.black}>{aux_resp_1_2}</Text>
          </Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'V. '}
            <Text selectable={true} style={this.styles.black}>{aux_resp_3}</Text>
          </Text>
          <Text selectable={true} style={this.styles.red}>{'R. '}
            <Text selectable={true} style={this.styles.black}>{aux_resp_2}</Text>
          </Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
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

  cantic(LT, weekDay, litYear, VESPRES){
    var aux_ant = GF.rs(VESPRES.antCantic, this.props.superTestMode, this.props.testErrorCB.bind(this));
    var aux_titol = "Càntic\nLc 1, 46-55\nLa meva ànima magnifica el Senyor";
    var aux_salm = this.salm(GF.rs(VESPRES.cantic, this.props.superTestMode, this.props.testErrorCB.bind(this)));
    var aux_gloria = "Glòria.";

    /*this.shareText += 'CÀNTIC DE MARIA\n\n';
    this.shareText += 'Ant. ' + aux_ant + '\n\n';
    this.shareText += aux_titol + '\n\n';
    this.shareText += aux_salm + '\n\n';
    this.shareText += aux_gloria + '\n\n';
    this.shareText += 'Ant. ' + aux_ant + '\n\n';*/

    return(
      <View>
        <Text selectable={true} style={this.styles.red}>{'Ant. '}
          <Text selectable={true} style={this.styles.black}>{aux_ant}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.redCenter}>{aux_titol}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.black}>{aux_salm}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.blackItalic}>{aux_gloria}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{'Ant. '}
          <Text selectable={true} style={this.styles.black}>{aux_ant}</Text>
        </Text>
      </View>
    );
  }

  convertN(pregs,papa,bisbe){
    if(pregs.search("papa N.") !== -1){
      pregs = pregs.replace("papa N.","papa "+papa);
    }
    else if(pregs.search("Papa N.") !== -1){
      pregs = pregs.replace("Papa N.","papa "+papa);
    }
    if(pregs.search("bisbe N.") !== -1){
      pregs = pregs.replace("bisbe N.","bisbe "+bisbe);
    }
    return pregs;
  }

  pregaries(LT, VESPRES){
    var allPregs = GF.rs(VESPRES.pregaries, this.props.superTestMode, this.props.testErrorCB.bind(this));

    //this.shareText += 'PREGÀRIES\n\n';

    //var aux_share_characters_before = this.shareText.length;

    //this.shareText += allPregs + '\n\n';

    if(allPregs === null || allPregs === undefined || allPregs === '' || allPregs === '-')
      return(<Text selectable={true} style={this.styles.black}>{"-"}</Text>);

    allPregs = this.convertN(allPregs, VESPRES.papa, VESPRES.bisbe);

    if(allPregs.match(/—/g, "")) var numGuio = allPregs.match(/—/g, "").length;
    else return(<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
    if(allPregs.match(/\n/g, "")) var numEnter = allPregs.match(/\n/g, "").length;
    else return(<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);

    if(numEnter !== numGuio*3+3){//every prayer have 3 spaces and intro have 3 more
      return(<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
    }
    else{
      var introPregs = allPregs.split(":")[0];
      if(allPregs.search(introPregs+':') !== -1){
        var pregsNoIntro = allPregs.replace(introPregs+':','');
        if(pregsNoIntro !== ''){
          while(pregsNoIntro.charAt(0) === '\n' || pregsNoIntro.charAt(0) === ' '){
            pregsNoIntro = pregsNoIntro.substring(1,pregsNoIntro.length);
          }
        }
      }
      else{
        Logger.Log(Logger.LogKeys.Screens, "pregaries", "InfoLog. something incorrect. Pregaries 1");
        return(<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
      }

      var respPregs = pregsNoIntro.split("\n")[0];
      if(pregsNoIntro.search(respPregs+'\n\n') !== -1){
        var pregaries = pregsNoIntro.replace(respPregs+'\n\n','');
      }
      else{
        Logger.Log(Logger.LogKeys.Screens, "pregaries", "InfoLog. something incorrect. Pregaries 2");
        return(<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
      }

      if(pregaries.search(": Pare nostre.") !== -1){
        pregaries = pregaries.replace(": Pare nostre.",':');
      }
      else{
        if(pregaries.search(":  Pare nostre.") !== -1){
          pregaries = pregaries.replace(":  Pare nostre.",':');
        }
        else{
          Logger.Log(Logger.LogKeys.Screens, "pregaries", "InfoLog. something incorrect. Pregaries 3");
          return(<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
        }
      }

      var pregsFinalPart = (pregaries.split("—")[numGuio-1]).split(".\n\n")[1]+'—'+pregaries.split("—")[numGuio];
      if(pregaries.search('\n\n'+pregsFinalPart) !== -1){
        pregaries = pregaries.replace('\n\n'+pregsFinalPart,'');
      }
      else{
        Logger.Log(Logger.LogKeys.Screens, "pregaries", "InfoLog. something incorrect. Pregaries 4");
        return(<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
      }
    }

    //this.shareText = this.shareText.substr(0, aux_share_characters_before);

    var aux_intencions = "Aquí es poden afegir altres intencions.";

    /*this.shareText += introPregs + ':\n\n';
    this.shareText += respPregs + '\n\n';
    this.shareText += pregaries + '\n\n';
    this.shareText += aux_intencions + '\n\n';
    this.shareText += pregsFinalPart + '\n\n';
    this.shareText += "Pare nostre." + '\n\n';*/

      return(
        <View>
          <Text selectable={true} style={this.styles.black}>{introPregs}{':'}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.blackItalic}>{respPregs}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.black}>{pregaries}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.redItalic}>{aux_intencions}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.black}>{pregsFinalPart}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.blackItalic}>{"Pare nostre."}</Text>
        </View>
      );
  }

  oracio(LT, weekDay, VESPRES){
    var aux_oracio = GF.completeOracio(GF.rs(VESPRES.oracio, this.props.superTestMode, this.props.testErrorCB.bind(this)),false);

    /*this.shareText += 'ORACIÓ\n\n';
    this.shareText += aux_oracio + '\n' + 'R. Amén.' + '\n\n';*/

    var aux_benediccio = 'Que el Senyor ens beneeixi i ens guardi de tot mal, i ens dugui a la vida eterna.';

    /*this.shareText += 'CONCLUSIÓ\n\n';
    this.shareText += 'V. ' + aux_benediccio + '\n' + 'R. Amén.' + '\n\n';

    if(Platform.OS === 'ios'){
      this.shareText += "_____\nCol·labora fent un donatiu:";
    }*/

    return(<Text selectable={true} style={this.styles.black}>{aux_oracio}</Text>);
  }
}

AppRegistry.registerComponent('VespersComponent', () => VespersComponent);
