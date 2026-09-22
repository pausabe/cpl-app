import Office, { TeDeumInformation } from '../../models/hours-liturgy/Office';
import LiturgyMasters from '../../models/liturgy-masters/LiturgyMasters';
import { LiturgySpecificDayInformation, SpecialCelebrationTypeEnum } from '../../models/LiturgyDayInformation';
import { Settings } from '../../models/Settings';
import OfficeCommonPsalter from '../../models/liturgy-masters/OfficeCommonPsalter';
import { Psalm, ReadingOfTheOffice, Responsory } from '../../models/liturgy-masters/CommonParts';
import { GenericLiturgyTimeType, SpecificLiturgyTimeType } from '../celebrationTimeEnums';
import { StringManagement } from '../../utils/StringManagement';
import * as CelebrationIdentifier from '../celebrationIdentifierService';
import { Celebration } from '../celebrationIdentifierService';

export function obtainOffice(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationOffice: Office,
  settings: Settings,
): Office {
  let office = new Office();

  let currentOfficeCommonPsalter = liturgyMasters.officeCommonPsalter;
  if (liturgyDayInformation.specialCelebration.specialCelebrationType === SpecialCelebrationTypeEnum.StrongTime) {
    currentOfficeCommonPsalter = Object.assign(
      Object.create(Object.getPrototypeOf(liturgyMasters.officeCommonPsalter)),
      liturgyMasters.officeCommonPsalter,
    ) as OfficeCommonPsalter;
    currentOfficeCommonPsalter.adaptWithStrongTimes(liturgyMasters.commonOfficeWhenStrongTimesPsalter);
  }

  if (liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
    office = celebrationOffice;
  } else {
    office.isDarkAnthem = isDarkAnthem();
    office.anthem = getAnthem(
      office.isDarkAnthem,
      currentOfficeCommonPsalter,
      liturgyMasters,
      liturgyDayInformation,
      celebrationOffice,
      settings,
    );
    const psalmody = getPsalmody(currentOfficeCommonPsalter, liturgyMasters, liturgyDayInformation, celebrationOffice);
    office.firstPsalm = psalmody.firstPsalm;
    office.secondPsalm = psalmody.secondPsalm;
    office.thirdPsalm = psalmody.thirdPsalm;
    office.responsory = getResponsory(
      currentOfficeCommonPsalter,
      liturgyMasters,
      liturgyDayInformation,
      celebrationOffice,
    );
    const readings = getReadings(currentOfficeCommonPsalter, liturgyMasters, liturgyDayInformation, celebrationOffice);
    office.firstReading = readings.firstReading;
    office.secondReading = readings.secondReading;
    office.teDeumInformation = getTeDeumInformation(
      currentOfficeCommonPsalter,
      liturgyMasters,
      liturgyDayInformation,
      celebrationOffice,
      settings,
    );
    office.finalPrayer = getFinalPrayer(
      currentOfficeCommonPsalter,
      liturgyMasters,
      liturgyDayInformation,
      celebrationOffice,
    );
  }
  return office;
}

function isDarkAnthem() {
  const nowDate = new Date();
  const hour = nowDate.getHours();
  return hour < 6;
}

