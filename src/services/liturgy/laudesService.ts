import Laudes from '../../models/hours-liturgy/Laudes';
import LiturgyMasters from '../../models/liturgy-masters/LiturgyMasters';
import { LiturgySpecificDayInformation } from '../../models/LiturgyDayInformation';
import { Settings } from '../../models/Settings';
import { Psalm, ShortReading, ShortResponsory } from '../../models/liturgy-masters/CommonParts';
import { YearType } from '../databaseEnums';
import { SpecificLiturgyTimeType } from '../celebrationTimeEnums';
import { StringManagement } from '../../utils/StringManagement';

export function obtainLaudes(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationLaudes: Laudes,
  settings: Settings,
): Laudes {
  let laudes = new Laudes();
  if (liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
    laudes = celebrationLaudes;
  } else {
    laudes.anthem = getAnthem(liturgyMasters, liturgyDayInformation, celebrationLaudes, settings);
    const psalmody = getPsalmody(liturgyMasters, liturgyDayInformation, celebrationLaudes);
    laudes.firstPsalm = psalmody.firstPsalm;
    laudes.secondPsalm = psalmody.secondPsalm;
    laudes.thirdPsalm = psalmody.thirdPsalm;
    laudes.shortReading = getShortReading(liturgyMasters, liturgyDayInformation, celebrationLaudes);
    laudes.shortResponsory = getShortResponsory(liturgyMasters, liturgyDayInformation, celebrationLaudes);
    laudes.evangelicalAntiphon = getEvangelicalAntiphon(liturgyMasters, liturgyDayInformation, celebrationLaudes);
    laudes.prayers = getPrayers(liturgyMasters, liturgyDayInformation, celebrationLaudes);
    laudes.finalPrayer = getFinalPrayer(liturgyMasters, liturgyDayInformation, celebrationLaudes);
  }
  laudes.evangelicalChant = liturgyMasters.various.laudesEvangelicalChant;
  return laudes;
}

function getAnthem(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationLaudes: Laudes,
  settings: Settings,
): string {
  if (StringManagement.hasLiturgyContent(celebrationLaudes.anthem)) {
    return celebrationLaudes.anthem;
  }

  let anthem = '';
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.Ordinary:
      if (settings.useLatin) {
        anthem = liturgyMasters.laudesCommonPsalter.latinAnthem;
      } else {
        anthem = liturgyMasters.laudesCommonPsalter.catalanAnthem;
      }
      break;
    case SpecificLiturgyTimeType.LentAshes:
    case SpecificLiturgyTimeType.LentWeeks:
      if (liturgyDayInformation.dayOfTheWeek === 0) {
        if (settings.useLatin) {
          anthem = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.laudesSundaysLatinAnthem;
        } else {
          anthem = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.laudesSundaysCatalanAnthem;
        }
      } else {
        if (settings.useLatin) {
          anthem = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.laudesFairsLatinAnthem;
        } else {
          anthem = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.laudesFairsCatalanAnthem;
        }
      }
      break;
    case SpecificLiturgyTimeType.PalmSunday:
    case SpecificLiturgyTimeType.HolyWeek:
      if (settings.useLatin) {
        anthem = liturgyMasters.commonPartsOfHolyWeek.laudesLatinAnthem;
      } else {
        anthem = liturgyMasters.commonPartsOfHolyWeek.laudesCatalanAnthem;
      }
      break;
    case SpecificLiturgyTimeType.PaschalTriduum:
      if (settings.useLatin) {
        anthem = liturgyMasters.partsOfEasterTriduum.laudesLatinAnthem;
      } else {
        anthem = liturgyMasters.partsOfEasterTriduum.laudesCatalanAnthem;
      }
      break;
    case SpecificLiturgyTimeType.EasterOctave:
      if (settings.useLatin) {
        anthem = liturgyMasters.partsOfEasterBeforeAscension.laudesWeekendLatinAnthem;
      } else {
        anthem = liturgyMasters.partsOfEasterBeforeAscension.laudesWeekendCatalanAnthem;
      }
      break;
    case SpecificLiturgyTimeType.EasterWeeks:
      if (liturgyDayInformation.week === '7') {
        if (settings.useLatin) {
          anthem = liturgyMasters.partsOfEasterAfterAscension.laudesLatinAnthem;
        } else {
          anthem = liturgyMasters.partsOfEasterAfterAscension.laudesCatalanAnthem;
        }
      } else {
        if (liturgyDayInformation.dayOfTheWeek === 6 || liturgyDayInformation.dayOfTheWeek === 0) {
          if (settings.useLatin) {
            anthem = liturgyMasters.partsOfEasterBeforeAscension.laudesWeekendLatinAnthem;
          } else {
            anthem = liturgyMasters.partsOfEasterBeforeAscension.laudesWeekendCatalanAnthem;
          }
        } else {
          if (settings.useLatin) {
            anthem = liturgyMasters.partsOfEasterBeforeAscension.laudesWorkdaysLatinAnthem;
          } else {
            anthem = liturgyMasters.partsOfEasterBeforeAscension.laudesWorkdaysCatalanAnthem;
          }
        }
      }
      break;
    case SpecificLiturgyTimeType.AdventWeeks:
    case SpecificLiturgyTimeType.AdventFairs:
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (
        liturgyDayInformation.specificLiturgyTime != SpecificLiturgyTimeType.ChristmasBeforeOrdinary ||
        (liturgyDayInformation.specificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
          liturgyDayInformation.date.getMonth() == 0 &&
          liturgyDayInformation.date.getDate() != 13)
      ) {
        if (settings.useLatin) {
          anthem = liturgyMasters.commonAdventAndChristmasParts.laudesLatinAnthem;
        } else {
          anthem = liturgyMasters.commonAdventAndChristmasParts.laudesCatalanAnthem;
        }
      }
      break;
    case SpecificLiturgyTimeType.ChristmasOctave:
      if (settings.useLatin) {
        anthem = liturgyMasters.solemnityAndFestivityParts.laudesLatinAnthem;
      } else {
        anthem = liturgyMasters.solemnityAndFestivityParts.laudesCatalanAnthem;
      }
      break;
  }
  return anthem;
}

