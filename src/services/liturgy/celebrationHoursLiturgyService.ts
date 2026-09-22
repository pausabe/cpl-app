import HoursLiturgy from '../../models/hours-liturgy/HoursLiturgy';
import LiturgyMasters from '../../models/liturgy-masters/LiturgyMasters';
import LiturgyDayInformation, {
  LiturgySpecificDayInformation,
  SpecialCelebrationTypeEnum,
} from '../../models/LiturgyDayInformation';
import { Settings } from '../../models/Settings';
import { CelebrationType, YearType } from '../databaseEnums';
import Vespers from '../../models/hours-liturgy/Vespers';
import { SpecificLiturgyTimeType } from '../celebrationTimeEnums';
import SaintsSolemnities from '../../models/liturgy-masters/SaintsSolemnities';
import SaintsMemories from '../../models/liturgy-masters/SaintsMemories';
import SpecialDaysParts from '../../models/liturgy-masters/SpecialDaysParts';
import EasterSunday from '../../models/liturgy-masters/EasterSunday';
import SolemnityAndFestivityParts from '../../models/liturgy-masters/SolemnityAndFestivityParts';
import { StringManagement } from '../../utils/StringManagement';
import PalmSundayParts from '../../models/liturgy-masters/PalmSundayParts';
import CommonPartsOfHolyWeek from '../../models/liturgy-masters/CommonPartsOfHolyWeek';
import PartsOfEasterTriduum from '../../models/liturgy-masters/PartsOfEasterTriduum';
import CommonAdventAndChristmasParts from '../../models/liturgy-masters/CommonAdventAndChristmasParts';
import AdventWeekParts from '../../models/liturgy-masters/AdventWeekParts';
import AdventSundayParts from '../../models/liturgy-masters/AdventSundayParts';

export function obtainCelebrationHoursLiturgy(
  todayLiturgyMasters: LiturgyMasters,
  tomorrowLiturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgyDayInformation,
  settings: Settings,
): HoursLiturgy {
  let hoursLiturgy: HoursLiturgy = buildHoursLiturgy(todayLiturgyMasters, liturgyDayInformation.today, settings);
  hoursLiturgy.tomorrowCelebrationInformation = buildHoursLiturgy(
    tomorrowLiturgyMasters,
    liturgyDayInformation.tomorrow,
    settings,
  ).todayCelebrationInformation;
  hoursLiturgy.vespersOptions.tomorrowFirstVespersWithCelebration = getFirstVespersWithCelebration(
    todayLiturgyMasters,
    liturgyDayInformation.tomorrow,
    settings,
  );
  return hoursLiturgy;
}

function buildHoursLiturgy(
  liturgyMasters: LiturgyMasters,
  liturgySpecificDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
) {
  let hoursLiturgy: HoursLiturgy;

  if (
    liturgySpecificDayInformation.specialCelebration.specialCelebrationType === SpecialCelebrationTypeEnum.SpecialDay
  ) {
    hoursLiturgy = getSpecialDayHoursLiturgy(liturgyMasters.specialDaysParts, settings);
  } else if (
    liturgySpecificDayInformation.specialCelebration.specialCelebrationType ===
    SpecialCelebrationTypeEnum.SolemnityAndFestivity
  ) {
    hoursLiturgy = getSolemnityAndFestivityHoursLiturgy(
      liturgyMasters.solemnityAndFestivityParts,
      liturgySpecificDayInformation,
      settings,
    );
  } else if (liturgySpecificDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
    hoursLiturgy = getEasterSundayHoursLiturgy(liturgyMasters.easterSunday, settings);
    hoursLiturgy.office.teDeumInformation.anthem = settings.useLatin
      ? liturgyMasters.various.teDeumLatinAnthem
      : liturgyMasters.various.teDeumCatalanAnthem;
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.evangelicalChant =
      liturgyMasters.various.vespersEvangelicalChant;
  } else {
    hoursLiturgy = getNormalCelebrationHoursLiturgy(liturgyMasters, liturgySpecificDayInformation, settings);
  }

  return hoursLiturgy;
}

function getNormalCelebrationHoursLiturgy(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): HoursLiturgy {
  let hoursLiturgy = new HoursLiturgy();
  switch (liturgyDayInformation.celebrationType) {
    case CelebrationType.Solemnity:
      hoursLiturgy = getSaintsSolemnitiesHoursLiturgy(liturgyMasters.saintsSolemnities, settings);
      break;
    case CelebrationType.Festivity:
      if (liturgyDayInformation.date.getDay() !== 0) {
        hoursLiturgy = getSaintsSolemnitiesHoursLiturgy(liturgyMasters.saintsSolemnities, settings);
      }
      break;
    case CelebrationType.OptionalMemory:
    case CelebrationType.OptionalVirginMemory:
      if (liturgyDayInformation.date.getDay() !== 0) {
        const saintsMemoriesHoursLiturgy = getSaintsMemoriesHoursLiturgy(
          liturgyMasters.saintsMemories,
          liturgyDayInformation,
          settings,
        );
        if (settings.optionalFestivityEnabled) {
          hoursLiturgy = saintsMemoriesHoursLiturgy;
        } else {
          hoursLiturgy.todayCelebrationInformation = saintsMemoriesHoursLiturgy.todayCelebrationInformation;
        }
      }
      break;
    case CelebrationType.Memory:
      if (liturgyDayInformation.date.getDay() !== 0) {
        hoursLiturgy = getSaintsMemoriesHoursLiturgy(liturgyMasters.saintsMemories, liturgyDayInformation, settings);
      }
      break;
  }
  return hoursLiturgy;
}

function getFirstVespersWithCelebration(
  liturgyMasters: LiturgyMasters,
  tomorrowLiturgyInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  if (
    tomorrowLiturgyInformation.specialCelebration.specialCelebrationType ===
    SpecialCelebrationTypeEnum.SolemnityAndFestivity
  ) {
    return getSolemnityAndFestivityFirstVespersOfTomorrow(
      liturgyMasters.solemnityAndFestivityWhenFirstVespersParts,
      tomorrowLiturgyInformation,
      settings,
    );
  }
  if (tomorrowLiturgyInformation.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday) {
    return getPalmSundayFistVespersOfTomorrow(
      liturgyMasters.palmSundayParts,
      liturgyMasters.commonPartsOfHolyWeek,
      tomorrowLiturgyInformation,
      settings,
    );
  }
  if (
    tomorrowLiturgyInformation.specificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum &&
    tomorrowLiturgyInformation.date.getDay() === 5
  ) {
    return getEasterTriduumFistVespersOfTomorrow(liturgyMasters.partsOfEasterTriduum, settings);
  }
  if (
    tomorrowLiturgyInformation.date.getDay() === 0 &&
    tomorrowLiturgyInformation.week === '1' &&
    tomorrowLiturgyInformation.specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks
  ) {
    return getAdventSundayFirstVespersOfTomorrow(
      liturgyMasters.adventFirstVespersOfSundayParts,
      liturgyMasters.adventWeekParts,
      liturgyMasters.commonAdventAndChristmasParts,
      tomorrowLiturgyInformation,
      settings,
    );
  }
  if (tomorrowLiturgyInformation.specialCelebration.specialCelebrationType === SpecialCelebrationTypeEnum.SpecialDay) {
    return getSpecialDaysFirstVespersOfTomorrow(liturgyMasters.specialDaysParts, tomorrowLiturgyInformation, settings);
  }
  if (
    tomorrowLiturgyInformation.celebrationType === CelebrationType.Solemnity ||
    tomorrowLiturgyInformation.celebrationType === CelebrationType.Festivity
  ) {
    return getSaintsSolemnitiesFirstVespersOfTomorrow(
      liturgyMasters.saintsSolemnitiesWhenFirstsVespersParts,
      tomorrowLiturgyInformation,
      settings,
    );
  }
  return new Vespers();
}

