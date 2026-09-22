import Vespers from '../../models/hours-liturgy/Vespers';
import LiturgyMasters from '../../models/liturgy-masters/LiturgyMasters';
import { LiturgySpecificDayInformation } from '../../models/LiturgyDayInformation';
import { Settings } from '../../models/Settings';
import { Psalm, ShortReading, ShortResponsory } from '../../models/liturgy-masters/CommonParts';
import { YearType } from '../databaseEnums';
import { SpecificLiturgyTimeType } from '../celebrationTimeEnums';
import { StringManagement } from '../../utils/StringManagement';
import * as CelebrationIdentifier from '../celebrationIdentifierService';
import { Celebration } from '../celebrationIdentifierService';

export function obtainVespers(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  let vespers = new Vespers();
  vespers.anthem = getAnthem(liturgyMasters, liturgyDayInformation, settings);
  const psalmody = getPsalmody(liturgyMasters, liturgyDayInformation);
  vespers.firstPsalm = psalmody.firstPsalm;
  vespers.secondPsalm = psalmody.secondPsalm;
  vespers.thirdPsalm = psalmody.thirdPsalm;
  vespers.shortReading = getShortReading(liturgyMasters, liturgyDayInformation);
  vespers.shortResponsory = getShortResponsory(liturgyMasters, liturgyDayInformation);
  vespers.evangelicalAntiphon = getEvangelicalAntiphon(liturgyMasters, liturgyDayInformation);
  vespers.prayers = getPrayers(liturgyMasters, liturgyDayInformation);
  vespers.finalPrayer = getFinalPrayer(liturgyMasters, liturgyDayInformation);
  vespers.evangelicalChant = liturgyMasters.various.vespersEvangelicalChant;
  vespers.title =
    liturgyDayInformation.dayOfTheWeek === 6 &&
    liturgyDayInformation.specificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum
      ? 'Primeres vespres de diumenge'
      : '';
  return vespers;
}

export function mergeVespersWithCelebration(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
  withoutCelebrationVespers: Vespers,
  withCelebrationVespers: Vespers,
): Vespers {
  let vespers = withoutCelebrationVespers;
  if (liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
    vespers = withCelebrationVespers;
  } else {
    let weUsedSomeCelebrationPart = false;
    if (StringManagement.hasLiturgyContent(withCelebrationVespers.anthem)) {
      weUsedSomeCelebrationPart = true;
      vespers.anthem = withCelebrationVespers.anthem;
    }
    if (StringManagement.hasLiturgyContent(withCelebrationVespers.firstPsalm.antiphon)) {
      weUsedSomeCelebrationPart = true;
      vespers.firstPsalm.antiphon = withCelebrationVespers.firstPsalm.antiphon;
    }
    if (StringManagement.hasLiturgyContent(withCelebrationVespers.firstPsalm.title)) {
      weUsedSomeCelebrationPart = true;
      vespers.firstPsalm = withCelebrationVespers.firstPsalm;
    }
    if (StringManagement.hasLiturgyContent(withCelebrationVespers.secondPsalm.antiphon)) {
      weUsedSomeCelebrationPart = true;
      vespers.secondPsalm.antiphon = withCelebrationVespers.secondPsalm.antiphon;
    }
    if (StringManagement.hasLiturgyContent(withCelebrationVespers.secondPsalm.title)) {
      weUsedSomeCelebrationPart = true;
      vespers.secondPsalm = withCelebrationVespers.secondPsalm;
    }
    if (StringManagement.hasLiturgyContent(withCelebrationVespers.thirdPsalm.antiphon)) {
      weUsedSomeCelebrationPart = true;
      vespers.thirdPsalm.antiphon = withCelebrationVespers.thirdPsalm.antiphon;
    }
    if (StringManagement.hasLiturgyContent(withCelebrationVespers.thirdPsalm.title)) {
      weUsedSomeCelebrationPart = true;
      vespers.thirdPsalm = withCelebrationVespers.thirdPsalm;
    }
    if (StringManagement.hasLiturgyContent(withCelebrationVespers.shortReading.shortReading)) {
      weUsedSomeCelebrationPart = true;
      vespers.shortReading = withCelebrationVespers.shortReading;
    }
    if (
      StringManagement.hasLiturgyContent(withCelebrationVespers.shortResponsory.firstPart) ||
      StringManagement.hasLiturgyContent(withCelebrationVespers.shortResponsory.specialAntiphon)
    ) {
      weUsedSomeCelebrationPart = true;
      vespers.shortResponsory = withCelebrationVespers.shortResponsory;
    }
    if (StringManagement.hasLiturgyContent(withCelebrationVespers.evangelicalAntiphon)) {
      weUsedSomeCelebrationPart = true;
      vespers.evangelicalAntiphon = withCelebrationVespers.evangelicalAntiphon;
    }
    if (StringManagement.hasLiturgyContent(withCelebrationVespers.prayers)) {
      weUsedSomeCelebrationPart = true;
      vespers.prayers = withCelebrationVespers.prayers;
    }
    if (StringManagement.hasLiturgyContent(withCelebrationVespers.finalPrayer)) {
      weUsedSomeCelebrationPart = true;
      vespers.finalPrayer = withCelebrationVespers.finalPrayer;
    }

    if (weUsedSomeCelebrationPart) {
      vespers.title = withCelebrationVespers.title;
    }
  }
  return vespers;
}

