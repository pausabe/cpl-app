import NightPrayer from '../../models/hours-liturgy/NightPrayer';
import LiturgyMasters from '../../models/liturgy-masters/LiturgyMasters';
import { LiturgySpecificDayInformation } from '../../models/LiturgyDayInformation';
import { Settings } from '../../models/Settings';
import { Psalm, ShortResponsory } from '../../models/liturgy-masters/CommonParts';
import { GenericLiturgyTimeType, SpecificLiturgyTimeType } from '../celebrationTimeEnums';

export function obtainNightPrayer(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): NightPrayer {
  let nightPrayer = new NightPrayer();
  nightPrayer.anthem = getAnthem(liturgyMasters, liturgyDayInformation, settings);
  const psalmody = getPsalmody(liturgyMasters, liturgyDayInformation);
  nightPrayer.firstPsalm = psalmody.firstPsalm;
  nightPrayer.secondPsalm = psalmody.secondPsalm;
  nightPrayer.hasMultiplePsalms = liturgyMasters.commonNightPrayerPsalter.hasTwoPsalms;
  nightPrayer.useOnlyFirstPsalmAntiphon =
    liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks &&
    liturgyDayInformation.genericLiturgyTime === GenericLiturgyTimeType.Easter;
  nightPrayer.shortReading = liturgyMasters.commonNightPrayerPsalter.shortReading;
  nightPrayer.shortResponsory = getShortResponsory(liturgyMasters, liturgyDayInformation);
  nightPrayer.evangelicalAntiphon = getEvangelicalAntiphon(liturgyMasters, liturgyDayInformation);
  nightPrayer.evangelicalChant = liturgyMasters.various.nightPrayerEvangelicalChant;
  nightPrayer.finalPrayer = liturgyMasters.commonNightPrayerPsalter.finalPrayer;
  if (settings.useLatin) {
    nightPrayer.virginMaryFinalAntiphonFirstOption = liturgyMasters.various.nightPrayerFinalAntiphonLatinFirstOption;
    nightPrayer.virginMaryFinalAntiphonSecondOption = liturgyMasters.various.nightPrayerFinalAntiphonLatinSecondOption;
    nightPrayer.virginMaryFinalAntiphonThirdOption = liturgyMasters.various.nightPrayerFinalAntiphonLatinThirdOption;
    nightPrayer.virginMaryFinalAntiphonFourthOption = liturgyMasters.various.nightPrayerFinalAntiphonLatinFourthOption;
    nightPrayer.virginMaryFinalAntiphonFifthOption = liturgyMasters.various.nightPrayerFinalAntiphonLatinFifthOption;
  } else {
    nightPrayer.virginMaryFinalAntiphonFirstOption = liturgyMasters.various.nightPrayerFinalAntiphonCatalanFirstOption;
    nightPrayer.virginMaryFinalAntiphonSecondOption =
      liturgyMasters.various.nightPrayerFinalAntiphonCatalanSecondOption;
    nightPrayer.virginMaryFinalAntiphonThirdOption = liturgyMasters.various.nightPrayerFinalAntiphonCatalanThirdOption;
    nightPrayer.virginMaryFinalAntiphonFourthOption =
      liturgyMasters.various.nightPrayerFinalAntiphonCatalanFourthOption;
    nightPrayer.virginMaryFinalAntiphonFifthOption = liturgyMasters.various.nightPrayerFinalAntiphonCatalanFifthOption;
  }
  nightPrayer.penitentialAct = liturgyMasters.various.penitentialAct;
  return nightPrayer;
}

