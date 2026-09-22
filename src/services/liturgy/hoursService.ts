import Hours from '../../models/hours-liturgy/Hours';
import LiturgyMasters from '../../models/liturgy-masters/LiturgyMasters';
import { LiturgySpecificDayInformation } from '../../models/LiturgyDayInformation';
import { Settings } from '../../models/Settings';
import { Psalm, Responsory, ShortReading } from '../../models/liturgy-masters/CommonParts';
import { SpecificLiturgyTimeType } from '../celebrationTimeEnums';
import { StringManagement } from '../../utils/StringManagement';
import * as CelebrationIdentifier from '../celebrationIdentifierService';
import { Celebration } from '../celebrationIdentifierService';

export function obtainHours(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationHours: Hours,
  settings: Settings,
): Hours {
  let hours = new Hours();
  if (liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
    hours = celebrationHours;
  } else {
    const hourAnthems = getHourAnthems(liturgyMasters, liturgyDayInformation, celebrationHours, settings);
    const hourPsalmody = getHoursPsalmody(liturgyMasters, liturgyDayInformation, celebrationHours);
    const hourResponsory = getResponsory(liturgyMasters, liturgyDayInformation, celebrationHours);
    const hourShortReading = getShortReading(liturgyMasters, liturgyDayInformation, celebrationHours);
    const hourFinalPraying = getFinalPraying(liturgyMasters, liturgyDayInformation, celebrationHours);

    hours.thirdHour.anthem = hourAnthems.thirdValue;
    hours.thirdHour.hasMultipleAntiphons = hourPsalmody.thirdValue.hasMultipleAntiphons;
    hours.thirdHour.uniqueAntiphon = hourPsalmody.thirdValue.uniqueAntiphon;
    hours.thirdHour.firstPsalm = hourPsalmody.thirdValue.firstPsalm;
    hours.thirdHour.secondPsalm = hourPsalmody.thirdValue.secondPsalm;
    hours.thirdHour.thirdPsalm = hourPsalmody.thirdValue.thirdPsalm;
    hours.thirdHour.responsory = hourResponsory.thirdValue;
    hours.thirdHour.shortReading = hourShortReading.thirdValue;
    hours.thirdHour.finalPrayer = hourFinalPraying.thirdValue;

    hours.sixthHour.anthem = hourAnthems.sixthValue;
    hours.sixthHour.hasMultipleAntiphons = hourPsalmody.sixthValue.hasMultipleAntiphons;
    hours.sixthHour.uniqueAntiphon = hourPsalmody.sixthValue.uniqueAntiphon;
    hours.sixthHour.firstPsalm = hourPsalmody.sixthValue.firstPsalm;
    hours.sixthHour.secondPsalm = hourPsalmody.sixthValue.secondPsalm;
    hours.sixthHour.thirdPsalm = hourPsalmody.sixthValue.thirdPsalm;
    hours.sixthHour.responsory = hourResponsory.sixthValue;
    hours.sixthHour.shortReading = hourShortReading.sixthValue;
    hours.sixthHour.finalPrayer = hourFinalPraying.sixthValue;

    hours.ninthHour.anthem = hourAnthems.ninthValue;
    hours.ninthHour.hasMultipleAntiphons = hourPsalmody.ninthValue.hasMultipleAntiphons;
    hours.ninthHour.uniqueAntiphon = hourPsalmody.ninthValue.uniqueAntiphon;
    hours.ninthHour.firstPsalm = hourPsalmody.ninthValue.firstPsalm;
    hours.ninthHour.secondPsalm = hourPsalmody.ninthValue.secondPsalm;
    hours.ninthHour.thirdPsalm = hourPsalmody.ninthValue.thirdPsalm;
    hours.ninthHour.responsory = hourResponsory.ninthValue;
    hours.ninthHour.shortReading = hourShortReading.ninthValue;
    hours.ninthHour.finalPrayer = hourFinalPraying.ninthValue;
  }
  return hours;
}

