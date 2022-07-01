import Vespers from "../../Models/HoursLiturgy/Vespers";
import GlobalKeys from "../../Utils/GlobalKeys";
import VespersPrecedenceLevelKeys from "./VespersPrecedenceLevelKeys";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";
import {Settings} from "../../Models/Settings";
import {Psalm, ShortReading, ShortResponsory} from "../../Models/LiturgyMasters/CommonParts";
import {YearType} from "../DatabaseEnums";
import * as PrecedenceService from "../PrecedenceService";

export function ObtainFirstVespers(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, settings : Settings) : Vespers{
    return liturgyDayInformation.DayOfTheWeek === 6? ObtainVespers(liturgyMasters, liturgyDayInformation, settings) : new Vespers();
}

export function ObtainSecondVespers(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, settings : Settings) : Vespers{
    return liturgyDayInformation.DayOfTheWeek === 6? new Vespers() : ObtainVespers(liturgyMasters, liturgyDayInformation, settings);
}

export function MergeVespersWithCelebration(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, settings : Settings, withoutCelebrationVespers: Vespers, withCelebrationVespers: Vespers): Vespers {
    let vespers = withoutCelebrationVespers;
    if(liturgyDayInformation.SpecificLiturgyTime === GlobalKeys.Q_DIUM_PASQUA) {
        vespers = withCelebrationVespers;
    }
    else{
        if(withCelebrationVespers.Anthem !== "-"){
            vespers.Anthem = withCelebrationVespers.Anthem;
        }
        if(withCelebrationVespers.FirstPsalm.Antiphon !== "-"){
            vespers.FirstPsalm.Antiphon = withCelebrationVespers.FirstPsalm.Antiphon;
        }
        if(withCelebrationVespers.FirstPsalm.Title !== "-"){
            vespers.FirstPsalm = withCelebrationVespers.FirstPsalm;
        }
        if(withCelebrationVespers.SecondPsalm.Antiphon !== "-"){
            vespers.SecondPsalm.Antiphon = withCelebrationVespers.SecondPsalm.Antiphon;
        }
        if(withCelebrationVespers.SecondPsalm.Title !== "-"){
            vespers.SecondPsalm = withCelebrationVespers.SecondPsalm;
        }
        if(withCelebrationVespers.ThirdPsalm.Antiphon !== "-"){
            vespers.ThirdPsalm.Antiphon = withCelebrationVespers.ThirdPsalm.Antiphon;
        }
        if(withCelebrationVespers.ThirdPsalm.Title !== "-"){
            vespers.ThirdPsalm = withCelebrationVespers.ThirdPsalm;
        }
        if(withCelebrationVespers.ShortReading.ShortReading !== "-"){
            vespers.ShortReading = withCelebrationVespers.ShortReading;
        }
        if(withCelebrationVespers.ShortResponsory.FirstPart !== "-"){
            vespers.ShortResponsory = withCelebrationVespers.ShortResponsory;
        }
        if(withCelebrationVespers.EvangelicalAntiphon !== "-"){
            vespers.EvangelicalAntiphon = withCelebrationVespers.EvangelicalAntiphon;
        }
        if(withCelebrationVespers.Prayers !== "-"){
            vespers.Prayers = withCelebrationVespers.Prayers;
        }
        if(withCelebrationVespers.FinalPrayer !== "-"){
            vespers.FinalPrayer = withCelebrationVespers.FinalPrayer;
        }
        vespers.CelebrationTitle = withCelebrationVespers.CelebrationTitle; // TODO: not sure
        return
    }
    return vespers;
}