function getPsalmody(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationLaudes: Laudes,
): { firstPsalm: Psalm; secondPsalm: Psalm; thirdPsalm: Psalm } {
  let psalmody = {
    firstPsalm: new Psalm(),
    secondPsalm: new Psalm(),
    thirdPsalm: new Psalm(),
  };

  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.Ordinary:
    case SpecificLiturgyTimeType.LentAshes:
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (
        liturgyDayInformation.specificLiturgyTime != SpecificLiturgyTimeType.ChristmasBeforeOrdinary ||
        (liturgyDayInformation.specificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
          liturgyDayInformation.date.getMonth() == 0 &&
          liturgyDayInformation.date.getDate() != 13)
      ) {
        psalmody.firstPsalm.antiphon = liturgyMasters.laudesCommonPsalter.firstPsalm.antiphon;
        psalmody.firstPsalm.title = liturgyMasters.laudesCommonPsalter.firstPsalm.title;
        psalmody.firstPsalm.comment = liturgyMasters.laudesCommonPsalter.firstPsalm.comment;
        psalmody.firstPsalm.psalm = liturgyMasters.laudesCommonPsalter.firstPsalm.psalm;
        psalmody.firstPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.firstPsalm.hasGloryPrayer;
        psalmody.secondPsalm.antiphon = liturgyMasters.laudesCommonPsalter.secondPsalm.antiphon;
        psalmody.secondPsalm.title = liturgyMasters.laudesCommonPsalter.secondPsalm.title;
        psalmody.secondPsalm.comment = liturgyMasters.laudesCommonPsalter.secondPsalm.comment;
        psalmody.secondPsalm.psalm = liturgyMasters.laudesCommonPsalter.secondPsalm.psalm;
        psalmody.secondPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.secondPsalm.hasGloryPrayer;
        psalmody.thirdPsalm.antiphon = liturgyMasters.laudesCommonPsalter.thirdPsalm.antiphon;
        psalmody.thirdPsalm.title = liturgyMasters.laudesCommonPsalter.thirdPsalm.title;
        psalmody.thirdPsalm.comment = liturgyMasters.laudesCommonPsalter.thirdPsalm.comment;
        psalmody.thirdPsalm.psalm = liturgyMasters.laudesCommonPsalter.thirdPsalm.psalm;
        psalmody.thirdPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.thirdPsalm.hasGloryPrayer;
      }
      break;
    case SpecificLiturgyTimeType.AdventFairs:
      psalmody.firstPsalm.antiphon = liturgyMasters.laudesCommonPsalter.firstPsalm.antiphon;
      psalmody.firstPsalm.title = liturgyMasters.laudesCommonPsalter.firstPsalm.title;
      psalmody.firstPsalm.comment = liturgyMasters.laudesCommonPsalter.firstPsalm.comment;
      psalmody.firstPsalm.psalm = liturgyMasters.laudesCommonPsalter.firstPsalm.psalm;
      psalmody.firstPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.firstPsalm.hasGloryPrayer;
      psalmody.secondPsalm.antiphon = liturgyMasters.laudesCommonPsalter.secondPsalm.antiphon;
      psalmody.secondPsalm.title = liturgyMasters.laudesCommonPsalter.secondPsalm.title;
      psalmody.secondPsalm.comment = liturgyMasters.laudesCommonPsalter.secondPsalm.comment;
      psalmody.secondPsalm.psalm = liturgyMasters.laudesCommonPsalter.secondPsalm.psalm;
      psalmody.secondPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.secondPsalm.hasGloryPrayer;
      psalmody.thirdPsalm.antiphon = liturgyMasters.laudesCommonPsalter.thirdPsalm.antiphon;
      psalmody.thirdPsalm.title = liturgyMasters.laudesCommonPsalter.thirdPsalm.title;
      psalmody.thirdPsalm.comment = liturgyMasters.laudesCommonPsalter.thirdPsalm.comment;
      psalmody.thirdPsalm.psalm = liturgyMasters.laudesCommonPsalter.thirdPsalm.psalm;
      psalmody.thirdPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.thirdPsalm.hasGloryPrayer;

      if (liturgyDayInformation.dayOfTheWeek !== 0) {
        psalmody.firstPsalm.antiphon = liturgyMasters.adventFairDaysAntiphons.firstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.adventFairDaysAntiphons.secondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.adventFairDaysAntiphons.thirdAntiphon;
      }
      break;
    case SpecificLiturgyTimeType.LentWeeks:
      psalmody.firstPsalm.antiphon = liturgyMasters.laudesCommonPsalter.firstPsalm.antiphon;
      psalmody.firstPsalm.title = liturgyMasters.laudesCommonPsalter.firstPsalm.title;
      psalmody.firstPsalm.comment = liturgyMasters.laudesCommonPsalter.firstPsalm.comment;
      psalmody.firstPsalm.psalm = liturgyMasters.laudesCommonPsalter.firstPsalm.psalm;
      psalmody.firstPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.firstPsalm.hasGloryPrayer;
      psalmody.secondPsalm.antiphon = liturgyMasters.laudesCommonPsalter.secondPsalm.antiphon;
      psalmody.secondPsalm.title = liturgyMasters.laudesCommonPsalter.secondPsalm.title;
      psalmody.secondPsalm.comment = liturgyMasters.laudesCommonPsalter.secondPsalm.comment;
      psalmody.secondPsalm.psalm = liturgyMasters.laudesCommonPsalter.secondPsalm.psalm;
      psalmody.secondPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.secondPsalm.hasGloryPrayer;
      psalmody.thirdPsalm.antiphon = liturgyMasters.laudesCommonPsalter.thirdPsalm.antiphon;
      psalmody.thirdPsalm.title = liturgyMasters.laudesCommonPsalter.thirdPsalm.title;
      psalmody.thirdPsalm.comment = liturgyMasters.laudesCommonPsalter.thirdPsalm.comment;
      psalmody.thirdPsalm.psalm = liturgyMasters.laudesCommonPsalter.thirdPsalm.psalm;
      psalmody.thirdPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.thirdPsalm.hasGloryPrayer;
      if (liturgyDayInformation.dayOfTheWeek === 0) {
        psalmody.firstPsalm.antiphon = liturgyMasters.fiveWeeksOfSundayLentParts.laudesFirstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.fiveWeeksOfSundayLentParts.laudesSecondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.fiveWeeksOfSundayLentParts.laudesThirdAntiphon;
      }
      break;
    case SpecificLiturgyTimeType.PalmSunday:
      psalmody.firstPsalm.antiphon = liturgyMasters.laudesCommonPsalter.firstPsalm.antiphon;
      psalmody.firstPsalm.title = liturgyMasters.laudesCommonPsalter.firstPsalm.title;
      psalmody.firstPsalm.comment = liturgyMasters.laudesCommonPsalter.firstPsalm.comment;
      psalmody.firstPsalm.psalm = liturgyMasters.laudesCommonPsalter.firstPsalm.psalm;
      psalmody.firstPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.firstPsalm.hasGloryPrayer;
      psalmody.secondPsalm.antiphon = liturgyMasters.laudesCommonPsalter.secondPsalm.antiphon;
      psalmody.secondPsalm.title = liturgyMasters.laudesCommonPsalter.secondPsalm.title;
      psalmody.secondPsalm.comment = liturgyMasters.laudesCommonPsalter.secondPsalm.comment;
      psalmody.secondPsalm.psalm = liturgyMasters.laudesCommonPsalter.secondPsalm.psalm;
      psalmody.secondPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.secondPsalm.hasGloryPrayer;
      psalmody.thirdPsalm.antiphon = liturgyMasters.laudesCommonPsalter.thirdPsalm.antiphon;
      psalmody.thirdPsalm.title = liturgyMasters.laudesCommonPsalter.thirdPsalm.title;
      psalmody.thirdPsalm.comment = liturgyMasters.laudesCommonPsalter.thirdPsalm.comment;
      psalmody.thirdPsalm.psalm = liturgyMasters.laudesCommonPsalter.thirdPsalm.psalm;
      psalmody.thirdPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.thirdPsalm.hasGloryPrayer;
      if (liturgyDayInformation.dayOfTheWeek === 0) {
        psalmody.firstPsalm.antiphon = liturgyMasters.palmSundayParts.laudesFirstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.palmSundayParts.laudesSecondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.palmSundayParts.laudesThirdAntiphon;
      }
      break;
    case SpecificLiturgyTimeType.HolyWeek:
      psalmody.firstPsalm.title = liturgyMasters.laudesCommonPsalter.firstPsalm.title;
      psalmody.firstPsalm.comment = liturgyMasters.laudesCommonPsalter.firstPsalm.comment;
      psalmody.firstPsalm.psalm = liturgyMasters.laudesCommonPsalter.firstPsalm.psalm;
      psalmody.firstPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.firstPsalm.hasGloryPrayer;
      psalmody.secondPsalm.title = liturgyMasters.laudesCommonPsalter.secondPsalm.title;
      psalmody.secondPsalm.comment = liturgyMasters.laudesCommonPsalter.secondPsalm.comment;
      psalmody.secondPsalm.psalm = liturgyMasters.laudesCommonPsalter.secondPsalm.psalm;
      psalmody.secondPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.secondPsalm.hasGloryPrayer;
      psalmody.thirdPsalm.title = liturgyMasters.laudesCommonPsalter.thirdPsalm.title;
      psalmody.thirdPsalm.comment = liturgyMasters.laudesCommonPsalter.thirdPsalm.comment;
      psalmody.thirdPsalm.psalm = liturgyMasters.laudesCommonPsalter.thirdPsalm.psalm;
      psalmody.thirdPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.thirdPsalm.hasGloryPrayer;

      psalmody.firstPsalm.antiphon = liturgyMasters.partsOfHolyWeek.laudesFirstAntiphon;
      psalmody.secondPsalm.antiphon = liturgyMasters.partsOfHolyWeek.laudesSecondAntiphon;
      psalmody.thirdPsalm.antiphon = liturgyMasters.partsOfHolyWeek.laudesThirdAntiphon;
      break;
    case SpecificLiturgyTimeType.PaschalTriduum:
      psalmody.firstPsalm.antiphon = liturgyMasters.partsOfEasterTriduum.laudesFirstPsalm.antiphon;
      psalmody.firstPsalm.title = liturgyMasters.partsOfEasterTriduum.laudesFirstPsalm.title;
      psalmody.firstPsalm.comment = '-';
      psalmody.firstPsalm.psalm = liturgyMasters.partsOfEasterTriduum.laudesFirstPsalm.psalm;
      psalmody.firstPsalm.hasGloryPrayer = liturgyMasters.partsOfEasterTriduum.laudesFirstPsalm.hasGloryPrayer;
      psalmody.secondPsalm.antiphon = liturgyMasters.partsOfEasterTriduum.laudesSecondPsalm.antiphon;
      psalmody.secondPsalm.title = liturgyMasters.partsOfEasterTriduum.laudesSecondPsalm.title;
      psalmody.secondPsalm.comment = '-';
      psalmody.secondPsalm.psalm = liturgyMasters.partsOfEasterTriduum.laudesSecondPsalm.psalm;
      psalmody.secondPsalm.hasGloryPrayer = liturgyMasters.partsOfEasterTriduum.laudesSecondPsalm.hasGloryPrayer;
      psalmody.thirdPsalm.antiphon = liturgyMasters.partsOfEasterTriduum.laudesThirdPsalm.antiphon;
      psalmody.thirdPsalm.title = liturgyMasters.partsOfEasterTriduum.laudesThirdPsalm.title;
      psalmody.thirdPsalm.comment = '-';
      psalmody.thirdPsalm.psalm = liturgyMasters.partsOfEasterTriduum.laudesThirdPsalm.psalm;
      psalmody.thirdPsalm.hasGloryPrayer = liturgyMasters.partsOfEasterTriduum.laudesThirdPsalm.hasGloryPrayer;
      break;
    case SpecificLiturgyTimeType.EasterOctave:
      psalmody.firstPsalm.antiphon = liturgyMasters.easterSunday.laudesFirstPsalm.antiphon;
      psalmody.firstPsalm.title = liturgyMasters.easterSunday.laudesFirstPsalm.title;
      psalmody.firstPsalm.comment = '-';
      psalmody.firstPsalm.psalm = liturgyMasters.easterSunday.laudesFirstPsalm.psalm;
      psalmody.firstPsalm.hasGloryPrayer = liturgyMasters.easterSunday.laudesFirstPsalm.hasGloryPrayer;
      psalmody.secondPsalm.antiphon = liturgyMasters.easterSunday.laudesSecondPsalm.antiphon;
      psalmody.secondPsalm.title = liturgyMasters.easterSunday.laudesSecondPsalm.title;
      psalmody.secondPsalm.comment = '-';
      psalmody.secondPsalm.psalm = liturgyMasters.easterSunday.laudesSecondPsalm.psalm;
      psalmody.secondPsalm.hasGloryPrayer = liturgyMasters.easterSunday.laudesSecondPsalm.hasGloryPrayer;
      psalmody.thirdPsalm.antiphon = liturgyMasters.easterSunday.laudesThirdPsalm.antiphon;
      psalmody.thirdPsalm.title = liturgyMasters.easterSunday.laudesThirdPsalm.title;
      psalmody.thirdPsalm.comment = '-';
      psalmody.thirdPsalm.psalm = liturgyMasters.easterSunday.laudesThirdPsalm.psalm;
      psalmody.thirdPsalm.hasGloryPrayer = liturgyMasters.easterSunday.laudesThirdPsalm.hasGloryPrayer;
      break;
    case SpecificLiturgyTimeType.EasterWeeks:
      psalmody.firstPsalm.title = liturgyMasters.laudesCommonPsalter.firstPsalm.title;
      psalmody.firstPsalm.comment = liturgyMasters.laudesCommonPsalter.firstPsalm.comment;
      psalmody.firstPsalm.psalm = liturgyMasters.laudesCommonPsalter.firstPsalm.psalm;
      psalmody.firstPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.firstPsalm.hasGloryPrayer;
      psalmody.secondPsalm.title = liturgyMasters.laudesCommonPsalter.secondPsalm.title;
      psalmody.secondPsalm.comment = liturgyMasters.laudesCommonPsalter.secondPsalm.comment;
      psalmody.secondPsalm.psalm = liturgyMasters.laudesCommonPsalter.secondPsalm.psalm;
      psalmody.secondPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.secondPsalm.hasGloryPrayer;
      psalmody.thirdPsalm.title = liturgyMasters.laudesCommonPsalter.thirdPsalm.title;
      psalmody.thirdPsalm.comment = liturgyMasters.laudesCommonPsalter.thirdPsalm.comment;
      psalmody.thirdPsalm.psalm = liturgyMasters.laudesCommonPsalter.thirdPsalm.psalm;
      psalmody.thirdPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.thirdPsalm.hasGloryPrayer;

      if (liturgyDayInformation.dayOfTheWeek === 0) {
        psalmody.firstPsalm.antiphon = liturgyMasters.easterSundayParts.laudesFirstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.easterSundayParts.laudesSecondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.easterSundayParts.laudesThirdAntiphon;
      } else {
        psalmody.firstPsalm.antiphon = liturgyMasters.commonSpecialPartsOfEaster.laudesFirstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.commonSpecialPartsOfEaster.laudesSecondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.commonSpecialPartsOfEaster.laudesThirdAntiphon;
      }
      break;
    case SpecificLiturgyTimeType.AdventWeeks:
      psalmody.firstPsalm.title = liturgyMasters.laudesCommonPsalter.firstPsalm.title;
      psalmody.firstPsalm.comment = liturgyMasters.laudesCommonPsalter.firstPsalm.comment;
      psalmody.firstPsalm.psalm = liturgyMasters.laudesCommonPsalter.firstPsalm.psalm;
      psalmody.firstPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.firstPsalm.hasGloryPrayer;
      psalmody.secondPsalm.title = liturgyMasters.laudesCommonPsalter.secondPsalm.title;
      psalmody.secondPsalm.comment = liturgyMasters.laudesCommonPsalter.secondPsalm.comment;
      psalmody.secondPsalm.psalm = liturgyMasters.laudesCommonPsalter.secondPsalm.psalm;
      psalmody.secondPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.secondPsalm.hasGloryPrayer;
      psalmody.thirdPsalm.title = liturgyMasters.laudesCommonPsalter.thirdPsalm.title;
      psalmody.thirdPsalm.comment = liturgyMasters.laudesCommonPsalter.thirdPsalm.comment;
      psalmody.thirdPsalm.psalm = liturgyMasters.laudesCommonPsalter.thirdPsalm.psalm;
      psalmody.thirdPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.thirdPsalm.hasGloryPrayer;

      if (liturgyDayInformation.dayOfTheWeek === 0) {
        psalmody.firstPsalm.antiphon = liturgyMasters.adventSundayParts.laudesFirstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.adventSundayParts.laudesSecondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.adventSundayParts.laudesThirdAntiphon;
      } else {
        psalmody.firstPsalm.antiphon = liturgyMasters.laudesCommonPsalter.firstPsalm.antiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.laudesCommonPsalter.secondPsalm.antiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.laudesCommonPsalter.thirdPsalm.antiphon;
      }
      break;
    case SpecificLiturgyTimeType.ChristmasOctave:
      psalmody.firstPsalm.antiphon = liturgyMasters.laudesCommonPsalter.firstPsalm.antiphon;
      psalmody.firstPsalm.title = liturgyMasters.laudesCommonPsalter.firstPsalm.title;
      psalmody.firstPsalm.comment = liturgyMasters.laudesCommonPsalter.firstPsalm.comment;
      psalmody.firstPsalm.psalm = liturgyMasters.laudesCommonPsalter.firstPsalm.psalm;
      psalmody.firstPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.firstPsalm.hasGloryPrayer;
      psalmody.secondPsalm.antiphon = liturgyMasters.laudesCommonPsalter.secondPsalm.antiphon;
      psalmody.secondPsalm.title = liturgyMasters.laudesCommonPsalter.secondPsalm.title;
      psalmody.secondPsalm.comment = liturgyMasters.laudesCommonPsalter.secondPsalm.comment;
      psalmody.secondPsalm.psalm = liturgyMasters.laudesCommonPsalter.secondPsalm.psalm;
      psalmody.secondPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.secondPsalm.hasGloryPrayer;
      psalmody.thirdPsalm.antiphon = liturgyMasters.laudesCommonPsalter.thirdPsalm.antiphon;
      psalmody.thirdPsalm.title = liturgyMasters.laudesCommonPsalter.thirdPsalm.title;
      psalmody.thirdPsalm.comment = liturgyMasters.laudesCommonPsalter.thirdPsalm.comment;
      psalmody.thirdPsalm.psalm = liturgyMasters.laudesCommonPsalter.thirdPsalm.psalm;
      psalmody.thirdPsalm.hasGloryPrayer = liturgyMasters.laudesCommonPsalter.thirdPsalm.hasGloryPrayer;

      if (liturgyDayInformation.date.getDate() === 25 && liturgyDayInformation.date.getMonth() === 11) {
        psalmody.firstPsalm.antiphon = liturgyMasters.laudesCommonPsalter.firstPsalm.antiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.laudesCommonPsalter.secondPsalm.antiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.laudesCommonPsalter.thirdPsalm.antiphon;
      } else {
        psalmody.firstPsalm.antiphon = liturgyMasters.solemnityAndFestivityParts.laudesFirstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.solemnityAndFestivityParts.laudesSecondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.solemnityAndFestivityParts.laudesThirdAntiphon;
      }
      break;
  }

  if (StringManagement.hasLiturgyContent(celebrationLaudes.firstPsalm.antiphon)) {
    psalmody.firstPsalm.antiphon = celebrationLaudes.firstPsalm.antiphon;
  }
  if (StringManagement.hasLiturgyContent(celebrationLaudes.firstPsalm.title)) {
    psalmody.firstPsalm.title = celebrationLaudes.firstPsalm.title;
    psalmody.firstPsalm.comment = '-';
  }
  if (StringManagement.hasLiturgyContent(celebrationLaudes.firstPsalm.psalm)) {
    psalmody.firstPsalm.psalm = celebrationLaudes.firstPsalm.psalm;
    psalmody.firstPsalm.hasGloryPrayer = celebrationLaudes.firstPsalm.hasGloryPrayer;
  }
  if (StringManagement.hasLiturgyContent(celebrationLaudes.secondPsalm.antiphon)) {
    psalmody.secondPsalm.antiphon = celebrationLaudes.secondPsalm.antiphon;
  }
  if (StringManagement.hasLiturgyContent(celebrationLaudes.secondPsalm.title)) {
    psalmody.secondPsalm.title = celebrationLaudes.secondPsalm.title;
    psalmody.secondPsalm.comment = '-';
  }
  if (StringManagement.hasLiturgyContent(celebrationLaudes.secondPsalm.psalm)) {
    psalmody.secondPsalm.psalm = celebrationLaudes.secondPsalm.psalm;
    psalmody.secondPsalm.hasGloryPrayer = celebrationLaudes.secondPsalm.hasGloryPrayer;
  }
  if (StringManagement.hasLiturgyContent(celebrationLaudes.thirdPsalm.antiphon)) {
    psalmody.thirdPsalm.antiphon = celebrationLaudes.thirdPsalm.antiphon;
  }
  if (StringManagement.hasLiturgyContent(celebrationLaudes.thirdPsalm.title)) {
    psalmody.thirdPsalm.title = celebrationLaudes.thirdPsalm.title;
    psalmody.thirdPsalm.comment = '-';
  }
  if (StringManagement.hasLiturgyContent(celebrationLaudes.thirdPsalm.psalm)) {
    psalmody.thirdPsalm.psalm = celebrationLaudes.thirdPsalm.psalm;
    psalmody.thirdPsalm.hasGloryPrayer = celebrationLaudes.thirdPsalm.hasGloryPrayer;
  }

  return psalmody;
}