function getEasterSundayHoursLiturgy(easterSunday: EasterSunday, settings: Settings): HoursLiturgy {
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.todayCelebrationInformation.title = 'Diumenge de Pasqua';

  hoursLiturgy.invitation.invitationAntiphon = easterSunday.invitationAntiphon;

  hoursLiturgy.office.firstReading = easterSunday.officeFirstReading;
  hoursLiturgy.office.firstPsalm.antiphon = easterSunday.officeFirstPsalm.antiphon;
  hoursLiturgy.office.firstPsalm.title = easterSunday.officeFirstPsalm.title;
  hoursLiturgy.office.firstPsalm.psalm = easterSunday.officeFirstPsalm.psalm;
  hoursLiturgy.office.firstPsalm.prayer = easterSunday.officeFirstPsalm.prayer;
  hoursLiturgy.office.secondReading = easterSunday.officeSecondReading;
  hoursLiturgy.office.secondPsalm.antiphon = easterSunday.officeSecondPsalm.antiphon;
  hoursLiturgy.office.secondPsalm.title = easterSunday.officeSecondPsalm.title;
  hoursLiturgy.office.secondPsalm.psalm = easterSunday.officeSecondPsalm.psalm;
  hoursLiturgy.office.secondPsalm.prayer = easterSunday.officeSecondPsalm.prayer;
  hoursLiturgy.office.thirdReading = easterSunday.officeThirdReading;
  hoursLiturgy.office.thirdPsalm.antiphon = easterSunday.officeThirdPsalm.antiphon;
  hoursLiturgy.office.thirdPsalm.title = easterSunday.officeThirdPsalm.title;
  hoursLiturgy.office.thirdPsalm.psalm = easterSunday.officeThirdPsalm.psalm;
  hoursLiturgy.office.thirdPsalm.prayer = easterSunday.officeThirdPsalm.prayer;
  hoursLiturgy.office.fourthReading = easterSunday.officeFourthReading;
  hoursLiturgy.office.fourthPsalm.antiphon = easterSunday.officeFourthPsalm.antiphon;
  hoursLiturgy.office.fourthPsalm.title = easterSunday.officeFourthPsalm.title;
  hoursLiturgy.office.fourthPsalm.psalm = easterSunday.officeFourthPsalm.psalm;
  hoursLiturgy.office.fourthPsalm.prayer = easterSunday.officeFourthPsalm.prayer;
  hoursLiturgy.office.teDeumInformation.enabled = true;
  hoursLiturgy.office.finalPrayer = easterSunday.officeFinalPrayer;

  hoursLiturgy.laudes.anthem = settings.useLatin ? easterSunday.laudesLatinAnthem : easterSunday.laudesCatalanAnthem;
  hoursLiturgy.laudes.firstPsalm = easterSunday.laudesFirstPsalm;
  hoursLiturgy.laudes.secondPsalm = easterSunday.laudesSecondPsalm;
  hoursLiturgy.laudes.thirdPsalm = easterSunday.laudesThirdPsalm;
  hoursLiturgy.laudes.shortReading = easterSunday.laudesShortReading;
  hoursLiturgy.laudes.shortResponsory = easterSunday.laudesShortResponsory;
  hoursLiturgy.laudes.evangelicalAntiphon = easterSunday.laudesEvangelicalAntiphon;
  hoursLiturgy.laudes.prayers = easterSunday.laudesPrayers;
  hoursLiturgy.laudes.finalPrayer = easterSunday.laudesFinalPrayer;

  hoursLiturgy.hours.thirdHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.thirdHour.anthem = settings.useLatin
    ? easterSunday.thirdHourParts.latinAnthem
    : easterSunday.thirdHourParts.catalanAnthem;
  hoursLiturgy.hours.thirdHour.uniqueAntiphon = easterSunday.thirdHourParts.antiphon;
  hoursLiturgy.hours.thirdHour.firstPsalm = easterSunday.hourPrayerFirstPsalm;
  hoursLiturgy.hours.thirdHour.secondPsalm = easterSunday.hourPrayerSecondPsalm;
  hoursLiturgy.hours.thirdHour.thirdPsalm = easterSunday.hourPrayerThirdPsalm;
  hoursLiturgy.hours.thirdHour.shortReading = easterSunday.thirdHourParts.shortReading;
  hoursLiturgy.hours.thirdHour.responsory = easterSunday.thirdHourParts.responsory;
  hoursLiturgy.hours.thirdHour.finalPrayer = easterSunday.thirdHourParts.finalPrayer;
  hoursLiturgy.hours.sixthHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.sixthHour.anthem = settings.useLatin
    ? easterSunday.sixthHourParts.latinAnthem
    : easterSunday.sixthHourParts.catalanAnthem;
  hoursLiturgy.hours.sixthHour.uniqueAntiphon = easterSunday.sixthHourParts.antiphon;
  hoursLiturgy.hours.sixthHour.firstPsalm = easterSunday.hourPrayerFirstPsalm;
  hoursLiturgy.hours.sixthHour.secondPsalm = easterSunday.hourPrayerSecondPsalm;
  hoursLiturgy.hours.sixthHour.thirdPsalm = easterSunday.hourPrayerThirdPsalm;
  hoursLiturgy.hours.sixthHour.shortReading = easterSunday.sixthHourParts.shortReading;
  hoursLiturgy.hours.sixthHour.responsory = easterSunday.sixthHourParts.responsory;
  hoursLiturgy.hours.sixthHour.finalPrayer = easterSunday.sixthHourParts.finalPrayer;
  hoursLiturgy.hours.ninthHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.ninthHour.anthem = settings.useLatin
    ? easterSunday.ninthHourParts.latinAnthem
    : easterSunday.ninthHourParts.catalanAnthem;
  hoursLiturgy.hours.ninthHour.uniqueAntiphon = easterSunday.ninthHourParts.antiphon;
  hoursLiturgy.hours.ninthHour.firstPsalm = easterSunday.hourPrayerFirstPsalm;
  hoursLiturgy.hours.ninthHour.secondPsalm = easterSunday.hourPrayerSecondPsalm;
  hoursLiturgy.hours.ninthHour.thirdPsalm = easterSunday.hourPrayerThirdPsalm;
  hoursLiturgy.hours.ninthHour.shortReading = easterSunday.ninthHourParts.shortReading;
  hoursLiturgy.hours.ninthHour.responsory = easterSunday.ninthHourParts.responsory;
  hoursLiturgy.hours.ninthHour.finalPrayer = easterSunday.ninthHourParts.finalPrayer;

  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.anthem = settings.useLatin
    ? easterSunday.vespersLatinAnthem
    : easterSunday.vespersCatalanAnthem;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.firstPsalm = easterSunday.vespersFirstPsalm;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.secondPsalm = easterSunday.vespersSecondPsalm;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.thirdPsalm = easterSunday.vespersThirdPsalm;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortReading = easterSunday.vespersShortReading;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortResponsory = easterSunday.vespersShortResponsory;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.evangelicalAntiphon =
    easterSunday.vespersEvangelicalAntiphon;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.prayers = easterSunday.vespersPrayers;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.finalPrayer = easterSunday.vespersFinalPrayer;

  return hoursLiturgy;
}