function ObtainVespers(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, settings : Settings) : Vespers{
    let vespers = new Vespers();
    vespers.Anthem = GetAnthem(liturgyMasters, liturgyDayInformation, settings);
    const psalmody = GetPsalmody(liturgyMasters, liturgyDayInformation);
    vespers.FirstPsalm = psalmody.FirstPsalm;
    vespers.SecondPsalm = psalmody.SecondPsalm;
    vespers.ThirdPsalm = psalmody.ThirdPsalm;
    vespers.ShortReading = GetShortReading(liturgyMasters, liturgyDayInformation);
    vespers.ShortResponsory = GetShortResponsory(liturgyMasters, liturgyDayInformation);
    vespers.EvangelicalAntiphon = GetEvangelicalAntiphon(liturgyMasters, liturgyDayInformation);
    vespers.Prayers = GetPrayers(liturgyMasters, liturgyDayInformation);
    vespers.FinalPrayer = GetFinalPrayer(liturgyMasters, liturgyDayInformation);
    vespers.EvangelicalChant = liturgyMasters.Various.VespersEvangelicalChant;
    vespers.CelebrationTitle = liturgyDayInformation.DayOfTheWeek === 6? "Primeres vespres de diumenge" : "";
    vespers.PrecedenceLevel = PrecedenceService.ObtainPrecedenceByLiturgyTime();
    return vespers;
}

function GetAnthem(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, settings : Settings) : string{
    let anthem = settings.UseLatin? liturgyMasters.VespersCommonPsalter.LatinAnthem : liturgyMasters.VespersCommonPsalter.CatalanAnthem;
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.Q_CENDRA:
        case GlobalKeys.Q_SETMANES:
            // TODO: firstVespresOption not sure
            if(liturgyDayInformation.DayOfTheWeek === 0 || liturgyDayInformation.DayOfTheWeek === 6){
                if(settings.UseLatin){
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.VespersSundaysLatinAnthem;
                }
                else{
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.VespersSundaysCatalanAnthem;
                }
            }
            else{
                if(settings.UseLatin){
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.VespersFairsLatinAnthem;
                }
                else{
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.VespersFairsCatalanAnthem;
                }
            }
            break;
        case GlobalKeys.Q_DIUM_RAMS:
        case GlobalKeys.Q_SET_SANTA:
            if(settings.UseLatin){
                anthem = liturgyMasters.CommonPartsOfHolyWeek.VespersLatinAnthem;
            }
            else{
                anthem = liturgyMasters.CommonPartsOfHolyWeek.VespersCatalanAnthem;
            }
            break;
        case GlobalKeys.Q_TRIDU:
            if(settings.UseLatin){
                anthem = liturgyMasters.PartsOfEasterTriduum.VespersLatinAnthem;
            }
            else{
                anthem = liturgyMasters.PartsOfEasterTriduum.VespersCatalanAnthem;
            }
            break;
        case GlobalKeys.P_OCTAVA:
            if(settings.UseLatin){
                anthem = liturgyMasters.PartsOfEasterBeforeAscension.VespersWeekendLatinAnthem;
            }
            else{
                anthem = liturgyMasters.PartsOfEasterBeforeAscension.VespersWeekendCatalanAnthem;
            }
            break;
        case GlobalKeys.P_SETMANES:
            if(liturgyDayInformation.Week === '7'){
                if(settings.UseLatin){
                    anthem = liturgyMasters.PartsOfEasterAfterAscension.VespersLatinAnthem;
                }
                else{
                    anthem = liturgyMasters.PartsOfEasterAfterAscension.VespersCatalanAnthem;
                }
            }
            else{
                // TODO: firstVespresOption not sure
                if(liturgyDayInformation.DayOfTheWeek === 6 || liturgyDayInformation.DayOfTheWeek === 0){
                    if(settings.UseLatin){
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.VespersWeekendLatinAnthem;
                    }
                    else{
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.VespersWeekendCatalanAnthem;
                    }
                }
                else{
                    if(settings.UseLatin){
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.VespersWorkdaysLatinAnthem;
                    }
                    else{
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.VespersWorkdaysCatalanAnthem;
                    }
                }
            }
            break;
        case GlobalKeys.A_SETMANES:
        case GlobalKeys.A_FERIES:
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.SpecificLiturgyTime != GlobalKeys.N_ABANS ||
                (liturgyDayInformation.SpecificLiturgyTime == GlobalKeys.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13)){
                if(settings.UseLatin){
                    anthem = liturgyMasters.CommonAdventAndChristmasParts.VespersLatinAnthem;
                }
                else{
                    anthem = liturgyMasters.CommonAdventAndChristmasParts.VespersCatalanAnthem;
                }
            }
            break;
        case GlobalKeys.N_OCTAVA:
            // TODO: what about SolemnityAndFestivityParts first vespers anthem?
            if(settings.UseLatin){
                anthem = liturgyMasters.SolemnityAndFestivityParts.SecondVespersLatinAnthem;
            }
            else{
                anthem = liturgyMasters.SolemnityAndFestivityParts.SecondVespersCatalanAnthem;
            }
            break;
    }
    return anthem;
}

