import {LiturgySpecificDayInformation} from "../Models/LiturgyDayInformation";
import * as CelebrationIdentifierService from "./CelebrationIdentifierService";
import {CelebrationType} from "./DatabaseEnums";
import GlobalKeys from "../Utils/GlobalKeys";
import { Settings } from "../Models/Settings";
import {GenericCelebrationType, SpecificCelebrationType} from "./CelebrationTimeEnums";

export function ObtainPrecedenceByLiturgyTime(dateLiturgyInformation: LiturgySpecificDayInformation, settings: Settings) : number{
    let precedence = 999;
    
    if(dateLiturgyInformation.SpecificLiturgyTime === SpecificCelebrationType.Q_TRIDU){
        return 1;
    }
    if (CelebrationIdentifierService.IsChristmas() ||
        CelebrationIdentifierService.IsEpiphany() ||
        CelebrationIdentifierService.IsAscencion() ||
        CelebrationIdentifierService.IsPentecost() ||
        CelebrationIdentifierService.WednesdayAshes() ||
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
    if(false /*TODO*/){
        return 3;
    }
    if(dateLiturgyInformation.CelebrationType === CelebrationType.Solemnity){
        return 4;
    }
    if(dateLiturgyInformation.CelebrationType === CelebrationType.Festivity){
        return 5;
    }
    if(dateLiturgyInformation.DayOfTheWeek === 0){
        return 6;
    }
    if(false /*TODO*/){
        return 7;
    }
    if(dateLiturgyInformation.CelebrationType === CelebrationType.Memory || 
        ((dateLiturgyInformation.CelebrationType === CelebrationType.OptionalMemory ||
            dateLiturgyInformation.CelebrationType === CelebrationType.OptionalVirginMemory) &&
            settings.OptionalFestivityEnabled)){
        return 8;
    }
    if (false /*TODO*/) {
        return 9;
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

/*function ObtainFirstVespers() : Vespers{
    let vespers = new Vespers();
    if (
        tomorrowCal === '-' || //demà no hi ha cap celebració
        tomorrowCal === 'F' || //demà hi ha Festa

        // TODO: HARDCODED These conditions below is there to fix Montserrat's Day. Fix properly (fa que les vespres siguin de Montserrat i no de St Jordi)
        (GlobalData.date.getFullYear() == 2019 && GlobalData.date.getMonth() == 3 && GlobalData.date.getDate() == 30) ||
        (GlobalData.date.getFullYear() == 2022 && GlobalData.date.getMonth() == 3 && GlobalData.date.getDate() == 27) ||

        (idTSF !== -1 && tomorrowCal !== 'TSF') || //quan dues TSF seguides es fa Vespres1 de la segona TSF. Basicamen evito el conflicte de les Vespres de Sagrada Familia quan cau en 31/12 i l'andemà és Mare de Déi 1/1 (únic conflicte possible entre TSF)
        (idDE !== -1 && tomorrowCal === '-') || //avui és DE i demà no hi ha celebració
        (GlobalData.date.getDay() === 0 && tomorrowCal === 'S' && GlobalData.LT !== GlobalKeys.O_ORDINARI) //Amb això generalitzo que DiumengeOrdinari>S i potser no és així
    ) {
        LITURGIA.vespres1 = false;
        vespresCelDEF = CEL.VESPRES;
    }
    else if (tomorrowCal === 'T') { //demà és divendres Sant
        LITURGIA.vespres1 = false;
        vespresCelDEF = CEL.VESPRES1;
    }
    else {
        LITURGIA.vespres1 = true;
        vespresCelDEF = CEL.VESPRES1;
    }
    return vespers;
}*/