function getSolemnityAndFestivityHoursLiturgy(
  solemnityAndFestivityParts: SolemnityAndFestivityParts,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): HoursLiturgy {
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.todayCelebrationInformation = solemnityAndFestivityParts.celebration;

  hoursLiturgy.invitation.invitationAntiphon = solemnityAndFestivityParts.invitationAntiphon;

  hoursLiturgy.office.anthem = settings.useLatin
    ? solemnityAndFestivityParts.officeLatinAnthem
    : solemnityAndFestivityParts.officeCatalanAnthem;
  hoursLiturgy.office.firstPsalm = solemnityAndFestivityParts.officeFirstPsalm;
  hoursLiturgy.office.secondPsalm = solemnityAndFestivityParts.officeSecondPsalm;
  hoursLiturgy.office.thirdPsalm = solemnityAndFestivityParts.officeThirdPsalm;
  hoursLiturgy.office.responsory = solemnityAndFestivityParts.officeResponsory;
  hoursLiturgy.office.firstReading = solemnityAndFestivityParts.officeFirstReading;
  hoursLiturgy.office.secondReading = solemnityAndFestivityParts.officeSecondReading;
  hoursLiturgy.office.teDeumInformation.enabled = true;
  hoursLiturgy.office.finalPrayer = solemnityAndFestivityParts.officeFinalPrayer;

  hoursLiturgy.laudes.anthem = settings.useLatin
    ? solemnityAndFestivityParts.laudesLatinAnthem
    : solemnityAndFestivityParts.laudesCatalanAnthem;
  hoursLiturgy.laudes.firstPsalm.antiphon = solemnityAndFestivityParts.laudesFirstAntiphon;
  hoursLiturgy.laudes.secondPsalm.antiphon = solemnityAndFestivityParts.laudesSecondAntiphon;
  hoursLiturgy.laudes.thirdPsalm.antiphon = solemnityAndFestivityParts.laudesThirdAntiphon;
  hoursLiturgy.laudes.shortReading = solemnityAndFestivityParts.laudesShortReading;
  hoursLiturgy.laudes.shortResponsory = solemnityAndFestivityParts.laudesShortResponsory;
  switch (liturgyDayInformation.yearType) {
    case YearType.A:
      hoursLiturgy.laudes.evangelicalAntiphon = solemnityAndFestivityParts.laudesEvangelicalAntiphonYearA;
      break;
    case YearType.B:
      hoursLiturgy.laudes.evangelicalAntiphon = solemnityAndFestivityParts.laudesEvangelicalAntiphonYearB;
      break;
    case YearType.C:
      hoursLiturgy.laudes.evangelicalAntiphon = solemnityAndFestivityParts.laudesEvangelicalAntiphonYearC;
      break;
  }

  hoursLiturgy.laudes.prayers = solemnityAndFestivityParts.laudesPrayers;
  hoursLiturgy.laudes.finalPrayer = solemnityAndFestivityParts.laudesFinalPrayer;

  hoursLiturgy.hours.thirdHour.anthem = settings.useLatin
    ? solemnityAndFestivityParts.thirdHourParts.latinAnthem
    : solemnityAndFestivityParts.thirdHourParts.catalanAnthem;
  hoursLiturgy.hours.thirdHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.thirdHour.uniqueAntiphon = solemnityAndFestivityParts.thirdHourParts.antiphon;
  hoursLiturgy.hours.thirdHour.firstPsalm = solemnityAndFestivityParts.hoursFirstPsalm;
  hoursLiturgy.hours.thirdHour.secondPsalm = solemnityAndFestivityParts.hoursSecondPsalm;
  hoursLiturgy.hours.thirdHour.thirdPsalm = solemnityAndFestivityParts.hoursThirdPsalm;
  hoursLiturgy.hours.thirdHour.shortReading = solemnityAndFestivityParts.thirdHourParts.shortReading;
  hoursLiturgy.hours.thirdHour.responsory = solemnityAndFestivityParts.thirdHourParts.responsory;
  hoursLiturgy.hours.thirdHour.finalPrayer = solemnityAndFestivityParts.thirdHourParts.finalPrayer;
  hoursLiturgy.hours.sixthHour.anthem = settings.useLatin
    ? solemnityAndFestivityParts.sixthHourParts.latinAnthem
    : solemnityAndFestivityParts.sixthHourParts.catalanAnthem;
  hoursLiturgy.hours.sixthHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.sixthHour.uniqueAntiphon = solemnityAndFestivityParts.sixthHourParts.antiphon;
  hoursLiturgy.hours.sixthHour.firstPsalm = solemnityAndFestivityParts.hoursFirstPsalm;
  hoursLiturgy.hours.sixthHour.secondPsalm = solemnityAndFestivityParts.hoursSecondPsalm;
  hoursLiturgy.hours.sixthHour.thirdPsalm = solemnityAndFestivityParts.hoursThirdPsalm;
  hoursLiturgy.hours.sixthHour.shortReading = solemnityAndFestivityParts.sixthHourParts.shortReading;
  hoursLiturgy.hours.sixthHour.responsory = solemnityAndFestivityParts.sixthHourParts.responsory;
  hoursLiturgy.hours.sixthHour.finalPrayer = solemnityAndFestivityParts.sixthHourParts.finalPrayer;
  hoursLiturgy.hours.ninthHour.anthem = settings.useLatin
    ? solemnityAndFestivityParts.ninthHourParts.latinAnthem
    : solemnityAndFestivityParts.ninthHourParts.catalanAnthem;
  hoursLiturgy.hours.ninthHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.ninthHour.uniqueAntiphon = solemnityAndFestivityParts.ninthHourParts.antiphon;
  hoursLiturgy.hours.ninthHour.firstPsalm = solemnityAndFestivityParts.hoursFirstPsalm;
  hoursLiturgy.hours.ninthHour.secondPsalm = solemnityAndFestivityParts.hoursSecondPsalm;
  hoursLiturgy.hours.ninthHour.thirdPsalm = solemnityAndFestivityParts.hoursThirdPsalm;
  hoursLiturgy.hours.ninthHour.shortReading = solemnityAndFestivityParts.ninthHourParts.shortReading;
  hoursLiturgy.hours.ninthHour.responsory = solemnityAndFestivityParts.ninthHourParts.responsory;
  hoursLiturgy.hours.ninthHour.finalPrayer = solemnityAndFestivityParts.ninthHourParts.finalPrayer;

  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.anthem = settings.useLatin
    ? solemnityAndFestivityParts.secondVespersLatinAnthem
    : solemnityAndFestivityParts.secondVespersCatalanAnthem;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.firstPsalm =
    solemnityAndFestivityParts.secondVespersFirstPsalm;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.secondPsalm =
    solemnityAndFestivityParts.secondVespersSecondPsalm;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.thirdPsalm =
    solemnityAndFestivityParts.secondVespersThirdPsalm;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortReading =
    solemnityAndFestivityParts.secondVespersShortReading;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortResponsory =
    solemnityAndFestivityParts.secondVespersShortResponsory;
  switch (liturgyDayInformation.yearType) {
    case YearType.A:
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.evangelicalAntiphon =
        solemnityAndFestivityParts.secondVespersEvangelicalAntiphonYearA;
      break;
    case YearType.B:
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.evangelicalAntiphon =
        solemnityAndFestivityParts.secondVespersEvangelicalAntiphonYearB;
      break;
    case YearType.C:
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.evangelicalAntiphon =
        solemnityAndFestivityParts.secondVespersEvangelicalAntiphonYearC;
      break;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.prayers =
    solemnityAndFestivityParts.secondVespersPrayers;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.finalPrayer =
    solemnityAndFestivityParts.secondVespersFinalPrayer;

  return hoursLiturgy;
}

function getSpecialDayHoursLiturgy(specialDaysParts: SpecialDaysParts, settings: Settings): HoursLiturgy {
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.todayCelebrationInformation = specialDaysParts.celebration;

  hoursLiturgy.invitation.invitationAntiphon = specialDaysParts.invitationAntiphon;

  hoursLiturgy.office.anthem = settings.useLatin
    ? specialDaysParts.officeLatinAnthem
    : specialDaysParts.officeCatalanAnthem;
  hoursLiturgy.office.firstPsalm = specialDaysParts.officeFirstPsalm;
  hoursLiturgy.office.secondPsalm = specialDaysParts.officeSecondPsalm;
  hoursLiturgy.office.thirdPsalm = specialDaysParts.officeThirdPsalm;
  hoursLiturgy.office.responsory = specialDaysParts.officeResponsory;
  hoursLiturgy.office.firstReading = specialDaysParts.officeFirstReading;
  hoursLiturgy.office.secondReading = specialDaysParts.officeSecondReading;
  hoursLiturgy.office.teDeumInformation.enabled = true;
  hoursLiturgy.office.finalPrayer = specialDaysParts.officeFinalPrayer;

  hoursLiturgy.laudes.anthem = settings.useLatin
    ? specialDaysParts.laudesLatinAnthem
    : specialDaysParts.laudesCatalanAnthem;
  hoursLiturgy.laudes.firstPsalm = specialDaysParts.laudesFirstPsalm;
  hoursLiturgy.laudes.secondPsalm = specialDaysParts.laudesSecondPsalm;
  hoursLiturgy.laudes.thirdPsalm = specialDaysParts.laudesThirdPsalm;
  hoursLiturgy.laudes.shortReading = specialDaysParts.laudesShortReading;
  hoursLiturgy.laudes.shortResponsory = specialDaysParts.laudesShortResponsory;
  hoursLiturgy.laudes.evangelicalAntiphon = specialDaysParts.laudesEvangelicalAntiphon;
  hoursLiturgy.laudes.prayers = specialDaysParts.laudesPrayers;
  hoursLiturgy.laudes.finalPrayer = specialDaysParts.laudesFinalPrayer;

  hoursLiturgy.hours.thirdHour.anthem = settings.useLatin
    ? specialDaysParts.thirdHourParts.latinAnthem
    : specialDaysParts.thirdHourParts.catalanAnthem;
  hoursLiturgy.hours.thirdHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.thirdHour.uniqueAntiphon = specialDaysParts.thirdHourParts.antiphon;
  hoursLiturgy.hours.thirdHour.firstPsalm = specialDaysParts.hoursFirstPsalm;
  hoursLiturgy.hours.thirdHour.secondPsalm = specialDaysParts.hoursSecondPsalm;
  hoursLiturgy.hours.thirdHour.thirdPsalm = specialDaysParts.hoursThirdPsalm;
  hoursLiturgy.hours.thirdHour.shortReading = specialDaysParts.thirdHourParts.shortReading;
  hoursLiturgy.hours.thirdHour.responsory = specialDaysParts.thirdHourParts.responsory;
  hoursLiturgy.hours.thirdHour.finalPrayer = specialDaysParts.thirdHourParts.finalPrayer;
  hoursLiturgy.hours.sixthHour.anthem = settings.useLatin
    ? specialDaysParts.sixthHourParts.latinAnthem
    : specialDaysParts.sixthHourParts.catalanAnthem;
  hoursLiturgy.hours.sixthHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.sixthHour.uniqueAntiphon = specialDaysParts.sixthHourParts.antiphon;
  hoursLiturgy.hours.sixthHour.firstPsalm = specialDaysParts.hoursFirstPsalm;
  hoursLiturgy.hours.sixthHour.secondPsalm = specialDaysParts.hoursSecondPsalm;
  hoursLiturgy.hours.sixthHour.thirdPsalm = specialDaysParts.hoursThirdPsalm;
  hoursLiturgy.hours.sixthHour.shortReading = specialDaysParts.sixthHourParts.shortReading;
  hoursLiturgy.hours.sixthHour.responsory = specialDaysParts.sixthHourParts.responsory;
  hoursLiturgy.hours.sixthHour.finalPrayer = specialDaysParts.sixthHourParts.finalPrayer;
  hoursLiturgy.hours.ninthHour.anthem = settings.useLatin
    ? specialDaysParts.ninthHourParts.latinAnthem
    : specialDaysParts.ninthHourParts.catalanAnthem;
  hoursLiturgy.hours.ninthHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.ninthHour.uniqueAntiphon = specialDaysParts.ninthHourParts.antiphon;
  hoursLiturgy.hours.ninthHour.firstPsalm = specialDaysParts.hoursFirstPsalm;
  hoursLiturgy.hours.ninthHour.secondPsalm = specialDaysParts.hoursSecondPsalm;
  hoursLiturgy.hours.ninthHour.thirdPsalm = specialDaysParts.hoursThirdPsalm;
  hoursLiturgy.hours.ninthHour.shortReading = specialDaysParts.ninthHourParts.shortReading;
  hoursLiturgy.hours.ninthHour.responsory = specialDaysParts.ninthHourParts.responsory;
  hoursLiturgy.hours.ninthHour.finalPrayer = specialDaysParts.ninthHourParts.finalPrayer;

  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.anthem = settings.useLatin
    ? specialDaysParts.secondVespersLatinAnthem
    : specialDaysParts.secondVespersCatalanAnthem;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.firstPsalm = specialDaysParts.secondVespersFirstPsalm;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.secondPsalm = specialDaysParts.secondVespersSecondPsalm;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.thirdPsalm = specialDaysParts.secondVespersThirdPsalm;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortReading =
    specialDaysParts.secondVespersShortReading;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortResponsory =
    specialDaysParts.secondVespersShortResponsory;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.evangelicalAntiphon =
    specialDaysParts.secondVespersEvangelicalAntiphon;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.prayers = specialDaysParts.secondVespersPrayers;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.finalPrayer = specialDaysParts.secondVespersFinalPrayer;

  return hoursLiturgy;
}

function getSaintsSolemnitiesHoursLiturgy(saintsSolemnities: SaintsSolemnities, settings: Settings): HoursLiturgy {
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.todayCelebrationInformation = saintsSolemnities.celebration;

  hoursLiturgy.invitation.invitationAntiphon = saintsSolemnities.invitationAntiphon;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.invitation.invitationAntiphon) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.invitation.invitationAntiphon = saintsSolemnities.commonOffices.invitationAntiphon;
  }
  hoursLiturgy.office.anthem = settings.useLatin
    ? saintsSolemnities.officeLatinAnthem
    : saintsSolemnities.officeCatalanAnthem;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.office.anthem) && saintsSolemnities.commonOffices) {
    hoursLiturgy.office.anthem = settings.useLatin
      ? saintsSolemnities.commonOffices.officeLatinAnthem
      : saintsSolemnities.commonOffices.officeCatalanAnthem;
  }
  hoursLiturgy.office.firstPsalm = saintsSolemnities.officeFirstPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.office.firstPsalm.psalm) && saintsSolemnities.commonOffices) {
    hoursLiturgy.office.firstPsalm = saintsSolemnities.commonOffices.officeFirstPsalm;
  }
  hoursLiturgy.office.secondPsalm = saintsSolemnities.officeSecondPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.office.secondPsalm.psalm) && saintsSolemnities.commonOffices) {
    hoursLiturgy.office.secondPsalm = saintsSolemnities.commonOffices.officeSecondPsalm;
  }
  hoursLiturgy.office.thirdPsalm = saintsSolemnities.officeThirdPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.office.thirdPsalm.psalm) && saintsSolemnities.commonOffices) {
    hoursLiturgy.office.thirdPsalm = saintsSolemnities.commonOffices.officeThirdPsalm;
  }
  hoursLiturgy.office.responsory = saintsSolemnities.officeResponsory;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.office.responsory.versicle) && saintsSolemnities.commonOffices) {
    hoursLiturgy.office.responsory = saintsSolemnities.commonOffices.officeResponsory;
  }
  hoursLiturgy.office.firstReading = saintsSolemnities.officeFirstReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.office.firstReading.reading) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.office.firstReading = saintsSolemnities.commonOffices.officeFirstReading;
  }
  hoursLiturgy.office.secondReading = saintsSolemnities.officeSecondReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.office.secondReading.reading) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.office.secondReading = saintsSolemnities.commonOffices.officeSecondReading;
  }
  hoursLiturgy.office.teDeumInformation.enabled = true;
  hoursLiturgy.office.finalPrayer = saintsSolemnities.officeFinalPrayer;

  hoursLiturgy.laudes.anthem = settings.useLatin
    ? saintsSolemnities.laudesLatinAnthem
    : saintsSolemnities.laudesCatalanAnthem;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.laudes.anthem) && saintsSolemnities.commonOffices) {
    hoursLiturgy.laudes.anthem = settings.useLatin
      ? saintsSolemnities.commonOffices.laudesLatinAnthem
      : saintsSolemnities.commonOffices.laudesCatalanAnthem;
  }
  if (saintsSolemnities.commonOffices) {
    hoursLiturgy.laudes.firstPsalm = saintsSolemnities.commonOffices.laudesFirstPsalm;
    hoursLiturgy.laudes.secondPsalm = saintsSolemnities.commonOffices.laudesSecondPsalm;
    hoursLiturgy.laudes.thirdPsalm = saintsSolemnities.commonOffices.laudesThirdPsalm;
  }
  if (StringManagement.hasLiturgyContent(saintsSolemnities.laudesFirstAntiphon)) {
    hoursLiturgy.laudes.firstPsalm.antiphon = saintsSolemnities.laudesFirstAntiphon;
  }
  if (StringManagement.hasLiturgyContent(saintsSolemnities.laudesSecondAntiphon)) {
    hoursLiturgy.laudes.secondPsalm.antiphon = saintsSolemnities.laudesSecondAntiphon;
  }
  if (StringManagement.hasLiturgyContent(saintsSolemnities.laudesThirdAntiphon)) {
    hoursLiturgy.laudes.thirdPsalm.antiphon = saintsSolemnities.laudesThirdAntiphon;
  }
  hoursLiturgy.laudes.shortReading = saintsSolemnities.laudesShortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.laudes.shortReading.shortReading) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.laudes.shortReading = saintsSolemnities.commonOffices.laudesShortReading;
  }
  hoursLiturgy.laudes.shortResponsory = saintsSolemnities.laudesShortResponsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.laudes.shortResponsory.firstPart) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.laudes.shortResponsory = saintsSolemnities.commonOffices.laudesShortResponsory;
  }
  hoursLiturgy.laudes.evangelicalAntiphon = saintsSolemnities.laudesEvangelicalAntiphon;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.laudes.evangelicalAntiphon) && saintsSolemnities.commonOffices) {
    hoursLiturgy.laudes.evangelicalAntiphon = saintsSolemnities.commonOffices.laudesEvangelicalAntiphon;
  }
  hoursLiturgy.laudes.prayers = saintsSolemnities.laudesPrayers;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.laudes.prayers) && saintsSolemnities.commonOffices) {
    hoursLiturgy.laudes.prayers = saintsSolemnities.commonOffices.laudesPrayers;
  }
  hoursLiturgy.laudes.finalPrayer = saintsSolemnities.laudesFinalPrayer;

  hoursLiturgy.hours.thirdHour.anthem = settings.useLatin
    ? saintsSolemnities.thirdHourParts.latinAnthem
    : saintsSolemnities.thirdHourParts.catalanAnthem;
  hoursLiturgy.hours.thirdHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.thirdHour.uniqueAntiphon = saintsSolemnities.thirdHourParts.antiphon;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.thirdHour.uniqueAntiphon) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.hours.thirdHour.uniqueAntiphon = saintsSolemnities.commonOffices.thirdHourParts.antiphon;
  }
  hoursLiturgy.hours.thirdHour.firstPsalm = saintsSolemnities.hoursFirstPsalm;
  hoursLiturgy.hours.thirdHour.secondPsalm = saintsSolemnities.hoursSecondPsalm;
  hoursLiturgy.hours.thirdHour.thirdPsalm = saintsSolemnities.hoursThirdPsalm;
  hoursLiturgy.hours.thirdHour.shortReading = saintsSolemnities.thirdHourParts.shortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.thirdHour.shortReading.shortReading) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.hours.thirdHour.shortReading = saintsSolemnities.commonOffices.thirdHourParts.shortReading;
  }
  hoursLiturgy.hours.thirdHour.responsory = saintsSolemnities.thirdHourParts.responsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.thirdHour.responsory.response) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.hours.thirdHour.responsory = saintsSolemnities.commonOffices.thirdHourParts.responsory;
  }
  hoursLiturgy.hours.thirdHour.finalPrayer = saintsSolemnities.thirdHourParts.finalPrayer;
  hoursLiturgy.hours.sixthHour.anthem = settings.useLatin
    ? saintsSolemnities.sixthHourParts.latinAnthem
    : saintsSolemnities.sixthHourParts.catalanAnthem;
  hoursLiturgy.hours.sixthHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.sixthHour.uniqueAntiphon = saintsSolemnities.sixthHourParts.antiphon;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.sixthHour.uniqueAntiphon) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.hours.sixthHour.uniqueAntiphon = saintsSolemnities.commonOffices.sixthHourParts.antiphon;
  }
  hoursLiturgy.hours.sixthHour.firstPsalm = saintsSolemnities.hoursFirstPsalm;
  hoursLiturgy.hours.sixthHour.secondPsalm = saintsSolemnities.hoursSecondPsalm;
  hoursLiturgy.hours.sixthHour.thirdPsalm = saintsSolemnities.hoursThirdPsalm;
  hoursLiturgy.hours.sixthHour.shortReading = saintsSolemnities.sixthHourParts.shortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.sixthHour.shortReading.shortReading) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.hours.sixthHour.shortReading = saintsSolemnities.commonOffices.sixthHourParts.shortReading;
  }
  hoursLiturgy.hours.sixthHour.responsory = saintsSolemnities.sixthHourParts.responsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.sixthHour.responsory.response) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.hours.sixthHour.responsory = saintsSolemnities.commonOffices.sixthHourParts.responsory;
  }
  hoursLiturgy.hours.sixthHour.finalPrayer = saintsSolemnities.sixthHourParts.finalPrayer;
  hoursLiturgy.hours.ninthHour.anthem = settings.useLatin
    ? saintsSolemnities.ninthHourParts.latinAnthem
    : saintsSolemnities.ninthHourParts.catalanAnthem;
  hoursLiturgy.hours.ninthHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.ninthHour.uniqueAntiphon = saintsSolemnities.ninthHourParts.antiphon;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.ninthHour.uniqueAntiphon) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.hours.ninthHour.uniqueAntiphon = saintsSolemnities.commonOffices.ninthHourParts.antiphon;
  }
  hoursLiturgy.hours.ninthHour.firstPsalm = saintsSolemnities.hoursFirstPsalm;
  hoursLiturgy.hours.ninthHour.secondPsalm = saintsSolemnities.hoursSecondPsalm;
  hoursLiturgy.hours.ninthHour.thirdPsalm = saintsSolemnities.hoursThirdPsalm;
  hoursLiturgy.hours.ninthHour.shortReading = saintsSolemnities.ninthHourParts.shortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.ninthHour.shortReading.shortReading) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.hours.ninthHour.shortReading = saintsSolemnities.commonOffices.ninthHourParts.shortReading;
  }
  hoursLiturgy.hours.ninthHour.responsory = saintsSolemnities.ninthHourParts.responsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.ninthHour.responsory.response) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.hours.ninthHour.responsory = saintsSolemnities.commonOffices.ninthHourParts.responsory;
  }
  hoursLiturgy.hours.ninthHour.finalPrayer = saintsSolemnities.ninthHourParts.finalPrayer;

  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.anthem = settings.useLatin
    ? saintsSolemnities.secondVespersLatinAnthem
    : saintsSolemnities.secondVespersCatalanAnthem;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.anthem) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.anthem = settings.useLatin
      ? saintsSolemnities.commonOffices.secondVespersLatinAnthem
      : saintsSolemnities.commonOffices.secondVespersCatalanAnthem;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.firstPsalm = saintsSolemnities.secondVespersFirstPsalm;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.firstPsalm.psalm,
    ) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.firstPsalm =
      saintsSolemnities.commonOffices.secondVespersFirstPsalm;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.secondPsalm =
    saintsSolemnities.secondVespersSecondPsalm;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.secondPsalm.psalm,
    ) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.secondPsalm =
      saintsSolemnities.commonOffices.secondVespersSecondPsalm;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.thirdPsalm = saintsSolemnities.secondVespersThirdPsalm;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.thirdPsalm.psalm,
    ) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.thirdPsalm =
      saintsSolemnities.commonOffices.secondVespersThirdPsalm;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortReading =
    saintsSolemnities.secondVespersShortReading;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortReading.shortReading,
    ) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortReading =
      saintsSolemnities.commonOffices.secondVespersShortReading;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortResponsory =
    saintsSolemnities.secondVespersShortResponsory;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortResponsory.firstPart,
    ) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortResponsory =
      saintsSolemnities.commonOffices.secondVespersShortResponsory;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.evangelicalAntiphon =
    saintsSolemnities.secondVespersEvangelicalAntiphon;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.evangelicalAntiphon,
    ) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.evangelicalAntiphon =
      saintsSolemnities.commonOffices.secondVespersEvangelicalAntiphon;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.prayers = saintsSolemnities.secondVespersPrayers;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.prayers) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.prayers =
      saintsSolemnities.commonOffices.secondVespersPrayers;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.finalPrayer =
    saintsSolemnities.secondVespersFinalPrayer;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.finalPrayer) &&
    saintsSolemnities.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.finalPrayer =
      saintsSolemnities.commonOffices.secondVespersFinalPrayer;
  }

  return hoursLiturgy;
}