function GetPsalmody(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation) : {FirstPsalm : Psalm, SecondPsalm : Psalm, ThirdPsalm : Psalm}{
    let psalmody = {
        FirstPsalm: liturgyMasters.VespersCommonPsalter.FirstPsalm,
        SecondPsalm: liturgyMasters.VespersCommonPsalter.SecondPsalm,
        ThirdPsalm: liturgyMasters.VespersCommonPsalter.ThirdPsalm
    }
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.A_FERIES:
            if(liturgyDayInformation.DayOfTheWeek !== 0){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.AdventFairDaysAntiphons.LaudesFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.AdventFairDaysAntiphons.LaudesSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.AdventFairDaysAntiphons.LaudesThirdAntiphon;
            }
            break;
        case GlobalKeys.Q_SETMANES:
        case GlobalKeys.Q_CENDRA:
            if(liturgyDayInformation.DayOfTheWeek === 6){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts.FirstVespersFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts.FirstVespersSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts.FirstVespersThirdAntiphon;
            }
            else if(liturgyDayInformation.DayOfTheWeek === 0){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.FiveWeeksOfSundayLentParts.SecondVespersFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.FiveWeeksOfSundayLentParts.SecondVespersSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.FiveWeeksOfSundayLentParts.SecondVespersThirdAntiphon;
            }
            break;
        case GlobalKeys.Q_DIUM_RAMS:
            // TODO: not sure why but these lines were commented (precedence's thing I guess)
            /*if(liturgyDayInformation.DayOfTheWeek === 6){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.PalmSundayParts.FirstVespersFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.PalmSundayParts.FirstVespersSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.PalmSundayParts.FirstVespersThirdAntiphon;
            }
            else */if(liturgyDayInformation.DayOfTheWeek === 0){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.PalmSundayParts.SecondVespersFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.PalmSundayParts.SecondVespersSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.PalmSundayParts.SecondVespersThirdAntiphon;
            }
            break;
        case GlobalKeys.Q_SET_SANTA:
            psalmody.FirstPsalm.Antiphon = liturgyMasters.PartsOfHolyWeek.VespersFirstAntiphon;
            psalmody.SecondPsalm.Antiphon = liturgyMasters.PartsOfHolyWeek.VespersSecondAntiphon;
            psalmody.ThirdPsalm.Antiphon = liturgyMasters.PartsOfHolyWeek.VespersThirdAntiphon;
            break;
        case GlobalKeys.Q_TRIDU:
            psalmody.FirstPsalm = liturgyMasters.PartsOfEasterTriduum.VespersFirstPsalm;
            psalmody.FirstPsalm.Comment = "-";
            psalmody.SecondPsalm = liturgyMasters.PartsOfEasterTriduum.VespersSecondPsalm;
            psalmody.SecondPsalm.Comment = "-";
            psalmody.ThirdPsalm = liturgyMasters.PartsOfEasterTriduum.VespersThirdPsalm;
            psalmody.ThirdPsalm.Comment = "-";
            break;
        case GlobalKeys.P_OCTAVA:
            psalmody.FirstPsalm = liturgyMasters.EasterSunday.VespersFirstPsalm;
            psalmody.FirstPsalm.Comment = "-";
            psalmody.SecondPsalm = liturgyMasters.EasterSunday.VespersSecondPsalm;
            psalmody.SecondPsalm.Comment = "-";
            psalmody.ThirdPsalm = liturgyMasters.EasterSunday.VespersThirdPsalm;
            psalmody.ThirdPsalm.Comment = "-";
            break;
        case GlobalKeys.P_SETMANES:
            if(liturgyDayInformation.DayOfTheWeek === 6 && liturgyMasters.EasterFirstVespersOfSundayParts.LaudesFirstAntiphon !== "-"){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.EasterFirstVespersOfSundayParts.LaudesFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.EasterFirstVespersOfSundayParts.LaudesSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.EasterFirstVespersOfSundayParts.LaudesThirdAntiphon;
            }
            else if(liturgyDayInformation.DayOfTheWeek === 0){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.EasterSundayParts.LaudesFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.EasterSundayParts.LaudesSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.EasterSundayParts.LaudesThirdAntiphon;
            }
            else{
                psalmody.FirstPsalm.Antiphon = liturgyMasters.CommonSpecialPartsOfEaster.LaudesFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.CommonSpecialPartsOfEaster.LaudesSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.CommonSpecialPartsOfEaster.LaudesThirdAntiphon;
            }
            break;
        case GlobalKeys.A_SETMANES:
            if(liturgyDayInformation.DayOfTheWeek === 6 && liturgyMasters.AdventFirstVespersOfSundayParts.LaudesFirstAntiphon !== "-"){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.AdventFirstVespersOfSundayParts.LaudesFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.AdventFirstVespersOfSundayParts.LaudesSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.AdventFirstVespersOfSundayParts.LaudesThirdAntiphon;
            }
            else if(liturgyDayInformation.DayOfTheWeek === 0){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.AdventSundayParts.LaudesFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.AdventSundayParts.LaudesSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.AdventSundayParts.LaudesThirdAntiphon;
            }
            break;
        case GlobalKeys.N_OCTAVA:
            psalmody.FirstPsalm = liturgyMasters.SolemnityAndFestivityParts.SecondVespersFirstPsalm;
            psalmody.FirstPsalm.Comment = "-";
            psalmody.FirstPsalm.HasGloryPrayer = true;
            psalmody.SecondPsalm = liturgyMasters.SolemnityAndFestivityParts.SecondVespersSecondPsalm;
            psalmody.SecondPsalm.Comment = "-";
            psalmody.SecondPsalm.HasGloryPrayer = true;
            psalmody.ThirdPsalm = liturgyMasters.SolemnityAndFestivityParts.SecondVespersThirdPsalm;
            psalmody.ThirdPsalm.Comment = "-";
            psalmody.ThirdPsalm.HasGloryPrayer = true;
            break;
    }

    // TODO: I thing this should be moved to CelebationVespers
    if(liturgyDayInformation.DayOfTheWeek === 0 &&
        (liturgyDayInformation.SpecificLiturgyTime === GlobalKeys.Q_SET_SANTA ||
            liturgyDayInformation.SpecificLiturgyTime === GlobalKeys.Q_SETMANES ||
            liturgyDayInformation.SpecificLiturgyTime === GlobalKeys.Q_DIUM_RAMS)){
        psalmody.ThirdPsalm.Title = "Càntic 1Pe 2, 21-24\nLa passió voluntària del Crist, el servent de Déu";
        psalmody.ThirdPsalm.Comment = '-';
        psalmody.ThirdPsalm.Psalm =  liturgyMasters.Various.SpecialVesperChant;
        psalmody.ThirdPsalm.HasGloryPrayer = true;
    }
    return psalmody;
}