function getHourAnthems(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationHours: Hours,
  settings: Settings,
): { thirdValue: string; sixthValue: string; ninthValue: string } {
  let hourAnthems = {
    thirdValue: '',
    sixthValue: '',
    ninthValue: '',
  };

  if (StringManagement.hasLiturgyContent(celebrationHours.thirdHour.anthem)) {
    hourAnthems.thirdValue = celebrationHours.thirdHour.anthem;
    hourAnthems.sixthValue = celebrationHours.sixthHour.anthem;
    hourAnthems.ninthValue = celebrationHours.ninthHour.anthem;
  } else {
    if (settings.useLatin) {
      hourAnthems.thirdValue = liturgyMasters.various.thirdHourLatinFirstOptionAnthem;
      hourAnthems.sixthValue = liturgyMasters.various.sixthHourLatinFirstOptionAnthem;
      hourAnthems.ninthValue = liturgyMasters.various.ninthHourLatinFirstOptionAnthem;
    } else {
      hourAnthems.thirdValue = liturgyMasters.various.thirdHourCatalanFirstOptionAnthem;
      hourAnthems.sixthValue = liturgyMasters.various.sixthHourCatalanFirstOptionAnthem;
      hourAnthems.ninthValue = liturgyMasters.various.ninthHourCatalanFirstOptionAnthem;
    }
    switch (liturgyDayInformation.specificLiturgyTime) {
      case SpecificLiturgyTimeType.LentAshes:
      case SpecificLiturgyTimeType.LentWeeks:
        if (settings.useLatin) {
          hourAnthems.thirdValue = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.thirdHourLatinAnthem;
          hourAnthems.sixthValue = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.sixthHourLatinAnthem;
          hourAnthems.ninthValue = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.ninthHourLatinAnthem;
        } else {
          hourAnthems.thirdValue = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.thirdHourCatalanAnthem;
          hourAnthems.sixthValue = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.sixthHourCatalanAnthem;
          hourAnthems.ninthValue = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.ninthHourCatalanAnthem;
        }
        break;
      case SpecificLiturgyTimeType.PalmSunday:
      case SpecificLiturgyTimeType.HolyWeek:
        if (settings.useLatin) {
          hourAnthems.thirdValue = liturgyMasters.commonPartsOfHolyWeek.hoursLatinAnthem;
          hourAnthems.sixthValue = liturgyMasters.commonPartsOfHolyWeek.hoursLatinAnthem;
          hourAnthems.ninthValue = liturgyMasters.commonPartsOfHolyWeek.hoursLatinAnthem;
        } else {
          hourAnthems.thirdValue = liturgyMasters.commonPartsOfHolyWeek.hoursCatalanAnthem;
          hourAnthems.sixthValue = liturgyMasters.commonPartsOfHolyWeek.hoursCatalanAnthem;
          hourAnthems.ninthValue = liturgyMasters.commonPartsOfHolyWeek.hoursCatalanAnthem;
        }
        break;
      case SpecificLiturgyTimeType.PaschalTriduum:
        if (settings.useLatin) {
          hourAnthems.thirdValue = liturgyMasters.partsOfEasterTriduum.thirdHourParts.latinAnthem;
          hourAnthems.sixthValue = liturgyMasters.partsOfEasterTriduum.sixthHourParts.latinAnthem;
          hourAnthems.ninthValue = liturgyMasters.partsOfEasterTriduum.ninthHourParts.latinAnthem;
        } else {
          hourAnthems.thirdValue = liturgyMasters.partsOfEasterTriduum.thirdHourParts.catalanAnthem;
          hourAnthems.sixthValue = liturgyMasters.partsOfEasterTriduum.sixthHourParts.catalanAnthem;
          hourAnthems.ninthValue = liturgyMasters.partsOfEasterTriduum.ninthHourParts.catalanAnthem;
        }
        break;
      case SpecificLiturgyTimeType.EasterOctave:
        if (settings.useLatin) {
          hourAnthems.thirdValue = liturgyMasters.partsOfEasterBeforeAscension.thirdHourLatinAnthem;
          hourAnthems.sixthValue = liturgyMasters.partsOfEasterBeforeAscension.sixthHourLatinAnthem;
          hourAnthems.ninthValue = liturgyMasters.partsOfEasterBeforeAscension.ninthHourLatinAnthem;
        } else {
          hourAnthems.thirdValue = liturgyMasters.partsOfEasterBeforeAscension.thirdHourCatalanAnthem;
          hourAnthems.sixthValue = liturgyMasters.partsOfEasterBeforeAscension.sixthHourCatalanAnthem;
          hourAnthems.ninthValue = liturgyMasters.partsOfEasterBeforeAscension.ninthHourCatalanAnthem;
        }
        break;
      case SpecificLiturgyTimeType.EasterWeeks:
        if (liturgyDayInformation.week === '7') {
          if (settings.useLatin) {
            hourAnthems.thirdValue = liturgyMasters.partsOfEasterAfterAscension.thirdHourLatinAnthem;
            hourAnthems.sixthValue = liturgyMasters.partsOfEasterAfterAscension.sixthHourLatinAnthem;
            hourAnthems.ninthValue = liturgyMasters.partsOfEasterAfterAscension.ninthHourLatinAnthem;
          } else {
            hourAnthems.thirdValue = liturgyMasters.partsOfEasterAfterAscension.thirdHourCatalanAnthem;
            hourAnthems.sixthValue = liturgyMasters.partsOfEasterAfterAscension.sixthHourCatalanAnthem;
            hourAnthems.ninthValue = liturgyMasters.partsOfEasterAfterAscension.ninthHourCatalanAnthem;
          }
        } else {
          if (settings.useLatin) {
            hourAnthems.thirdValue = liturgyMasters.partsOfEasterBeforeAscension.thirdHourLatinAnthem;
            hourAnthems.sixthValue = liturgyMasters.partsOfEasterBeforeAscension.sixthHourLatinAnthem;
            hourAnthems.ninthValue = liturgyMasters.partsOfEasterBeforeAscension.ninthHourLatinAnthem;
          } else {
            hourAnthems.thirdValue = liturgyMasters.partsOfEasterBeforeAscension.thirdHourCatalanAnthem;
            hourAnthems.sixthValue = liturgyMasters.partsOfEasterBeforeAscension.sixthHourCatalanAnthem;
            hourAnthems.ninthValue = liturgyMasters.partsOfEasterBeforeAscension.ninthHourCatalanAnthem;
          }
        }
        break;
      case SpecificLiturgyTimeType.AdventWeeks:
      case SpecificLiturgyTimeType.AdventFairs:
      case SpecificLiturgyTimeType.ChristmasOctave:
      case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
        const beforeChristmasConditions =
          liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
          liturgyDayInformation.date.getMonth() == 0 &&
          liturgyDayInformation.date.getDate() != 13;
        const christmasOctaveConditions =
          liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave &&
          !CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation);
        if (
          (liturgyDayInformation.specificLiturgyTime !== SpecificLiturgyTimeType.ChristmasBeforeOrdinary ||
            beforeChristmasConditions) &&
          (liturgyDayInformation.specificLiturgyTime !== SpecificLiturgyTimeType.ChristmasOctave ||
            christmasOctaveConditions)
        ) {
          if (settings.useLatin) {
            hourAnthems.thirdValue = liturgyMasters.commonAdventAndChristmasParts.thirdHourLatinAnthem;
            hourAnthems.sixthValue = liturgyMasters.commonAdventAndChristmasParts.sixthHourLatinAnthem;
            hourAnthems.ninthValue = liturgyMasters.commonAdventAndChristmasParts.ninthHourLatinAnthem;
          } else {
            hourAnthems.thirdValue = liturgyMasters.commonAdventAndChristmasParts.thirdHourCatalanAnthem;
            hourAnthems.sixthValue = liturgyMasters.commonAdventAndChristmasParts.sixthHourCatalanAnthem;
            hourAnthems.ninthValue = liturgyMasters.commonAdventAndChristmasParts.ninthHourCatalanAnthem;
          }
        }
        break;
    }
  }
  return hourAnthems;
}