function getAnthem(
  isDarkAnthem: boolean,
  currentOfficeCommonPsalter: OfficeCommonPsalter,
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationOffice: Office,
  settings: Settings,
): string {
  if (StringManagement.hasLiturgyContent(celebrationOffice.anthem)) {
    return celebrationOffice.anthem;
  }

  let anthem;
  if (isDarkAnthem) {
    if (settings.useLatin) {
      anthem = liturgyMasters.officeCommonPsalter.nightLatinAnthem;
    } else {
      anthem = liturgyMasters.officeCommonPsalter.nightCatalanAnthem;
    }
  } else {
    if (settings.useLatin) {
      anthem = liturgyMasters.officeCommonPsalter.dayLatinAnthem;
    } else {
      anthem = liturgyMasters.officeCommonPsalter.dayCatalanAnthem;
    }
  }
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.LentAshes:
    case SpecificLiturgyTimeType.LentWeeks:
      if (liturgyDayInformation.dayOfTheWeek === 0) {
        if (settings.useLatin) {
          anthem = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.officeSundaysLatinAnthem;
        } else {
          anthem = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.officeSundaysCatalanAnthem;
        }
      } else {
        if (settings.useLatin) {
          anthem = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.officeFairsLatinAnthem;
        } else {
          anthem = liturgyMasters.commonPartsUntilFifthWeekOfLentTime.officeFairsCatalanAnthem;
        }
      }
      break;
    case SpecificLiturgyTimeType.PalmSunday:
    case SpecificLiturgyTimeType.HolyWeek:
      if (settings.useLatin) {
        anthem = liturgyMasters.commonPartsOfHolyWeek.officeLatinAnthem;
      } else {
        anthem = liturgyMasters.commonPartsOfHolyWeek.officeCatalanAnthem;
      }
      break;
    case SpecificLiturgyTimeType.PaschalTriduum:
      if (settings.useLatin) {
        anthem = liturgyMasters.partsOfEasterTriduum.officeLatinAnthem;
      } else {
        anthem = liturgyMasters.partsOfEasterTriduum.officeCatalanAnthem;
      }
      break;
    case SpecificLiturgyTimeType.EasterOctave:
      if (settings.useLatin) {
        anthem = liturgyMasters.partsOfEasterBeforeAscension.officeWeekendLatinAnthem;
      } else {
        anthem = liturgyMasters.partsOfEasterBeforeAscension.officeWeekendCatalanAnthem;
      }
      break;
    case SpecificLiturgyTimeType.EasterWeeks:
      if (liturgyDayInformation.week === '7') {
        if (settings.useLatin) {
          anthem = liturgyMasters.partsOfEasterAfterAscension.officeLatinAnthem;
        } else {
          anthem = liturgyMasters.partsOfEasterAfterAscension.officeCatalanAnthem;
        }
      } else {
        if (liturgyDayInformation.dayOfTheWeek === 6 || liturgyDayInformation.dayOfTheWeek === 0) {
          if (settings.useLatin) {
            anthem = liturgyMasters.partsOfEasterBeforeAscension.officeWeekendLatinAnthem;
          } else {
            anthem = liturgyMasters.partsOfEasterBeforeAscension.officeWeekendCatalanAnthem;
          }
        } else {
          if (settings.useLatin) {
            anthem = liturgyMasters.partsOfEasterBeforeAscension.officeWorkdaysLatinAnthem;
          } else {
            anthem = liturgyMasters.partsOfEasterBeforeAscension.officeWorkdaysCatalanAnthem;
          }
        }
      }
      break;
    case SpecificLiturgyTimeType.AdventWeeks:
    case SpecificLiturgyTimeType.AdventFairs:
    case SpecificLiturgyTimeType.ChristmasOctave:
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (
        liturgyDayInformation.specificLiturgyTime != SpecificLiturgyTimeType.ChristmasBeforeOrdinary ||
        (liturgyDayInformation.specificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
          liturgyDayInformation.date.getMonth() == 0 &&
          liturgyDayInformation.date.getDate() != 13)
      ) {
        if (settings.useLatin) {
          anthem = liturgyMasters.commonAdventAndChristmasParts.officeLatinAnthem;
        } else {
          anthem = liturgyMasters.commonAdventAndChristmasParts.officeCatalanAnthem;
        }
      }
      break;
  }
  return anthem;
}