function GetShortReading(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation) : ShortReading{
    let shortReading = liturgyMasters.VespersCommonPsalter.ShortReading;
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.Q_CENDRA:
            return liturgyMasters.PartsOfLentTime.VespersShortReading;
        case GlobalKeys.Q_SETMANES:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.VespersShortReading;
        case GlobalKeys.Q_DIUM_RAMS:
            // TODO: not sure why but these lines were commented (precedence's thing I guess)
            /*if(liturgyDayInformation.DayOfTheWeek === 6){
                return liturgyMasters.PalmSundayParts.FirstVespersShortReading;
            }
            else{*/
                return liturgyMasters.PalmSundayParts.SecondVespersShortReading;
            //}
        case GlobalKeys.Q_SET_SANTA:
            return liturgyMasters.PartsOfHolyWeek.VespersShortReading;
        case GlobalKeys.Q_TRIDU:
            return liturgyMasters.PartsOfEasterTriduum.VespersShortReading;
        case GlobalKeys.P_OCTAVA:
            return liturgyMasters.PartsOfEasterOctave.VespersShortReading;
        case GlobalKeys.P_SETMANES:
            return liturgyMasters.EasterWeekParts.VespersShortReading;
        case GlobalKeys.A_SETMANES:
            return liturgyMasters.AdventWeekParts.VespersShortReading;
        case GlobalKeys.A_FERIES:
            return liturgyMasters.AdventFairDaysParts.VespersShortReading;
        case GlobalKeys.N_OCTAVA:
            return liturgyMasters.ChristmasWhenOctaveParts.VespersShortReading;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.SpecificLiturgyTime == GlobalKeys.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                return liturgyMasters.ChristmasBeforeEpiphanyParts.VespersShortReading;
            }
            break;
    }
    return shortReading;
}