function getSaintsMemoriesHoursLiturgy(
  saintsMemories: SaintsMemories,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): HoursLiturgy {
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.todayCelebrationInformation = saintsMemories.celebration;

  hoursLiturgy.invitation.invitationAntiphon = saintsMemories.invitationAntiphon;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.invitation.invitationAntiphon) && saintsMemories.commonOffices) {
    hoursLiturgy.invitation.invitationAntiphon = saintsMemories.commonOffices.invitationAntiphon;
  }

  hoursLiturgy.office.anthem = settings.useLatin
    ? saintsMemories.officeLatinAnthem
    : saintsMemories.officeCatalanAnthem;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.office.anthem) && saintsMemories.commonOffices) {
    hoursLiturgy.office.anthem = settings.useLatin
      ? saintsMemories.commonOffices.officeLatinAnthem
      : saintsMemories.commonOffices.officeCatalanAnthem;
  }
  hoursLiturgy.office.firstPsalm = saintsMemories.officeFirstPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.office.firstPsalm.psalm) && saintsMemories.commonOffices) {
    hoursLiturgy.office.firstPsalm = saintsMemories.commonOffices.officeFirstPsalm;
  }
  hoursLiturgy.office.secondPsalm = saintsMemories.officeSecondPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.office.secondPsalm.psalm) && saintsMemories.commonOffices) {
    hoursLiturgy.office.secondPsalm = saintsMemories.commonOffices.officeSecondPsalm;
  }
  hoursLiturgy.office.thirdPsalm = saintsMemories.officeThirdPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.office.thirdPsalm.psalm) && saintsMemories.commonOffices) {
    hoursLiturgy.office.thirdPsalm = saintsMemories.commonOffices.officeThirdPsalm;
  }
  hoursLiturgy.office.responsory = saintsMemories.officeResponsory;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.office.firstPsalm.psalm) && saintsMemories.commonOffices) {
    hoursLiturgy.office.firstPsalm = saintsMemories.commonOffices.officeFirstPsalm;
  }
  hoursLiturgy.office.firstReading = saintsMemories.officeFirstReading;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.office.firstReading.reading) && saintsMemories.commonOffices) {
    hoursLiturgy.office.firstReading = saintsMemories.commonOffices.officeFirstReading;
  }
  hoursLiturgy.office.secondReading = saintsMemories.officeSecondReading;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.office.secondReading.reading) && saintsMemories.commonOffices) {
    hoursLiturgy.office.secondReading = saintsMemories.commonOffices.officeSecondReading;
  }
  hoursLiturgy.office.teDeumInformation.enabled = false;
  hoursLiturgy.office.finalPrayer = saintsMemories.officeFinalPrayer;

  hoursLiturgy.laudes.anthem = settings.useLatin
    ? saintsMemories.laudesLatinAnthem
    : saintsMemories.laudesCatalanAnthem;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.laudes.anthem) && saintsMemories.commonOffices) {
    hoursLiturgy.laudes.anthem = settings.useLatin
      ? saintsMemories.commonOffices.laudesLatinAnthem
      : saintsMemories.commonOffices.laudesCatalanAnthem;
  }
  hoursLiturgy.laudes.firstPsalm = saintsMemories.laudesFirstPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.laudes.firstPsalm.psalm) && saintsMemories.commonOffices) {
    hoursLiturgy.laudes.firstPsalm = saintsMemories.commonOffices.laudesFirstPsalm;
  }
  hoursLiturgy.laudes.secondPsalm = saintsMemories.laudesSecondPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.laudes.secondPsalm.psalm) && saintsMemories.commonOffices) {
    hoursLiturgy.laudes.secondPsalm = saintsMemories.commonOffices.laudesSecondPsalm;
  }
  hoursLiturgy.laudes.thirdPsalm = saintsMemories.laudesThirdPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.laudes.thirdPsalm.psalm) && saintsMemories.commonOffices) {
    hoursLiturgy.laudes.thirdPsalm = saintsMemories.commonOffices.laudesThirdPsalm;
  }
  hoursLiturgy.laudes.shortReading = saintsMemories.laudesShortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.laudes.shortReading.shortReading) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.laudes.shortReading = saintsMemories.commonOffices.laudesShortReading;
  }
  hoursLiturgy.laudes.shortResponsory = saintsMemories.laudesShortResponsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.laudes.shortResponsory.firstPart) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.laudes.shortResponsory = saintsMemories.commonOffices.laudesShortResponsory;
  }
  hoursLiturgy.laudes.evangelicalAntiphon = saintsMemories.laudesEvangelicalAntiphon;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.laudes.evangelicalAntiphon) && saintsMemories.commonOffices) {
    hoursLiturgy.laudes.evangelicalAntiphon = saintsMemories.commonOffices.laudesEvangelicalAntiphon;
  }
  hoursLiturgy.laudes.prayers = saintsMemories.laudesPrayers;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.laudes.prayers) && saintsMemories.commonOffices) {
    hoursLiturgy.laudes.prayers = saintsMemories.commonOffices.laudesPrayers;
  }
  hoursLiturgy.laudes.finalPrayer = saintsMemories.laudesFinalPrayer;

  hoursLiturgy.hours.thirdHour.anthem = settings.useLatin
    ? saintsMemories.thirdHourParts.latinAnthem
    : saintsMemories.thirdHourParts.catalanAnthem;
  hoursLiturgy.hours.thirdHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.thirdHour.uniqueAntiphon = saintsMemories.thirdHourParts.antiphon;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.thirdHour.uniqueAntiphon) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.hours.thirdHour.uniqueAntiphon = saintsMemories.commonOffices.thirdHourParts.antiphon;
  }
  hoursLiturgy.hours.thirdHour.firstPsalm = saintsMemories.hoursFirstPsalm;
  hoursLiturgy.hours.thirdHour.secondPsalm = saintsMemories.hoursSecondPsalm;
  hoursLiturgy.hours.thirdHour.thirdPsalm = saintsMemories.hoursThirdPsalm;
  hoursLiturgy.hours.thirdHour.shortReading = saintsMemories.thirdHourParts.shortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.thirdHour.shortReading.shortReading) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.hours.thirdHour.shortReading = saintsMemories.commonOffices.thirdHourParts.shortReading;
  }
  hoursLiturgy.hours.thirdHour.responsory = saintsMemories.thirdHourParts.responsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.thirdHour.responsory.response) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.hours.thirdHour.responsory = saintsMemories.commonOffices.thirdHourParts.responsory;
  }
  hoursLiturgy.hours.thirdHour.finalPrayer = saintsMemories.thirdHourParts.finalPrayer;
  hoursLiturgy.hours.sixthHour.anthem = settings.useLatin
    ? saintsMemories.sixthHourParts.latinAnthem
    : saintsMemories.sixthHourParts.catalanAnthem;
  hoursLiturgy.hours.sixthHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.sixthHour.uniqueAntiphon = saintsMemories.sixthHourParts.antiphon;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.sixthHour.uniqueAntiphon) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.hours.sixthHour.uniqueAntiphon = saintsMemories.commonOffices.sixthHourParts.antiphon;
  }
  hoursLiturgy.hours.sixthHour.firstPsalm = saintsMemories.hoursFirstPsalm;
  hoursLiturgy.hours.sixthHour.secondPsalm = saintsMemories.hoursSecondPsalm;
  hoursLiturgy.hours.sixthHour.thirdPsalm = saintsMemories.hoursThirdPsalm;
  hoursLiturgy.hours.sixthHour.shortReading = saintsMemories.sixthHourParts.shortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.sixthHour.shortReading.shortReading) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.hours.sixthHour.shortReading = saintsMemories.commonOffices.sixthHourParts.shortReading;
  }
  hoursLiturgy.hours.sixthHour.responsory = saintsMemories.sixthHourParts.responsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.sixthHour.responsory.response) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.hours.sixthHour.responsory = saintsMemories.commonOffices.sixthHourParts.responsory;
  }
  hoursLiturgy.hours.sixthHour.finalPrayer = saintsMemories.sixthHourParts.finalPrayer;
  hoursLiturgy.hours.ninthHour.anthem = settings.useLatin
    ? saintsMemories.ninthHourParts.latinAnthem
    : saintsMemories.ninthHourParts.catalanAnthem;
  hoursLiturgy.hours.ninthHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.ninthHour.uniqueAntiphon = saintsMemories.ninthHourParts.antiphon;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.ninthHour.uniqueAntiphon) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.hours.ninthHour.uniqueAntiphon = saintsMemories.commonOffices.ninthHourParts.antiphon;
  }
  hoursLiturgy.hours.ninthHour.firstPsalm = saintsMemories.hoursFirstPsalm;
  hoursLiturgy.hours.ninthHour.secondPsalm = saintsMemories.hoursSecondPsalm;
  hoursLiturgy.hours.ninthHour.thirdPsalm = saintsMemories.hoursThirdPsalm;
  hoursLiturgy.hours.ninthHour.shortReading = saintsMemories.ninthHourParts.shortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.ninthHour.shortReading.shortReading) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.hours.ninthHour.shortReading = saintsMemories.commonOffices.ninthHourParts.shortReading;
  }
  hoursLiturgy.hours.ninthHour.responsory = saintsMemories.ninthHourParts.responsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.hours.ninthHour.responsory.response) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.hours.ninthHour.responsory = saintsMemories.commonOffices.ninthHourParts.responsory;
  }
  hoursLiturgy.hours.ninthHour.finalPrayer = saintsMemories.ninthHourParts.finalPrayer;

  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.anthem = settings.useLatin
    ? saintsMemories.vespersLatinAnthem
    : saintsMemories.vespersCatalanAnthem;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.anthem) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.anthem = settings.useLatin
      ? saintsMemories.commonOffices.secondVespersLatinAnthem
      : saintsMemories.commonOffices.secondVespersCatalanAnthem;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.firstPsalm = saintsMemories.vespersFirstPsalm;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.firstPsalm.psalm,
    ) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.firstPsalm =
      saintsMemories.commonOffices.secondVespersFirstPsalm;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.secondPsalm = saintsMemories.vespersSecondPsalm;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.secondPsalm.psalm,
    ) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.secondPsalm =
      saintsMemories.commonOffices.secondVespersSecondPsalm;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.thirdPsalm = saintsMemories.vespersThirdPsalm;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.thirdPsalm.psalm,
    ) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.thirdPsalm =
      saintsMemories.commonOffices.secondVespersThirdPsalm;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortReading = saintsMemories.vespersShortReading;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortReading.shortReading,
    ) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortReading =
      saintsMemories.commonOffices.secondVespersShortReading;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortResponsory = saintsMemories.vespersShortResponsory;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortResponsory.firstPart,
    ) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.shortResponsory =
      saintsMemories.commonOffices.secondVespersShortResponsory;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.evangelicalAntiphon =
    saintsMemories.vespersEvangelicalAntiphon;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.evangelicalAntiphon,
    ) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.evangelicalAntiphon =
      saintsMemories.commonOffices.secondVespersEvangelicalAntiphon;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.prayers = saintsMemories.vespersPrayers;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.prayers) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.prayers =
      saintsMemories.commonOffices.secondVespersPrayers;
  }
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.finalPrayer = saintsMemories.vespersFinalPrayer;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.finalPrayer) &&
    saintsMemories.commonOffices
  ) {
    hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration.finalPrayer =
      saintsMemories.commonOffices.secondVespersFinalPrayer;
  }

  return hoursLiturgy;
}

