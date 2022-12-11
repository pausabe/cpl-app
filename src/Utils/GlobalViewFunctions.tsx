import * as Logger from './Logger';

//TODO: [UI Refactor]

let GlobalViewFunctions = {
  canticSpace(titolCantic){
    if(titolCantic) titolCantic = titolCantic.replace("Càntic	","Càntic\n");
    return titolCantic;
  },

  completeOracio(oracio, horaMenor){
    if(!oracio) return "";

    var form1 = "Per nostre Senyor Jesucrist";
    var form7 = "Que amb vós viu i regna";
    var bigf1 = "Per nostre Senyor Jesucrist, el vostre Fill, que amb vós viu i regna en la unitat de l'Esperit Sant, Déu, pels segles dels segles";
    var HMf1 = "Per Crist Senyor nostre";
    var form6 = "Vós, que viviu i regneu";
    var form2 = "Vós, que viviu i regneu pels segles dels segles";
    var bigf2 = "Vós, que viviu i regneu amb Déu Pare en la unitat de l'Esperit Sant, Déu, pels segles dels segles";
    var HMf2 = "Vós, que viviu i regneu pels segles dels segles";
    var form3 = "Que viu i regna pels segles dels segles";
    var form4 = "Ell, que viu i regna pels segles dels segles";
    var form5 = "Ell, que amb vós viu i regna";
    var bigf4 = "Ell, que amb vós viu i regna en la unitat de l'Esperit Sant, Déu, pels segles dels segles";
    var HMf4 = "Ell, que viu i regna pels segles dels segles";

    let oAux = oracio;

    if(oAux.search(/\u00AD/g)) {
      oAux = oAux.replace(/\u00AD/g, '');
    }

    if(oAux.search(form1) !== -1){
      if(horaMenor){
        return oAux.replace(form1, HMf1);
      }
      else if(!horaMenor){
        return oAux.replace(form1, bigf1);
      }
    }
    if(oAux.search(form7) !== -1){
      if(horaMenor){
        return oAux.replace(form7, HMf1);
      }
      else if(!horaMenor){
        return oAux.replace(form7, bigf1);
      }
    }
    if(oAux.search(form2) !== -1){
      if(horaMenor){
        return oAux.replace(form2, HMf2);
      }
      else if(!horaMenor){
        return oAux.replace(form2, bigf2);
      }
    }
    if(oAux.search(form6) !== -1){
      if(horaMenor){
        return oAux.replace(form6, HMf2);
      }
      else if(!horaMenor){
        return oAux.replace(form6, bigf2);
      }
    }
    if(oAux.search(form3) !== -1){
      if(horaMenor){
        return oAux.replace(form3, HMf4);
      }
      else if(!horaMenor){
        return oAux.replace(form3, bigf4);
      }
    }
    if(oAux.search(form4) !== -1){
      if(horaMenor){
        return oAux.replace(form4, HMf4);
      }
      else if(!horaMenor){
        return oAux.replace(form4, bigf4);
      }
    }
    if(oAux.search(form5) !== -1){
      if(horaMenor){
        return oAux.replace(form5, HMf4);
      }
      else if(!horaMenor){
        return oAux.replace(form5, bigf4);
      }
    }

    return oracio;
  },

  salmInvExists(salmNum,titols){
    for(i = 0; i<titols.length; i++){
      titol = titols[i];
      if(titol && titol.search("Salm "+salmNum) !== -1) return false;
    }
    return true;
  },

  rs(text){
    if(text){
      var length = text.length;
      var lastChar = text.charAt(length-1);
      if(lastChar === ' ' || lastChar === '\n') return text.slice(0,length-1);
    }
    return text;
  },

  trim(text){

    if(!text){
      return "";
    }

    try {

      var length = text.length;
      var lastChar = text.charAt(length-1);
      if(lastChar === ' ' || lastChar === '\n') return text.slice(0,length-1);
      return text;

    } catch (error) {
      Logger.LogError(Logger.LogKeys.GlobalFunctions, "trim", error);
      return text
    }

  },

  respTogether(r1,r2){
    let result = '';

    if(r1 && r2){
      result = r1 + ' ' + r2
      var lastCharacter = r1.charAt(r1.length-1);
      var firstWord = r2.split(" ")[0];
      firstWord=firstWord.replace(",", '');
      firstWord=firstWord.replace(".", '');
      firstWord=firstWord.replace(":", '');
      firstWord=firstWord.replace(";", '');

      if(lastCharacter !== '.' && firstWord !== 'Senyor' && firstWord !== 'Déu'
          && firstWord !== 'Vós' && firstWord !== 'Mare' && firstWord !== 'Verge'
          && firstWord !== 'Maria' && firstWord !== 'Sant')
        result = r1 + ' ' + r2.charAt(0).toLowerCase() + r2.slice(1);
    }
    else{
      const errorMessage = `First Part = '${r1}', Second Part = '${r2}'`;
      Logger.LogError(Logger.LogKeys.GlobalFunctions, "respTogether", new Error(errorMessage));
    }

    return result;
  },

  getMonthText(monthNum){
    switch (monthNum) {
      case 0:
        return "gener"
        break;
      case 1:
        return "febrer"
        break;
      case 2:
        return "març"
        break;
      case 3:
        return "abril"
        break;
      case 4:
        return "maig"
        break;
      case 5:
        return "juny"
        break;
      case 6:
        return "juliol"
        break;
      case 7:
        return "agost"
        break;
      case 8:
        return "setembre"
        break;
      case 9:
        return "octubre"
        break;
      case 10:
        return "novembre"
        break;
      case 11:
        return "desembre"
        break;
    }
  },

  getStyle(typeCode, platformOS, textSizeConfigured, darkModeEnabled){
    try {

      var backgroundColor = 'white';
      var genericColor = 'black';
      var accentColor = 'red';
      var otherColor = 'grey';
      if(darkModeEnabled != undefined && darkModeEnabled == true){
        backgroundColor = 'black';
        genericColor = 'white';
        accentColor = '#FA8072';
        otherColor = '#bfbfbf';
      }

      switch (typeCode){

          //CONTAINER
        case 'CONTAINER':
          return {
            flex: 1,
            backgroundColor: backgroundColor
          };

          //GENERIC
        case 'GENERIC':
          return {
            color: genericColor,
            fontSize: this.convertTextSize(textSizeConfigured),
          };

        case 'GENERIC_BOLD':
          return {
            color: genericColor,
            fontSize: this.convertTextSize(textSizeConfigured),
            fontWeight: 'bold',
          };

        case 'GENERIC_ITALIC':
          return {
            color: genericColor,
            fontSize: this.convertTextSize(textSizeConfigured),
            fontStyle: 'italic',
          };

        case 'GENERIC_SMALL_ITALIC_RIGHT':
          return {
            color: genericColor,
            fontSize: this.convertTextSize(textSizeConfigured)-2,
            fontStyle: 'italic',
            textAlign: 'right'
          };

        case 'GENERIC_JUSTIFIED':
          return {
            color: genericColor,
            fontSize: this.convertTextSize(textSizeConfigured),
            textAlign: platformOS == 'ios'? 'justify' : 'auto',
          };

          //ACCENT
        case 'ACCENT':
          return {
            color: accentColor,
            fontSize: this.convertTextSize(textSizeConfigured),
          };

        case 'ACCENT_ITALIC':
          return {
            color: accentColor,
            fontSize: this.convertTextSize(textSizeConfigured),
            fontStyle: 'italic'
          };

        case 'ACCENT_CENTER':
          return {
            color: accentColor,
            fontSize: this.convertTextSize(textSizeConfigured),
            textAlign: 'center'
          };

        case 'ACCENT_CENTER_BOLD':
          return {
            color: accentColor,
            fontSize: this.convertTextSize(textSizeConfigured),
            textAlign: 'center',
            fontWeight: 'bold',
          };

        case 'ACCENT_SMALL_ITALIC_RIGHT':
          return {
            color: accentColor,
            fontSize: this.convertTextSize(textSizeConfigured)-2,
            fontStyle: 'italic',
            textAlign: 'right'
          };

          //OTHERS
        case 'HIDDEN_PRAYER_BUTTON':
          return {
            color: otherColor,
            fontSize: this.convertTextSize(textSizeConfigured)-3,
          };

        case 'PRAYER_TAB_BUTTON':
          return {
            color: otherColor,
            fontSize: this.convertTextSize(textSizeConfigured) > 17? 17 : this.convertTextSize(textSizeConfigured)-3,
          };

        case 'PRAYER_TAB_BUTTON_BOLD':
          return {
            color: otherColor,
            fontSize: this.convertTextSize(textSizeConfigured) > 17? 17 : this.convertTextSize(textSizeConfigured)-3,
            fontWeight: 'bold',
          };

        default:
          Logger.LogError(Logger.LogKeys.GlobalFunctions, "getStyle", new Error("getTextStyle NOT FOUND!!!! -> " + typeCode));
          break;
      }
    } catch (error) {
      Logger.LogError(Logger.LogKeys.GlobalFunctions, "getStyle", error);
    }
  },

  convertTextSize(value){
    switch (value) {
      case '1':
        return 15;//GLOBALS.size1;
      case '2':
        return 18;//GLOBALS.size2;
      case '3':
        return 21;//GLOBALS.size3;
      case '4':
        return 24;//GLOBALS.size4;
      case '5':
        return 27;//GLOBALS.size5;
      case '6':
        return 30;//GLOBALS.size6;
      case '7':
        return 33;//GLOBALS.size7;
      case '8':
        return 36;//GLOBALS.size8;
      case '9':
        return 39;//GLOBALS.size9;
      case '10':
        return 42;//GLOBALS.size10;
    }
  },
}

export default GlobalViewFunctions;