function GetShortResponsory(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation) : ShortResponsory{
    let shortResponsory =  liturgyMasters.VespersCommonPsalter.ShortResponsory;
    shortResponsory.HasSpecialAntiphon = false;
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.Q_CENDRA:
            return liturgyMasters.PartsOfLentTime.VespersShortResponsory;
        case GlobalKeys.Q_SETMANES:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.VespersShortResponsory;
        case GlobalKeys.Q_DIUM_RAMS:
            // TODO: not sure why but these lines were commented (precedence's thing I guess)
            /*if(liturgyDayInformation.DayOfTheWeek === 6){
              respBreu1 = liturgyMasters.PalmSundayParts.respBreuVespres1
              respBreu2 = liturgyMasters.PalmSundayParts.respBreuVespres2
              respBreu3 = liturgyMasters.PalmSundayParts.respBreuVespres3
            }
            else{*/
            return liturgyMasters.PalmSundayParts.SecondVespresShortResponsory;
            //}
        case GlobalKeys.Q_SET_SANTA:
            return liturgyMasters.PartsOfHolyWeek.VespersShortResponsory;
        case GlobalKeys.P_SETMANES:
            return liturgyMasters.EasterWeekParts.VespersShortResponsory;
        case GlobalKeys.A_SETMANES:
            return liturgyMasters.AdventWeekParts.VespersShortResponsory;
        case GlobalKeys.A_FERIES:
            return liturgyMasters.AdventFairDaysParts.VespersShortResponsory;
        case GlobalKeys.N_OCTAVA:
            return liturgyMasters.ChristmasWhenOctaveParts.VespersShortResponsory;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.SpecificLiturgyTime == GlobalKeys.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                return liturgyMasters.ChristmasBeforeEpiphanyParts.VespersShortResponsory;
            }
            break;
        case GlobalKeys.Q_TRIDU:
            return liturgyMasters.PartsOfEasterTriduum.VespersShortResponsory;
        case GlobalKeys.P_OCTAVA:
            return liturgyMasters.PartsOfEasterOctave.VespersShortResponsory;
    }
    return shortResponsory;
}

