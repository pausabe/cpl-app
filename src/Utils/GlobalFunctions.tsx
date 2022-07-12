import * as Logger from './Logger';

// TODO: refactor

let GlobalFunctions = {

  getPrecNum(prec){
    switch (prec) {
      case "1":
        return 1;
        break;
      case "2":
        return 2;
        break;
      case "3":
        return 3;
        break;
      case "4a":
        return 4;
        break;
      case "4b":
        return 5;
        break;
      case "4c":
        return 6;
        break;
      case "4d":
        return 7;
        break;
      case "5":
        return 8;
        break;
      case "6":
        return 9;
        break;
      case "7":
        return 10;
        break;
      case "8a":
        return 11;
        break;
      case "8b":
        return 12;
        break;
      case "8c":
        return 13;
        break;
      case "8d":
        return 14;
        break;
      case "8e":
        return 15;
        break;
      case "8f":
        return 16;
        break;
      case "9":
        return 17;
        break;
      case "10":
        return 18;
        break;
      case "11a":
        return 19;
        break;
      case "11b":
        return 20;
        break;
      case "12":
        return 21;
        break;
      case "13":
        return 22;
      default:
      return 22;
    }
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

  canticSpace(titolCantic){
    if(titolCantic) titolCantic = titolCantic.replace("Càntic	","Càntic\n");
    return titolCantic;
  },

  rs(text, superTestMode, error){
    if(superTestMode) {
      if(!text||text===undefined||text===''||text==='-'||text===' '||text===':'){
        error();
        return text;
      }
    }
    if(text){
      var length = text.length;
      var lastChar = text.charAt(length-1);
      if(lastChar === ' ' || lastChar === '\n') return text.slice(0,length-1);
    }
    else{
    }
    return text;
  },

  trim(text){

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
    var result = r1 + ' ' + r2;

    if(r1 && r2){
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
      Logger.LogError(Logger.LogKeys.GlobalFunctions, "respTogether", error);
    }

    return result;
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

    oAux = oracio;

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

  getCelType(diocesi, anyliturgic){
    switch (diocesi) {
      default:
        celType = anyliturgic.BaD;
        break;
      case "BaD":
        celType = anyliturgic.BaD;
        break;
      case "BaV":
        celType = anyliturgic.BaV;
        break;
      case "BaC":
        celType = anyliturgic.BaC;
        break;
      case "GiD":
        celType = anyliturgic.GiD;
        break;
      case "GiV":
        celType = anyliturgic.GiV;
        break;
      case "GiC":
        celType = anyliturgic.GiC;
        break;
      case "LlD":
        celType = anyliturgic.LlD;
        break;
      case "LlV":
        celType = anyliturgic.LlV;
        break;
      case "LlC":
        celType = anyliturgic.LlC;
        break;
      case "SFD":
        celType = anyliturgic.SFD;
        break;
      case "SFV":
        celType = anyliturgic.SFV;
        break;
      case "SFC":
        celType = anyliturgic.SFC;
        break;
      case "SoD":
        celType = anyliturgic.SoD;
        break;
      case "SoV":
        celType = anyliturgic.SoV;
        break;
      case "SoC":
        celType = anyliturgic.SoC;
        break;
      case "TaD":
        celType = anyliturgic.TaD;
        break;
      case "TaV":
        celType = anyliturgic.TaV;
        break;
      case "TaC":
        celType = anyliturgic.TaC;
        break;
      case "TeD":
        celType = anyliturgic.TeD;
        break;
      case "TeV":
        celType = anyliturgic.TeV;
        break;
      case "TeC":
        celType = anyliturgic.TeC;
        break;
      case "ToD":
        celType = anyliturgic.ToD;
        break;
      case "ToV":
        celType = anyliturgic.ToV;
        break;
      case "ToC":
        celType = anyliturgic.ToC;
        break;
      case "UrD":
        celType = anyliturgic.UrD;
        break;
      case "UrV":
        celType = anyliturgic.UrV;
        break;
      case "UrC":
        celType = anyliturgic.UrC;
        break;
      case "ViD":
        celType = anyliturgic.ViD;
        break;
      case "ViV":
        celType = anyliturgic.ViV;
        break;
      case "ViC":
        celType = anyliturgic.ViC;
        break;
      case "MaD":
        celType = anyliturgic.MaD;
        break;
      case "MaV":
        celType = anyliturgic.MaV;
        break;
      case "MaC":
        celType = anyliturgic.MaC;
        break;
      case "Andorra":
        celType = anyliturgic.Andorra;
        break;
    }

    return(celType);
  },

  getTestNameDiocesiByIndex(index){
    switch (index) {
      case 0:
        return 'Andorra';
      case 1:
        return 'Barcelona';
      case 2:
        return 'Barcelona';
      case 3:
        return 'Barcelona';
      case 4:
        return 'Girona';
      case 5:
        return 'Girona';
      case 6:
        return 'Girona';
      case 7:
        return 'Lleida';
      case 8:
        return 'Lleida';
      case 9:
        return 'Lleida';
      case 10:
        return 'Mallorca';
      case 11:
        return 'Mallorca';
      case 12:
        return 'Mallorca';
      case 13:
        return 'Sant Feliu de Llobregat';
      case 14:
        return 'Sant Feliu de Llobregat';
      case 15:
        return 'Sant Feliu de Llobregat';
      case 16:
        return 'Solsona';
      case 17:
        return 'Solsona';
      case 18:
        return 'Solsona';
      case 19:
        return 'Tarragona';
      case 20:
        return 'Tarragona';
      case 21:
        return 'Tarragona';
      case 22:
        return 'Terrassa';
      case 23:
        return 'Terrassa';
      case 24:
        return 'Terrassa';
      case 25:
        return 'Tortosa';
      case 26:
        return 'Tortosa';
      case 27:
        return 'Tortosa';
      case 28:
        return 'Urgell';
      case 29:
        return 'Urgell';
      case 30:
        return 'Urgell';
      case 31:
        return 'Vic';
      case 32:
        return 'Vic';
      case 33:
        return 'Vic';
      }
  },

  transformDiocesiName(diocesi, lloc){
    switch (diocesi) {
      case "Barcelona":
        switch (lloc) {
          case "Diòcesi":
            return 'BaD';
          case "Catedral":
            return 'BaC';
          case "Ciutat":
            return 'BaV';
        }
        break;
      case "Girona":
        switch (lloc) {
          case "Diòcesi":
            return 'GiD';
          case "Catedral":
            return 'GiC';
          case "Ciutat":
            return 'GiV';
        }
        break;
      case "Lleida":
        switch (lloc) {
          case "Diòcesi":
            return 'LlD';
          case "Catedral":
            return 'LlC';
          case "Ciutat":
            return 'LlV';
        }
        break;
      case "Sant Feliu de Llobregat":
        switch (lloc) {
          case "Diòcesi":
            return 'SFD';
          case "Catedral":
            return 'SFC';
          case "Ciutat":
            return 'SFV';
        }
        break;
      case "Solsona":
        switch (lloc) {
          case "Diòcesi":
            return 'SoD';
          case "Catedral":
            return 'SoC';
          case "Ciutat":
            return 'SoV';
        }
        break;
      case "Tarragona":
        switch (lloc) {
          case "Diòcesi":
            return 'TaD';
          case "Catedral":
            return 'TaC';
          case "Ciutat":
            return 'TaV';
        }
        break;
      case "Terrassa":
        switch (lloc) {
          case "Diòcesi":
            return 'TeD';
          case "Catedral":
            return 'TeC';
          case "Ciutat":
            return 'TeV';
        }
        break;
      case "Tortosa":
        switch (lloc) {
          case "Diòcesi":
            return 'ToD';
          case "Catedral":
            return 'ToC';
          case "Ciutat":
            return 'ToV';
        }
        break;
      case "Urgell":
        switch (lloc) {
          case "Diòcesi":
            return 'UrD';
          case "Catedral":
            return 'UrC';
          case "Ciutat":
            return 'UrV';
        }
        break;
      case "Vic":
        switch (lloc) {
          case "Diòcesi":
            return 'ViD';
          case "Catedral":
            return 'ViC';
          case "Ciutat":
            return 'ViV';
        }
        break;
      case "Andorra":
        return 'Andorra';
      case "Mallorca":
        switch (lloc) {
          case "Diòcesi":
            return 'MaD';
          case "Catedral":
            return 'MaC';
          case "Ciutat":
            return 'MaV';
        }
        break;
    }

    return('BaD');
  },

  bisbeId(diocesiName){
    switch (diocesiName) {
      case "Barcelona":
        return(39);
      case "Girona":
        return(40);
      case "Lleida":
        return(41);
      case "Sant Feliu de Llobregat":
        return(42);
      case "Solsona":
        return(43);
      case "Tarragona":
        return(44);
      case "Terrassa":
        return(45);
      case "Tortosa":
        return(46);
      case "Urgell":
        return(47);
      case "Vic":
        return(48);
      case "Andorra":
        return(49);
      case "Mallorca":
        return(50);
    }

    return(39);
  },

  salmInvExists(salmNum,titols){
    for(i = 0; i<titols.length; i++){
      titol = titols[i];
      if(titol && titol.search("Salm "+salmNum) !== -1) return false;
    }
    return true;
  },

  isDarkAnthem(){
    //return true; //To avoid distint himns when doing state test and compare dark test with light test
    var nowDate = new Date();
    var hour = nowDate.getHours();
    return hour<6;
  },

  isDiocesiMogut(diocesi, diocesiMogut) {
    if (!diocesi || diocesi === '' || diocesiMogut === '-' || diocesi === undefined)
      return false;
    if (diocesiMogut === '*') return true;
    if (diocesi === diocesiMogut) return true;
    if (diocesi.charAt(0) === diocesiMogut.charAt(0) &&
      diocesi.charAt(1) === diocesiMogut.charAt(1))
      return true;
    return false;
  },

  calculeDia(date, diocesi, diaMogut, diocesiMogut) {
    if (diaMogut !== '-' && this.isDiocesiMogut(diocesi, diocesiMogut))
      return diaMogut;

    switch (date.getMonth()) {
      case 0:
        mes = "ene";
        break;
      case 1:
        mes = "feb";
        break;
      case 2:
        mes = "mar";
        break;
      case 3:
        mes = "abr";
        break;
      case 4:
        mes = "may";
        break;
      case 5:
        mes = "jun";
        break;
      case 6:
        mes = "jul";
        break;
      case 7:
        mes = "ago";
        break;
      case 8:
        mes = "sep";
        break;
      case 9:
        mes = "oct";
        break;
      case 10:
        mes = "nov";
        break;
      case 11:
        mes = "dic";
        break;
    }
    if (date.getDate() < 10)
      dia = `0${date.getDate()}`;
    else dia = date.getDate();

    result = dia + "-" + mes;
    return result;
  }
}

export default GlobalFunctions;