function getShortReading(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationLaudes: Laudes,
): ShortReading {
  if (StringManagement.hasLiturgyContent(celebrationLaudes.shortReading.quote)) {
    return celebrationLaudes.shortReading;
  }

  let shortReading = liturgyMasters.laudesCommonPsalter.shortReading;
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.LentAshes:
      return liturgyMasters.partsOfLentTime.laudesShortReading;
    case SpecificLiturgyTimeType.LentWeeks:
      return liturgyMasters.partsOfFiveWeeksOfLentTime.laudesShortReading;
    case SpecificLiturgyTimeType.PalmSunday:
      return liturgyMasters.palmSundayParts.laudesShortReading;
    case SpecificLiturgyTimeType.HolyWeek:
      return liturgyMasters.partsOfHolyWeek.laudesShortReading;
    case SpecificLiturgyTimeType.PaschalTriduum:
      return liturgyMasters.partsOfEasterTriduum.laudesShortReading;
    case SpecificLiturgyTimeType.EasterOctave:
      return liturgyMasters.partsOfEasterOctave.laudesShortReading;
    case SpecificLiturgyTimeType.EasterWeeks:
      return liturgyMasters.easterWeekParts.laudesShortReading;
    case SpecificLiturgyTimeType.AdventWeeks:
      return liturgyMasters.adventWeekParts.laudesShortReading;
    case SpecificLiturgyTimeType.AdventFairs:
      return liturgyMasters.adventFairDaysParts.laudesShortReading;
    case SpecificLiturgyTimeType.ChristmasOctave:
      return liturgyMasters.christmasWhenOctaveParts.laudesShortReading;
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (liturgyDayInformation.date.getMonth() == 0 && liturgyDayInformation.date.getDate() != 13) {
        return liturgyMasters.christmasBeforeEpiphanyParts.laudesShortReading;
      }
      break;
  }
  return shortReading;
}