function getHoursPsalmody(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationHours: Hours,
): {
  thirdValue: {
    hasMultipleAntiphons: boolean;
    uniqueAntiphon: string;
    firstPsalm: Psalm;
    secondPsalm: Psalm;
    thirdPsalm: Psalm;
  };
  sixthValue: {
    hasMultipleAntiphons: boolean;
    uniqueAntiphon: string;
    firstPsalm: Psalm;
    secondPsalm: Psalm;
    thirdPsalm: Psalm;
  };
  ninthValue: {
    hasMultipleAntiphons: boolean;
    uniqueAntiphon: string;
    firstPsalm: Psalm;
    secondPsalm: Psalm;
    thirdPsalm: Psalm;
  };
} {
  let psalmody = {
    thirdValue: {
      hasMultipleAntiphons: true,
      uniqueAntiphon: '',
      firstPsalm: new Psalm(),
      secondPsalm: new Psalm(),
      thirdPsalm: new Psalm(),
    },
    sixthValue: {
      hasMultipleAntiphons: true,
      uniqueAntiphon: '',
      firstPsalm: new Psalm(),
      secondPsalm: new Psalm(),
      thirdPsalm: new Psalm(),
    },
    ninthValue: {
      hasMultipleAntiphons: true,
      uniqueAntiphon: '',
      firstPsalm: new Psalm(),
      secondPsalm: new Psalm(),
      thirdPsalm: new Psalm(),
    },
  };

  // Antiphon
  if (StringManagement.hasLiturgyContent(celebrationHours.thirdHour.uniqueAntiphon)) {
    psalmody.thirdValue.hasMultipleAntiphons = celebrationHours.thirdHour.hasMultipleAntiphons;
    psalmody.thirdValue.uniqueAntiphon = celebrationHours.thirdHour.uniqueAntiphon;
    psalmody.sixthValue.hasMultipleAntiphons = celebrationHours.sixthHour.hasMultipleAntiphons;
    psalmody.sixthValue.uniqueAntiphon = celebrationHours.sixthHour.uniqueAntiphon;
    psalmody.ninthValue.hasMultipleAntiphons = celebrationHours.ninthHour.hasMultipleAntiphons;
    psalmody.ninthValue.uniqueAntiphon = celebrationHours.ninthHour.uniqueAntiphon;
  } else {
    if (StringManagement.hasLiturgyContent(celebrationHours.thirdHour.firstPsalm.antiphon)) {
      psalmody.thirdValue.hasMultipleAntiphons = false;
      psalmody.thirdValue.firstPsalm.antiphon = celebrationHours.thirdHour.firstPsalm.antiphon;
      psalmody.thirdValue.secondPsalm.antiphon = celebrationHours.thirdHour.secondPsalm.antiphon;
      psalmody.thirdValue.thirdPsalm.antiphon = celebrationHours.thirdHour.thirdPsalm.antiphon;
      psalmody.sixthValue.hasMultipleAntiphons = false;
      psalmody.sixthValue.firstPsalm.antiphon = celebrationHours.sixthHour.firstPsalm.antiphon;
      psalmody.sixthValue.secondPsalm.antiphon = celebrationHours.sixthHour.secondPsalm.antiphon;
      psalmody.sixthValue.thirdPsalm.antiphon = celebrationHours.sixthHour.thirdPsalm.antiphon;
      psalmody.ninthValue.hasMultipleAntiphons = false;
      psalmody.ninthValue.firstPsalm.antiphon = celebrationHours.ninthHour.firstPsalm.antiphon;
      psalmody.ninthValue.secondPsalm.antiphon = celebrationHours.ninthHour.secondPsalm.antiphon;
      psalmody.ninthValue.thirdPsalm.antiphon = celebrationHours.ninthHour.thirdPsalm.antiphon;
    } else {
      switch (liturgyDayInformation.specificLiturgyTime) {
        case SpecificLiturgyTimeType.LentAshes:
        case SpecificLiturgyTimeType.LentWeeks:
          psalmody.thirdValue.hasMultipleAntiphons = false;
          psalmody.sixthValue.hasMultipleAntiphons = false;
          psalmody.ninthValue.hasMultipleAntiphons = false;
          psalmody.thirdValue.uniqueAntiphon = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.thirdHourAntiphon;
          psalmody.sixthValue.uniqueAntiphon = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.sixthHourAntiphon;
          psalmody.ninthValue.uniqueAntiphon = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.ninthHourAntiphon;
          break;
        case SpecificLiturgyTimeType.PalmSunday:
        case SpecificLiturgyTimeType.HolyWeek:
          psalmody.thirdValue.hasMultipleAntiphons = false;
          psalmody.sixthValue.hasMultipleAntiphons = false;
          psalmody.ninthValue.hasMultipleAntiphons = false;
          psalmody.thirdValue.uniqueAntiphon = liturgyMasters.commonPartsOfHolyWeek.thirdHourAntiphon;
          psalmody.sixthValue.uniqueAntiphon = liturgyMasters.commonPartsOfHolyWeek.sixthHourAntiphon;
          psalmody.ninthValue.uniqueAntiphon = liturgyMasters.commonPartsOfHolyWeek.ninthHourAntiphon;
          break;
        case SpecificLiturgyTimeType.PaschalTriduum:
          psalmody.thirdValue.hasMultipleAntiphons = false;
          psalmody.sixthValue.hasMultipleAntiphons = false;
          psalmody.ninthValue.hasMultipleAntiphons = false;
          psalmody.thirdValue.uniqueAntiphon = liturgyMasters.partsOfEasterTriduum.thirdHourParts.antiphon;
          psalmody.sixthValue.uniqueAntiphon = liturgyMasters.partsOfEasterTriduum.sixthHourParts.antiphon;
          psalmody.ninthValue.uniqueAntiphon = liturgyMasters.partsOfEasterTriduum.ninthHourParts.antiphon;
          break;
        case SpecificLiturgyTimeType.EasterOctave:
          psalmody.thirdValue.hasMultipleAntiphons = false;
          psalmody.sixthValue.hasMultipleAntiphons = false;
          psalmody.ninthValue.hasMultipleAntiphons = false;
          psalmody.thirdValue.uniqueAntiphon = liturgyMasters.partsOfEasterOctave.thirdHourParts.antiphon;
          psalmody.sixthValue.uniqueAntiphon = liturgyMasters.partsOfEasterOctave.sixthHourParts.antiphon;
          psalmody.ninthValue.uniqueAntiphon = liturgyMasters.partsOfEasterOctave.ninthHourParts.antiphon;
          break;
        case SpecificLiturgyTimeType.EasterWeeks:
          psalmody.thirdValue.hasMultipleAntiphons = false;
          psalmody.sixthValue.hasMultipleAntiphons = false;
          psalmody.ninthValue.hasMultipleAntiphons = false;
          psalmody.thirdValue.uniqueAntiphon = 'Al·leluia, al·leluia, al·leluia.';
          psalmody.sixthValue.uniqueAntiphon = 'Al·leluia, al·leluia, al·leluia.';
          psalmody.ninthValue.uniqueAntiphon = 'Al·leluia, al·leluia, al·leluia.';
          break;
        case SpecificLiturgyTimeType.AdventWeeks:
        case SpecificLiturgyTimeType.ChristmasOctave:
        case SpecificLiturgyTimeType.AdventFairs:
        case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
          const beforeChristmasConditions =
            liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
            liturgyDayInformation.date.getMonth() == 0 &&
            liturgyDayInformation.date.getDate() != 13;
          const christmasOctaveConditions =
            liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave &&
            !CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation);
          if (
            (liturgyDayInformation.specificLiturgyTime !== SpecificLiturgyTimeType.ChristmasBeforeOrdinary ||
              beforeChristmasConditions) &&
            (liturgyDayInformation.specificLiturgyTime !== SpecificLiturgyTimeType.ChristmasOctave ||
              christmasOctaveConditions)
          ) {
            psalmody.thirdValue.hasMultipleAntiphons = false;
            psalmody.sixthValue.hasMultipleAntiphons = false;
            psalmody.ninthValue.hasMultipleAntiphons = false;
            psalmody.thirdValue.uniqueAntiphon = liturgyMasters.commonAdventAndChristmasParts.thirdHourAntiphon;
            psalmody.sixthValue.uniqueAntiphon = liturgyMasters.commonAdventAndChristmasParts.sixthHourAntiphon;
            psalmody.ninthValue.uniqueAntiphon = liturgyMasters.commonAdventAndChristmasParts.ninthHourAntiphon;
          }
          break;
      }
    }
  }

  // Psalms
  if (StringManagement.hasLiturgyContent(celebrationHours.thirdHour.firstPsalm.psalm)) {
    psalmody.thirdValue.firstPsalm = celebrationHours.thirdHour.firstPsalm;
    psalmody.thirdValue.secondPsalm = celebrationHours.thirdHour.secondPsalm;
    psalmody.thirdValue.thirdPsalm = celebrationHours.thirdHour.thirdPsalm;
    psalmody.sixthValue.firstPsalm = celebrationHours.sixthHour.firstPsalm;
    psalmody.sixthValue.secondPsalm = celebrationHours.sixthHour.secondPsalm;
    psalmody.sixthValue.thirdPsalm = celebrationHours.sixthHour.thirdPsalm;
    psalmody.ninthValue.firstPsalm = celebrationHours.ninthHour.firstPsalm;
    psalmody.ninthValue.secondPsalm = celebrationHours.ninthHour.secondPsalm;
    psalmody.ninthValue.thirdPsalm = celebrationHours.ninthHour.thirdPsalm;
  } else {
    psalmody.thirdValue.firstPsalm = liturgyMasters.commonHourPsalter.firstPsalm;
    psalmody.thirdValue.secondPsalm = liturgyMasters.commonHourPsalter.secondPsalm;
    psalmody.thirdValue.thirdPsalm = liturgyMasters.commonHourPsalter.thirdPsalm;
    psalmody.sixthValue.firstPsalm = liturgyMasters.commonHourPsalter.firstPsalm;
    psalmody.sixthValue.secondPsalm = liturgyMasters.commonHourPsalter.secondPsalm;
    psalmody.sixthValue.thirdPsalm = liturgyMasters.commonHourPsalter.thirdPsalm;
    psalmody.ninthValue.firstPsalm = liturgyMasters.commonHourPsalter.firstPsalm;
    psalmody.ninthValue.secondPsalm = liturgyMasters.commonHourPsalter.secondPsalm;
    psalmody.ninthValue.thirdPsalm = liturgyMasters.commonHourPsalter.thirdPsalm;
    switch (liturgyDayInformation.specificLiturgyTime) {
      case SpecificLiturgyTimeType.PaschalTriduum:
        psalmody.thirdValue.firstPsalm = liturgyMasters.partsOfEasterTriduum.hourPrayerFirstPsalm;
        psalmody.thirdValue.firstPsalm.comment = '-';
        psalmody.thirdValue.firstPsalm.hasGloryPrayer = true;
        psalmody.thirdValue.secondPsalm = liturgyMasters.partsOfEasterTriduum.hourPrayerSecondPsalm;
        psalmody.thirdValue.secondPsalm.comment = '-';
        psalmody.thirdValue.secondPsalm.hasGloryPrayer = true;
        psalmody.thirdValue.thirdPsalm = liturgyMasters.partsOfEasterTriduum.hourPrayerThirdPsalm;
        psalmody.thirdValue.thirdPsalm.comment = '-';
        psalmody.thirdValue.thirdPsalm.hasGloryPrayer = true;
        psalmody.sixthValue.firstPsalm = liturgyMasters.partsOfEasterTriduum.hourPrayerFirstPsalm;
        psalmody.sixthValue.firstPsalm.comment = '-';
        psalmody.sixthValue.firstPsalm.hasGloryPrayer = true;
        psalmody.sixthValue.secondPsalm = liturgyMasters.partsOfEasterTriduum.hourPrayerSecondPsalm;
        psalmody.sixthValue.secondPsalm.comment = '-';
        psalmody.sixthValue.secondPsalm.hasGloryPrayer = true;
        psalmody.sixthValue.thirdPsalm = liturgyMasters.partsOfEasterTriduum.hourPrayerThirdPsalm;
        psalmody.sixthValue.thirdPsalm.comment = '-';
        psalmody.sixthValue.thirdPsalm.hasGloryPrayer = true;
        psalmody.ninthValue.firstPsalm = liturgyMasters.partsOfEasterTriduum.hourPrayerFirstPsalm;
        psalmody.ninthValue.firstPsalm.comment = '-';
        psalmody.ninthValue.firstPsalm.hasGloryPrayer = true;
        psalmody.ninthValue.secondPsalm = liturgyMasters.partsOfEasterTriduum.hourPrayerSecondPsalm;
        psalmody.ninthValue.secondPsalm.comment = '-';
        psalmody.ninthValue.secondPsalm.hasGloryPrayer = true;
        psalmody.ninthValue.thirdPsalm = liturgyMasters.partsOfEasterTriduum.hourPrayerThirdPsalm;
        psalmody.ninthValue.thirdPsalm.comment = '-';
        psalmody.ninthValue.thirdPsalm.hasGloryPrayer = true;
        break;
      case SpecificLiturgyTimeType.EasterOctave:
        psalmody.thirdValue.firstPsalm = liturgyMasters.partsOfEasterOctave.hourPrayerFirstPsalm;
        psalmody.thirdValue.firstPsalm.comment = '-';
        psalmody.thirdValue.firstPsalm.hasGloryPrayer = true;
        psalmody.thirdValue.secondPsalm = liturgyMasters.partsOfEasterOctave.hourPrayerSecondPsalm;
        psalmody.thirdValue.secondPsalm.comment = '-';
        psalmody.thirdValue.secondPsalm.hasGloryPrayer = true;
        psalmody.thirdValue.thirdPsalm = liturgyMasters.partsOfEasterOctave.hourPrayerThirdPsalm;
        psalmody.thirdValue.thirdPsalm.comment = '-';
        psalmody.thirdValue.thirdPsalm.hasGloryPrayer = true;
        psalmody.sixthValue.firstPsalm = liturgyMasters.partsOfEasterOctave.hourPrayerFirstPsalm;
        psalmody.sixthValue.firstPsalm.comment = '-';
        psalmody.sixthValue.firstPsalm.hasGloryPrayer = true;
        psalmody.sixthValue.secondPsalm = liturgyMasters.partsOfEasterOctave.hourPrayerSecondPsalm;
        psalmody.sixthValue.secondPsalm.comment = '-';
        psalmody.sixthValue.secondPsalm.hasGloryPrayer = true;
        psalmody.sixthValue.thirdPsalm = liturgyMasters.partsOfEasterOctave.hourPrayerThirdPsalm;
        psalmody.sixthValue.thirdPsalm.comment = '-';
        psalmody.sixthValue.thirdPsalm.hasGloryPrayer = true;
        psalmody.ninthValue.firstPsalm = liturgyMasters.partsOfEasterOctave.hourPrayerFirstPsalm;
        psalmody.ninthValue.firstPsalm.comment = '-';
        psalmody.ninthValue.firstPsalm.hasGloryPrayer = true;
        psalmody.ninthValue.secondPsalm = liturgyMasters.partsOfEasterOctave.hourPrayerSecondPsalm;
        psalmody.ninthValue.secondPsalm.comment = '-';
        psalmody.ninthValue.secondPsalm.hasGloryPrayer = true;
        psalmody.ninthValue.thirdPsalm = liturgyMasters.partsOfEasterOctave.hourPrayerThirdPsalm;
        psalmody.ninthValue.thirdPsalm.comment = '-';
        psalmody.ninthValue.thirdPsalm.hasGloryPrayer = true;
        break;
    }
  }

  return psalmody;
}