function getAnthem(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): string {
  let anthem = settings.useLatin
    ? liturgyMasters.vespersCommonPsalter.latinAnthem
    : liturgyMasters.vespersCommonPsalter.catalanAnthem;
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.LentAshes:
    case SpecificLiturgyTimeType.LentWeeks:
      if (liturgyDayInformation.dayOfTheWeek === 0 || liturgyDayInformation.dayOfTheWeek === 6) {
        if (settings.useLatin) {
          anthem = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.vespersSundaysLatinAnthem;
        } else {
          anthem = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.vespersSundaysCatalanAnthem;
        }
      } else {
        if (settings.useLatin) {
          anthem = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.vespersFairsLatinAnthem;
        } else {
          anthem = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.vespersFairsCatalanAnthem;
        }
      }
      break;
    case SpecificLiturgyTimeType.PalmSunday:
    case SpecificLiturgyTimeType.HolyWeek:
      if (settings.useLatin) {
        anthem = liturgyMasters.commonPartsOfHolyWeek.vespersLatinAnthem;
      } else {
        anthem = liturgyMasters.commonPartsOfHolyWeek.vespersCatalanAnthem;
      }
      break;
    case SpecificLiturgyTimeType.PaschalTriduum:
      if (settings.useLatin) {
        anthem = liturgyMasters.partsOfEasterTriduum.vespersLatinAnthem;
      } else {
        anthem = liturgyMasters.partsOfEasterTriduum.vespersCatalanAnthem;
      }
      break;
    case SpecificLiturgyTimeType.EasterOctave:
      if (settings.useLatin) {
        anthem = liturgyMasters.partsOfEasterBeforeAscension.vespersWeekendLatinAnthem;
      } else {
        anthem = liturgyMasters.partsOfEasterBeforeAscension.vespersWeekendCatalanAnthem;
      }
      break;
    case SpecificLiturgyTimeType.EasterWeeks:
      if (liturgyDayInformation.week === '7') {
        if (settings.useLatin) {
          anthem = liturgyMasters.partsOfEasterAfterAscension.vespersLatinAnthem;
        } else {
          anthem = liturgyMasters.partsOfEasterAfterAscension.vespersCatalanAnthem;
        }
      } else {
        if (liturgyDayInformation.dayOfTheWeek === 6 || liturgyDayInformation.dayOfTheWeek === 0) {
          if (settings.useLatin) {
            anthem = liturgyMasters.partsOfEasterBeforeAscension.vespersWeekendLatinAnthem;
          } else {
            anthem = liturgyMasters.partsOfEasterBeforeAscension.vespersWeekendCatalanAnthem;
          }
        } else {
          if (settings.useLatin) {
            anthem = liturgyMasters.partsOfEasterBeforeAscension.vespersWorkdaysLatinAnthem;
          } else {
            anthem = liturgyMasters.partsOfEasterBeforeAscension.vespersWorkdaysCatalanAnthem;
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
          anthem = liturgyMasters.commonAdventAndChristmasParts.vespersLatinAnthem;
        } else {
          anthem = liturgyMasters.commonAdventAndChristmasParts.vespersCatalanAnthem;
        }
      }
      break;
    case SpecificLiturgyTimeType.ChristmasOctave:
      if (settings.useLatin) {
        anthem = liturgyMasters.solemnityAndFestivityParts.secondVespersLatinAnthem;
      } else {
        anthem = liturgyMasters.solemnityAndFestivityParts.secondVespersCatalanAnthem;
      }
      break;
  }
  return anthem;
}