function getShortResponsory(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationLaudes: Laudes,
): ShortResponsory {
  if (
    liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday ||
    StringManagement.hasLiturgyContent(celebrationLaudes.shortResponsory.firstPart)
  ) {
    return celebrationLaudes.shortResponsory;
  } else {
    if (liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum) {
      return liturgyMasters.partsOfEasterTriduum.laudesShortResponsory;
    } else if (liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.EasterOctave) {
      return liturgyMasters.partsOfEasterOctave.laudesShortResponsory;
    }
  }

  let shortResponsory = liturgyMasters.laudesCommonPsalter.shortResponsory;
  shortResponsory.hasSpecialAntiphon = false;
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.LentAshes:
      return liturgyMasters.partsOfLentTime.laudesShortResponsory;
    case SpecificLiturgyTimeType.LentWeeks:
      return liturgyMasters.partsOfFiveWeeksOfLentTime.laudesShortResponsory;
    case SpecificLiturgyTimeType.PalmSunday:
      return liturgyMasters.palmSundayParts.laudesShortResponsory;
    case SpecificLiturgyTimeType.HolyWeek:
      return liturgyMasters.partsOfHolyWeek.laudesShortResponsory;
    case SpecificLiturgyTimeType.EasterWeeks:
      return liturgyMasters.easterWeekParts.laudesShortResponsory;
    case SpecificLiturgyTimeType.AdventWeeks:
      return liturgyMasters.adventWeekParts.laudesShortResponsory;
    case SpecificLiturgyTimeType.AdventFairs:
      return liturgyMasters.adventFairDaysParts.laudesShortResponsory;
    case SpecificLiturgyTimeType.ChristmasOctave:
      return liturgyMasters.christmasWhenOctaveParts.laudesShortResponsory;
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (liturgyDayInformation.date.getMonth() == 0 && liturgyDayInformation.date.getDate() != 13) {
        return liturgyMasters.christmasBeforeEpiphanyParts.laudesShortResponsory;
      }
      break;
  }
  return shortResponsory;
}