function getSolemnityAndFestivityFirstVespersOfTomorrow(
  solemnityAndFestivityParts: SolemnityAndFestivityParts,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  let vespers = new Vespers();
  vespers.title = solemnityAndFestivityParts.celebration.title;
  vespers.anthem = settings.useLatin
    ? solemnityAndFestivityParts.firstVespersLatinAnthem
    : solemnityAndFestivityParts.firstVespersCatalanAnthem;
  vespers.firstPsalm = solemnityAndFestivityParts.firstVespersFirstPsalm;
  vespers.secondPsalm = solemnityAndFestivityParts.firstVespersSecondPsalm;
  vespers.thirdPsalm = solemnityAndFestivityParts.firstVespersThirdPsalm;
  vespers.shortReading = solemnityAndFestivityParts.firstVespersShortReading;
  vespers.shortResponsory = solemnityAndFestivityParts.firstVespersShortResponsory;
  switch (liturgyDayInformation.yearType) {
    case YearType.A:
      vespers.evangelicalAntiphon = solemnityAndFestivityParts.firstVespersEvangelicalAntiphonYearA;
      break;
    case YearType.B:
      vespers.evangelicalAntiphon = solemnityAndFestivityParts.firstVespersEvangelicalAntiphonYearB;
      break;
    case YearType.C:
      vespers.evangelicalAntiphon = solemnityAndFestivityParts.firstVespersEvangelicalAntiphonYearC;
      break;
  }
  vespers.prayers = solemnityAndFestivityParts.firstVespersPrayers;
  vespers.finalPrayer = solemnityAndFestivityParts.firstVespersFinalPrayer;
  return vespers;
}