function getAnthem(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): string {
  let anthem = settings.useLatin
    ? liturgyMasters.various.nightPrayerLatinSecondOptionAnthem
    : liturgyMasters.various.nightPrayerCatalanSecondOptionAnthem;
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.LentWeeks:
      if (liturgyDayInformation.week == '1' || liturgyDayInformation.week == '3' || liturgyDayInformation.week == '5') {
        return settings.useLatin
          ? liturgyMasters.various.nightPrayerLatinFirstOptionAnthem
          : liturgyMasters.various.nightPrayerCatalanFirstOptionAnthem;
      }
      break;
    case SpecificLiturgyTimeType.AdventWeeks:
    case SpecificLiturgyTimeType.ChristmasOctave:
      return settings.useLatin
        ? liturgyMasters.various.nightPrayerLatinFirstOptionAnthem
        : liturgyMasters.various.nightPrayerCatalanFirstOptionAnthem;
    case SpecificLiturgyTimeType.AdventFairs:
      if (liturgyDayInformation.date.getDate() == 24 && liturgyDayInformation.date.getMonth() == 11) {
        return settings.useLatin
          ? liturgyMasters.various.nightPrayerLatinFirstOptionAnthem
          : liturgyMasters.various.nightPrayerCatalanFirstOptionAnthem;
      }
      break;
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (liturgyDayInformation.date.getDate() < 5) {
        return settings.useLatin
          ? liturgyMasters.various.nightPrayerLatinFirstOptionAnthem
          : liturgyMasters.various.nightPrayerCatalanFirstOptionAnthem;
      }
      break;
    default:
      if (liturgyDayInformation.genericLiturgyTime === GenericLiturgyTimeType.Easter) {
        const lentLatinAnthem =
          'Iesu, redémptor sǽculi,\nVerbum Patris altíssimi,\nlux lucis invisíbilis,\ncustos tuórum pérvigil:\n\nTu fabricátor ómnium\ndiscrétor atque témporum,\nfessa labóre córpora\nnoctis quiéte récrea.\n\nQui frangis ima tártara,\ntu nos ab hoste líbera,\nne váleat sedúcere\ntuo redémptos sánguine,\n\nUt, dum graváti córpore\nbrevi manémus témpore,\nsic caro nostra dórmiat\nut mens sopórem nésciat.\n\nIesu, tibi sit glória,\nqui morte victa prǽnites,\ncum Patre et almo Spíritu,\nin sempitérna sǽcula. \nAmen.';
        const lentCatalanAnthem =
          "Jesús, oh Verb del Déu excels,\nde tots els segles Redemptor,\nsou llum de llum que brilla al cel\ni sou dels homes bon Pastor.\n\nVós que heu creat tot l'univers,\nl'espai i el temps amb savi dit,\nel cos cansat reanimeu\namb el descans d'aquesta nit.\n\nAmb cor humil us supliquem,\noh Crist, que sou el germà gran,\nque no pertorbi l'enemic\nels redimits amb vostra Sang.\n\nQue en el temps breu que dura el son,\n-sots vostres ales descansant-\nrecobri forces nostre cos\ni l'esperit vetlli, estimant.\n\nA vós, Jesús, glorifiquem\nque resplendiu vencent la mort,\namb l'etern Pare i l'Esperit,\nara i per segles sense fi.\nAmén";
        return settings.useLatin ? lentLatinAnthem : lentCatalanAnthem;
      }
  }
  return anthem;
}

function getPsalmody(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
): { firstPsalm: Psalm; secondPsalm: Psalm } {
  let psalmody = {
    firstPsalm: liturgyMasters.commonNightPrayerPsalter.firstPsalm,
    secondPsalm: liturgyMasters.commonNightPrayerPsalter.secondPsalm,
  };
  if (liturgyDayInformation.genericLiturgyTime === GenericLiturgyTimeType.Easter) {
    psalmody.firstPsalm.antiphon = 'Al·leluia, al·leluia, al·leluia.';
  }
  return psalmody;
}

function getShortResponsory(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
): ShortResponsory {
  let shortResponsory = new ShortResponsory();
  shortResponsory.hasSpecialAntiphon = false;
  shortResponsory.firstPart = 'A les vostres mans, Senyor,';
  shortResponsory.secondPart = 'Encomano el meu esperit.';
  shortResponsory.thirdPart = 'Vós, Déu fidel, ens heu redimit.';
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.EasterWeeks:
      shortResponsory.firstPart = 'A les vostres mans, Senyor, encomano el meu esperit,';
      shortResponsory.secondPart = 'Al·leluia, al·leluia.';
      shortResponsory.thirdPart = 'Vós, Déu fidel, ens heu redimit.';
      break;
    case SpecificLiturgyTimeType.HolyWeek:
      if (liturgyDayInformation.dayOfTheWeek === 4) {
        shortResponsory.hasSpecialAntiphon = true;
        shortResponsory.specialAntiphon = 'Crist es féu per nosaltres obedient fins a la mort.';
      }
      break;
    case SpecificLiturgyTimeType.PaschalTriduum:
      if (liturgyDayInformation.dayOfTheWeek === 5) {
        shortResponsory.hasSpecialAntiphon = true;
        shortResponsory.specialAntiphon = 'Crist es féu per nosaltres obedient fins a la mort i una mort de creu.';
      } else if (liturgyDayInformation.dayOfTheWeek === 6) {
        shortResponsory.hasSpecialAntiphon = true;
        shortResponsory.specialAntiphon =
          "Crist es féu per nosaltres obedient fins a la mort i una mort de creu. Per això Déu l'ha exalçat i li ha concedit aquell nom que està per damunt de tot altre nom.";
      }
      break;
    default:
      if (liturgyDayInformation.genericLiturgyTime === GenericLiturgyTimeType.Easter) {
        shortResponsory.hasSpecialAntiphon = true;
        shortResponsory.specialAntiphon =
          'Avui és el dia en què ha obrat el Senyor: alegrem-nos i celebrem-lo, al·leluia.';
      }
      break;
  }
  return shortResponsory;
}

function getEvangelicalAntiphon(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
): string {
  let evangelicalAntiphon =
    'Salveu-nos, Senyor, durant el dia, guardeu-nos durant la nit, perquè sigui amb Crist la nostra vetlla i amb Crist el nostre descans.';
  if (liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
    evangelicalAntiphon = evangelicalAntiphon + ' Al·leluia.';
  }
  return evangelicalAntiphon;
}