function getPsalmody(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
): { firstPsalm: Psalm; secondPsalm: Psalm; thirdPsalm: Psalm } {
  let psalmody = {
    firstPsalm: liturgyMasters.vespersCommonPsalter.firstPsalm,
    secondPsalm: liturgyMasters.vespersCommonPsalter.secondPsalm,
    thirdPsalm: liturgyMasters.vespersCommonPsalter.thirdPsalm,
  };
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.AdventFairs:
      if (liturgyDayInformation.dayOfTheWeek !== 0) {
        psalmody.firstPsalm.antiphon = liturgyMasters.adventFairDaysAntiphons.firstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.adventFairDaysAntiphons.secondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.adventFairDaysAntiphons.thirdAntiphon;
      }
      break;
    case SpecificLiturgyTimeType.LentWeeks:
    case SpecificLiturgyTimeType.LentAshes:
      if (liturgyDayInformation.dayOfTheWeek === 6) {
        psalmody.firstPsalm.antiphon =
          liturgyMasters.fiveWeeksOfFirstsVespersOfSundayLentParts.firstVespersFirstAntiphon;
        psalmody.secondPsalm.antiphon =
          liturgyMasters.fiveWeeksOfFirstsVespersOfSundayLentParts.firstVespersSecondAntiphon;
        psalmody.thirdPsalm.antiphon =
          liturgyMasters.fiveWeeksOfFirstsVespersOfSundayLentParts.firstVespersThirdAntiphon;
      } else if (liturgyDayInformation.dayOfTheWeek === 0) {
        psalmody.firstPsalm.antiphon = liturgyMasters.fiveWeeksOfSundayLentParts.secondVespersFirstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.fiveWeeksOfSundayLentParts.secondVespersSecondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.fiveWeeksOfSundayLentParts.secondVespersThirdAntiphon;
      }
      break;
    case SpecificLiturgyTimeType.PalmSunday:
      if (liturgyDayInformation.dayOfTheWeek === 0) {
        psalmody.firstPsalm.antiphon = liturgyMasters.palmSundayParts.secondVespersFirstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.palmSundayParts.secondVespersSecondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.palmSundayParts.secondVespersThirdAntiphon;
      }
      break;
    case SpecificLiturgyTimeType.HolyWeek:
      psalmody.firstPsalm.antiphon = liturgyMasters.partsOfHolyWeek.vespersFirstAntiphon;
      psalmody.secondPsalm.antiphon = liturgyMasters.partsOfHolyWeek.vespersSecondAntiphon;
      psalmody.thirdPsalm.antiphon = liturgyMasters.partsOfHolyWeek.vespersThirdAntiphon;
      break;
    case SpecificLiturgyTimeType.PaschalTriduum:
      psalmody.firstPsalm = liturgyMasters.partsOfEasterTriduum.vespersFirstPsalm;
      psalmody.firstPsalm.comment = '-';
      psalmody.secondPsalm = liturgyMasters.partsOfEasterTriduum.vespersSecondPsalm;
      psalmody.secondPsalm.comment = '-';
      psalmody.thirdPsalm = liturgyMasters.partsOfEasterTriduum.vespersThirdPsalm;
      psalmody.thirdPsalm.comment = '-';
      break;
    case SpecificLiturgyTimeType.EasterOctave:
      psalmody.firstPsalm = liturgyMasters.easterSunday.vespersFirstPsalm;
      psalmody.firstPsalm.comment = '-';
      psalmody.secondPsalm = liturgyMasters.easterSunday.vespersSecondPsalm;
      psalmody.secondPsalm.comment = '-';
      psalmody.thirdPsalm = liturgyMasters.easterSunday.vespersThirdPsalm;
      psalmody.thirdPsalm.comment = '-';
      break;
    case SpecificLiturgyTimeType.EasterWeeks:
      if (
        liturgyDayInformation.dayOfTheWeek === 6 &&
        StringManagement.hasLiturgyContent(liturgyMasters.easterFirstVespersOfSundayParts.firstVespersFirstAntiphon)
      ) {
        psalmody.firstPsalm.antiphon = liturgyMasters.easterFirstVespersOfSundayParts.firstVespersFirstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.easterFirstVespersOfSundayParts.firstVespersSecondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.easterFirstVespersOfSundayParts.firstVespersThirdAntiphon;
      } else if (liturgyDayInformation.dayOfTheWeek === 0) {
        psalmody.firstPsalm.antiphon = liturgyMasters.easterSundayParts.secondVespersFirstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.easterSundayParts.secondVespersSecondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.easterSundayParts.secondVespersThirdAntiphon;
      } else {
        psalmody.firstPsalm.antiphon = liturgyMasters.commonSpecialPartsOfEaster.vespersFirstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.commonSpecialPartsOfEaster.vespersSecondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.commonSpecialPartsOfEaster.vespersThirdAntiphon;
      }
      break;
    case SpecificLiturgyTimeType.AdventWeeks:
      if (
        liturgyDayInformation.dayOfTheWeek === 6 &&
        StringManagement.hasLiturgyContent(liturgyMasters.adventFirstVespersOfSundayParts.firstVespersFirstAntiphon)
      ) {
        psalmody.firstPsalm.antiphon = liturgyMasters.adventFirstVespersOfSundayParts.firstVespersFirstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.adventFirstVespersOfSundayParts.firstVespersSecondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.adventFirstVespersOfSundayParts.firstVespersThirdAntiphon;
      } else if (liturgyDayInformation.dayOfTheWeek === 0) {
        psalmody.firstPsalm.antiphon = liturgyMasters.adventSundayParts.secondVespersFirstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.adventSundayParts.secondVespersSecondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.adventSundayParts.secondVespersThirdAntiphon;
      }
      break;
    case SpecificLiturgyTimeType.ChristmasOctave:
      psalmody.firstPsalm = liturgyMasters.solemnityAndFestivityParts.secondVespersFirstPsalm;
      psalmody.firstPsalm.comment = '-';
      psalmody.firstPsalm.hasGloryPrayer = true;
      psalmody.secondPsalm = liturgyMasters.solemnityAndFestivityParts.secondVespersSecondPsalm;
      psalmody.secondPsalm.comment = '-';
      psalmody.secondPsalm.hasGloryPrayer = true;
      psalmody.thirdPsalm = liturgyMasters.solemnityAndFestivityParts.secondVespersThirdPsalm;
      psalmody.thirdPsalm.comment = '-';
      psalmody.thirdPsalm.hasGloryPrayer = true;
      break;
  }

  if (
    liturgyDayInformation.dayOfTheWeek === 0 &&
    (liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.HolyWeek ||
      liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks ||
      liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday)
  ) {
    psalmody.thirdPsalm.title = 'Càntic 1Pe 2, 21-24\nLa passió voluntària del Crist, el servent de Déu';
    psalmody.thirdPsalm.comment = '-';
    psalmody.thirdPsalm.psalm = liturgyMasters.various.specialVesperChant;
    psalmody.thirdPsalm.hasGloryPrayer = true;
  }
  return psalmody;
}