function getSpecialDaysFirstVespersOfTomorrow(
  specialDaysParts: SpecialDaysParts,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  let vespers = new Vespers();
  vespers.title = specialDaysParts.celebration.title;
  vespers.anthem = settings.useLatin
    ? specialDaysParts.firstVespersLatinAnthem
    : specialDaysParts.firstVespersCatalanAnthem;
  vespers.firstPsalm = specialDaysParts.firstVespersFirstPsalm;
  vespers.secondPsalm = specialDaysParts.firstVespersSecondPsalm;
  vespers.thirdPsalm = specialDaysParts.firstVespersThirdPsalm;
  vespers.shortReading = specialDaysParts.firstVespersShortReading;
  vespers.shortResponsory = specialDaysParts.firstVespersShortResponsory;
  switch (liturgyDayInformation.yearType) {
    case YearType.A:
      vespers.evangelicalAntiphon = specialDaysParts.firstVespersEvangelicalAntiphonYearA;
      break;
    case YearType.B:
      vespers.evangelicalAntiphon = specialDaysParts.firstVespersEvangelicalAntiphonYearB;
      break;
    case YearType.C:
      vespers.evangelicalAntiphon = specialDaysParts.firstVespersEvangelicalAntiphonYearC;
      break;
  }
  vespers.prayers = specialDaysParts.firstVespersPrayers;
  vespers.finalPrayer = specialDaysParts.firstVespersFinalPrayer;
  return vespers;
}

