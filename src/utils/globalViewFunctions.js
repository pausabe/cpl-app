import * as Logger from './logger';

let GlobalViewFunctions = {
  canticSpace(canticleTitle) {
    if (canticleTitle) canticleTitle = canticleTitle.replace('Càntic	', 'Càntic\n');
    return canticleTitle;
  },

  completePrayer(prayer, minorHour) {
    if (!prayer) return '';

    let form1 = 'Per nostre Senyor Jesucrist';
    let form7 = 'Que amb vós viu i regna';
    let longForm1 =
      "Per nostre Senyor Jesucrist, el vostre Fill, que amb vós viu i regna en la unitat de l'Esperit Sant, Déu, pels segles dels segles";
    let minorHourForm1 = 'Per Crist Senyor nostre';
    let form6 = 'Vós, que viviu i regneu';
    let form2 = 'Vós, que viviu i regneu pels segles dels segles';
    let longForm2 = "Vós, que viviu i regneu amb Déu Pare en la unitat de l'Esperit Sant, Déu, pels segles dels segles";
    let minorHourForm2 = 'Vós, que viviu i regneu pels segles dels segles';
    let form3 = 'Que viu i regna pels segles dels segles';
    let form4 = 'Ell, que viu i regna pels segles dels segles';
    let form5 = 'Ell, que amb vós viu i regna';
    let longForm4 = "Ell, que amb vós viu i regna en la unitat de l'Esperit Sant, Déu, pels segles dels segles";
    let minorHourForm4 = 'Ell, que viu i regna pels segles dels segles';

    let text = prayer;

    if (text.search(/\u00AD/g)) {
      text = text.replace(/\u00AD/g, '');
    }

    if (text.search(form1) !== -1) {
      if (minorHour) {
        return text.replace(form1, minorHourForm1);
      } else if (!minorHour) {
        return text.replace(form1, longForm1);
      }
    }
    if (text.search(form7) !== -1) {
      if (minorHour) {
        return text.replace(form7, minorHourForm1);
      } else if (!minorHour) {
        return text.replace(form7, longForm1);
      }
    }
    if (text.search(form2) !== -1) {
      if (minorHour) {
        return text.replace(form2, minorHourForm2);
      } else if (!minorHour) {
        return text.replace(form2, longForm2);
      }
    }
    if (text.search(form6) !== -1) {
      if (minorHour) {
        return text.replace(form6, minorHourForm2);
      } else if (!minorHour) {
        return text.replace(form6, longForm2);
      }
    }
    if (text.search(form3) !== -1) {
      if (minorHour) {
        return text.replace(form3, minorHourForm4);
      } else if (!minorHour) {
        return text.replace(form3, longForm4);
      }
    }
    if (text.search(form4) !== -1) {
      if (minorHour) {
        return text.replace(form4, minorHourForm4);
      } else if (!minorHour) {
        return text.replace(form4, longForm4);
      }
    }
    if (text.search(form5) !== -1) {
      if (minorHour) {
        return text.replace(form5, minorHourForm4);
      } else if (!minorHour) {
        return text.replace(form5, longForm4);
      }
    }

    return prayer;
  },

  invitatoryPsalmExists(psalmNumber, titles) {
    for (let i = 0; i < titles.length; i++) {
      let title = titles[i];
      if (title && title.search('Salm ' + psalmNumber) !== -1) return false;
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
