import { LiturgySpecificDayInformation } from '../models/LiturgyDayInformation';
import * as CelebrationIdentifierService from './celebrationIdentifierService';
import { Celebration } from './celebrationIdentifierService';
import { CelebrationSpecificClassification, CelebrationType } from './databaseEnums';
import { GenericLiturgyTimeType, SpecificLiturgyTimeType } from './celebrationTimeEnums';
import CelebrationInformation from '../models/hours-liturgy/CelebrationInformation';
import * as Logger from '../utils/logger';
import { LogKeys } from '../utils/logger';
import { DateManagement } from '../utils/DateManagement';

export function obtainPrecedenceByLiturgyTime(
  dateLiturgyInformation: LiturgySpecificDayInformation,
  celebrationInformation: CelebrationInformation,
): number {
  if (
    dateLiturgyInformation.specificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum ||
    dateLiturgyInformation.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday
  ) {
    return 1;
  }
  if (
    CelebrationIdentifierService.checkCelebration(Celebration.Christmas, dateLiturgyInformation) ||
    CelebrationIdentifierService.checkCelebration(Celebration.Epiphany, dateLiturgyInformation) ||
    CelebrationIdentifierService.checkCelebration(Celebration.Ascension, dateLiturgyInformation) ||
    CelebrationIdentifierService.checkCelebration(Celebration.Pentecost, dateLiturgyInformation) ||
    CelebrationIdentifierService.checkCelebration(Celebration.AshWednesday, dateLiturgyInformation) ||
    (dateLiturgyInformation.dayOfTheWeek === 0 &&
      (dateLiturgyInformation.genericLiturgyTime === GenericLiturgyTimeType.Advent ||
        dateLiturgyInformation.genericLiturgyTime === GenericLiturgyTimeType.Lent ||
        dateLiturgyInformation.genericLiturgyTime === GenericLiturgyTimeType.Easter)) ||
    (dateLiturgyInformation.celebrationType === CelebrationType.Fair &&
      dateLiturgyInformation.specificLiturgyTime === SpecificLiturgyTimeType.HolyWeek &&
      dateLiturgyInformation.dayOfTheWeek >= 1 &&
      dateLiturgyInformation.dayOfTheWeek <= 4) ||
    dateLiturgyInformation.specificLiturgyTime === SpecificLiturgyTimeType.EasterOctave
  ) {
    return 2;
  }
  if (
    (dateLiturgyInformation.celebrationType === CelebrationType.Solemnity &&
      (celebrationInformation.specificClassification === CelebrationSpecificClassification.Lord ||
        celebrationInformation.specificClassification === CelebrationSpecificClassification.MotherOfGod ||
        celebrationInformation.specificClassification === CelebrationSpecificClassification.Generic)) ||
    CelebrationIdentifierService.checkCelebration(Celebration.AllSaints, dateLiturgyInformation)
  ) {
    return 3;
  }
  if (
    dateLiturgyInformation.celebrationType === CelebrationType.Solemnity &&
    celebrationInformation.specificClassification === CelebrationSpecificClassification.Own
  ) {
    return 4;
  }
  if (
    dateLiturgyInformation.celebrationType === CelebrationType.Festivity &&
    celebrationInformation.specificClassification === CelebrationSpecificClassification.Lord
  ) {
    return 5;
  }
  if (
    dateLiturgyInformation.dayOfTheWeek === 0 &&
    (dateLiturgyInformation.genericLiturgyTime === GenericLiturgyTimeType.Christmas ||
      dateLiturgyInformation.genericLiturgyTime === GenericLiturgyTimeType.Ordinary)
  ) {
    return 6;
  }
  if (
    dateLiturgyInformation.celebrationType === CelebrationType.Festivity &&
    (celebrationInformation.specificClassification === CelebrationSpecificClassification.MotherOfGod ||
      celebrationInformation.specificClassification === CelebrationSpecificClassification.Generic)
  ) {
    return 7;
  }
  if (
    dateLiturgyInformation.celebrationType === CelebrationType.Festivity &&
    celebrationInformation.specificClassification === CelebrationSpecificClassification.Own
  ) {
    return 8;
  }
  if (
    (dateLiturgyInformation.celebrationType === CelebrationType.Fair &&
      dateLiturgyInformation.genericLiturgyTime === GenericLiturgyTimeType.Advent &&
      dateLiturgyInformation.date.getMonth() === 11 &&
      dateLiturgyInformation.date.getDate() >= 17 &&
      dateLiturgyInformation.date.getDate() <= 24) ||
    dateLiturgyInformation.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave ||
    (dateLiturgyInformation.celebrationType === CelebrationType.Fair &&
      dateLiturgyInformation.genericLiturgyTime === GenericLiturgyTimeType.Lent)
  ) {
    return 9;
  }
  if (
    dateLiturgyInformation.celebrationType === CelebrationType.Memory &&
    celebrationInformation.specificClassification === CelebrationSpecificClassification.Generic &&
    dateLiturgyInformation.genericLiturgyTime !== GenericLiturgyTimeType.Lent
  ) {
    return 10;
  }
  if (
    dateLiturgyInformation.celebrationType === CelebrationType.Memory &&
    celebrationInformation.specificClassification === CelebrationSpecificClassification.Own &&
    dateLiturgyInformation.genericLiturgyTime !== GenericLiturgyTimeType.Lent
  ) {
    return 11;
  }
  if (
    dateLiturgyInformation.celebrationType === CelebrationType.OptionalMemory ||
    dateLiturgyInformation.celebrationType === CelebrationType.OptionalVirginMemory ||
    (dateLiturgyInformation.celebrationType === CelebrationType.Memory &&
      dateLiturgyInformation.genericLiturgyTime === GenericLiturgyTimeType.Lent)
  ) {
    return 12;
  }
  if (
    (dateLiturgyInformation.celebrationType === CelebrationType.Fair &&
      dateLiturgyInformation.genericLiturgyTime === GenericLiturgyTimeType.Advent &&
      DateManagement.firstDateIsBeforeOrEqualToSecondDate(
        dateLiturgyInformation.date,
        new Date(dateLiturgyInformation.date.getFullYear(), 11, 16),
      )) ||
    (dateLiturgyInformation.celebrationType === CelebrationType.Fair &&
      dateLiturgyInformation.genericLiturgyTime === GenericLiturgyTimeType.Christmas &&
      dateLiturgyInformation.date.getMonth() === 0 &&
      dateLiturgyInformation.date.getDate() > 1 &&
      dateLiturgyInformation.date.getDate() <=
        CelebrationIdentifierService.getSaturdayAfterEpiphanyDate(dateLiturgyInformation).getDate()) ||
    (dateLiturgyInformation.celebrationType === CelebrationType.Fair &&
      dateLiturgyInformation.genericLiturgyTime === GenericLiturgyTimeType.Easter &&
      DateManagement.firstDateIsInBetweenSecondAndThirdDatesInclusively(
        dateLiturgyInformation.date,
        CelebrationIdentifierService.getMondayAfterEasterOctaveDate(dateLiturgyInformation),
        CelebrationIdentifierService.getSaturdayBeforePentecostDate(dateLiturgyInformation),
      )) ||
    (dateLiturgyInformation.celebrationType === CelebrationType.Fair &&
      dateLiturgyInformation.genericLiturgyTime === GenericLiturgyTimeType.Ordinary)
  ) {
    return 13;
  }
  Logger.logError(LogKeys.PrecedenceService, 'obtainPrecedenceByLiturgyTime', new Error('Precedence not found'));
  return 999;
}
