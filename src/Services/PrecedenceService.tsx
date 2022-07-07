import {LiturgySpecificDayInformation} from "../Models/LiturgyDayInformation";
import * as CelebrationIdentifierService from "./CelebrationIdentifierService";
import {CelebrationSpecificClassification, CelebrationType} from "./DatabaseEnums";
import {GenericLiturgyTimeType, SpecificLiturgyTimeType} from "./CelebrationTimeEnums";
import CelebrationInformation from "../Models/HoursLiturgy/CelebrationInformation";

export function ObtainPrecedenceByLiturgyTime(dateLiturgyInformation: LiturgySpecificDayInformation, celebrationInformation: CelebrationInformation) : number{
    if(dateLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_TRIDU){
        return 1;
    }
    if (CelebrationIdentifierService.IsChristmas(dateLiturgyInformation.Date) ||
        CelebrationIdentifierService.IsEpiphany(dateLiturgyInformation.Date) ||
        CelebrationIdentifierService.IsAscension(dateLiturgyInformation) ||
        CelebrationIdentifierService.IsPentecost(dateLiturgyInformation) ||
        CelebrationIdentifierService.AshWednesday(dateLiturgyInformation) ||
        (dateLiturgyInformation.DayOfTheWeek === 0 &&
            (dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Advent ||
            dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Lent ||
            dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Easter)) ||
        (dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
            dateLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_SET_SANTA &&
            dateLiturgyInformation.DayOfTheWeek >= 1 &&
            dateLiturgyInformation.DayOfTheWeek <= 4) ||
        dateLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.P_OCTAVA){
        return 2;
    }
    if((dateLiturgyInformation.CelebrationType === CelebrationType.Solemnity &&
        (celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Lord ||
            celebrationInformation.SpecificClassification === CelebrationSpecificClassification.MotherOfGod ||
            celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Generic)) ||
        CelebrationIdentifierService.IsAllSaints(dateLiturgyInformation)){
        return 3;
    }
    if(dateLiturgyInformation.CelebrationType === CelebrationType.Solemnity &&
        celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Own){
        return 4;
    }
    if(dateLiturgyInformation.CelebrationType === CelebrationType.Festivity &&
        celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Lord){
        return 5;
    }
    if(dateLiturgyInformation.DayOfTheWeek === 0 &&
        (dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Christmas ||
        dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Ordinary)){
        return 6;
    }
    if(dateLiturgyInformation.CelebrationType === CelebrationType.Festivity &&
        (celebrationInformation.SpecificClassification === CelebrationSpecificClassification.MotherOfGod ||
            celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Generic)){
        return 7;
    }
    if(dateLiturgyInformation.CelebrationType === CelebrationType.Festivity &&
        celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Own){
        return 8;
    }
    if ((dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
        dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Advent &&
        dateLiturgyInformation.Date.getDate() >= 17 && dateLiturgyInformation.Date.getDate() <= 24 &&
        dateLiturgyInformation.Date.getMonth() === 11) ||
        dateLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.N_OCTAVA ||
        (dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
        dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Lent)) {
        return 9;
    }
    if(dateLiturgyInformation.CelebrationType === CelebrationType.Memory &&
        celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Generic &&
        dateLiturgyInformation.GenericLiturgyTime !== GenericLiturgyTimeType.Lent){
        return 10;
    }
    if(dateLiturgyInformation.CelebrationType === CelebrationType.Memory &&
        celebrationInformation.SpecificClassification === CelebrationSpecificClassification.Own &&
        dateLiturgyInformation.GenericLiturgyTime !== GenericLiturgyTimeType.Lent){
        return 11;
    }
    if((dateLiturgyInformation.CelebrationType === CelebrationType.OptionalMemory || dateLiturgyInformation.CelebrationType === CelebrationType.OptionalVirginMemory) ||
        (dateLiturgyInformation.CelebrationType === CelebrationType.Memory &&
            dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Lent)){
        return 12;
    }
    if((dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
            dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Advent &&
            dateLiturgyInformation.Date.getDate() <= 16) ||
        (dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
            dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Christmas &&
            dateLiturgyInformation.Date.getDate() >= 2 &&
            dateLiturgyInformation.Date.getDate() <= CelebrationIdentifierService.GetSaturdayAfterEpiphanyDate(dateLiturgyInformation).getDate()) ||
        (dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
            dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Easter &&
            dateLiturgyInformation.Date.getDate() >= CelebrationIdentifierService.GetMondayAfterEasterOctaveDate(dateLiturgyInformation).getDate() &&
            dateLiturgyInformation.Date.getDate() <= CelebrationIdentifierService.GetSaturdayBeforePentecostDate(dateLiturgyInformation).getDate()) ||
        (dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
            dateLiturgyInformation.GenericLiturgyTime === GenericLiturgyTimeType.Ordinary)){
        return 13;
    }
    return 999; // Never should be here
}