function getEvangelicalAntiphon(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationLaudes: Laudes,
): string {
  if (StringManagement.hasLiturgyContent(celebrationLaudes.evangelicalAntiphon)) {
    return celebrationLaudes.evangelicalAntiphon;
  }

  let evangelicalAntiphon = liturgyMasters.laudesCommonPsalter.evangelicalAntiphon;
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.Ordinary:
      if (liturgyDayInformation.dayOfTheWeek === 0) {
        switch (liturgyDayInformation.yearType) {
          case YearType.A:
            return liturgyMasters.prayersOfOrdinaryTime.laudesEvangelicalAntiphonYearA;
          case YearType.B:
            return liturgyMasters.prayersOfOrdinaryTime.laudesEvangelicalAntiphonYearB;
          case YearType.C:
            return liturgyMasters.prayersOfOrdinaryTime.laudesEvangelicalAntiphonYearC;
        }
      }
      break;
    case SpecificLiturgyTimeType.LentAshes:
      return liturgyMasters.partsOfLentTime.laudesEvangelicalAntiphon;
    case SpecificLiturgyTimeType.LentWeeks:
      if (liturgyDayInformation.dayOfTheWeek !== 0) {
        return liturgyMasters.partsOfFiveWeeksOfLentTime.laudesEvangelicalAntiphon;
      } else {
        switch (liturgyDayInformation.yearType) {
          case YearType.A:
            return liturgyMasters.fiveWeeksOfSundayLentParts.laudesEvangelicalAntiphonYearA;
          case YearType.B:
            return liturgyMasters.fiveWeeksOfSundayLentParts.laudesEvangelicalAntiphonYearB;
          case YearType.C:
            return liturgyMasters.fiveWeeksOfSundayLentParts.laudesEvangelicalAntiphonYearC;
        }
      }
      break;
    case SpecificLiturgyTimeType.PalmSunday:
      switch (liturgyDayInformation.yearType) {
        case YearType.A:
          return liturgyMasters.palmSundayParts.laudesEvangelicalAntiphonYearA;
        case YearType.B:
          return liturgyMasters.palmSundayParts.laudesEvangelicalAntiphonYearB;
        case YearType.C:
          return liturgyMasters.palmSundayParts.laudesEvangelicalAntiphonYearC;
      }
      break;
    case SpecificLiturgyTimeType.HolyWeek:
      return liturgyMasters.partsOfHolyWeek.laudesEvangelicalAntiphon;
    case SpecificLiturgyTimeType.PaschalTriduum:
      return liturgyMasters.partsOfEasterTriduum.laudesEvangelicalAntiphon;
    case SpecificLiturgyTimeType.EasterOctave:
      return liturgyMasters.partsOfEasterOctave.laudesEvangelicalAntiphon;
    case SpecificLiturgyTimeType.EasterWeeks:
      if (liturgyDayInformation.dayOfTheWeek !== 0) {
        return liturgyMasters.easterWeekParts.laudesEvangelicalAntiphon;
      } else {
        switch (liturgyDayInformation.yearType) {
          case YearType.A:
            return liturgyMasters.easterSundayParts.laudesEvangelicalAntiphonYearA;
          case YearType.B:
            return liturgyMasters.easterSundayParts.laudesEvangelicalAntiphonYearB;
          case YearType.C:
            return liturgyMasters.easterSundayParts.laudesEvangelicalAntiphonYearC;
        }
      }
      break;
    case SpecificLiturgyTimeType.AdventWeeks:
      if (liturgyDayInformation.dayOfTheWeek !== 0) {
        return liturgyMasters.adventWeekParts.laudesEvangelicalAntiphon;
      } else {
        switch (liturgyDayInformation.yearType) {
          case YearType.A:
            return liturgyMasters.adventSundayParts.laudesEvangelicalAntiphonYearA;
          case YearType.B:
            return liturgyMasters.adventSundayParts.laudesEvangelicalAntiphonYearB;
          case YearType.C:
            return liturgyMasters.adventSundayParts.laudesEvangelicalAntiphonYearC;
        }
      }
      break;
    case SpecificLiturgyTimeType.AdventFairs:
      return liturgyMasters.adventFairDaysParts.laudesEvangelicalAntiphon;
    case SpecificLiturgyTimeType.ChristmasOctave:
      return liturgyMasters.christmasWhenOctaveParts.laudesEvangelicalAntiphon;
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (liturgyDayInformation.date.getMonth() == 0 && liturgyDayInformation.date.getDate() != 13) {
        return liturgyMasters.christmasBeforeEpiphanyParts.laudesEvangelicalAntiphon;
      }
      break;
  }
  return evangelicalAntiphon;
}

