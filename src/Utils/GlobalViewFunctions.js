import * as Logger from './Logger';
import {convertTextSize} from '../Theme/typography';
import {createTheme} from '../Theme/Theme';
import {prayerTextStyles} from '../Theme/prayerStyles';

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
    for(let i = 0; i<titols.length; i++){
      let titol = titols[i];
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

  // The styles of the prayer texts, from the theme (src/Theme/prayerStyles.ts). Kept with its old
  // codes for whatever still asks for them this way.
  getStyle(typeCode, platformOS, textSizeConfigured, darkModeEnabled){
    try {
      const theme = createTheme({dark: darkModeEnabled === true, textSize: textSizeConfigured});
      const styles = prayerTextStyles(theme);
      const muted = {color: theme.colors.text3, fontSize: theme.prayer.fontSize - 3};
      const tab = {color: theme.colors.text3, fontSize: theme.prayer.fontSize > 17 ? 17 : theme.prayer.fontSize - 3};

      switch (typeCode){
        case 'CONTAINER': return styles.container;
        case 'GENERIC': return styles.black;
        case 'GENERIC_BOLD': return styles.blackBold;
        case 'GENERIC_ITALIC': return styles.blackItalic;
        case 'GENERIC_SMALL_ITALIC_RIGHT': return styles.blackSmallItalicRight;
        case 'GENERIC_JUSTIFIED': return styles.blackJustified;
        case 'ACCENT': return styles.red;
        case 'ACCENT_ITALIC': return styles.redItalic;
        case 'ACCENT_CENTER': return styles.redCenter;
        case 'ACCENT_CENTER_BOLD': return styles.redCenterBold;
        case 'ACCENT_SMALL_ITALIC_RIGHT': return styles.redSmallItalicRight;
        case 'HIDDEN_PRAYER_BUTTON': return muted;
        case 'PRAYER_TAB_BUTTON': return tab;
        case 'PRAYER_TAB_BUTTON_BOLD': return {...tab, fontWeight: 'bold'};
        default:
          Logger.LogError(Logger.LogKeys.GlobalFunctions, "getStyle", new Error("getTextStyle NOT FOUND!!!! -> " + typeCode));
          break;
      }
    } catch (error) {
      Logger.LogError(Logger.LogKeys.GlobalFunctions, "getStyle", error);
    }
  },

  // The size of the prayer text for the setting "1" to "10": now in src/Theme/typography.ts
  convertTextSize(value){
    return convertTextSize(value);
  },
}

export default GlobalViewFunctions;