function getResponsory(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationHours: Hours,
): { thirdValue: Responsory; sixthValue: Responsory; ninthValue: Responsory } {
  let hourAnthems = {
    thirdValue: new Responsory(),
    sixthValue: new Responsory(),
    ninthValue: new Responsory(),
  };

  if (StringManagement.hasLiturgyContent(celebrationHours.thirdHour.responsory.versicle)) {
    hourAnthems.thirdValue = celebrationHours.thirdHour.responsory;
    hourAnthems.sixthValue = celebrationHours.sixthHour.responsory;
    hourAnthems.ninthValue = celebrationHours.ninthHour.responsory;
  } else {
    hourAnthems.thirdValue = liturgyMasters.commonHourPsalter.thirdHourParts.responsory;
    hourAnthems.sixthValue = liturgyMasters.commonHourPsalter.sixthHourParts.responsory;
    hourAnthems.ninthValue = liturgyMasters.commonHourPsalter.ninthHourParts.responsory;
    switch (liturgyDayInformation.specificLiturgyTime) {
      case SpecificLiturgyTimeType.LentAshes:
        hourAnthems.thirdValue = liturgyMasters.partsOfLentTime.thirdHourParts.responsory;
        hourAnthems.sixthValue = liturgyMasters.partsOfLentTime.sixthHourParts.responsory;
        hourAnthems.ninthValue = liturgyMasters.partsOfLentTime.ninthHourParts.responsory;
        break;
      case SpecificLiturgyTimeType.LentWeeks:
        hourAnthems.thirdValue = liturgyMasters.partsOfFiveWeeksOfLentTime.thirdHourParts.responsory;
        hourAnthems.sixthValue = liturgyMasters.partsOfFiveWeeksOfLentTime.sixthHourParts.responsory;
        hourAnthems.ninthValue = liturgyMasters.partsOfFiveWeeksOfLentTime.ninthHourParts.responsory;
        break;
      case SpecificLiturgyTimeType.PalmSunday:
        hourAnthems.thirdValue = liturgyMasters.palmSundayParts.thirdHourParts.responsory;
        hourAnthems.sixthValue = liturgyMasters.palmSundayParts.sixthHourParts.responsory;
        hourAnthems.ninthValue = liturgyMasters.palmSundayParts.ninthHourParts.responsory;
        break;
      case SpecificLiturgyTimeType.HolyWeek:
        hourAnthems.thirdValue = liturgyMasters.partsOfHolyWeek.thirdHourParts.responsory;
        hourAnthems.sixthValue = liturgyMasters.partsOfHolyWeek.sixthHourParts.responsory;
        hourAnthems.ninthValue = liturgyMasters.partsOfHolyWeek.ninthHourParts.responsory;
        break;
      case SpecificLiturgyTimeType.PaschalTriduum:
        hourAnthems.thirdValue = liturgyMasters.partsOfEasterTriduum.thirdHourParts.responsory;
        hourAnthems.sixthValue = liturgyMasters.partsOfEasterTriduum.sixthHourParts.responsory;
        hourAnthems.ninthValue = liturgyMasters.partsOfEasterTriduum.ninthHourParts.responsory;
        break;
      case SpecificLiturgyTimeType.EasterOctave:
        hourAnthems.thirdValue.versicle = 'Avui és el dia en què ha obrat el Senyor, al·leluia.';
        hourAnthems.thirdValue.response = 'Alegrem-nos i celebrem-lo, al·leluia.';
        hourAnthems.sixthValue.versicle = 'Avui és el dia en què ha obrat el Senyor, al·leluia.';
        hourAnthems.sixthValue.response = 'Alegrem-nos i celebrem-lo, al·leluia.';
        hourAnthems.ninthValue.versicle = 'Avui és el dia en què ha obrat el Senyor, al·leluia.';
        hourAnthems.ninthValue.response = 'Alegrem-nos i celebrem-lo, al·leluia.';
        break;
      case SpecificLiturgyTimeType.EasterWeeks:
        hourAnthems.thirdValue = liturgyMasters.easterWeekParts.thirdHourParts.responsory;
        hourAnthems.sixthValue = liturgyMasters.easterWeekParts.sixthHourParts.responsory;
        hourAnthems.ninthValue = liturgyMasters.easterWeekParts.ninthHourParts.responsory;
        break;
      case SpecificLiturgyTimeType.AdventWeeks:
        hourAnthems.thirdValue = liturgyMasters.adventWeekParts.thirdHourParts.responsory;
        hourAnthems.sixthValue = liturgyMasters.adventWeekParts.sixthHourParts.responsory;
        hourAnthems.ninthValue = liturgyMasters.adventWeekParts.ninthHourParts.responsory;
        break;
      case SpecificLiturgyTimeType.AdventFairs:
        hourAnthems.thirdValue = liturgyMasters.adventFairDaysParts.thirdHourParts.responsory;
        hourAnthems.sixthValue = liturgyMasters.adventFairDaysParts.sixthHourParts.responsory;
        hourAnthems.ninthValue = liturgyMasters.adventFairDaysParts.ninthHourParts.responsory;
        break;
      case SpecificLiturgyTimeType.ChristmasOctave:
        if (!CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation)) {
          hourAnthems.thirdValue = liturgyMasters.christmasWhenOctaveParts.thirdHourParts.responsory;
          hourAnthems.sixthValue = liturgyMasters.christmasWhenOctaveParts.sixthHourParts.responsory;
          hourAnthems.ninthValue = liturgyMasters.christmasWhenOctaveParts.ninthHourParts.responsory;
        }
        break;
      case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
        if (
          liturgyDayInformation.specificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
          liturgyDayInformation.date.getMonth() == 0 &&
          liturgyDayInformation.date.getDate() != 13
        ) {
          hourAnthems.thirdValue = liturgyMasters.christmasBeforeEpiphanyParts.thirdHourParts.responsory;
          hourAnthems.sixthValue = liturgyMasters.christmasBeforeEpiphanyParts.sixthHourParts.responsory;
          hourAnthems.ninthValue = liturgyMasters.christmasBeforeEpiphanyParts.ninthHourParts.responsory;
        }
        break;
    }
  }
  return hourAnthems;
}