function getPsalmody(
  currentOfficeCommonPsalter: OfficeCommonPsalter,
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationOffice: Office,
): { firstPsalm: Psalm; secondPsalm: Psalm; thirdPsalm: Psalm } {
  let psalmody = {
    firstPsalm: currentOfficeCommonPsalter.firstPsalm,
    secondPsalm: currentOfficeCommonPsalter.secondPsalm,
    thirdPsalm: currentOfficeCommonPsalter.thirdPsalm,
  };

  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.PaschalTriduum:
      psalmody.firstPsalm = liturgyMasters.partsOfEasterTriduum.officeFirstPsalm;
      psalmody.firstPsalm.comment = '-';
      psalmody.secondPsalm = liturgyMasters.partsOfEasterTriduum.officeSecondPsalm;
      psalmody.secondPsalm.comment = '-';
      psalmody.thirdPsalm = liturgyMasters.partsOfEasterTriduum.officeThirdPsalm;
      psalmody.thirdPsalm.comment = '-';
      break;
    case SpecificLiturgyTimeType.EasterOctave:
      psalmody.firstPsalm = liturgyMasters.partsOfEasterOctave.officeFirstPsalm;
      psalmody.firstPsalm.comment = '-';
      psalmody.secondPsalm = liturgyMasters.partsOfEasterOctave.officeSecondPsalm;
      psalmody.secondPsalm.comment = '-';
      psalmody.thirdPsalm = liturgyMasters.partsOfEasterOctave.officeThirdPsalm;
      psalmody.thirdPsalm.comment = '-';
      break;
    case SpecificLiturgyTimeType.EasterWeeks:
      if (liturgyDayInformation.dayOfTheWeek === 0) {
        if (liturgyDayInformation.week === '7') {
          psalmody.firstPsalm.antiphon =
            liturgyMasters.specialCommonPartsOfEasterSundays.officeFirstAntiphonSundayWeekVII;
          psalmody.secondPsalm.antiphon =
            liturgyMasters.specialCommonPartsOfEasterSundays.officeSecondAntiphonSundayWeekVII;
          psalmody.thirdPsalm.antiphon =
            liturgyMasters.specialCommonPartsOfEasterSundays.officeThirdAntiphonSundayWeekVII;
        } else {
          psalmody.firstPsalm.antiphon =
            liturgyMasters.specialCommonPartsOfEasterSundays.officeFirstAntiphonSundayNotWeekVII;
          psalmody.secondPsalm.antiphon =
            liturgyMasters.specialCommonPartsOfEasterSundays.officeSecondAntiphonSundayNotWeekVII;
          psalmody.thirdPsalm.antiphon =
            liturgyMasters.specialCommonPartsOfEasterSundays.officeThirdAntiphonSundayNotWeekVII;
        }
      } else {
        if (
          !(liturgyDayInformation.weekCycle === '3' && liturgyDayInformation.dayOfTheWeek === 4) &&
          !(liturgyDayInformation.weekCycle === '4' && liturgyDayInformation.dayOfTheWeek === 2) &&
          !(liturgyDayInformation.weekCycle === '2' && liturgyDayInformation.dayOfTheWeek === 1) &&
          !(liturgyDayInformation.weekCycle === '2' && liturgyDayInformation.dayOfTheWeek === 3) &&
          !(liturgyDayInformation.weekCycle === '2' && liturgyDayInformation.dayOfTheWeek === 5)
        ) {
          psalmody.firstPsalm.antiphon += ' Al·leluia.';
        }
        if (
          !(liturgyDayInformation.weekCycle === '2' && liturgyDayInformation.dayOfTheWeek === 3) &&
          !(liturgyDayInformation.weekCycle === '2' && liturgyDayInformation.dayOfTheWeek === 4) &&
          !(liturgyDayInformation.weekCycle === '2' && liturgyDayInformation.dayOfTheWeek === 6) &&
          !(liturgyDayInformation.weekCycle === '3' && liturgyDayInformation.dayOfTheWeek === 5) &&
          !(liturgyDayInformation.weekCycle === '4' && liturgyDayInformation.dayOfTheWeek === 1) &&
          !(liturgyDayInformation.weekCycle === '4' && liturgyDayInformation.dayOfTheWeek === 2)
        ) {
          psalmody.secondPsalm.antiphon += ' Al·leluia.';
        }
        if (!(liturgyDayInformation.weekCycle === '4' && liturgyDayInformation.dayOfTheWeek === 4)) {
          psalmody.thirdPsalm.antiphon += ' Al·leluia.';
        }
      }
      break;
    case SpecificLiturgyTimeType.AdventWeeks:
    case SpecificLiturgyTimeType.AdventFairs:
      if (liturgyDayInformation.dayOfTheWeek == 0) {
        psalmody.firstPsalm.antiphon = liturgyMasters.adventSundayParts.officeFirstAntiphon;
        psalmody.secondPsalm.antiphon = liturgyMasters.adventSundayParts.officeSecondAntiphon;
        psalmody.thirdPsalm.antiphon = liturgyMasters.adventSundayParts.officeThirdAntiphon;
      }
      break;
    case SpecificLiturgyTimeType.ChristmasOctave:
      if (!CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation)) {
        psalmody.firstPsalm = liturgyMasters.christmasWhenOctaveParts.officeFirstPsalm;
        psalmody.firstPsalm.comment = '-';
        psalmody.secondPsalm = liturgyMasters.christmasWhenOctaveParts.officeSecondPsalm;
        psalmody.secondPsalm.comment = '-';
        psalmody.thirdPsalm = liturgyMasters.christmasWhenOctaveParts.officeThirdPsalm;
        psalmody.thirdPsalm.comment = '-';
      }
      break;
  }

  if (StringManagement.hasLiturgyContent(celebrationOffice.firstPsalm.antiphon)) {
    psalmody.firstPsalm.antiphon = celebrationOffice.firstPsalm.antiphon;
  }
  if (StringManagement.hasLiturgyContent(celebrationOffice.firstPsalm.title)) {
    psalmody.firstPsalm = celebrationOffice.firstPsalm;
  }
  if (StringManagement.hasLiturgyContent(celebrationOffice.secondPsalm.antiphon)) {
    psalmody.secondPsalm.antiphon = celebrationOffice.secondPsalm.antiphon;
  }
  if (StringManagement.hasLiturgyContent(celebrationOffice.secondPsalm.title)) {
    psalmody.secondPsalm = celebrationOffice.secondPsalm;
  }
  if (StringManagement.hasLiturgyContent(celebrationOffice.thirdPsalm.antiphon)) {
    psalmody.thirdPsalm.antiphon = celebrationOffice.thirdPsalm.antiphon;
  }
  if (StringManagement.hasLiturgyContent(celebrationOffice.thirdPsalm.title)) {
    psalmody.thirdPsalm = celebrationOffice.thirdPsalm;
  }

  if (
    liturgyDayInformation.dayOfTheWeek === 0 &&
    (liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks ||
      liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.LentAshes ||
      liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ||
      liturgyDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.HolyWeek)
  ) {
    if (psalmody.firstPsalm.antiphon.search(', al·leluia') !== -1) {
      psalmody.firstPsalm.antiphon = psalmody.firstPsalm.antiphon.replace(', al·leluia', '');
    }
    if (psalmody.secondPsalm.antiphon.search(', al·leluia') !== -1) {
      psalmody.secondPsalm.antiphon = psalmody.secondPsalm.antiphon.replace(', al·leluia', '');
    }
    if (psalmody.thirdPsalm.antiphon.search(', al·leluia') !== -1) {
      psalmody.thirdPsalm.antiphon = psalmody.thirdPsalm.antiphon.replace(', al·leluia', '');
    }
  }
  return psalmody;
}

