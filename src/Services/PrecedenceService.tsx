import GLOBAL from "../Utils/GlobalKeys";
import {LiturgySpecificDayInformation} from "../Models/LiturgyDayInformation";
import * as CelebrationIdentifierService from "./CelebrationIdentifierService";
import {CelebrationType} from "./DatabaseEnums";

export function ObtainPrecedence(dateLiturgyInformation : LiturgySpecificDayInformation) : number{
    let precedence = 22;
    if (dateLiturgyInformation.Date.getDay() === 0) {
        precedence = 9;
        if (dateLiturgyInformation.SpecificLiturgyTime === GLOBAL.A_SETMANES ||
            dateLiturgyInformation.SpecificLiturgyTime === GLOBAL.A_FERIES ||
            dateLiturgyInformation.SpecificLiturgyTime === GLOBAL.Q_CENDRA ||
            dateLiturgyInformation.SpecificLiturgyTime === GLOBAL.Q_SETMANES ||
            dateLiturgyInformation.SpecificLiturgyTime === GLOBAL.Q_SET_SANTA ||
            dateLiturgyInformation.SpecificLiturgyTime === GLOBAL.P_OCTAVA ||
            dateLiturgyInformation.SpecificLiturgyTime === GLOBAL.P_SETMANES) {
            precedence = 2;
        }
    }
    return UpdatePrecedenceCelebrationStatus(dateLiturgyInformation, precedence);
}

function UpdatePrecedenceCelebrationStatus(dateLiturgyInformation : LiturgySpecificDayInformation, precedence: number) : number{
    if (CelebrationIdentifierService.IsImmaculateHeartOfTheBlessedVirginMary(dateLiturgyInformation)) {
        return 10 < precedence? 10 : precedence;
    }
    if(CelebrationIdentifierService.MotherOfGodFromTheTibbon(dateLiturgyInformation)){
        if (dateLiturgyInformation.CelebrationType === CelebrationType.Memory) {
            return 10 < precedence? 10 : precedence;
        }
        if (dateLiturgyInformation.CelebrationType === CelebrationType.Solemnity) {
            return 4 < precedence? 4 : precedence;
        }
    }
    if(CelebrationIdentifierService.JesusChristHighPriestForever(dateLiturgyInformation)){
        return 8 < precedence? 8 : precedence;
    }
    if(CelebrationIdentifierService.BlessedVirginMaryMotherOfTheChurch(dateLiturgyInformation)){
        return 10 < precedence? 10 : precedence;
    }
    return precedence;
}