function getSaintsSolemnitiesFirstVespersOfTomorrow(
  saintsSolemnities: SaintsSolemnities,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  let vespers = new Vespers();
  vespers.title = saintsSolemnities.celebration.title;
  vespers.anthem = settings.useLatin
    ? saintsSolemnities.firstVespersLatinAnthem
    : saintsSolemnities.firstVespersCatalanAnthem;
  if (!StringManagement.hasLiturgyContent(vespers.anthem) && saintsSolemnities.commonOffices) {
    vespers.anthem = settings.useLatin
      ? saintsSolemnities.commonOffices.firstVespersLatinAnthem
      : saintsSolemnities.commonOffices.firstVespersCatalanAnthem;
  }
  vespers.firstPsalm = saintsSolemnities.firstVespersFirstPsalm;
  if (!StringManagement.hasLiturgyContent(vespers.firstPsalm.psalm) && saintsSolemnities.commonOffices) {
    vespers.firstPsalm = saintsSolemnities.commonOffices.firstVespersFirstPsalm;
  }
  vespers.secondPsalm = saintsSolemnities.firstVespersSecondPsalm;
  if (!StringManagement.hasLiturgyContent(vespers.secondPsalm.psalm) && saintsSolemnities.commonOffices) {
    vespers.secondPsalm = saintsSolemnities.commonOffices.firstVespersSecondPsalm;
  }
  vespers.thirdPsalm = saintsSolemnities.firstVespersThirdPsalm;
  if (!StringManagement.hasLiturgyContent(vespers.thirdPsalm.psalm) && saintsSolemnities.commonOffices) {
    vespers.thirdPsalm = saintsSolemnities.commonOffices.firstVespersThirdPsalm;
  }
  vespers.shortReading = saintsSolemnities.firstVespersShortReading;
  if (!StringManagement.hasLiturgyContent(vespers.shortReading.shortReading) && saintsSolemnities.commonOffices) {
    vespers.shortReading = saintsSolemnities.commonOffices.firstVespersShortReading;
  }
  vespers.shortResponsory = saintsSolemnities.firstVespersShortResponsory;
  if (!StringManagement.hasLiturgyContent(vespers.shortResponsory.firstPart) && saintsSolemnities.commonOffices) {
    vespers.shortResponsory = saintsSolemnities.commonOffices.firstVespersShortResponsory;
  }
  vespers.evangelicalAntiphon = saintsSolemnities.firstVespersEvangelicalAntiphon;
  if (!StringManagement.hasLiturgyContent(vespers.evangelicalAntiphon) && saintsSolemnities.commonOffices) {
    vespers.evangelicalAntiphon = saintsSolemnities.commonOffices.firstVespersEvangelicalAntiphon;
  }
  vespers.prayers = saintsSolemnities.firstVespersPrayers;
  if (!StringManagement.hasLiturgyContent(vespers.prayers) && saintsSolemnities.commonOffices) {
    vespers.prayers = saintsSolemnities.commonOffices.firstVespersPrayers;
  }
  vespers.finalPrayer = saintsSolemnities.firstVespersFinalPrayer;
  return vespers;
}

