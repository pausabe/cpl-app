import { LiturgySpecificDayInformation } from '../models/LiturgyDayInformation';
import { CelebrationType } from './databaseEnums';
import { SpecificLiturgyTimeType } from './celebrationTimeEnums';
import { DateManagement } from '../utils/DateManagement';
import { Settings } from '../models/Settings';
import { DioceseName } from './SettingsService';

export enum Celebration {
  Assumption,
  ImmaculateConception,
  SaintJoseph,
  SaintTecla,
  MatherOfGodOfMerce,
  SaintsPereAndPau,
  SaintJames,
  SaintJohnBaptist,
  AllSaints,
  SaintJohn,
  SaintEulalia,
  DedicationSantJoanLatera,
  ExaltationHolyCross,
  LordTransfiguration,
  LordPresentation,
  Epiphany,
  Baptism,
  MatherOfGod,
  Christmas,
  Pentecost,
  HolyHeartOfJesus,
  HolyBodyAndBloodOfChrist,
  HolyTrinity,
  BodyAndBlood,
  SacredHeartOfJesus,
  OurLordJesusChrist,
  AshWednesday,
  ImmaculateHeartOfTheBlessedVirginMary,
  MotherOfGodFromTheTibbon,
  JesusChristHighPriestForever,
  BlessedVirginMaryMotherOfTheChurch,
  Ascension,
  SacredFamily,
}