function GetEvangelicalAntiphon(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation) : string{    
    let evangelicalAntiphon;
    if(liturgyDayInformation.DayOfTheWeek !== 0 && liturgyDayInformation.DayOfTheWeek !== 6){
        evangelicalAntiphon = liturgyMasters.VespersCommonPsalter.EvangelicalAntiphon;
    }
    else{
        if(liturgyDayInformation.DayOfTheWeek === 6 && liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers.FirstVespersEvangelicalAntiphonYearA !== "-"){
            switch (liturgyDayInformation.YearType) {
                case YearType.A:
                    evangelicalAntiphon = liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers.FirstVespersEvangelicalAntiphonYearA;
                    break;
                case YearType.B:
                    evangelicalAntiphon = liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers.FirstVespersEvangelicalAntiphonYearB;
                    break;
                case YearType.C:
                    evangelicalAntiphon = liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers.FirstVespersEvangelicalAntiphonYearC;
                    break;
            }
        }
        else{
            switch (liturgyDayInformation.YearType) {
                case YearType.A:
                    evangelicalAntiphon = liturgyMasters.PrayersOfOrdinaryTime.SecondVespersEvangelicalAntiphonYearA;
                    break;
                case YearType.B:
                    evangelicalAntiphon = liturgyMasters.PrayersOfOrdinaryTime.SecondVespersEvangelicalAntiphonYearB;
                    break;
                case YearType.C:
                    evangelicalAntiphon = liturgyMasters.PrayersOfOrdinaryTime.SecondVespersEvangelicalAntiphonYearC;
                    break;
            }
        }
    }
    switch(liturgyDayInformation.SpecificLiturgyTime) {
        case GlobalKeys.Q_CENDRA:
            switch (liturgyDayInformation.YearType) {
                case YearType.A:
                    evangelicalAntiphon = liturgyMasters.PartsOfLentTime.VespersEvangelicalAntiphonYearA;
                    break;
                case YearType.B:
                    evangelicalAntiphon = liturgyMasters.PartsOfLentTime.VespersEvangelicalAntiphonYearB;
                    break;
                case YearType.C:
                    evangelicalAntiphon = liturgyMasters.PartsOfLentTime.VespersEvangelicalAntiphonYearC;
                    break;
            }
            if (evangelicalAntiphon === '-') {
                evangelicalAntiphon = liturgyMasters.PartsOfLentTime.VespersEvangelicalAntiphon;
            }
            break;
        case GlobalKeys.Q_SETMANES:
            if (liturgyDayInformation.DayOfTheWeek !== 0 && liturgyDayInformation.DayOfTheWeek !== 6) {
                evangelicalAntiphon = liturgyMasters.PartsOfFiveWeeksOfLentTime.VespersEvangelicalAntiphon;
            } else {
                if (liturgyDayInformation.DayOfTheWeek === 6 && liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts.FirstVespersEvangelicalAntiphonYearA !== "-") {
                    switch (liturgyDayInformation.YearType) {
                        case YearType.A:
                            evangelicalAntiphon = liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts.FirstVespersEvangelicalAntiphonYearA;
                            break;
                        case YearType.B:
                            evangelicalAntiphon = liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts.FirstVespersEvangelicalAntiphonYearB;
                            break;
                        case YearType.C:
                            evangelicalAntiphon = liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts.FirstVespersEvangelicalAntiphonYearC;
                            break;
                    }
                } else {
                    switch (liturgyDayInformation.YearType) {
                        case YearType.A:
                            evangelicalAntiphon = liturgyMasters.FiveWeeksOfSundayLentParts.SecondVespersEvangelicalAntiphonYearA;
                            break;
                        case YearType.B:
                            evangelicalAntiphon = liturgyMasters.FiveWeeksOfSundayLentParts.SecondVespersEvangelicalAntiphonYearB;
                            break;
                        case YearType.C:
                            evangelicalAntiphon = liturgyMasters.FiveWeeksOfSundayLentParts.SecondVespersEvangelicalAntiphonYearC;
                            break;
                    }
                }
            }
            break;
        case GlobalKeys.Q_DIUM_RAMS:
            // TODO: not sure why but these lines were commented (precedence's thing I guess)
            /*if(liturgyDayInformation.DayOfTheWeek === 6){
              switch (liturgyDayInformation.YearType) {
                case YearType.A:
                  evangelicalAntiphon = liturgyMasters.PalmSundayParts.FirstVespersEvangelicalAntiphonYearA;
                  break;
                case YearType.B:
                  evangelicalAntiphon = liturgyMasters.PalmSundayParts.FirstVespersEvangelicalAntiphonYearB;
                  break;
                case YearType.C:
                  evangelicalAntiphon = liturgyMasters.PalmSundayParts.FirstVespersEvangelicalAntiphonYearC;
                  break;
              }
            }
            else{*/
            switch (liturgyDayInformation.YearType) {
                case YearType.A:
                    evangelicalAntiphon = liturgyMasters.PalmSundayParts.SecondVespersEvangelicalAntiphonYearA;
                    break;
                case YearType.B:
                    evangelicalAntiphon = liturgyMasters.PalmSundayParts.SecondVespersEvangelicalAntiphonYearB;
                    break;
                case YearType.C:
                    evangelicalAntiphon = liturgyMasters.PalmSundayParts.SecondVespersEvangelicalAntiphonYearC;
                    break;
            }
            //}
            break;
        case GlobalKeys.Q_SET_SANTA:
            evangelicalAntiphon = liturgyMasters.PartsOfHolyWeek.VespersEvangelicalAntiphon;
            break;
        case GlobalKeys.Q_TRIDU:
            evangelicalAntiphon = liturgyMasters.PartsOfEasterTriduum.VespersEvangelicalAntiphon;
            break;
        case GlobalKeys.P_OCTAVA:
            evangelicalAntiphon = liturgyMasters.PartsOfEasterOctave.VespersEvangelicalAntiphon;
            break;
        case GlobalKeys.P_SETMANES:
            if(liturgyDayInformation.DayOfTheWeek !== 6 && liturgyDayInformation.DayOfTheWeek !== 0){
                evangelicalAntiphon = liturgyMasters.EasterWeekParts.VespersEvangelicalAntiphon;
            }
            else{
                if(liturgyDayInformation.DayOfTheWeek === 6 && liturgyMasters.EasterFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearA !== "-"){
                    switch (liturgyDayInformation.YearType) {
                        case YearType.A:
                            evangelicalAntiphon = liturgyMasters.EasterFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearA;
                            break;
                        case YearType.B:
                            evangelicalAntiphon = liturgyMasters.EasterFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearB;
                            break;
                        case YearType.C:
                            evangelicalAntiphon = liturgyMasters.EasterFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearC;
                            break;
                    }
                }
                else{
                    switch (liturgyDayInformation.YearType) {
                        case YearType.A:
                            evangelicalAntiphon = liturgyMasters.EasterSundayParts.SecondVespersEvangelicalAntiphonYearA;
                            break;
                        case YearType.B:
                            evangelicalAntiphon = liturgyMasters.EasterSundayParts.SecondVespersEvangelicalAntiphonYearB;
                            break;
                        case YearType.C:
                            evangelicalAntiphon = liturgyMasters.EasterSundayParts.SecondVespersEvangelicalAntiphonYearC;
                            break;
                    }
                }
            }
            break;
        case GlobalKeys.A_SETMANES:
            if(liturgyDayInformation.DayOfTheWeek !== 6 && liturgyDayInformation.DayOfTheWeek !==0){
                evangelicalAntiphon = liturgyMasters.AdventWeekParts.VespersEvangelicalAntiphon;
            }
            else{
                if(liturgyDayInformation.DayOfTheWeek === 6 && liturgyMasters.AdventFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearA !== "-"){
                    switch (liturgyDayInformation.YearType) {
                        case YearType.A:
                            evangelicalAntiphon = liturgyMasters.AdventFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearA;
                            break;
                        case YearType.B:
                            evangelicalAntiphon = liturgyMasters.AdventFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearB;
                            break;
                        case YearType.C:
                            evangelicalAntiphon = liturgyMasters.AdventFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearC;
                            break;
                    }
                }
                else{
                    switch (liturgyDayInformation.YearType) {
                        case YearType.A:
                            evangelicalAntiphon = liturgyMasters.AdventSundayParts.SecondVespersEvangelicalAntiphonYearA;
                            break;
                        case YearType.B:
                            evangelicalAntiphon = liturgyMasters.AdventSundayParts.SecondVespersEvangelicalAntiphonYearB;
                            break;
                        case YearType.C:
                            evangelicalAntiphon = liturgyMasters.AdventSundayParts.SecondVespersEvangelicalAntiphonYearC;
                            break;
                    }
                }
            }
            break;
        case GlobalKeys.A_FERIES:
            evangelicalAntiphon = liturgyMasters.AdventFairDaysParts.VespersEvangelicalAntiphon;
            break;
        case GlobalKeys.N_OCTAVA:
            evangelicalAntiphon = liturgyMasters.ChristmasWhenOctaveParts.VespersEvangelicalAntiphon;
            break;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.SpecificLiturgyTime == GlobalKeys.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                evangelicalAntiphon = liturgyMasters.ChristmasBeforeEpiphanyParts.VespersEvangelicalAntiphon;
            }
            break;
    }
    return evangelicalAntiphon;
}