function getPalmSundayFistVespersOfTomorrow(
  palmSundayParts: PalmSundayParts,
  commonPartsOfHolyWeek: CommonPartsOfHolyWeek,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  let vespers = new Vespers();
  vespers.title = 'Diumenge de Rams';
  vespers.anthem = settings.useLatin
    ? commonPartsOfHolyWeek.vespersLatinAnthem
    : commonPartsOfHolyWeek.vespersCatalanAnthem;
  vespers.firstPsalm.antiphon = palmSundayParts.firstVespersFirstAntiphon;
  vespers.secondPsalm.antiphon = palmSundayParts.firstVespersSecondAntiphon;
  vespers.thirdPsalm.antiphon = palmSundayParts.firstVespersThirdAntiphon;
  vespers.shortReading = palmSundayParts.firstVespersShortReading;
  vespers.shortResponsory = palmSundayParts.firstVespersShortResponsory;
  switch (liturgyDayInformation.yearType) {
    case YearType.A:
      vespers.evangelicalAntiphon = palmSundayParts.firstVespersEvangelicalAntiphonYearA;
      break;
    case YearType.B:
      vespers.evangelicalAntiphon = palmSundayParts.firstVespersEvangelicalAntiphonYearB;
      break;
    case YearType.C:
      vespers.evangelicalAntiphon = palmSundayParts.firstVespersEvangelicalAntiphonYearC;
      break;
  }
  vespers.prayers = palmSundayParts.firstVespersPrayers;
  vespers.finalPrayer = palmSundayParts.firstVespersFinalPrayer;
  return vespers;
}

function getEasterTriduumFistVespersOfTomorrow(
  partsOfEasterTriduum: PartsOfEasterTriduum,
  settings: Settings,
): Vespers {
  let vespers = new Vespers();
  vespers.title = 'Tridu Pasqual';
  vespers.anthem = settings.useLatin
    ? partsOfEasterTriduum.vespersLatinAnthem
    : partsOfEasterTriduum.vespersCatalanAnthem;
  vespers.firstPsalm = partsOfEasterTriduum.vespersFirstPsalm;
  vespers.secondPsalm = partsOfEasterTriduum.vespersSecondPsalm;
  vespers.thirdPsalm = partsOfEasterTriduum.vespersThirdPsalm;
  vespers.shortReading = partsOfEasterTriduum.vespersShortReading;
  vespers.shortResponsory = partsOfEasterTriduum.vespersShortResponsory;
  vespers.evangelicalAntiphon = partsOfEasterTriduum.vespersEvangelicalAntiphon;
  vespers.prayers = partsOfEasterTriduum.vespersPrayers;
  vespers.finalPrayer = partsOfEasterTriduum.vespersFinalPrayer;
  return vespers;
}

function getAdventSundayFirstVespersOfTomorrow(
  adventSundayParts: AdventSundayParts,
  adventWeekParts: AdventWeekParts,
  commonAdventAndChristmasParts: CommonAdventAndChristmasParts,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  let vespers = new Vespers();
  vespers.title = "Diumenge d'advent";
  vespers.anthem = settings.useLatin
    ? commonAdventAndChristmasParts.vespersLatinAnthem
    : commonAdventAndChristmasParts.vespersCatalanAnthem;
  vespers.firstPsalm.antiphon = adventSundayParts.firstVespersFirstAntiphon;
  vespers.secondPsalm.antiphon = adventSundayParts.firstVespersSecondAntiphon;
  vespers.thirdPsalm.antiphon = adventSundayParts.firstVespersThirdAntiphon;
  vespers.shortReading = adventWeekParts.vespersShortReading;
  vespers.shortResponsory = adventWeekParts.vespersShortResponsory;
  switch (liturgyDayInformation.yearType) {
    case YearType.A:
      vespers.evangelicalAntiphon = adventSundayParts.firstVespersEvangelicalAntiphonYearA;
      break;
    case YearType.B:
      vespers.evangelicalAntiphon = adventSundayParts.firstVespersEvangelicalAntiphonYearB;
      break;
    case YearType.C:
      vespers.evangelicalAntiphon = adventSundayParts.firstVespersEvangelicalAntiphonYearC;
      break;
  }
  vespers.prayers = adventWeekParts.vespersPrayers;
  vespers.finalPrayer = adventWeekParts.vespersFinalPrayer;
  return vespers;
}