function getResponsory(
  currentOfficeCommonPsalter: OfficeCommonPsalter,
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationOffice: Office,
): Responsory {
  if (StringManagement.hasLiturgyContent(celebrationOffice.responsory.response)) {
    return celebrationOffice.responsory;
  }

  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.LentAshes:
      return liturgyMasters.partsOfLentTime.officeResponsory;
    case SpecificLiturgyTimeType.LentWeeks:
      return liturgyMasters.partsOfFiveWeeksOfLentTime.officeResponsory;
    case SpecificLiturgyTimeType.PalmSunday:
      return liturgyMasters.palmSundayParts.officeResponsory;
    case SpecificLiturgyTimeType.HolyWeek:
      return liturgyMasters.partsOfHolyWeek.officeResponsory;
    case SpecificLiturgyTimeType.PaschalTriduum:
      return liturgyMasters.partsOfEasterTriduum.officeResponsory;
    case SpecificLiturgyTimeType.EasterOctave:
      return liturgyMasters.partsOfEasterOctave.officeResponsory;
    case SpecificLiturgyTimeType.EasterWeeks:
      return liturgyMasters.easterWeekParts.officeResponsory;
    case SpecificLiturgyTimeType.AdventWeeks:
      return liturgyMasters.adventWeekParts.officeResponsory;
    case SpecificLiturgyTimeType.AdventFairs:
      return liturgyMasters.adventFairDaysParts.officeResponsory;
    case SpecificLiturgyTimeType.ChristmasOctave:
      return liturgyMasters.christmasWhenOctaveParts.officeResponsory;
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (liturgyDayInformation.date.getMonth() == 0 && liturgyDayInformation.date.getDate() != 13) {
        return liturgyMasters.christmasBeforeEpiphanyParts.officeResponsory;
      }
      break;
  }
  return currentOfficeCommonPsalter.responsory;
}