function getShortReading(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
): ShortReading {
  let shortReading = liturgyMasters.vespersCommonPsalter.shortReading;
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.LentAshes:
      return liturgyMasters.partsOfLentTime.vespersShortReading;
    case SpecificLiturgyTimeType.LentWeeks:
      return liturgyMasters.partsOfFiveWeeksOfLentTime.vespersShortReading;
    case SpecificLiturgyTimeType.PalmSunday:
      return liturgyMasters.palmSundayParts.secondVespersShortReading;
    case SpecificLiturgyTimeType.HolyWeek:
      return liturgyMasters.partsOfHolyWeek.vespersShortReading;
    case SpecificLiturgyTimeType.PaschalTriduum:
      return liturgyMasters.partsOfEasterTriduum.vespersShortReading;
    case SpecificLiturgyTimeType.EasterOctave:
      return liturgyMasters.partsOfEasterOctave.vespersShortReading;
    case SpecificLiturgyTimeType.EasterWeeks:
      return liturgyMasters.easterWeekParts.vespersShortReading;
    case SpecificLiturgyTimeType.AdventWeeks:
      return liturgyMasters.adventWeekParts.vespersShortReading;
    case SpecificLiturgyTimeType.AdventFairs:
      return liturgyMasters.adventFairDaysParts.vespersShortReading;
    case SpecificLiturgyTimeType.ChristmasOctave:
      if (!CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation)) {
        return liturgyMasters.christmasWhenOctaveParts.vespersShortReading;
      }
      break;
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (
        liturgyDayInformation.specificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
        liturgyDayInformation.date.getMonth() == 0 &&
        liturgyDayInformation.date.getDate() != 13
      ) {
        return liturgyMasters.christmasBeforeEpiphanyParts.vespersShortReading;
      }
      break;
  }
  return shortReading;
}

