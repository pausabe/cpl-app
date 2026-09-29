import HoursLiturgy from '../../models/hours-liturgy/HoursLiturgy';
import LiturgyMasters from '../../models/liturgy-masters/LiturgyMasters';
import LiturgyDayInformation, {
  LiturgySpecificDayInformation,
  SpecialCelebrationTypeEnum,
} from '../../models/LiturgyDayInformation';
import { Settings } from '../../models/Settings';
import { CelebrationType, YearType } from '../databaseEnums';
import Vespers from '../../models/hours-liturgy/Vespers';
import Office from '../../models/hours-liturgy/Office';
import Laudes from '../../models/hours-liturgy/Laudes';
import Hours from '../../models/hours-liturgy/Hours';
import { SpecificLiturgyTimeType } from '../celebrationTimeEnums';
import SaintsSolemnities from '../../models/liturgy-masters/SaintsSolemnities';
import SaintsMemories from '../../models/liturgy-masters/SaintsMemories';
import SpecialDaysParts from '../../models/liturgy-masters/SpecialDaysParts';
import EasterSunday from '../../models/liturgy-masters/EasterSunday';
import SolemnityAndFestivityParts from '../../models/liturgy-masters/SolemnityAndFestivityParts';
import CommonOffice from '../../models/liturgy-masters/CommonOffices';
import {
  HourCommonParts,
  Psalm,
  ReadingOfTheOffice,
  Responsory,
  ShortReading,
  ShortResponsory,
} from '../../models/liturgy-masters/CommonParts';
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
        const saintsMemoriesHoursLiturgy = getSaintsMemoriesHoursLiturgy(liturgyMasters.saintsMemories, settings);
        if (settings.optionalFestivityEnabled) {
          hoursLiturgy = saintsMemoriesHoursLiturgy;
        } else {
          hoursLiturgy.todayCelebrationInformation = saintsMemoriesHoursLiturgy.todayCelebrationInformation;
        }
      }
      break;
    case CelebrationType.Memory:
      if (liturgyDayInformation.date.getDay() !== 0) {
        hoursLiturgy = getSaintsMemoriesHoursLiturgy(liturgyMasters.saintsMemories, settings);
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

// --- What the celebrations have in common ------------------------------------------------------
//
// Every celebration fills the hours the same way; what changes is where each text comes from. The
// helpers below write the texts in the order they have always been written, and they hand over the
// same objects they are given (the three minor hours share their psalms): the goldens compare the
// liturgy as JSON, and later services change some of those objects in place.

// A hymn, in Latin or in Catalan as the settings say
function inLanguage(settings: Settings, latin: string, catalan: string): string {
  return settings.useLatin ? latin : catalan;
}

// The text of the year of the day, A, B or C
function ofTheYear(yearType: string, yearA: string, yearB: string, yearC: string): string {
  return ({ [YearType.A]: yearA, [YearType.B]: yearB, [YearType.C]: yearC } as Record<string, string>)[yearType];
}

// Where the text of each part is, to tell whether a celebration has that part of its own
const itself = (text: string) => text;
const psalmText = (psalm: Psalm) => psalm.psalm;
const readingText = (reading: ReadingOfTheOffice) => reading.reading;
const shortReadingText = (reading: ShortReading) => reading.shortReading;
const shortResponsoryText = (responsory: ShortResponsory) => responsory.firstPart;

// What the celebration has of its own; or, when that has no text and the celebration follows a
// common (the saints do), what the common has
function ownOrCommon<T>(
  own: T,
  textOf: (part: T) => string,
  common: CommonOffice | undefined,
  fromCommon: (common: CommonOffice) => T,
): T {
  return !StringManagement.hasLiturgyContent(textOf(own)) && common ? fromCommon(common) : own;
}

interface OfficeTexts {
  anthem: string;
  firstPsalm: Psalm;
  secondPsalm: Psalm;
  thirdPsalm: Psalm;
  responsory: Responsory;
  firstReading: ReadingOfTheOffice;
  secondReading: ReadingOfTheOffice;
  teDeum: boolean;
  finalPrayer: string;
}

function fillOffice(office: Office, texts: OfficeTexts) {
  office.anthem = texts.anthem;
  office.firstPsalm = texts.firstPsalm;
  office.secondPsalm = texts.secondPsalm;
  office.thirdPsalm = texts.thirdPsalm;
  office.responsory = texts.responsory;
  office.firstReading = texts.firstReading;
  office.secondReading = texts.secondReading;
  office.teDeumInformation.enabled = texts.teDeum;
  office.finalPrayer = texts.finalPrayer;
}

interface LaudesTexts {
  anthem: string;
  // The whole psalms, or only the antiphons for the psalms of the day
  psalms: [Psalm, Psalm, Psalm] | { antiphons: [string, string, string] };
  shortReading: ShortReading;
  shortResponsory: ShortResponsory;
  evangelicalAntiphon: string;
  prayers: string;
  finalPrayer: string;
}

function fillLaudes(laudes: Laudes, texts: LaudesTexts) {
  laudes.anthem = texts.anthem;
  if (Array.isArray(texts.psalms)) {
    [laudes.firstPsalm, laudes.secondPsalm, laudes.thirdPsalm] = texts.psalms;
  } else {
    [laudes.firstPsalm.antiphon, laudes.secondPsalm.antiphon, laudes.thirdPsalm.antiphon] = texts.psalms.antiphons;
  }
  laudes.shortReading = texts.shortReading;
  laudes.shortResponsory = texts.shortResponsory;
  laudes.evangelicalAntiphon = texts.evangelicalAntiphon;
  laudes.prayers = texts.prayers;
  laudes.finalPrayer = texts.finalPrayer;
}

// Terce, Sext and None of a celebration: each with its own hymn, antiphon, reading, responsory and
// prayer, the three with the same psalms. What a saint does not have comes from its common.
function fillMinorHours(
  hours: Hours,
  parts: { third: HourCommonParts; sixth: HourCommonParts; ninth: HourCommonParts },
  psalms: [Psalm, Psalm, Psalm],
  settings: Settings,
  common?: CommonOffice,
) {
  const eachHour = [
    { hour: hours.thirdHour, own: parts.third, ofCommon: (c: CommonOffice) => c.thirdHourParts },
    { hour: hours.sixthHour, own: parts.sixth, ofCommon: (c: CommonOffice) => c.sixthHourParts },
    { hour: hours.ninthHour, own: parts.ninth, ofCommon: (c: CommonOffice) => c.ninthHourParts },
  ];
  for (const { hour, own, ofCommon } of eachHour) {
    hour.anthem = inLanguage(settings, own.latinAnthem, own.catalanAnthem);
    hour.hasMultipleAntiphons = false;
    hour.uniqueAntiphon = ownOrCommon(own.antiphon, itself, common, (c) => ofCommon(c).antiphon);
    [hour.firstPsalm, hour.secondPsalm, hour.thirdPsalm] = psalms;
    hour.shortReading = ownOrCommon(own.shortReading, shortReadingText, common, (c) => ofCommon(c).shortReading);
    hour.responsory = ownOrCommon(
      own.responsory,
      (responsory) => responsory.response,
      common,
      (c) => ofCommon(c).responsory,
    );
    hour.finalPrayer = own.finalPrayer;
  }
}

interface VespersTexts {
  anthem: string;
  firstPsalm: Psalm;
  secondPsalm: Psalm;
  thirdPsalm: Psalm;
  shortReading: ShortReading;
  shortResponsory: ShortResponsory;
  evangelicalAntiphon: string;
  prayers: string;
  finalPrayer: string;
}

function fillVespers(vespers: Vespers, texts: VespersTexts) {
  vespers.anthem = texts.anthem;
  vespers.firstPsalm = texts.firstPsalm;
  vespers.secondPsalm = texts.secondPsalm;
  vespers.thirdPsalm = texts.thirdPsalm;
  vespers.shortReading = texts.shortReading;
  vespers.shortResponsory = texts.shortResponsory;
  vespers.evangelicalAntiphon = texts.evangelicalAntiphon;
  vespers.prayers = texts.prayers;
  vespers.finalPrayer = texts.finalPrayer;
}

// --- Each kind of celebration ---------------------------------------------------------------------

// A psalm of the Vigil said at the Office of Easter Sunday: antiphon, title, psalm and prayer
function fillVigilPsalm(psalm: Psalm, vigilPsalm: EasterSunday['officeFirstPsalm']) {
  psalm.antiphon = vigilPsalm.antiphon;
  psalm.title = vigilPsalm.title;
  psalm.psalm = vigilPsalm.psalm;
  psalm.prayer = vigilPsalm.prayer;
}

function getEasterSundayHoursLiturgy(easterSunday: EasterSunday, settings: Settings): HoursLiturgy {
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.todayCelebrationInformation.title = 'Diumenge de Pasqua';

  hoursLiturgy.invitation.invitationAntiphon = easterSunday.invitationAntiphon;

  const office = hoursLiturgy.office;
  office.firstReading = easterSunday.officeFirstReading;
  fillVigilPsalm(office.firstPsalm, easterSunday.officeFirstPsalm);
  office.secondReading = easterSunday.officeSecondReading;
  fillVigilPsalm(office.secondPsalm, easterSunday.officeSecondPsalm);
  office.thirdReading = easterSunday.officeThirdReading;
  fillVigilPsalm(office.thirdPsalm, easterSunday.officeThirdPsalm);
  office.fourthReading = easterSunday.officeFourthReading;
  fillVigilPsalm(office.fourthPsalm, easterSunday.officeFourthPsalm);
  office.teDeumInformation.enabled = true;
  office.finalPrayer = easterSunday.officeFinalPrayer;

  fillLaudes(hoursLiturgy.laudes, {
    anthem: inLanguage(settings, easterSunday.laudesLatinAnthem, easterSunday.laudesCatalanAnthem),
    psalms: [easterSunday.laudesFirstPsalm, easterSunday.laudesSecondPsalm, easterSunday.laudesThirdPsalm],
    shortReading: easterSunday.laudesShortReading,
    shortResponsory: easterSunday.laudesShortResponsory,
    evangelicalAntiphon: easterSunday.laudesEvangelicalAntiphon,
    prayers: easterSunday.laudesPrayers,
    finalPrayer: easterSunday.laudesFinalPrayer,
  });

  // Written first here, as it always was
  hoursLiturgy.hours.thirdHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.sixthHour.hasMultipleAntiphons = false;
  hoursLiturgy.hours.ninthHour.hasMultipleAntiphons = false;
  fillMinorHours(
    hoursLiturgy.hours,
    { third: easterSunday.thirdHourParts, sixth: easterSunday.sixthHourParts, ninth: easterSunday.ninthHourParts },
    [easterSunday.hourPrayerFirstPsalm, easterSunday.hourPrayerSecondPsalm, easterSunday.hourPrayerThirdPsalm],
    settings,
  );

  fillVespers(hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration, {
    anthem: inLanguage(settings, easterSunday.vespersLatinAnthem, easterSunday.vespersCatalanAnthem),
    firstPsalm: easterSunday.vespersFirstPsalm,
    secondPsalm: easterSunday.vespersSecondPsalm,
    thirdPsalm: easterSunday.vespersThirdPsalm,
    shortReading: easterSunday.vespersShortReading,
    shortResponsory: easterSunday.vespersShortResponsory,
    evangelicalAntiphon: easterSunday.vespersEvangelicalAntiphon,
    prayers: easterSunday.vespersPrayers,
    finalPrayer: easterSunday.vespersFinalPrayer,
  });

  return hoursLiturgy;
}

function getSolemnityAndFestivityHoursLiturgy(
  solemnityAndFestivityParts: SolemnityAndFestivityParts,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): HoursLiturgy {
  const parts = solemnityAndFestivityParts;
  const yearType = liturgyDayInformation.yearType;
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.todayCelebrationInformation = parts.celebration;

  hoursLiturgy.invitation.invitationAntiphon = parts.invitationAntiphon;

  fillOffice(hoursLiturgy.office, {
    anthem: inLanguage(settings, parts.officeLatinAnthem, parts.officeCatalanAnthem),
    firstPsalm: parts.officeFirstPsalm,
    secondPsalm: parts.officeSecondPsalm,
    thirdPsalm: parts.officeThirdPsalm,
    responsory: parts.officeResponsory,
    firstReading: parts.officeFirstReading,
    secondReading: parts.officeSecondReading,
    teDeum: true,
    finalPrayer: parts.officeFinalPrayer,
  });

  fillLaudes(hoursLiturgy.laudes, {
    anthem: inLanguage(settings, parts.laudesLatinAnthem, parts.laudesCatalanAnthem),
    psalms: { antiphons: [parts.laudesFirstAntiphon, parts.laudesSecondAntiphon, parts.laudesThirdAntiphon] },
    shortReading: parts.laudesShortReading,
    shortResponsory: parts.laudesShortResponsory,
    evangelicalAntiphon: ofTheYear(
      yearType,
      parts.laudesEvangelicalAntiphonYearA,
      parts.laudesEvangelicalAntiphonYearB,
      parts.laudesEvangelicalAntiphonYearC,
    ),
    prayers: parts.laudesPrayers,
    finalPrayer: parts.laudesFinalPrayer,
  });

  fillMinorHours(
    hoursLiturgy.hours,
    { third: parts.thirdHourParts, sixth: parts.sixthHourParts, ninth: parts.ninthHourParts },
    [parts.hoursFirstPsalm, parts.hoursSecondPsalm, parts.hoursThirdPsalm],
    settings,
  );

  fillVespers(hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration, {
    anthem: inLanguage(settings, parts.secondVespersLatinAnthem, parts.secondVespersCatalanAnthem),
    firstPsalm: parts.secondVespersFirstPsalm,
    secondPsalm: parts.secondVespersSecondPsalm,
    thirdPsalm: parts.secondVespersThirdPsalm,
    shortReading: parts.secondVespersShortReading,
    shortResponsory: parts.secondVespersShortResponsory,
    evangelicalAntiphon: ofTheYear(
      yearType,
      parts.secondVespersEvangelicalAntiphonYearA,
      parts.secondVespersEvangelicalAntiphonYearB,
      parts.secondVespersEvangelicalAntiphonYearC,
    ),
    prayers: parts.secondVespersPrayers,
    finalPrayer: parts.secondVespersFinalPrayer,
  });

  return hoursLiturgy;
}

function getSpecialDayHoursLiturgy(specialDaysParts: SpecialDaysParts, settings: Settings): HoursLiturgy {
  const parts = specialDaysParts;
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.todayCelebrationInformation = parts.celebration;

  hoursLiturgy.invitation.invitationAntiphon = parts.invitationAntiphon;

  fillOffice(hoursLiturgy.office, {
    anthem: inLanguage(settings, parts.officeLatinAnthem, parts.officeCatalanAnthem),
    firstPsalm: parts.officeFirstPsalm,
    secondPsalm: parts.officeSecondPsalm,
    thirdPsalm: parts.officeThirdPsalm,
    responsory: parts.officeResponsory,
    firstReading: parts.officeFirstReading,
    secondReading: parts.officeSecondReading,
    teDeum: true,
    finalPrayer: parts.officeFinalPrayer,
  });

  fillLaudes(hoursLiturgy.laudes, {
    anthem: inLanguage(settings, parts.laudesLatinAnthem, parts.laudesCatalanAnthem),
    psalms: [parts.laudesFirstPsalm, parts.laudesSecondPsalm, parts.laudesThirdPsalm],
    shortReading: parts.laudesShortReading,
    shortResponsory: parts.laudesShortResponsory,
    evangelicalAntiphon: parts.laudesEvangelicalAntiphon,
    prayers: parts.laudesPrayers,
    finalPrayer: parts.laudesFinalPrayer,
  });

  fillMinorHours(
    hoursLiturgy.hours,
    { third: parts.thirdHourParts, sixth: parts.sixthHourParts, ninth: parts.ninthHourParts },
    [parts.hoursFirstPsalm, parts.hoursSecondPsalm, parts.hoursThirdPsalm],
    settings,
  );

  fillVespers(hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration, {
    anthem: inLanguage(settings, parts.secondVespersLatinAnthem, parts.secondVespersCatalanAnthem),
    firstPsalm: parts.secondVespersFirstPsalm,
    secondPsalm: parts.secondVespersSecondPsalm,
    thirdPsalm: parts.secondVespersThirdPsalm,
    shortReading: parts.secondVespersShortReading,
    shortResponsory: parts.secondVespersShortResponsory,
    evangelicalAntiphon: parts.secondVespersEvangelicalAntiphon,
    prayers: parts.secondVespersPrayers,
    finalPrayer: parts.secondVespersFinalPrayer,
  });

  return hoursLiturgy;
}

// A solemnity or feast of a saint: what it has of its own, and the rest from its common
function getSaintsSolemnitiesHoursLiturgy(saintsSolemnities: SaintsSolemnities, settings: Settings): HoursLiturgy {
  const saint = saintsSolemnities;
  const common = saint.commonOffices;
  const orCommon = <T>(own: T, textOf: (part: T) => string, fromCommon: (common: CommonOffice) => T) =>
    ownOrCommon(own, textOf, common, fromCommon);
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.todayCelebrationInformation = saint.celebration;

  hoursLiturgy.invitation.invitationAntiphon = orCommon(saint.invitationAntiphon, itself, (c) => c.invitationAntiphon);

  fillOffice(hoursLiturgy.office, {
    anthem: orCommon(inLanguage(settings, saint.officeLatinAnthem, saint.officeCatalanAnthem), itself, (c) =>
      inLanguage(settings, c.officeLatinAnthem, c.officeCatalanAnthem),
    ),
    firstPsalm: orCommon(saint.officeFirstPsalm, psalmText, (c) => c.officeFirstPsalm),
    secondPsalm: orCommon(saint.officeSecondPsalm, psalmText, (c) => c.officeSecondPsalm),
    thirdPsalm: orCommon(saint.officeThirdPsalm, psalmText, (c) => c.officeThirdPsalm),
    responsory: orCommon(
      saint.officeResponsory,
      (responsory) => responsory.versicle,
      (c) => c.officeResponsory,
    ),
    firstReading: orCommon(saint.officeFirstReading, readingText, (c) => c.officeFirstReading),
    secondReading: orCommon(saint.officeSecondReading, readingText, (c) => c.officeSecondReading),
    teDeum: true,
    finalPrayer: saint.officeFinalPrayer,
  });

  // The psalms of Lauds are always those of the common (in place: they are the common's objects),
  // and a saint with antiphons of its own puts them on them
  const laudes = hoursLiturgy.laudes;
  laudes.anthem = orCommon(inLanguage(settings, saint.laudesLatinAnthem, saint.laudesCatalanAnthem), itself, (c) =>
    inLanguage(settings, c.laudesLatinAnthem, c.laudesCatalanAnthem),
  );
  if (common) {
    laudes.firstPsalm = common.laudesFirstPsalm;
    laudes.secondPsalm = common.laudesSecondPsalm;
    laudes.thirdPsalm = common.laudesThirdPsalm;
  }
  if (StringManagement.hasLiturgyContent(saint.laudesFirstAntiphon)) {
    laudes.firstPsalm.antiphon = saint.laudesFirstAntiphon;
  }
  if (StringManagement.hasLiturgyContent(saint.laudesSecondAntiphon)) {
    laudes.secondPsalm.antiphon = saint.laudesSecondAntiphon;
  }
  if (StringManagement.hasLiturgyContent(saint.laudesThirdAntiphon)) {
    laudes.thirdPsalm.antiphon = saint.laudesThirdAntiphon;
  }
  laudes.shortReading = orCommon(saint.laudesShortReading, shortReadingText, (c) => c.laudesShortReading);
  laudes.shortResponsory = orCommon(saint.laudesShortResponsory, shortResponsoryText, (c) => c.laudesShortResponsory);
  laudes.evangelicalAntiphon = orCommon(saint.laudesEvangelicalAntiphon, itself, (c) => c.laudesEvangelicalAntiphon);
  laudes.prayers = orCommon(saint.laudesPrayers, itself, (c) => c.laudesPrayers);
  laudes.finalPrayer = saint.laudesFinalPrayer;

  fillMinorHours(
    hoursLiturgy.hours,
    { third: saint.thirdHourParts, sixth: saint.sixthHourParts, ninth: saint.ninthHourParts },
    [saint.hoursFirstPsalm, saint.hoursSecondPsalm, saint.hoursThirdPsalm],
    settings,
    common,
  );

  fillVespers(hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration, {
    anthem: orCommon(
      inLanguage(settings, saint.secondVespersLatinAnthem, saint.secondVespersCatalanAnthem),
      itself,
      (c) => inLanguage(settings, c.secondVespersLatinAnthem, c.secondVespersCatalanAnthem),
    ),
    firstPsalm: orCommon(saint.secondVespersFirstPsalm, psalmText, (c) => c.secondVespersFirstPsalm),
    secondPsalm: orCommon(saint.secondVespersSecondPsalm, psalmText, (c) => c.secondVespersSecondPsalm),
    thirdPsalm: orCommon(saint.secondVespersThirdPsalm, psalmText, (c) => c.secondVespersThirdPsalm),
    shortReading: orCommon(saint.secondVespersShortReading, shortReadingText, (c) => c.secondVespersShortReading),
    shortResponsory: orCommon(
      saint.secondVespersShortResponsory,
      shortResponsoryText,
      (c) => c.secondVespersShortResponsory,
    ),
    evangelicalAntiphon: orCommon(
      saint.secondVespersEvangelicalAntiphon,
      itself,
      (c) => c.secondVespersEvangelicalAntiphon,
    ),
    prayers: orCommon(saint.secondVespersPrayers, itself, (c) => c.secondVespersPrayers),
    finalPrayer: orCommon(saint.secondVespersFinalPrayer, itself, (c) => c.secondVespersFinalPrayer),
  });

  return hoursLiturgy;
}

// A memorial of a saint: what it has of its own, and the rest from its common. Unlike the
// solemnities, the versicle of the Office (responsory) never comes from the common: on memorials the
// psalmody is the weekday's, and the versicle goes with it (OGLH 235). Without one of its own, the
// Office takes the weekday's (officeService.getResponsory).
function getSaintsMemoriesHoursLiturgy(saintsMemories: SaintsMemories, settings: Settings): HoursLiturgy {
  const saint = saintsMemories;
  const common = saint.commonOffices;
  const orCommon = <T>(own: T, textOf: (part: T) => string, fromCommon: (common: CommonOffice) => T) =>
    ownOrCommon(own, textOf, common, fromCommon);
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.todayCelebrationInformation = saint.celebration;

  hoursLiturgy.invitation.invitationAntiphon = orCommon(saint.invitationAntiphon, itself, (c) => c.invitationAntiphon);

  fillOffice(hoursLiturgy.office, {
    anthem: orCommon(inLanguage(settings, saint.officeLatinAnthem, saint.officeCatalanAnthem), itself, (c) =>
      inLanguage(settings, c.officeLatinAnthem, c.officeCatalanAnthem),
    ),
    firstPsalm: orCommon(saint.officeFirstPsalm, psalmText, (c) => c.officeFirstPsalm),
    secondPsalm: orCommon(saint.officeSecondPsalm, psalmText, (c) => c.officeSecondPsalm),
    thirdPsalm: orCommon(saint.officeThirdPsalm, psalmText, (c) => c.officeThirdPsalm),
    responsory: saint.officeResponsory,
    firstReading: orCommon(saint.officeFirstReading, readingText, (c) => c.officeFirstReading),
    secondReading: orCommon(saint.officeSecondReading, readingText, (c) => c.officeSecondReading),
    teDeum: false,
    finalPrayer: saint.officeFinalPrayer,
  });

  fillLaudes(hoursLiturgy.laudes, {
    anthem: orCommon(inLanguage(settings, saint.laudesLatinAnthem, saint.laudesCatalanAnthem), itself, (c) =>
      inLanguage(settings, c.laudesLatinAnthem, c.laudesCatalanAnthem),
    ),
    psalms: [
      orCommon(saint.laudesFirstPsalm, psalmText, (c) => c.laudesFirstPsalm),
      orCommon(saint.laudesSecondPsalm, psalmText, (c) => c.laudesSecondPsalm),
      orCommon(saint.laudesThirdPsalm, psalmText, (c) => c.laudesThirdPsalm),
    ],
    shortReading: orCommon(saint.laudesShortReading, shortReadingText, (c) => c.laudesShortReading),
    shortResponsory: orCommon(saint.laudesShortResponsory, shortResponsoryText, (c) => c.laudesShortResponsory),
    evangelicalAntiphon: orCommon(saint.laudesEvangelicalAntiphon, itself, (c) => c.laudesEvangelicalAntiphon),
    prayers: orCommon(saint.laudesPrayers, itself, (c) => c.laudesPrayers),
    finalPrayer: saint.laudesFinalPrayer,
  });

  fillMinorHours(
    hoursLiturgy.hours,
    { third: saint.thirdHourParts, sixth: saint.sixthHourParts, ninth: saint.ninthHourParts },
    [saint.hoursFirstPsalm, saint.hoursSecondPsalm, saint.hoursThirdPsalm],
    settings,
    common,
  );

  fillVespers(hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration, {
    anthem: orCommon(inLanguage(settings, saint.vespersLatinAnthem, saint.vespersCatalanAnthem), itself, (c) =>
      inLanguage(settings, c.secondVespersLatinAnthem, c.secondVespersCatalanAnthem),
    ),
    firstPsalm: orCommon(saint.vespersFirstPsalm, psalmText, (c) => c.secondVespersFirstPsalm),
    secondPsalm: orCommon(saint.vespersSecondPsalm, psalmText, (c) => c.secondVespersSecondPsalm),
    thirdPsalm: orCommon(saint.vespersThirdPsalm, psalmText, (c) => c.secondVespersThirdPsalm),
    shortReading: orCommon(saint.vespersShortReading, shortReadingText, (c) => c.secondVespersShortReading),
    shortResponsory: orCommon(saint.vespersShortResponsory, shortResponsoryText, (c) => c.secondVespersShortResponsory),
    evangelicalAntiphon: orCommon(saint.vespersEvangelicalAntiphon, itself, (c) => c.secondVespersEvangelicalAntiphon),
    prayers: orCommon(saint.vespersPrayers, itself, (c) => c.secondVespersPrayers),
    finalPrayer: orCommon(saint.vespersFinalPrayer, itself, (c) => c.secondVespersFinalPrayer),
  });

  return hoursLiturgy;
}

// --- The first Vespers of tomorrow's celebration ----------------------------------------------------

function getSolemnityAndFestivityFirstVespersOfTomorrow(
  solemnityAndFestivityParts: SolemnityAndFestivityParts,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  const parts = solemnityAndFestivityParts;
  let vespers = new Vespers();
  vespers.title = parts.celebration.title;
  fillVespers(vespers, {
    anthem: inLanguage(settings, parts.firstVespersLatinAnthem, parts.firstVespersCatalanAnthem),
    firstPsalm: parts.firstVespersFirstPsalm,
    secondPsalm: parts.firstVespersSecondPsalm,
    thirdPsalm: parts.firstVespersThirdPsalm,
    shortReading: parts.firstVespersShortReading,
    shortResponsory: parts.firstVespersShortResponsory,
    evangelicalAntiphon: ofTheYear(
      liturgyDayInformation.yearType,
      parts.firstVespersEvangelicalAntiphonYearA,
      parts.firstVespersEvangelicalAntiphonYearB,
      parts.firstVespersEvangelicalAntiphonYearC,
    ),
    prayers: parts.firstVespersPrayers,
    finalPrayer: parts.firstVespersFinalPrayer,
  });
  return vespers;
}

function getSpecialDaysFirstVespersOfTomorrow(
  specialDaysParts: SpecialDaysParts,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  const parts = specialDaysParts;
  let vespers = new Vespers();
  vespers.title = parts.celebration.title;
  fillVespers(vespers, {
    anthem: inLanguage(settings, parts.firstVespersLatinAnthem, parts.firstVespersCatalanAnthem),
    firstPsalm: parts.firstVespersFirstPsalm,
    secondPsalm: parts.firstVespersSecondPsalm,
    thirdPsalm: parts.firstVespersThirdPsalm,
    shortReading: parts.firstVespersShortReading,
    shortResponsory: parts.firstVespersShortResponsory,
    evangelicalAntiphon: ofTheYear(
      liturgyDayInformation.yearType,
      parts.firstVespersEvangelicalAntiphonYearA,
      parts.firstVespersEvangelicalAntiphonYearB,
      parts.firstVespersEvangelicalAntiphonYearC,
    ),
    prayers: parts.firstVespersPrayers,
    finalPrayer: parts.firstVespersFinalPrayer,
  });
  return vespers;
}

// The first Vespers of a saint: its own, and the rest from its common. The final prayer is always
// its own.
function getSaintsSolemnitiesFirstVespersOfTomorrow(
  saintsSolemnities: SaintsSolemnities,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  const saint = saintsSolemnities;
  const common = saint.commonOffices;
  const orCommon = <T>(own: T, textOf: (part: T) => string, fromCommon: (common: CommonOffice) => T) =>
    ownOrCommon(own, textOf, common, fromCommon);
  let vespers = new Vespers();
  vespers.title = saint.celebration.title;
  fillVespers(vespers, {
    anthem: orCommon(
      inLanguage(settings, saint.firstVespersLatinAnthem, saint.firstVespersCatalanAnthem),
      itself,
      (c) => inLanguage(settings, c.firstVespersLatinAnthem, c.firstVespersCatalanAnthem),
    ),
    firstPsalm: orCommon(saint.firstVespersFirstPsalm, psalmText, (c) => c.firstVespersFirstPsalm),
    secondPsalm: orCommon(saint.firstVespersSecondPsalm, psalmText, (c) => c.firstVespersSecondPsalm),
    thirdPsalm: orCommon(saint.firstVespersThirdPsalm, psalmText, (c) => c.firstVespersThirdPsalm),
    shortReading: orCommon(saint.firstVespersShortReading, shortReadingText, (c) => c.firstVespersShortReading),
    shortResponsory: orCommon(
      saint.firstVespersShortResponsory,
      shortResponsoryText,
      (c) => c.firstVespersShortResponsory,
    ),
    evangelicalAntiphon: orCommon(
      saint.firstVespersEvangelicalAntiphon,
      itself,
      (c) => c.firstVespersEvangelicalAntiphon,
    ),
    prayers: orCommon(saint.firstVespersPrayers, itself, (c) => c.firstVespersPrayers),
    finalPrayer: saint.firstVespersFinalPrayer,
  });
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
  vespers.anthem = inLanguage(
    settings,
    commonPartsOfHolyWeek.vespersLatinAnthem,
    commonPartsOfHolyWeek.vespersCatalanAnthem,
  );
  vespers.firstPsalm.antiphon = palmSundayParts.firstVespersFirstAntiphon;
  vespers.secondPsalm.antiphon = palmSundayParts.firstVespersSecondAntiphon;
  vespers.thirdPsalm.antiphon = palmSundayParts.firstVespersThirdAntiphon;
  vespers.shortReading = palmSundayParts.firstVespersShortReading;
  vespers.shortResponsory = palmSundayParts.firstVespersShortResponsory;
  vespers.evangelicalAntiphon = ofTheYear(
    liturgyDayInformation.yearType,
    palmSundayParts.firstVespersEvangelicalAntiphonYearA,
    palmSundayParts.firstVespersEvangelicalAntiphonYearB,
    palmSundayParts.firstVespersEvangelicalAntiphonYearC,
  );
  vespers.prayers = palmSundayParts.firstVespersPrayers;
  vespers.finalPrayer = palmSundayParts.firstVespersFinalPrayer;
  return vespers;
}

function getEasterTriduumFistVespersOfTomorrow(
  partsOfEasterTriduum: PartsOfEasterTriduum,
  settings: Settings,
): Vespers {
  const parts = partsOfEasterTriduum;
  let vespers = new Vespers();
  vespers.title = 'Tridu Pasqual';
  fillVespers(vespers, {
    anthem: inLanguage(settings, parts.vespersLatinAnthem, parts.vespersCatalanAnthem),
    firstPsalm: parts.vespersFirstPsalm,
    secondPsalm: parts.vespersSecondPsalm,
    thirdPsalm: parts.vespersThirdPsalm,
    shortReading: parts.vespersShortReading,
    shortResponsory: parts.vespersShortResponsory,
    evangelicalAntiphon: parts.vespersEvangelicalAntiphon,
    prayers: parts.vespersPrayers,
    finalPrayer: parts.vespersFinalPrayer,
  });
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
  vespers.anthem = inLanguage(
    settings,
    commonAdventAndChristmasParts.vespersLatinAnthem,
    commonAdventAndChristmasParts.vespersCatalanAnthem,
  );
  vespers.firstPsalm.antiphon = adventSundayParts.firstVespersFirstAntiphon;
  vespers.secondPsalm.antiphon = adventSundayParts.firstVespersSecondAntiphon;
  vespers.thirdPsalm.antiphon = adventSundayParts.firstVespersThirdAntiphon;
  vespers.shortReading = adventWeekParts.vespersShortReading;
  vespers.shortResponsory = adventWeekParts.vespersShortResponsory;
  vespers.evangelicalAntiphon = ofTheYear(
    liturgyDayInformation.yearType,
    adventSundayParts.firstVespersEvangelicalAntiphonYearA,
    adventSundayParts.firstVespersEvangelicalAntiphonYearB,
    adventSundayParts.firstVespersEvangelicalAntiphonYearC,
  );
  vespers.prayers = adventWeekParts.vespersPrayers;
  vespers.finalPrayer = adventWeekParts.vespersFinalPrayer;
  return vespers;
}