function getPrayers(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationLaudes: Laudes,
): string {
  if (StringManagement.hasLiturgyContent(celebrationLaudes.prayers)) {
    return celebrationLaudes.prayers;
  }

  let prayers = liturgyMasters.laudesCommonPsalter.prayers;
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.LentAshes:
      return liturgyMasters.partsOfLentTime.laudesPrayers;
    case SpecificLiturgyTimeType.LentWeeks:
      return liturgyMasters.partsOfFiveWeeksOfLentTime.laudesPrayers;
    case SpecificLiturgyTimeType.PalmSunday:
      return liturgyMasters.palmSundayParts.laudesPrayers;
    case SpecificLiturgyTimeType.HolyWeek:
      return liturgyMasters.partsOfHolyWeek.laudesPrayers;
    case SpecificLiturgyTimeType.PaschalTriduum:
      return liturgyMasters.partsOfEasterTriduum.laudesPrayers;
    case SpecificLiturgyTimeType.EasterOctave:
      return liturgyMasters.partsOfEasterOctave.laudesPrayers;
    case SpecificLiturgyTimeType.EasterWeeks:
      return liturgyMasters.easterWeekParts.laudesPrayers;
    case SpecificLiturgyTimeType.AdventWeeks:
      return liturgyMasters.adventWeekParts.laudesPrayers;
    case SpecificLiturgyTimeType.AdventFairs:
      return liturgyMasters.adventFairDaysParts.laudesPrayers;
    case SpecificLiturgyTimeType.ChristmasOctave:
      return liturgyMasters.christmasWhenOctaveParts.laudesPrayers;
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (liturgyDayInformation.date.getMonth() == 0 && liturgyDayInformation.date.getDate() != 13) {
        return liturgyMasters.christmasBeforeEpiphanyParts.laudesPrayers;
      }
      break;
  }
  return prayers;
}