function getShortResponsory(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
): ShortResponsory {
  let shortResponsory = liturgyMasters.vespersCommonPsalter.shortResponsory;
  shortResponsory.hasSpecialAntiphon = false;
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.LentAshes:
      return liturgyMasters.partsOfLentTime.vespersShortResponsory;
    case SpecificLiturgyTimeType.LentWeeks:
      return liturgyMasters.partsOfFiveWeeksOfLentTime.vespersShortResponsory;
    case SpecificLiturgyTimeType.PalmSunday:
      return liturgyMasters.palmSundayParts.secondVespresShortResponsory;
    case SpecificLiturgyTimeType.HolyWeek:
      return liturgyMasters.partsOfHolyWeek.vespersShortResponsory;
    case SpecificLiturgyTimeType.EasterWeeks:
      return liturgyMasters.easterWeekParts.vespersShortResponsory;
    case SpecificLiturgyTimeType.AdventWeeks:
      return liturgyMasters.adventWeekParts.vespersShortResponsory;
    case SpecificLiturgyTimeType.AdventFairs:
      return liturgyMasters.adventFairDaysParts.vespersShortResponsory;
    case SpecificLiturgyTimeType.ChristmasOctave:
      if (!CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation)) {
        return liturgyMasters.christmasWhenOctaveParts.vespersShortResponsory;
      }
      break;
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (
        liturgyDayInformation.specificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
        liturgyDayInformation.date.getMonth() == 0 &&
        liturgyDayInformation.date.getDate() != 13
      ) {
        return liturgyMasters.christmasBeforeEpiphanyParts.vespersShortResponsory;
      }
      break;
    case SpecificLiturgyTimeType.PaschalTriduum:
      return liturgyMasters.partsOfEasterTriduum.vespersShortResponsory;
    case SpecificLiturgyTimeType.EasterOctave:
      return liturgyMasters.partsOfEasterOctave.vespersShortResponsory;
  }
  return shortResponsory;
}