function getShortReading(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationHours: Hours,
): { thirdValue: ShortReading; sixthValue: ShortReading; ninthValue: ShortReading } {
  let hourShortReading = {
    thirdValue: new ShortReading(),
    sixthValue: new ShortReading(),
    ninthValue: new ShortReading(),
  };

  if (StringManagement.hasLiturgyContent(celebrationHours.thirdHour.shortReading.shortReading)) {
    hourShortReading.thirdValue = celebrationHours.thirdHour.shortReading;
    hourShortReading.sixthValue = celebrationHours.sixthHour.shortReading;
    hourShortReading.ninthValue = celebrationHours.ninthHour.shortReading;
  } else {
    hourShortReading.thirdValue = liturgyMasters.commonHourPsalter.thirdHourParts.shortReading;
    hourShortReading.sixthValue = liturgyMasters.commonHourPsalter.sixthHourParts.shortReading;
    hourShortReading.ninthValue = liturgyMasters.commonHourPsalter.ninthHourParts.shortReading;
    switch (liturgyDayInformation.specificLiturgyTime) {
      case SpecificLiturgyTimeType.LentAshes:
        hourShortReading.thirdValue = liturgyMasters.partsOfLentTime.thirdHourParts.shortReading;
        hourShortReading.sixthValue = liturgyMasters.partsOfLentTime.sixthHourParts.shortReading;
        hourShortReading.ninthValue = liturgyMasters.partsOfLentTime.ninthHourParts.shortReading;
        break;
      case SpecificLiturgyTimeType.LentWeeks:
        hourShortReading.thirdValue = liturgyMasters.partsOfFiveWeeksOfLentTime.thirdHourParts.shortReading;
        hourShortReading.sixthValue = liturgyMasters.partsOfFiveWeeksOfLentTime.sixthHourParts.shortReading;
        hourShortReading.ninthValue = liturgyMasters.partsOfFiveWeeksOfLentTime.ninthHourParts.shortReading;
        break;
      case SpecificLiturgyTimeType.PalmSunday:
        hourShortReading.thirdValue = liturgyMasters.palmSundayParts.thirdHourParts.shortReading;
        hourShortReading.sixthValue = liturgyMasters.palmSundayParts.sixthHourParts.shortReading;
        hourShortReading.ninthValue = liturgyMasters.palmSundayParts.ninthHourParts.shortReading;
        break;
      case SpecificLiturgyTimeType.HolyWeek:
        hourShortReading.thirdValue = liturgyMasters.partsOfHolyWeek.thirdHourParts.shortReading;
        hourShortReading.sixthValue = liturgyMasters.partsOfHolyWeek.sixthHourParts.shortReading;
        hourShortReading.ninthValue = liturgyMasters.partsOfHolyWeek.ninthHourParts.shortReading;
        break;
      case SpecificLiturgyTimeType.PaschalTriduum:
        hourShortReading.thirdValue = liturgyMasters.partsOfEasterTriduum.thirdHourParts.shortReading;
        hourShortReading.sixthValue = liturgyMasters.partsOfEasterTriduum.sixthHourParts.shortReading;
        hourShortReading.ninthValue = liturgyMasters.partsOfEasterTriduum.ninthHourParts.shortReading;
        break;
      case SpecificLiturgyTimeType.EasterOctave:
        hourShortReading.thirdValue = liturgyMasters.partsOfEasterOctave.thirdHourParts.shortReading;
        hourShortReading.sixthValue = liturgyMasters.partsOfEasterOctave.sixthHourParts.shortReading;
        hourShortReading.ninthValue = liturgyMasters.partsOfEasterOctave.ninthHourParts.shortReading;
        break;
      case SpecificLiturgyTimeType.EasterWeeks:
        hourShortReading.thirdValue = liturgyMasters.easterWeekParts.thirdHourParts.shortReading;
        hourShortReading.sixthValue = liturgyMasters.easterWeekParts.sixthHourParts.shortReading;
        hourShortReading.ninthValue = liturgyMasters.easterWeekParts.ninthHourParts.shortReading;
        break;
      case SpecificLiturgyTimeType.AdventWeeks:
        hourShortReading.thirdValue = liturgyMasters.adventWeekParts.thirdHourParts.shortReading;
        hourShortReading.sixthValue = liturgyMasters.adventWeekParts.sixthHourParts.shortReading;
        hourShortReading.ninthValue = liturgyMasters.adventWeekParts.ninthHourParts.shortReading;
        break;
      case SpecificLiturgyTimeType.AdventFairs:
        hourShortReading.thirdValue = liturgyMasters.adventFairDaysParts.thirdHourParts.shortReading;
        hourShortReading.sixthValue = liturgyMasters.adventFairDaysParts.sixthHourParts.shortReading;
        hourShortReading.ninthValue = liturgyMasters.adventFairDaysParts.ninthHourParts.shortReading;
        break;
      case SpecificLiturgyTimeType.ChristmasOctave:
        if (!CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation)) {
          hourShortReading.thirdValue = liturgyMasters.christmasWhenOctaveParts.thirdHourParts.shortReading;
          hourShortReading.sixthValue = liturgyMasters.christmasWhenOctaveParts.sixthHourParts.shortReading;
          hourShortReading.ninthValue = liturgyMasters.christmasWhenOctaveParts.ninthHourParts.shortReading;
        }
        break;
      case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
        if (
          liturgyDayInformation.specificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
          liturgyDayInformation.date.getMonth() == 0 &&
          liturgyDayInformation.date.getDate() != 13
        ) {
          hourShortReading.thirdValue = liturgyMasters.christmasBeforeEpiphanyParts.thirdHourParts.shortReading;
          hourShortReading.sixthValue = liturgyMasters.christmasBeforeEpiphanyParts.sixthHourParts.shortReading;
          hourShortReading.ninthValue = liturgyMasters.christmasBeforeEpiphanyParts.ninthHourParts.shortReading;
        }
        break;
    }
  }
  return hourShortReading;
}

