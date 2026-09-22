import * as Logger from './logger';

let GlobalViewFunctions = {
  canticSpace(titolCantic) {
    if (titolCantic) titolCantic = titolCantic.replace('Càntic	', 'Càntic\n');
    return titolCantic;
  },

  completeOracio(oracio, horaMenor) {
    if (!oracio) return '';

    let form1 = 'Per nostre Senyor Jesucrist';
    let form7 = 'Que amb vós viu i regna';
    let bigf1 =
      "Per nostre Senyor Jesucrist, el vostre Fill, que amb vós viu i regna en la unitat de l'Esperit Sant, Déu, pels segles dels segles";
    let HMf1 = 'Per Crist Senyor nostre';
    let form6 = 'Vós, que viviu i regneu';
    let form2 = 'Vós, que viviu i regneu pels segles dels segles';
    let bigf2 = "Vós, que viviu i regneu amb Déu Pare en la unitat de l'Esperit Sant, Déu, pels segles dels segles";
    let HMf2 = 'Vós, que viviu i regneu pels segles dels segles';
    let form3 = 'Que viu i regna pels segles dels segles';
    let form4 = 'Ell, que viu i regna pels segles dels segles';
    let form5 = 'Ell, que amb vós viu i regna';
    let bigf4 = "Ell, que amb vós viu i regna en la unitat de l'Esperit Sant, Déu, pels segles dels segles";
    let HMf4 = 'Ell, que viu i regna pels segles dels segles';

    let oAux = oracio;

    if (oAux.search(/\u00AD/g)) {
      oAux = oAux.replace(/\u00AD/g, '');
    }

    if (oAux.search(form1) !== -1) {
      if (horaMenor) {
        return oAux.replace(form1, HMf1);
      } else if (!horaMenor) {
        return oAux.replace(form1, bigf1);
      }
    }
    if (oAux.search(form7) !== -1) {
      if (horaMenor) {
        return oAux.replace(form7, HMf1);
      } else if (!horaMenor) {
        return oAux.replace(form7, bigf1);
      }
    }
    if (oAux.search(form2) !== -1) {
      if (horaMenor) {
        return oAux.replace(form2, HMf2);
      } else if (!horaMenor) {
        return oAux.replace(form2, bigf2);
      }
    }
    if (oAux.search(form6) !== -1) {
      if (horaMenor) {
        return oAux.replace(form6, HMf2);
      } else if (!horaMenor) {
        return oAux.replace(form6, bigf2);
      }
    }
    if (oAux.search(form3) !== -1) {
      if (horaMenor) {
        return oAux.replace(form3, HMf4);
      } else if (!horaMenor) {
        return oAux.replace(form3, bigf4);
      }
    }
    if (oAux.search(form4) !== -1) {
      if (horaMenor) {
        return oAux.replace(form4, HMf4);
      } else if (!horaMenor) {
        return oAux.replace(form4, bigf4);
      }
    }
    if (oAux.search(form5) !== -1) {
      if (horaMenor) {
        return oAux.replace(form5, HMf4);
      } else if (!horaMenor) {
        return oAux.replace(form5, bigf4);
      }
    }

    return oracio;
  },

  salmInvExists(salmNum, titols) {
    for (let i = 0; i < titols.length; i++) {
      let titol = titols[i];
      if (titol && titol.search('Salm ' + salmNum) !== -1) return false;
    }
    return true;
  },

  rs(text) {
    if (text) {
      let length = text.length;
      let lastChar = text.charAt(length - 1);
      if (lastChar === ' ' || lastChar === '\n') return text.slice(0, length - 1);
    }
    return text;
  },

  trim(text) {
    if (!text) {
      return '';
    }

    try {
      let length = text.length;
      let lastChar = text.charAt(length - 1);
      if (lastChar === ' ' || lastChar === '\n') return text.slice(0, length - 1);
      return text;
    } catch (error) {
      Logger.logError(Logger.LogKeys.GlobalFunctions, 'trim', error);
      return text;
    }
  },

  respTogether(r1, r2) {
    let result = '';

    if (r1 && r2) {
      result = r1 + ' ' + r2;
      let lastCharacter = r1.charAt(r1.length - 1);
      let firstWord = r2.split(' ')[0];
      firstWord = firstWord.replace(',', '');
      firstWord = firstWord.replace('.', '');
      firstWord = firstWord.replace(':', '');
      firstWord = firstWord.replace(';', '');

      if (
        lastCharacter !== '.' &&
        firstWord !== 'Senyor' &&
        firstWord !== 'Déu' &&
        firstWord !== 'Vós' &&
        firstWord !== 'Mare' &&
        firstWord !== 'Verge' &&
        firstWord !== 'Maria' &&
        firstWord !== 'Sant'
      )
        result = r1 + ' ' + r2.charAt(0).toLowerCase() + r2.slice(1);
    } else {
      const errorMessage = `First Part = '${r1}', Second Part = '${r2}'`;
      Logger.logError(Logger.LogKeys.GlobalFunctions, 'respTogether', new Error(errorMessage));
    }

    return result;
  },
};

export default GlobalViewFunctions;