function getEvangelicalAntiphon(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
): string {
  let evangelicalAntiphon;
  if (liturgyDayInformation.dayOfTheWeek !== 0 && liturgyDayInformation.dayOfTheWeek !== 6) {
    evangelicalAntiphon = liturgyMasters.vespersCommonPsalter.evangelicalAntiphon;
  } else {
    if (
      liturgyDayInformation.dayOfTheWeek === 6 &&
      StringManagement.hasLiturgyContent(
        liturgyMasters.prayersOfOrdinaryTimeWhenFirstVespers.firstVespersEvangelicalAntiphonYearA,
      )
    ) {
      switch (liturgyDayInformation.yearType) {
        case YearType.A:
          evangelicalAntiphon =
            liturgyMasters.prayersOfOrdinaryTimeWhenFirstVespers.firstVespersEvangelicalAntiphonYearA;
          break;
        case YearType.B:
          evangelicalAntiphon =
            liturgyMasters.prayersOfOrdinaryTimeWhenFirstVespers.firstVespersEvangelicalAntiphonYearB;
          break;
        case YearType.C:
          evangelicalAntiphon =
            liturgyMasters.prayersOfOrdinaryTimeWhenFirstVespers.firstVespersEvangelicalAntiphonYearC;
          break;
      }
    } else {
      switch (liturgyDayInformation.yearType) {
        case YearType.A:
          evangelicalAntiphon = liturgyMasters.prayersOfOrdinaryTime.secondVespersEvangelicalAntiphonYearA;
          break;
        case YearType.B:
          evangelicalAntiphon = liturgyMasters.prayersOfOrdinaryTime.secondVespersEvangelicalAntiphonYearB;
          break;
        case YearType.C:
          evangelicalAntiphon = liturgyMasters.prayersOfOrdinaryTime.secondVespersEvangelicalAntiphonYearC;
          break;
      }
    }
  }
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.LentAshes:
      switch (liturgyDayInformation.yearType) {
        case YearType.A:
          evangelicalAntiphon = liturgyMasters.partsOfLentTime.vespersEvangelicalAntiphonYearA;
          break;
        case YearType.B:
          evangelicalAntiphon = liturgyMasters.partsOfLentTime.vespersEvangelicalAntiphonYearB;
          break;
        case YearType.C:
          evangelicalAntiphon = liturgyMasters.partsOfLentTime.vespersEvangelicalAntiphonYearC;
          break;
      }
      if (evangelicalAntiphon === '-') {
        evangelicalAntiphon = liturgyMasters.partsOfLentTime.vespersEvangelicalAntiphon;
      }
      break;
    case SpecificLiturgyTimeType.LentWeeks:
      if (liturgyDayInformation.dayOfTheWeek !== 0 && liturgyDayInformation.dayOfTheWeek !== 6) {
        evangelicalAntiphon = liturgyMasters.partsOfFiveWeeksOfLentTime.vespersEvangelicalAntiphon;
      } else {
        if (
          liturgyDayInformation.dayOfTheWeek === 6 &&
          StringManagement.hasLiturgyContent(
            liturgyMasters.fiveWeeksOfFirstsVespersOfSundayLentParts.firstVespersEvangelicalAntiphonYearA,
          )
        ) {
          switch (liturgyDayInformation.yearType) {
            case YearType.A:
              evangelicalAntiphon =
                liturgyMasters.fiveWeeksOfFirstsVespersOfSundayLentParts.firstVespersEvangelicalAntiphonYearA;
              break;
            case YearType.B:
              evangelicalAntiphon =
                liturgyMasters.fiveWeeksOfFirstsVespersOfSundayLentParts.firstVespersEvangelicalAntiphonYearB;
              break;
            case YearType.C:
              evangelicalAntiphon =
                liturgyMasters.fiveWeeksOfFirstsVespersOfSundayLentParts.firstVespersEvangelicalAntiphonYearC;
              break;
          }
        } else {
          switch (liturgyDayInformation.yearType) {
            case YearType.A:
              evangelicalAntiphon = liturgyMasters.fiveWeeksOfSundayLentParts.secondVespersEvangelicalAntiphonYearA;
              break;
            case YearType.B:
              evangelicalAntiphon = liturgyMasters.fiveWeeksOfSundayLentParts.secondVespersEvangelicalAntiphonYearB;
              break;
            case YearType.C:
              evangelicalAntiphon = liturgyMasters.fiveWeeksOfSundayLentParts.secondVespersEvangelicalAntiphonYearC;
              break;
          }
        }
      }
      break;
    case SpecificLiturgyTimeType.PalmSunday:
      switch (liturgyDayInformation.yearType) {
        case YearType.A:
          evangelicalAntiphon = liturgyMasters.palmSundayParts.secondVespersEvangelicalAntiphonYearA;
          break;
        case YearType.B:
          evangelicalAntiphon = liturgyMasters.palmSundayParts.secondVespersEvangelicalAntiphonYearB;
          break;
        case YearType.C:
          evangelicalAntiphon = liturgyMasters.palmSundayParts.secondVespersEvangelicalAntiphonYearC;
          break;
      }
      break;
    case SpecificLiturgyTimeType.HolyWeek:
      evangelicalAntiphon = liturgyMasters.partsOfHolyWeek.vespersEvangelicalAntiphon;
      break;
    case SpecificLiturgyTimeType.PaschalTriduum:
      evangelicalAntiphon = liturgyMasters.partsOfEasterTriduum.vespersEvangelicalAntiphon;
      break;
    case SpecificLiturgyTimeType.EasterOctave:
      evangelicalAntiphon = liturgyMasters.partsOfEasterOctave.vespersEvangelicalAntiphon;
      break;
    case SpecificLiturgyTimeType.EasterWeeks:
      if (liturgyDayInformation.dayOfTheWeek !== 6 && liturgyDayInformation.dayOfTheWeek !== 0) {
        evangelicalAntiphon = liturgyMasters.easterWeekParts.vespersEvangelicalAntiphon;
      } else {
        if (
          liturgyDayInformation.dayOfTheWeek === 6 &&
          StringManagement.hasLiturgyContent(
            liturgyMasters.easterFirstVespersOfSundayParts.firstVespersEvangelicalAntiphonYearA,
          )
        ) {
          switch (liturgyDayInformation.yearType) {
            case YearType.A:
              evangelicalAntiphon = liturgyMasters.easterFirstVespersOfSundayParts.firstVespersEvangelicalAntiphonYearA;
              break;
            case YearType.B:
              evangelicalAntiphon = liturgyMasters.easterFirstVespersOfSundayParts.firstVespersEvangelicalAntiphonYearB;
              break;
            case YearType.C:
              evangelicalAntiphon = liturgyMasters.easterFirstVespersOfSundayParts.firstVespersEvangelicalAntiphonYearC;
              break;
          }
        } else {
          switch (liturgyDayInformation.yearType) {
            case YearType.A:
              evangelicalAntiphon = liturgyMasters.easterSundayParts.secondVespersEvangelicalAntiphonYearA;
              break;
            case YearType.B:
              evangelicalAntiphon = liturgyMasters.easterSundayParts.secondVespersEvangelicalAntiphonYearB;
              break;
            case YearType.C:
              evangelicalAntiphon = liturgyMasters.easterSundayParts.secondVespersEvangelicalAntiphonYearC;
              break;
          }
        }
      }
      break;
    case SpecificLiturgyTimeType.AdventWeeks:
      if (liturgyDayInformation.dayOfTheWeek !== 6 && liturgyDayInformation.dayOfTheWeek !== 0) {
        evangelicalAntiphon = liturgyMasters.adventWeekParts.vespersEvangelicalAntiphon;
      } else {
        if (
          liturgyDayInformation.dayOfTheWeek === 6 &&
          StringManagement.hasLiturgyContent(
            liturgyMasters.adventFirstVespersOfSundayParts.firstVespersEvangelicalAntiphonYearA,
          )
        ) {
          switch (liturgyDayInformation.yearType) {
            case YearType.A:
              evangelicalAntiphon = liturgyMasters.adventFirstVespersOfSundayParts.firstVespersEvangelicalAntiphonYearA;
              break;
            case YearType.B:
              evangelicalAntiphon = liturgyMasters.adventFirstVespersOfSundayParts.firstVespersEvangelicalAntiphonYearB;
              break;
            case YearType.C:
              evangelicalAntiphon = liturgyMasters.adventFirstVespersOfSundayParts.firstVespersEvangelicalAntiphonYearC;
              break;
          }
        } else {
          switch (liturgyDayInformation.yearType) {
            case YearType.A:
              evangelicalAntiphon = liturgyMasters.adventSundayParts.secondVespersEvangelicalAntiphonYearA;
              break;
            case YearType.B:
              evangelicalAntiphon = liturgyMasters.adventSundayParts.secondVespersEvangelicalAntiphonYearB;
              break;
            case YearType.C:
              evangelicalAntiphon = liturgyMasters.adventSundayParts.secondVespersEvangelicalAntiphonYearC;
              break;
          }
        }
      }
      break;
    case SpecificLiturgyTimeType.AdventFairs:
      evangelicalAntiphon = liturgyMasters.adventFairDaysParts.vespersEvangelicalAntiphon;
      break;
    case SpecificLiturgyTimeType.ChristmasOctave:
      if (!CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation)) {
        evangelicalAntiphon = liturgyMasters.christmasWhenOctaveParts.vespersEvangelicalAntiphon;
      }
      break;
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (
        liturgyDayInformation.specificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
        liturgyDayInformation.date.getMonth() == 0 &&
        liturgyDayInformation.date.getDate() != 13
      ) {
        evangelicalAntiphon = liturgyMasters.christmasBeforeEpiphanyParts.vespersEvangelicalAntiphon;
      }
      break;
  }
  return evangelicalAntiphon;
}