function getReadings(
  currentOfficeCommonPsalter: OfficeCommonPsalter,
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationOffice: Office,
): { firstReading: ReadingOfTheOffice; secondReading: ReadingOfTheOffice } {
  let readings = {
    firstReading: liturgyMasters.officeOfOrdinaryTime.officeFirstReading,
    secondReading: liturgyMasters.officeOfOrdinaryTime.officeSecondReading,
  };
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.LentAshes:
      readings.firstReading = liturgyMasters.partsOfLentTime.officeFirstReading;
      readings.secondReading = liturgyMasters.partsOfLentTime.officeSecondReading;
      break;
    case SpecificLiturgyTimeType.LentWeeks:
      readings.firstReading = liturgyMasters.partsOfFiveWeeksOfLentTime.officeFirstReading;
      readings.secondReading = liturgyMasters.partsOfFiveWeeksOfLentTime.officeSecondReading;
      break;
    case SpecificLiturgyTimeType.PalmSunday:
      readings.firstReading = liturgyMasters.palmSundayParts.officeFirstReading;
      readings.secondReading = liturgyMasters.palmSundayParts.officeSecondReading;
      break;
    case SpecificLiturgyTimeType.HolyWeek:
      readings.firstReading = liturgyMasters.partsOfHolyWeek.officeFirstReading;
      readings.secondReading = liturgyMasters.partsOfHolyWeek.officeSecondReading;
      break;
    case SpecificLiturgyTimeType.PaschalTriduum:
      readings.firstReading = liturgyMasters.partsOfEasterTriduum.officeFirstReading;
      readings.secondReading = liturgyMasters.partsOfEasterTriduum.officeSecondReading;
      break;
    case SpecificLiturgyTimeType.EasterOctave:
      readings.firstReading = liturgyMasters.partsOfEasterOctave.officeFirstReading;
      readings.secondReading = liturgyMasters.partsOfEasterOctave.officeSecondReading;
      break;
    case SpecificLiturgyTimeType.EasterWeeks:
      readings.firstReading = liturgyMasters.easterWeekParts.officeFirstReading;
      readings.secondReading = liturgyMasters.easterWeekParts.officeSecondReading;
      break;
    case SpecificLiturgyTimeType.AdventWeeks:
      readings.firstReading = liturgyMasters.adventWeekParts.officeFirstReading;
      readings.secondReading = liturgyMasters.adventWeekParts.officeSecondReading;
      break;
    case SpecificLiturgyTimeType.AdventFairs:
      readings.firstReading = liturgyMasters.adventFairDaysParts.officeFirstReading;
      readings.secondReading = liturgyMasters.adventFairDaysParts.officeSecondReading;
      break;
    case SpecificLiturgyTimeType.ChristmasOctave:
      if (!CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation)) {
        readings.firstReading = liturgyMasters.christmasWhenOctaveParts.officeFirstReading;
        readings.secondReading = liturgyMasters.christmasWhenOctaveParts.officeSecondReading;
      }
      break;
    case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
      if (liturgyDayInformation.date.getMonth() == 0 && liturgyDayInformation.date.getDate() != 13) {
        readings.firstReading = liturgyMasters.christmasBeforeEpiphanyParts.officeFirstReading;
        readings.secondReading = liturgyMasters.christmasBeforeEpiphanyParts.officeSecondReading;
      }
      break;
  }
  if (StringManagement.hasLiturgyContent(celebrationOffice.firstReading.reading)) {
    readings.firstReading = celebrationOffice.firstReading;
  }
  if (StringManagement.hasLiturgyContent(celebrationOffice.secondReading.reading)) {
    readings.secondReading = celebrationOffice.secondReading;
  }
  return readings;
}

function getTeDeumInformation(
  currentOfficeCommonPsalter: OfficeCommonPsalter,
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationOffice: Office,
  settings: Settings,
): TeDeumInformation {
  let teDeumInformationEnabled =
    liturgyDayInformation.dayOfTheWeek === 0 &&
    liturgyDayInformation.genericLiturgyTime !== GenericLiturgyTimeType.Lent;
  switch (liturgyDayInformation.specificLiturgyTime) {
    case SpecificLiturgyTimeType.EasterOctave:
    case SpecificLiturgyTimeType.ChristmasOctave:
      teDeumInformationEnabled = true;
      break;
  }

  let teDeumInformation = new TeDeumInformation();
  teDeumInformation.enabled = teDeumInformationEnabled || celebrationOffice.teDeumInformation.enabled;
  teDeumInformation.anthem = settings.useLatin
    ? liturgyMasters.various.teDeumLatinAnthem
    : liturgyMasters.various.teDeumCatalanAnthem;
  return teDeumInformation;
}

function getFinalPrayer(
  currentOfficeCommonPsalter: OfficeCommonPsalter,
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationOffice: Office,
): string {
  if (StringManagement.hasLiturgyContent(celebrationOffice.finalPrayer)) {
    return celebrationOffice.finalPrayer;
  }

  let finalPrayer = liturgyMasters.prayersOfOrdinaryTime.finalPrayer;
  switch (liturgyDayInformation.specificLiturgyTime) {
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