function getFinalPrayer(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationLaudes: Laudes,
): string {
  if (StringManagement.hasLiturgyContent(celebrationLaudes.finalPrayer)) {
    return celebrationLaudes.finalPrayer;
  }

  let finalPrayer = liturgyMasters.laudesCommonPsalter.finalPrayer;
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.Ordinary:
      if (liturgyDayInformation.dayOfTheWeek === 0) {
        1;
        return liturgyMasters.prayersOfOrdinaryTime.finalPrayer;
      }
      break;
    case SpecificLiturgyTimeType.LentAshes:
      return liturgyMasters.partsOfLentTime.laudesFinalPrayer;
    case SpecificLiturgyTimeType.LentWeeks:
      return liturgyMasters.partsOfFiveWeeksOfLentTime.laudesFinalPrayer;
    case SpecificLiturgyTimeType.PalmSunday:
      return liturgyMasters.palmSundayParts.laudesFinalPrayer;
    case SpecificLiturgyTimeType.HolyWeek:
      return liturgyMasters.partsOfHolyWeek.laudesFinalPrayer;
    case SpecificLiturgyTimeType.PaschalTriduum:
      return liturgyMasters.partsOfEasterTriduum.laudesFinalPrayer;
    case SpecificLiturgyTimeType.EasterOctave:
      return liturgyMasters.partsOfEasterOctave.laudesFinalPrayer;
    case SpecificLiturgyTimeType.EasterWeeks:
      return liturgyMasters.easterWeekParts.laudesFinalPrayer;
    case SpecificLiturgyTimeType.AdventWeeks:
      return liturgyMasters.adventWeekParts.laudesFinalPrayer;
    case SpecificLiturgyTimeType.AdventFairs:
      return liturgyMasters.adventFairDaysParts.laudesFinalPrayer;
    case SpecificLiturgyTimeType.ChristmasOctave:
      return liturgyMasters.christmasWhenOctaveParts.laudesFinalPrayer;
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (liturgyDayInformation.date.getMonth() == 0 && liturgyDayInformation.date.getDate() != 13) {
        return liturgyMasters.christmasBeforeEpiphanyParts.laudesFinalPrayer;
      }
      break;
  }
  return finalPrayer;
}
