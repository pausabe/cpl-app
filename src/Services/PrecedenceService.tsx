import {LiturgySpecificDayInformation} from "../Models/LiturgyDayInformation";
import * as CelebrationIdentifierService from "./CelebrationIdentifierService";
import {CelebrationType} from "./DatabaseEnums";
import { Settings } from "../Models/Settings";
import {GenericCelebrationType, SpecificCelebrationType} from "./CelebrationTimeEnums";

export function ObtainPrecedenceByLiturgyTime(dateLiturgyInformation: LiturgySpecificDayInformation, settings: Settings) : number{
    if(dateLiturgyInformation.SpecificLiturgyTime === SpecificCelebrationType.Q_TRIDU){
        return 1;
    }
    if (CelebrationIdentifierService.IsChristmas(dateLiturgyInformation) ||
        CelebrationIdentifierService.IsEpiphany(dateLiturgyInformation) ||
        CelebrationIdentifierService.IsAscension(dateLiturgyInformation) ||
        CelebrationIdentifierService.IsPentecost(dateLiturgyInformation) ||
        CelebrationIdentifierService.AshWednesday(dateLiturgyInformation) ||
        (dateLiturgyInformation.DayOfTheWeek === 0 &&
            (dateLiturgyInformation.GenericLiturgyTime === GenericCelebrationType.Advent ||
            dateLiturgyInformation.GenericLiturgyTime === GenericCelebrationType.Lent ||
            dateLiturgyInformation.GenericLiturgyTime === GenericCelebrationType.Easter)) ||
        (dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
            dateLiturgyInformation.SpecificLiturgyTime === SpecificCelebrationType.Q_SET_SANTA &&
            dateLiturgyInformation.DayOfTheWeek >= 1 &&
            dateLiturgyInformation.DayOfTheWeek <= 4) ||
        dateLiturgyInformation.SpecificLiturgyTime === SpecificCelebrationType.P_OCTAVA){
        return 2;
    }

    // Tipus de Solemnitats/Festes (4): propies / senyor / marededeu / sants
    // Tipus de Memories obligatories (2): generals / propies

    if(false /*TODO solemnitats del senyor, marededeu i sants && CelebrationIdentifierService.IsCommmemoriationOfAllDifunts()*/){
        return 3;
    }
    if(false /*TODO solemnitats propies*/){
        return 4;
    }
    if(false /*TODO festes del senyor general*/){
        return 5;
    }
    if(dateLiturgyInformation.DayOfTheWeek === 0 &&
        (dateLiturgyInformation.GenericLiturgyTime === GenericCelebrationType.Christmas ||
        dateLiturgyInformation.GenericLiturgyTime === GenericCelebrationType.Ordinary)){
        return 6;
    }
    if(false /*TODO festes marededeu i sants*/){
        return 7;
    }
    if(false /*TODO festes propies */){
        return 8;
    }
    if ((dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
        dateLiturgyInformation.GenericLiturgyTime === GenericCelebrationType.Advent &&
        dateLiturgyInformation.Date.getDate() >= 17 && dateLiturgyInformation.Date.getDate() <= 24 &&
        dateLiturgyInformation.Date.getMonth() === 11) ||
        dateLiturgyInformation.SpecificLiturgyTime === SpecificCelebrationType.N_OCTAVA ||
        (dateLiturgyInformation.CelebrationType === CelebrationType.Fair &&
        dateLiturgyInformation.GenericLiturgyTime === GenericCelebrationType.Lent)) {
        return 9;
    }
    if(false/*TODO memoria obligatoria general que no cau en quaresma*/){
        return 10;
    }
    if(false/*TODO memoria obligatoria propia que no cau en quaresma*/){
        return 11;
    }
    if(false/*TODO memoria lliure o memoria obligatoria de quaresma*/){
        return 12;
    }
    else{
        return 13;
    }
}