function getPrayers(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgySpecificDayInformation): string {
  let prayers = liturgyMasters.vespersCommonPsalter.prayers;
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.LentAshes:
      return liturgyMasters.partsOfLentTime.vespersPrayers;
    case SpecificLiturgyTimeType.LentWeeks:
      return liturgyMasters.partsOfFiveWeeksOfLentTime.vespersPrayers;
    case SpecificLiturgyTimeType.PalmSunday:
      return liturgyMasters.palmSundayParts.secondVespersPrayers;
    case SpecificLiturgyTimeType.HolyWeek:
      return liturgyMasters.partsOfHolyWeek.vespersPrayers;
    case SpecificLiturgyTimeType.PaschalTriduum:
      return liturgyMasters.partsOfEasterTriduum.vespersPrayers;
    case SpecificLiturgyTimeType.EasterOctave:
      return liturgyMasters.partsOfEasterOctave.vespersPrayers;
    case SpecificLiturgyTimeType.EasterWeeks:
      return liturgyMasters.easterWeekParts.vespersPrayers;
    case SpecificLiturgyTimeType.AdventWeeks:
      return liturgyMasters.adventWeekParts.vespersPrayers;
    case SpecificLiturgyTimeType.AdventFairs:
      return liturgyMasters.adventFairDaysParts.vespersPrayers;
    case SpecificLiturgyTimeType.ChristmasOctave:
      if (!CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation)) {
        return liturgyMasters.christmasWhenOctaveParts.vespersPrayers;
      }
      break;
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (
        liturgyDayInformation.specificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
        liturgyDayInformation.date.getMonth() == 0 &&
        liturgyDayInformation.date.getDate() != 13
      ) {
        return liturgyMasters.christmasBeforeEpiphanyParts.vespersPrayers;
      }
      break;
  }
  return prayers;
}