function GetPrayers(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation) : string{
    let prayers = liturgyMasters.VespersCommonPsalter.Prayers;
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.Q_CENDRA:
            return liturgyMasters.PartsOfLentTime.VespersPrayers;
        case GlobalKeys.Q_SETMANES:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.VespersPrayers;
        case GlobalKeys.Q_DIUM_RAMS:
            // TODO: not sure why but these lines were commented (precedence's thing I guess)
            /*if(liturgyDayInformation.DayOfTheWeek === 6){
              prayers = liturgyMasters.PalmSundayParts.FirstVespersPrayers;
            }
            else{*/
            return liturgyMasters.PalmSundayParts.SecondVespersPrayers;
            //}
        case GlobalKeys.Q_SET_SANTA:
            return liturgyMasters.PartsOfHolyWeek.VespersPrayers;
        case GlobalKeys.Q_TRIDU:
            return liturgyMasters.PartsOfEasterTriduum.VespersPrayers;
        case GlobalKeys.P_OCTAVA:
            return liturgyMasters.PartsOfEasterOctave.VespersPrayers;
        case GlobalKeys.P_SETMANES:
            return liturgyMasters.EasterWeekParts.VespersPrayers;
        case GlobalKeys.A_SETMANES:
            return liturgyMasters.AdventWeekParts.VespersPrayers;
        case GlobalKeys.A_FERIES:
            return liturgyMasters.AdventFairDaysParts.VespersPrayers;
        case GlobalKeys.N_OCTAVA:
            return liturgyMasters.ChristmasWhenOctaveParts.VespersPrayers;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.SpecificLiturgyTime == GlobalKeys.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                return liturgyMasters.ChristmasBeforeEpiphanyParts.VespersPrayers;
            }
            break;
    }
    return prayers;
}