function getFinalPraying(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationHours: Hours,
): { thirdValue: string; sixthValue: string; ninthValue: string } {
  let finalPraying = {
    thirdValue: '',
    sixthValue: '',
    ninthValue: '',
  };

  if (StringManagement.hasLiturgyContent(celebrationHours.thirdHour.finalPrayer)) {
    finalPraying.thirdValue = celebrationHours.thirdHour.finalPrayer;
    finalPraying.sixthValue = celebrationHours.sixthHour.finalPrayer;
    finalPraying.ninthValue = celebrationHours.ninthHour.finalPrayer;
  } else {
    switch (liturgyDayInformation.specificLiturgyTime) {
      case SpecificLiturgyTimeType.LentAshes:
        finalPraying.thirdValue = liturgyMasters.partsOfLentTime.laudesFinalPrayer;
        finalPraying.sixthValue = liturgyMasters.partsOfLentTime.laudesFinalPrayer;
        finalPraying.ninthValue = liturgyMasters.partsOfLentTime.laudesFinalPrayer;
        break;
      case SpecificLiturgyTimeType.LentWeeks:
        finalPraying.thirdValue = liturgyMasters.partsOfFiveWeeksOfLentTime.laudesFinalPrayer;
        finalPraying.sixthValue = liturgyMasters.partsOfFiveWeeksOfLentTime.laudesFinalPrayer;
        finalPraying.ninthValue = liturgyMasters.partsOfFiveWeeksOfLentTime.laudesFinalPrayer;
        break;
      case SpecificLiturgyTimeType.PalmSunday:
        finalPraying.thirdValue = liturgyMasters.palmSundayParts.laudesFinalPrayer;
        finalPraying.sixthValue = liturgyMasters.palmSundayParts.laudesFinalPrayer;
        finalPraying.ninthValue = liturgyMasters.palmSundayParts.laudesFinalPrayer;
        break;
      case SpecificLiturgyTimeType.HolyWeek:
        finalPraying.thirdValue = liturgyMasters.partsOfHolyWeek.laudesFinalPrayer;
        finalPraying.sixthValue = liturgyMasters.partsOfHolyWeek.laudesFinalPrayer;
        finalPraying.ninthValue = liturgyMasters.partsOfHolyWeek.laudesFinalPrayer;
        break;
      case SpecificLiturgyTimeType.PaschalTriduum:
        finalPraying.thirdValue = liturgyMasters.partsOfEasterTriduum.thirdHourParts.finalPrayer;
        finalPraying.sixthValue = liturgyMasters.partsOfEasterTriduum.sixthHourParts.finalPrayer;
        finalPraying.ninthValue = liturgyMasters.partsOfEasterTriduum.ninthHourParts.finalPrayer;
        break;
      case SpecificLiturgyTimeType.EasterOctave:
        finalPraying.thirdValue = liturgyMasters.partsOfEasterOctave.thirdHourParts.finalPrayer;
        finalPraying.sixthValue = liturgyMasters.partsOfEasterOctave.sixthHourParts.finalPrayer;
        finalPraying.ninthValue = liturgyMasters.partsOfEasterOctave.ninthHourParts.finalPrayer;
        break;
      case SpecificLiturgyTimeType.EasterWeeks:
        finalPraying.thirdValue = liturgyMasters.easterWeekParts.laudesFinalPrayer;
        finalPraying.sixthValue = liturgyMasters.easterWeekParts.laudesFinalPrayer;
        finalPraying.ninthValue = liturgyMasters.easterWeekParts.laudesFinalPrayer;
        break;
      case SpecificLiturgyTimeType.AdventWeeks:
        finalPraying.thirdValue = liturgyMasters.adventWeekParts.laudesFinalPrayer;
        finalPraying.sixthValue = liturgyMasters.adventWeekParts.laudesFinalPrayer;
        finalPraying.ninthValue = liturgyMasters.adventWeekParts.laudesFinalPrayer;
        break;
      case SpecificLiturgyTimeType.AdventFairs:
        finalPraying.thirdValue = liturgyMasters.adventFairDaysParts.laudesFinalPrayer;
        finalPraying.sixthValue = liturgyMasters.adventFairDaysParts.laudesFinalPrayer;
        finalPraying.ninthValue = liturgyMasters.adventFairDaysParts.laudesFinalPrayer;
        break;
      case SpecificLiturgyTimeType.ChristmasOctave:
        if (!CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation)) {
          finalPraying.thirdValue = liturgyMasters.christmasWhenOctaveParts.laudesFinalPrayer;
          finalPraying.sixthValue = liturgyMasters.christmasWhenOctaveParts.laudesFinalPrayer;
          finalPraying.ninthValue = liturgyMasters.christmasWhenOctaveParts.laudesFinalPrayer;
        }
        break;
      case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
        if (
          liturgyDayInformation.specificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
          liturgyDayInformation.date.getMonth() == 0 &&
          liturgyDayInformation.date.getDate() != 13
        ) {
          finalPraying.thirdValue = liturgyMasters.christmasBeforeEpiphanyParts.laudesFinalPrayer;
          finalPraying.sixthValue = liturgyMasters.christmasBeforeEpiphanyParts.laudesFinalPrayer;
          finalPraying.ninthValue = liturgyMasters.christmasBeforeEpiphanyParts.laudesFinalPrayer;
        }
        break;
    }

    if (!StringManagement.hasLiturgyContent(finalPraying.thirdValue) && liturgyDayInformation.dayOfTheWeek === 0) {
      finalPraying.thirdValue = liturgyMasters.prayersOfOrdinaryTime.finalPrayer;
      finalPraying.sixthValue = liturgyMasters.prayersOfOrdinaryTime.finalPrayer;
      finalPraying.ninthValue = liturgyMasters.prayersOfOrdinaryTime.finalPrayer;
    } else if (!StringManagement.hasLiturgyContent(finalPraying.thirdValue)) {
      finalPraying.thirdValue = liturgyMasters.commonHourPsalter.thirdHourParts.finalPrayer;
      finalPraying.sixthValue = liturgyMasters.commonHourPsalter.sixthHourParts.finalPrayer;
      finalPraying.ninthValue = liturgyMasters.commonHourPsalter.ninthHourParts.finalPrayer;
    }
  }
  return finalPraying;
}
