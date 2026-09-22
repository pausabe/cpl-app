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
    dateLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum ||
    dateLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday
  ) {
    return 1;
  }
  if (
    CelebrationIdentifierService.checkCelebration(Celebration.Christmas, dateLiturgyInformation) ||
    CelebrationIdentifierService.checkCelebration(Celebration.Epiphany, dateLiturgyInformation) ||
    CelebrationIdentifierService.checkCelebration(Celebration.Ascension, dateLiturgyInformation) ||
    CelebrationIdentifierService.checkCelebration(Celebration.Pentecost, dateLiturgyInformation) ||
    CelebrationIdentifierService.checkCelebration(Celebration.AshWednesday, dateLiturgyInformation) ||
    (dateLiturgyInformation.DayOfTheWeek === 0 &&
      (dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Advent ||
        dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Lent ||
        dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Easter)) ||
    (dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
      dateLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.HolyWeek &&
      dateLiturgyInformation.DayOfTheWeek >= 1 &&
      dateLiturgyInformation.DayOfTheWeek <= 4) ||
    dateLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterOctave
  ) {
    return 2;
  }
  if (
    (dateLiturgyInformation.CelebrationType === CelebrationType.Solemnity &&
      (celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Lord ||
        celebrationInformation.SpecificClassification === CelebrationSpecificClassification.MotherOfGod ||
        celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Generic)) ||
    CelebrationIdentifierService.checkCelebration(Celebration.AllSaints, dateLiturgyInformation)
  ) {
    return 3;
  }
  if (
    dateLiturgyInformation.CelebrationType === CelebrationType.Solemnity &&
    celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Own
  ) {
    return 4;
  }
  if (
    dateLiturgyInformation.CelebrationType === CelebrationType.Festivity &&
    celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Lord
  ) {
    return 5;
  }
  if (
    dateLiturgyInformation.DayOfTheWeek === 0 &&
    (dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Christmas ||
      dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Ordinary)
  ) {
    return 6;
  }
  if (
    dateLiturgyInformation.CelebrationType === CelebrationType.Festivity &&
    (celebrationInformation.SpecificClassification === CelebrationSpecificClassification.MotherOfGod ||
      celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Generic)
  ) {
    return 7;
  }
  if (
    dateLiturgyInformation.CelebrationType === CelebrationType.Festivity &&
    celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Own
  ) {
    return 8;
  }
  if (
    (dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
      dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Advent &&
      dateLiturgyInformation.Date.getMonth() === 11 &&
      dateLiturgyInformation.Date.getDate() >= 17 &&
      dateLiturgyInformation.Date.getDate() <= 24) ||
    dateLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave ||
    (dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
      dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Lent)
  ) {
    return 9;
  }
  if (
    dateLiturgyInformation.CelebrationType === CelebrationType.Memory &&
    celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Generic &&
    dateLiturgyInformation.GenericLiturgyTime !== GenericLiturgyTimeType.Lent
  ) {
    return 10;
  }
  if (
    dateLiturgyInformation.CelebrationType === CelebrationType.Memory &&
    celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Own &&
    dateLiturgyInformation.GenericLiturgyTime !== GenericLiturgyTimeType.Lent
  ) {
    return 11;
  }
  if (
    dateLiturgyInformation.CelebrationType === CelebrationType.OptionalMemory ||
    dateLiturgyInformation.CelebrationType === CelebrationType.OptionalVirginMemory ||
    (dateLiturgyInformation.CelebrationType === CelebrationType.Memory &&
      dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Lent)
  ) {
    return 12;
  }
  if (
    (dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
      dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Advent &&
      DateManagement.firstDateIsBeforeOrEqualToSecondDate(
        dateLiturgyInformation.Date,
        new Date(dateLiturgyInformation.Date.getFullYear(), 11, 16),
      )) ||
    (dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
      dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Christmas &&
      dateLiturgyInformation.Date.getMonth() === 0 &&
      dateLiturgyInformation.Date.getDate() > 1 &&
      dateLiturgyInformation.Date.getDate() <=
        CelebrationIdentifierService.getSaturdayAfterEpiphanyDate(dateLiturgyInformation).getDate()) ||
    (dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
      dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Easter &&
      DateManagement.firstDateIsInBetweenSecondAndThirdDatesInclusively(
        dateLiturgyInformation.Date,
        CelebrationIdentifierService.getMondayAfterEasterOctaveDate(dateLiturgyInformation),
        CelebrationIdentifierService.getSaturdayBeforePentecostDate(dateLiturgyInformation),
      )) ||
    (dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
      dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Ordinary)
  ) {
    return 13;
  }
  Logger.logError(LogKeys.PrecedenceService, 'obtainPrecedenceByLiturgyTime', new Error('Precedence not found'));
  return 999;
}