export function checkCelebration(
  celebration: Celebration,
  liturgySpecificDayInformation: LiturgySpecificDayInformation,
  settings?: Settings,
): boolean {
  const dateWhenNotMoved = liturgySpecificDayInformation.date;
  const dateWhenMoved = liturgySpecificDayInformation.movedDay.originDate;
  const todayWeCelebrateAMovedDay = dateWhenMoved !== undefined;

  let isCelebrationWhenNotMoved = false;
  let isCelebrationWhenMoved = false;
  let isCelebrationThatCantBeMoved = false;

  switch (celebration) {
    // Can be moved
    case Celebration.Assumption:
      isCelebrationWhenNotMoved = isAssumption(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isAssumption(dateWhenMoved);
      break;
    case Celebration.ImmaculateConception:
      isCelebrationWhenNotMoved = isImmaculateConception(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isImmaculateConception(dateWhenMoved);
      break;
    case Celebration.SaintJoseph:
      isCelebrationWhenNotMoved = isSaintJoseph(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isSaintJoseph(dateWhenMoved);
      break;
    case Celebration.SaintTecla:
      isCelebrationWhenNotMoved = isSaintTecla(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isSaintTecla(dateWhenMoved);
      break;
    case Celebration.MatherOfGodOfMerce:
      isCelebrationWhenNotMoved = isMatherOfGodOfMerce(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isMatherOfGodOfMerce(dateWhenMoved);
      break;
    case Celebration.SaintsPereAndPau:
      isCelebrationWhenNotMoved = isSaintsPereAndPau(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isSaintsPereAndPau(dateWhenMoved);
      break;
    case Celebration.SaintJames:
      isCelebrationWhenNotMoved = isSaintJames(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isSaintJames(dateWhenMoved);
      break;
    case Celebration.SaintJohnBaptist:
      isCelebrationWhenNotMoved = isSaintJohnBaptist(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isSaintJohnBaptist(dateWhenMoved);
      break;
    case Celebration.AllSaints:
      isCelebrationWhenNotMoved = isAllSaints(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isAllSaints(dateWhenMoved);
      break;
    case Celebration.SaintJohn:
      isCelebrationWhenNotMoved = isSaintJohn(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isSaintJohn(dateWhenMoved);
      break;
    case Celebration.SaintEulalia:
      isCelebrationWhenNotMoved = isSaintEulalia(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isSaintEulalia(dateWhenMoved);
      break;
    case Celebration.DedicationSantJoanLatera:
      isCelebrationWhenNotMoved = isDedicationSantJoanLatera(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isDedicationSantJoanLatera(dateWhenMoved);
      break;
    case Celebration.ExaltationHolyCross:
      isCelebrationWhenNotMoved = isExaltationHolyCross(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isExaltationHolyCross(dateWhenMoved);
      break;
    case Celebration.LordTransfiguration:
      isCelebrationWhenNotMoved = isLordTransfiguration(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isLordTransfiguration(dateWhenMoved);
      break;
    case Celebration.LordPresentation:
      isCelebrationWhenNotMoved = isLordPresentation(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isLordPresentation(dateWhenMoved);
      break;
    case Celebration.Epiphany:
      isCelebrationWhenNotMoved = isEpiphany(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isEpiphany(dateWhenMoved);
      break;
    case Celebration.Baptism:
      isCelebrationWhenNotMoved = isBaptism(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isBaptism(dateWhenMoved);
      break;
    case Celebration.MatherOfGod:
      isCelebrationWhenNotMoved = isMatherOfGod(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isMatherOfGod(dateWhenMoved);
      break;
    case Celebration.Christmas:
      isCelebrationWhenNotMoved = isChristmas(dateWhenNotMoved);
      isCelebrationWhenMoved = todayWeCelebrateAMovedDay && isChristmas(dateWhenMoved);
      break;

    // Never will be moved
    case Celebration.HolyHeartOfJesus:
      isCelebrationWhenNotMoved = isHolyHeartOfJesus(liturgySpecificDayInformation);
      isCelebrationThatCantBeMoved = isCelebrationWhenNotMoved;
      break;
    case Celebration.Pentecost:
      isCelebrationWhenNotMoved = isPentecost(liturgySpecificDayInformation);
      isCelebrationThatCantBeMoved = isCelebrationWhenNotMoved;
      break;
    case Celebration.HolyBodyAndBloodOfChrist:
      isCelebrationWhenNotMoved = isHolyBodyAndBloodOfChrist(liturgySpecificDayInformation);
      isCelebrationThatCantBeMoved = isCelebrationWhenNotMoved;
      break;
    case Celebration.HolyTrinity:
      isCelebrationWhenNotMoved = isHolyTrinity(liturgySpecificDayInformation);
      isCelebrationThatCantBeMoved = isCelebrationWhenNotMoved;
      break;
    case Celebration.BodyAndBlood:
      isCelebrationWhenNotMoved = isBodyAndBlood(liturgySpecificDayInformation);
      isCelebrationThatCantBeMoved = isCelebrationWhenNotMoved;
      break;
    case Celebration.SacredHeartOfJesus:
      isCelebrationWhenNotMoved = isSacredHeartOfJesus(liturgySpecificDayInformation);
      isCelebrationThatCantBeMoved = isCelebrationWhenNotMoved;
      break;
    case Celebration.OurLordJesusChrist:
      isCelebrationWhenNotMoved = isOurLordJesusChrist(liturgySpecificDayInformation);
      isCelebrationThatCantBeMoved = isCelebrationWhenNotMoved;
      break;
    case Celebration.AshWednesday:
      isCelebrationWhenNotMoved = isAshWednesday(liturgySpecificDayInformation);
      isCelebrationThatCantBeMoved = isCelebrationWhenNotMoved;
      break;
    case Celebration.ImmaculateHeartOfTheBlessedVirginMary:
      isCelebrationWhenNotMoved = isImmaculateHeartOfTheBlessedVirginMary(liturgySpecificDayInformation);
      isCelebrationThatCantBeMoved = isCelebrationWhenNotMoved;
      break;
    case Celebration.MotherOfGodFromTheTibbon:
      isCelebrationWhenNotMoved = isMotherOfGodFromTheTibbon(liturgySpecificDayInformation.date, settings);
      isCelebrationThatCantBeMoved = isCelebrationWhenNotMoved;
      break;
    case Celebration.JesusChristHighPriestForever:
      isCelebrationWhenNotMoved = isJesusChristHighPriestForever(liturgySpecificDayInformation);
      isCelebrationThatCantBeMoved = isCelebrationWhenNotMoved;
      break;
    case Celebration.BlessedVirginMaryMotherOfTheChurch:
      isCelebrationWhenNotMoved = isBlessedVirginMaryMotherOfTheChurch(liturgySpecificDayInformation);
      isCelebrationThatCantBeMoved = isCelebrationWhenNotMoved;
      break;
    case Celebration.Ascension:
      isCelebrationWhenNotMoved = isAscension(liturgySpecificDayInformation);
      isCelebrationThatCantBeMoved = isCelebrationWhenNotMoved;
      break;
    case Celebration.SacredFamily:
      isCelebrationWhenNotMoved = isSacredFamily(liturgySpecificDayInformation.date);
      isCelebrationThatCantBeMoved = isCelebrationWhenNotMoved;
      break;
  }

  if (todayWeCelebrateAMovedDay) {
    return isCelebrationWhenMoved;
  }

  // The following variable is used to help the situation
  //  of having 2 celebrations in the same day and we want to move one of them but celebrate the other.
  // For example, if today is 26-may 2024 in SF will be in a HolyTrinity Sunday but also SF Cathedral Celebration.
  // In this case, we want to move the Cathedral Celebration but celebrate HolyTrinity.
  let todayIsMovedButAlsoIsCelebrationThatCantBeMoved =
    liturgySpecificDayInformation.movedDay.todayIsMoved && isCelebrationThatCantBeMoved;

  if (liturgySpecificDayInformation.movedDay.todayIsMoved && !todayIsMovedButAlsoIsCelebrationThatCantBeMoved) {
    return false;
  }

  return isCelebrationWhenNotMoved;
}

export function getSaturdayBeforePentecostDate(liturgySpecificDayInformation: LiturgySpecificDayInformation): Date {
  let saturdayBeforePentecost = new Date(
    liturgySpecificDayInformation.pentecostDay.getFullYear(),
    liturgySpecificDayInformation.pentecostDay.getMonth(),
    liturgySpecificDayInformation.pentecostDay.getDate(),
  );
  saturdayBeforePentecost.setDate(saturdayBeforePentecost.getDate() - 1);
  return saturdayBeforePentecost;
}

export function getMondayAfterEasterOctaveDate(liturgySpecificDayInformation: LiturgySpecificDayInformation): Date {
  let mondayAfterEasterOctave = new Date(
    liturgySpecificDayInformation.pentecostDay.getFullYear(),
    liturgySpecificDayInformation.pentecostDay.getMonth(),
    liturgySpecificDayInformation.pentecostDay.getDate(),
  );
  mondayAfterEasterOctave.setDate(mondayAfterEasterOctave.getDate() - 41);
  return mondayAfterEasterOctave;
}

export function getSaturdayAfterEpiphanyDate(liturgySpecificDayInformation: LiturgySpecificDayInformation): Date {
  let saturdayAfterEpiphany = new Date(liturgySpecificDayInformation.date.getFullYear(), 0, 6);
  if (saturdayAfterEpiphany.getDay() === 6) {
    saturdayAfterEpiphany.setDate(saturdayAfterEpiphany.getDate() + 1);
  }
  while (saturdayAfterEpiphany.getDay() !== 6) {
    saturdayAfterEpiphany.setDate(saturdayAfterEpiphany.getDate() + 1);
  }
  return saturdayAfterEpiphany;
}

export function getSacredFamily(fullYear: number): Date {
  let sacredFamily: Date;
  for (let i = 26; i <= 31; i++) {
    sacredFamily = new Date(fullYear, 11, i);
    if (sacredFamily.getDay() === 0) {
      return sacredFamily;
    }
  }
  // There is this weird rule that if Christmas is in Sunday then SacredFamily will be the 30th
  return new Date(fullYear, 11, 30);
}

export function getSecondSundayAfterChristmas(date: Date): Date {
  // From a week after christmas to first sunday = second sunday
  let dateIterator = new Date(date.getFullYear(), 0, 1);
  while (dateIterator.getDay() !== 0) {
    dateIterator.setDate(dateIterator.getDate() + 1);
  }
  return dateIterator;
}

// The following celebrations can be moved for precedence purposes

function isAssumption(date: Date): boolean {
  return date.getMonth() === 7 && date.getDate() === 15;
}

function isImmaculateConception(date: Date): boolean {
  return date.getMonth() === 11 && date.getDate() === 8;
}

function isSaintJoseph(date: Date) {
  return date.getMonth() === 2 && date.getDate() === 19;
}

function isSaintTecla(date: Date): boolean {
  return date.getMonth() === 8 && date.getDate() === 23;
}

function isMatherOfGodOfMerce(date: Date): boolean {
  return date.getMonth() === 8 && date.getDate() === 24;
}

function isSaintsPereAndPau(date: Date): boolean {
  return date.getMonth() === 5 && date.getDate() === 29;
}

function isSaintJames(date: Date): boolean {
  return date.getMonth() === 6 && date.getDate() === 25;
}

function isSaintJohnBaptist(date: Date): boolean {
  return date.getMonth() === 5 && date.getDate() === 24;
}

function isAllSaints(date: Date): boolean {
  return date.getMonth() === 10 && date.getDate() === 1;
}

function isSaintJohn(date: Date): boolean {
  return date.getMonth() === 5 && date.getDate() === 24;
}

function isSaintEulalia(date: Date): boolean {
  return date.getMonth() === 1 && date.getDate() === 12;
}

function isDedicationSantJoanLatera(date: Date): boolean {
  return date.getMonth() === 10 && date.getDate() === 9;
}

function isExaltationHolyCross(date: Date): boolean {
  return date.getMonth() === 8 && date.getDate() === 14;
}

function isLordTransfiguration(date: Date): boolean {
  return date.getMonth() === 7 && date.getDate() === 6;
}

function isLordPresentation(date: Date): boolean {
  return date.getMonth() === 1 && date.getDate() === 2;
}

function isEpiphany(date: Date): boolean {
  return date.getDate() === 6 && date.getMonth() === 0;
}

function isChristmas(date: Date): boolean {
  return date.getDate() === 25 && date.getMonth() === 11;
}

function isBaptism(date: Date): boolean {
  if (date.getMonth() !== 0) return false;
  if (date.getDay() !== 0) return false;
  return !(date.getDate() < 7 || date.getDate() > 13);
}

function isMatherOfGod(date: Date): boolean {
  return date.getMonth() === 0 && date.getDate() === 1;
}

// The following celebrations can't be moved for precedence purposes

function isPentecost(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
  return DateManagement.datesAreTheEqual(
    liturgySpecificDayInformation.date,
    liturgySpecificDayInformation.pentecostDay,
  );
}

function isHolyHeartOfJesus(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
  //Divendres de la tercera setmana després de Pentecosta (Divendres després de Corpus) A (166) B (167) C (168)
  //Sagrat cor de Jesús
  const holyHeartOfJesus = new Date(
    liturgySpecificDayInformation.pentecostDay.getFullYear(),
    liturgySpecificDayInformation.pentecostDay.getMonth(),
    liturgySpecificDayInformation.pentecostDay.getDate() + 19,
  );
  return DateManagement.datesAreTheEqual(liturgySpecificDayInformation.date, holyHeartOfJesus);
}

function isHolyBodyAndBloodOfChrist(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
  //Diumenge després de la Santíssima Trinitat A (163) B (164) C (165)
  //Santíssim cos i sang de crist
  const holyBodyAndBloodOfChrist = new Date(
    liturgySpecificDayInformation.pentecostDay.getFullYear(),
    liturgySpecificDayInformation.pentecostDay.getMonth(),
    liturgySpecificDayInformation.pentecostDay.getDate() + 14,
  );
  return DateManagement.datesAreTheEqual(liturgySpecificDayInformation.date, holyBodyAndBloodOfChrist);
}

function isHolyTrinity(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
  //Diumenge després de Pentecosta A (160) B (161) C (162)
  const holyTrinity = getHolyTrinity(liturgySpecificDayInformation);
  return DateManagement.datesAreTheEqual(liturgySpecificDayInformation.date, holyTrinity);
}

function getHolyTrinity(liturgySpecificDayInformation: LiturgySpecificDayInformation): Date {
  return new Date(
    liturgySpecificDayInformation.pentecostDay.getFullYear(),
    liturgySpecificDayInformation.pentecostDay.getMonth(),
    liturgySpecificDayInformation.pentecostDay.getDate() + 7,
  );
}

function isBodyAndBlood(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
  const bodyAndBlood = getBodyAndBlood(liturgySpecificDayInformation);
  return DateManagement.datesAreTheEqual(liturgySpecificDayInformation.date, bodyAndBlood);
}

function getBodyAndBlood(liturgySpecificDayInformation: LiturgySpecificDayInformation): Date {
  const holyTrinity = getHolyTrinity(liturgySpecificDayInformation);
  return new Date(holyTrinity.getFullYear(), holyTrinity.getMonth(), holyTrinity.getDate() + 7);
}

function isSacredHeartOfJesus(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
  const bodyAndBlood = getBodyAndBlood(liturgySpecificDayInformation);
  const sacredHeartOfJesus = new Date(bodyAndBlood.getFullYear(), bodyAndBlood.getMonth(), bodyAndBlood.getDate() + 5);
  return DateManagement.datesAreTheEqual(liturgySpecificDayInformation.date, sacredHeartOfJesus);
}

function isOurLordJesusChrist(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
  return (
    liturgySpecificDayInformation.date.getDay() === 0 &&
    liturgySpecificDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary &&
    liturgySpecificDayInformation.week === '34'
  );
}

function isAshWednesday(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
  return (
    liturgySpecificDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.LentAshes &&
    liturgySpecificDayInformation.dayOfTheWeek === 3
  );
}

function isImmaculateHeartOfTheBlessedVirginMary(
  liturgySpecificDayInformation: LiturgySpecificDayInformation,
): boolean {
  //santsMemories M - dissabte de la tercera setmana després de Pentecosta (COR IMMACULAT DE LA BENAURADA VERGE MARIA)
  if (liturgySpecificDayInformation.celebrationType === CelebrationType.Memory) {
    let corImmaculat = new Date(
      liturgySpecificDayInformation.pentecostDay.getFullYear(),
      liturgySpecificDayInformation.pentecostDay.getMonth(),
      liturgySpecificDayInformation.pentecostDay.getDate() + 20,
    );
    if (
      liturgySpecificDayInformation.date.getDate() === corImmaculat.getDate() &&
      liturgySpecificDayInformation.date.getMonth() === corImmaculat.getMonth() &&
      liturgySpecificDayInformation.date.getFullYear() === corImmaculat.getFullYear()
    ) {
      return true;
    }
  }
  return false;
}

function isMotherOfGodFromTheTibbon(date: Date, settings?: Settings): boolean {
  //santsMemories M - dissabte abans del primer diumenge de setembre (MARE DE DÉU DE LA CINTA)
  //santsSolemnitats S - dissabte abans del primer diumenge de setembre (MARE DE DÉU DE LA CINTA)
  // This celebration is specific to the Diocese of Tortosa
  if (settings && settings.dioceseName !== DioceseName.Tortosa) {
    return false;
  }
  const auxDay = new Date(date.getFullYear(), 8, 2);
  let b = true;
  let dies = 0;
  while (b && dies < 7) {
    if (auxDay.getDay() === 0) {
      b = false;
    }
    auxDay.setDate(auxDay.getDate() + 1);
    dies += 1;
  }
  const tibbonDate = new Date(date.getFullYear(), 8, dies);
  return DateManagement.datesAreTheEqual(date, tibbonDate);
}

function isJesusChristHighPriestForever(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
  //santsSolemnitats F - dijous després de Pentecosta (Jesucrist, gran sacerdot per sempre)
  if (liturgySpecificDayInformation.celebrationType === CelebrationType.Festivity) {
    const granSacerdot = new Date(
      liturgySpecificDayInformation.pentecostDay.getFullYear(),
      liturgySpecificDayInformation.pentecostDay.getMonth(),
      liturgySpecificDayInformation.pentecostDay.getDate() + 4,
    );
    if (DateManagement.datesAreTheEqual(liturgySpecificDayInformation.date, granSacerdot)) {
      return true;
    }
  }
  return false;
}

function isBlessedVirginMaryMotherOfTheChurch(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
  //santsMemories M - dilluns després de Pentecosta (Benaurada Verge Maria, Mare de l’Església)
  if (liturgySpecificDayInformation.celebrationType === CelebrationType.Memory) {
    const benaurada = new Date(
      liturgySpecificDayInformation.pentecostDay.getFullYear(),
      liturgySpecificDayInformation.pentecostDay.getMonth(),
      liturgySpecificDayInformation.pentecostDay.getDate() + 1,
    );
    if (DateManagement.datesAreTheEqual(liturgySpecificDayInformation.date, benaurada)) {
      return true;
    }
  }
  return false;
}

function isAscension(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
  return (
    liturgySpecificDayInformation.date.getDay() === 0 &&
    liturgySpecificDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks &&
    liturgySpecificDayInformation.week === '7'
  );
}

function isSacredFamily(date: Date): boolean {
  const sacredFamilyDate = getSacredFamily(date.getFullYear());
  return DateManagement.datesAreTheEqual(date, sacredFamilyDate);
}