function GetFinalPrayer(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation) : string{    
    let finalPrayer = liturgyMasters.VespersCommonPsalter.FinalPrayer;
    if(liturgyDayInformation.DayOfTheWeek === 0){ 
        finalPrayer = liturgyMasters.PrayersOfOrdinaryTime.FinalPrayer;
    }
    else if(liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers.FinalPrayer !== "-"){
        finalPrayer = liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers.FinalPrayer;
    }
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.Q_CENDRA:
            return liturgyMasters.PartsOfLentTime.VespersFinalPrayer;
        case GlobalKeys.Q_SETMANES:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.VespersFinalPrayer;
        case GlobalKeys.Q_DIUM_RAMS:
            // TODO: not sure why but these lines were commented (precedence's thing I guess)
            /*if(liturgyDayInformation.DayOfTheWeek === 6){
              finalPrayer = liturgyMasters.PalmSundayParts.FinalVespersFinalPrayer;
            }
            else{*/
            return liturgyMasters.PalmSundayParts.SecondVespersFinalPrayer;
            //}
        case GlobalKeys.Q_SET_SANTA:
            return liturgyMasters.PartsOfHolyWeek.VespersFinalPrayer;
        case GlobalKeys.Q_TRIDU:
            return liturgyMasters.PartsOfEasterTriduum.VespersFinalPrayer;
        case GlobalKeys.P_OCTAVA:
            return liturgyMasters.PartsOfEasterOctave.VespersFinalPrayer;
        case GlobalKeys.P_SETMANES:
            return liturgyMasters.EasterWeekParts.VespersFinalPrayer;
        case GlobalKeys.A_SETMANES:
            return liturgyMasters.AdventWeekParts.VespersFinalPrayer;
        case GlobalKeys.A_FERIES:
            return liturgyMasters.AdventFairDaysParts.VespersFinalPrayer;
        case GlobalKeys.N_OCTAVA:
            return liturgyMasters.ChristmasWhenOctaveParts.VespersFinalPrayer;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.SpecificLiturgyTime == GlobalKeys.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                return liturgyMasters.ChristmasBeforeEpiphanyParts.VespersFinalPrayer;
            }
            break;
    }
    return finalPrayer;
}