function getFinalPrayer(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgySpecificDayInformation): string {
  let finalPrayer = liturgyMasters.vespersCommonPsalter.finalPrayer;
  if (liturgyDayInformation.dayOfTheWeek === 0) {
    finalPrayer = liturgyMasters.prayersOfOrdinaryTime.finalPrayer;
  } else if (
    liturgyDayInformation.dayOfTheWeek === 6 &&
    StringManagement.hasLiturgyContent(liturgyMasters.prayersOfOrdinaryTimeWhenFirstVespers.finalPrayer)
  ) {
    finalPrayer = liturgyMasters.prayersOfOrdinaryTimeWhenFirstVespers.finalPrayer;
  }
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.LentAshes:
      return liturgyMasters.partsOfLentTime.vespersFinalPrayer;
    case SpecificLiturgyTimeType.LentWeeks:
      return liturgyMasters.partsOfFiveWeeksOfLentTime.vespersFinalPrayer;
    case SpecificLiturgyTimeType.PalmSunday:
      return liturgyMasters.palmSundayParts.secondVespersFinalPrayer;
    case SpecificLiturgyTimeType.HolyWeek:
      return liturgyMasters.partsOfHolyWeek.vespersFinalPrayer;
    case SpecificLiturgyTimeType.PaschalTriduum:
      return liturgyMasters.partsOfEasterTriduum.vespersFinalPrayer;
    case SpecificLiturgyTimeType.EasterOctave:
      return liturgyMasters.partsOfEasterOctave.vespersFinalPrayer;
    case SpecificLiturgyTimeType.EasterWeeks:
      return liturgyMasters.easterWeekParts.vespersFinalPrayer;
    case SpecificLiturgyTimeType.AdventWeeks:
      return liturgyMasters.adventWeekParts.vespersFinalPrayer;
    case SpecificLiturgyTimeType.AdventFairs:
      return liturgyMasters.adventFairDaysParts.vespersFinalPrayer;
    case SpecificLiturgyTimeType.ChristmasOctave:
      if (!CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation)) {
        return liturgyMasters.christmasWhenOctaveParts.vespersFinalPrayer;
      }
      break;
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (
        liturgyDayInformation.specificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
        liturgyDayInformation.date.getMonth() == 0 &&
        liturgyDayInformation.date.getDate() != 13
      ) {
        return liturgyMasters.christmasBeforeEpiphanyParts.vespersFinalPrayer;
      }
      break;
  }
  return finalPrayer;
}
