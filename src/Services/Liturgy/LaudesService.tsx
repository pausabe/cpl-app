import Laudes from "../../Models/HoursLiturgy/Laudes";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";
import GlobalKeys from "../../Utils/GlobalKeys";
import {Settings} from "../../Models/Settings";
import {Psalm, ShortReading, ShortResponsory} from "../../Models/LiturgyMasters/CommonParts";
import {YearType} from "../DatabaseEnums";

export function ObtainLaudes(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationLaudes : Laudes, settings : Settings) : Laudes{
    let laudes = new Laudes();
    if(liturgyDayInformation.SpecificLiturgyTime === GlobalKeys.Q_DIUM_PASQUA) {
        laudes = celebrationLaudes;
    }
    else{
        laudes.Anthem = GetAnthem(liturgyMasters, liturgyDayInformation, celebrationLaudes, settings);
        const psalmody = GetPsalmody(liturgyMasters, liturgyDayInformation, celebrationLaudes);
        laudes.FirstPsalm = psalmody.FirstPsalm;
        laudes.SecondPsalm = psalmody.SecondPsalm;
        laudes.ThirdPsalm = psalmody.ThirdPsalm;
        laudes.ShortReading = GetShortReading(liturgyMasters, liturgyDayInformation, celebrationLaudes);
        laudes.ShortResponsory = GetShortResponsory(liturgyMasters, liturgyDayInformation, celebrationLaudes);
        laudes.EvangelicalAntiphon = GetEvangelicalAntiphon(liturgyMasters, liturgyDayInformation, celebrationLaudes);
        laudes.Prayers = GetPrayers(liturgyMasters, liturgyDayInformation, celebrationLaudes);
        laudes.FinalPrayer = GetFinalPrayer(liturgyMasters, liturgyDayInformation, celebrationLaudes);
    }
    laudes.EvangelicalChant = liturgyMasters.Various.LaudesEvangelicalChant;
    return laudes;
}

function GetAnthem(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationLaudes : Laudes, settings : Settings) : string{
    if(celebrationLaudes.Anthem !== '-'){
        return celebrationLaudes.Anthem;
    }
    
    let anthem = "";
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.O_ORDINARI:
            if(settings.UseLatin){
                anthem = liturgyMasters.LaudesCommonPsalter.LatinAnthem;
            }
            else{
                anthem = liturgyMasters.LaudesCommonPsalter.CatalanAnthem;
            }
            break;
        case GlobalKeys.Q_CENDRA:
        case GlobalKeys.Q_SETMANES:
            if(liturgyDayInformation.DayOfTheWeek === 0){
                if(settings.UseLatin){
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.LaudesSundaysLatinAnthem;
                }
                else{
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.LaudesSundaysCatalanAnthem;
                }
            }
            else{
                if(settings.UseLatin){
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.LaudesFairsLatinAnthem;
                }
                else{
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.LaudesFairsCatalanAnthem;
                }
            }
            break;
        case GlobalKeys.Q_DIUM_RAMS:
        case GlobalKeys.Q_SET_SANTA:
            if(settings.UseLatin){
                anthem = liturgyMasters.CommonPartsOfHolyWeek.LaudesLatinAnthem;
            }
            else{
                anthem = liturgyMasters.CommonPartsOfHolyWeek.LaudesCatalanAnthem;
            }
            break;
        case GlobalKeys.Q_TRIDU:
            if(settings.UseLatin){
                anthem = liturgyMasters.PartsOfEasterTriduum.LaudesLatinAnthem;
            }
            else{
                anthem = liturgyMasters.PartsOfEasterTriduum.LaudesCatalanAnthem;
            }
            break;
        case GlobalKeys.P_OCTAVA:
            if(settings.UseLatin){
                anthem = liturgyMasters.PartsOfEasterBeforeAscension.LaudesWeekendLatinAnthem;
            }
            else{
                anthem = liturgyMasters.PartsOfEasterBeforeAscension.LaudesWeekendCatalanAnthem;
            }
            break;
        case GlobalKeys.P_SETMANES:
            if(liturgyDayInformation.Week === '7'){
                if(settings.UseLatin){
                    anthem = liturgyMasters.PartsOfEasterAfterAscension.LaudesLatinAnthem;
                }
                else{
                    anthem = liturgyMasters.PartsOfEasterAfterAscension.LaudesCatalanAnthem;
                }
            }
            else{
                if(liturgyDayInformation.DayOfTheWeek === 6 || liturgyDayInformation.DayOfTheWeek === 0){
                    if(settings.UseLatin){
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.LaudesWeekendLatinAnthem;
                    }
                    else{
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.LaudesWeekendCatalanAnthem;
                    }
                }
                else{
                    if(settings.UseLatin){
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.LaudesWorkdaysLatinAnthem;
                    }
                    else{
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.LaudesWorkdaysCatalanAnthem;
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
                    anthem = liturgyMasters.CommonAdventAndChristmasParts.LaudesLatinAnthem;
                }
                else{
                    anthem = liturgyMasters.CommonAdventAndChristmasParts.LaudesCatalanAnthem;
                }
            }
            break;
        case GlobalKeys.N_OCTAVA:
            if(settings.UseLatin){
                anthem = liturgyMasters.SolemnityAndFestivityParts.LaudesLatinAnthem;
            }
            else{
                anthem = liturgyMasters.SolemnityAndFestivityParts.LaudesCatalanAnthem;
            }
            break;
    }
    return anthem;
}

function GetPsalmody(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationLaudes : Laudes) : {FirstPsalm : Psalm, SecondPsalm : Psalm, ThirdPsalm : Psalm}{
    let psalmody = {
        FirstPsalm: new Psalm(),
        SecondPsalm: new Psalm(),
        ThirdPsalm: new Psalm()
    }
    
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.O_ORDINARI:
        case GlobalKeys.Q_CENDRA:
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.SpecificLiturgyTime != GlobalKeys.N_ABANS || 
                (liturgyDayInformation.SpecificLiturgyTime == GlobalKeys.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13)){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Antiphon;
                psalmody.FirstPsalm.Title = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Title;
                psalmody.FirstPsalm.Comment = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Comment;
                psalmody.FirstPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Psalm;
                psalmody.FirstPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.FirstPsalm.HasGloryPrayer;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Antiphon;
                psalmody.SecondPsalm.Title = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Title;
                psalmody.SecondPsalm.Comment = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Comment;
                psalmody.SecondPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Psalm;
                psalmody.SecondPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.SecondPsalm.HasGloryPrayer;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Antiphon;
                psalmody.ThirdPsalm.Title = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Title;
                psalmody.ThirdPsalm.Comment = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Comment;
                psalmody.ThirdPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Psalm;
                psalmody.ThirdPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.HasGloryPrayer;
            }
            break;
        case GlobalKeys.A_FERIES:
            psalmody.FirstPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Antiphon;
            psalmody.FirstPsalm.Title = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Title;
            psalmody.FirstPsalm.Comment = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Comment;
            psalmody.FirstPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Psalm;
            psalmody.FirstPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.FirstPsalm.HasGloryPrayer;
            psalmody.SecondPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Antiphon;
            psalmody.SecondPsalm.Title = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Title;
            psalmody.SecondPsalm.Comment = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Comment;
            psalmody.SecondPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Psalm;
            psalmody.SecondPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.SecondPsalm.HasGloryPrayer;
            psalmody.ThirdPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Antiphon;
            psalmody.ThirdPsalm.Title = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Title;
            psalmody.ThirdPsalm.Comment = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Comment;
            psalmody.ThirdPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Psalm;
            psalmody.ThirdPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.HasGloryPrayer;

            if(liturgyDayInformation.DayOfTheWeek !== 0){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.AdventFairDaysAntiphons.LaudesFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.AdventFairDaysAntiphons.LaudesSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.AdventFairDaysAntiphons.LaudesThirdAntiphon;
            }
            break;
        case GlobalKeys.Q_SETMANES:
            psalmody.FirstPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Antiphon;
            psalmody.FirstPsalm.Title = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Title;
            psalmody.FirstPsalm.Comment = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Comment;
            psalmody.FirstPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Psalm;
            psalmody.FirstPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.FirstPsalm.HasGloryPrayer;
            psalmody.SecondPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Antiphon;
            psalmody.SecondPsalm.Title = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Title;
            psalmody.SecondPsalm.Comment = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Comment;
            psalmody.SecondPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Psalm;
            psalmody.SecondPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.SecondPsalm.HasGloryPrayer;
            psalmody.ThirdPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Antiphon;
            psalmody.ThirdPsalm.Title = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Title;
            psalmody.ThirdPsalm.Comment = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Comment;
            psalmody.ThirdPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Psalm;
            psalmody.ThirdPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.HasGloryPrayer;
            if(liturgyDayInformation.DayOfTheWeek === 0){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.FiveWeeksOfSundayLentParts.LaudesFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.FiveWeeksOfSundayLentParts.LaudesSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.FiveWeeksOfSundayLentParts.LaudesThirdAntiphon;
            }
            break;
        case GlobalKeys.Q_DIUM_RAMS:
            psalmody.FirstPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Antiphon;
            psalmody.FirstPsalm.Title = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Title;
            psalmody.FirstPsalm.Comment = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Comment;
            psalmody.FirstPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Psalm;
            psalmody.FirstPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.FirstPsalm.HasGloryPrayer;
            psalmody.SecondPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Antiphon;
            psalmody.SecondPsalm.Title = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Title;
            psalmody.SecondPsalm.Comment = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Comment;
            psalmody.SecondPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Psalm;
            psalmody.SecondPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.SecondPsalm.HasGloryPrayer;
            psalmody.ThirdPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Antiphon;
            psalmody.ThirdPsalm.Title = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Title;
            psalmody.ThirdPsalm.Comment = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Comment;
            psalmody.ThirdPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Psalm;
            psalmody.ThirdPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.HasGloryPrayer;
            if(liturgyDayInformation.DayOfTheWeek === 0){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.PalmSundayParts.LaudesFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.PalmSundayParts.LaudesSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.PalmSundayParts.LaudesThirdAntiphon;
            }
            break;
        case GlobalKeys.Q_SET_SANTA:
            psalmody.FirstPsalm.Title = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Title;
            psalmody.FirstPsalm.Comment = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Comment;
            psalmody.FirstPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Psalm;
            psalmody.FirstPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.FirstPsalm.HasGloryPrayer;
            psalmody.SecondPsalm.Title = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Title;
            psalmody.SecondPsalm.Comment = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Comment;
            psalmody.SecondPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Psalm;
            psalmody.SecondPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.SecondPsalm.HasGloryPrayer;
            psalmody.ThirdPsalm.Title = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Title;
            psalmody.ThirdPsalm.Comment = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Comment;
            psalmody.ThirdPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Psalm;
            psalmody.ThirdPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.HasGloryPrayer;

            psalmody.FirstPsalm.Antiphon = liturgyMasters.PartsOfHolyWeek.LaudesFirstAntiphon;
            psalmody.SecondPsalm.Antiphon = liturgyMasters.PartsOfHolyWeek.LaudesSecondAntiphon;
            psalmody.ThirdPsalm.Antiphon = liturgyMasters.PartsOfHolyWeek.LaudesThirdAntiphon;
            break;
        case GlobalKeys.Q_TRIDU:
            psalmody.FirstPsalm.Antiphon = liturgyMasters.PartsOfEasterTriduum.LaudesFirstPsalm.Antiphon;
            psalmody.FirstPsalm.Title = liturgyMasters.PartsOfEasterTriduum.LaudesFirstPsalm.Title;
            psalmody.FirstPsalm.Comment = "-";
            psalmody.FirstPsalm.Psalm = liturgyMasters.PartsOfEasterTriduum.LaudesFirstPsalm.Psalm;
            psalmody.FirstPsalm.HasGloryPrayer = liturgyMasters.PartsOfEasterTriduum.LaudesFirstPsalm.HasGloryPrayer;
            psalmody.SecondPsalm.Antiphon = liturgyMasters.PartsOfEasterTriduum.LaudesSecondPsalm.Antiphon;
            psalmody.SecondPsalm.Title = liturgyMasters.PartsOfEasterTriduum.LaudesSecondPsalm.Title;
            psalmody.SecondPsalm.Comment = "-";
            psalmody.SecondPsalm.Psalm = liturgyMasters.PartsOfEasterTriduum.LaudesSecondPsalm.Psalm;
            psalmody.SecondPsalm.HasGloryPrayer = liturgyMasters.PartsOfEasterTriduum.LaudesSecondPsalm.HasGloryPrayer;
            psalmody.ThirdPsalm.Antiphon = liturgyMasters.PartsOfEasterTriduum.LaudesThirdPsalm.Antiphon;
            psalmody.ThirdPsalm.Title = liturgyMasters.PartsOfEasterTriduum.LaudesThirdPsalm.Title;
            psalmody.ThirdPsalm.Comment = "-";
            psalmody.ThirdPsalm.Psalm = liturgyMasters.PartsOfEasterTriduum.LaudesThirdPsalm.Psalm;
            psalmody.ThirdPsalm.HasGloryPrayer = liturgyMasters.PartsOfEasterTriduum.LaudesThirdPsalm.HasGloryPrayer;
            break;
        case GlobalKeys.P_OCTAVA:
            psalmody.FirstPsalm.Antiphon = liturgyMasters.EasterSunday.LaudesFirstPsalm.Antiphon;
            psalmody.FirstPsalm.Title = liturgyMasters.EasterSunday.LaudesFirstPsalm.Title;
            psalmody.FirstPsalm.Comment = "-";
            psalmody.FirstPsalm.Psalm = liturgyMasters.EasterSunday.LaudesFirstPsalm.Psalm;
            psalmody.FirstPsalm.HasGloryPrayer = liturgyMasters.EasterSunday.LaudesFirstPsalm.HasGloryPrayer;
            psalmody.SecondPsalm.Antiphon = liturgyMasters.EasterSunday.LaudesSecondPsalm.Antiphon;
            psalmody.SecondPsalm.Title = liturgyMasters.EasterSunday.LaudesSecondPsalm.Title;
            psalmody.SecondPsalm.Comment = "-";
            psalmody.SecondPsalm.Psalm = liturgyMasters.EasterSunday.LaudesSecondPsalm.Psalm;
            psalmody.SecondPsalm.HasGloryPrayer = liturgyMasters.EasterSunday.LaudesSecondPsalm.HasGloryPrayer;
            psalmody.ThirdPsalm.Antiphon = liturgyMasters.EasterSunday.LaudesThirdPsalm.Antiphon;
            psalmody.ThirdPsalm.Title = liturgyMasters.EasterSunday.LaudesThirdPsalm.Title;
            psalmody.ThirdPsalm.Comment = "-";
            psalmody.ThirdPsalm.Psalm = liturgyMasters.EasterSunday.LaudesThirdPsalm.Psalm;
            psalmody.ThirdPsalm.HasGloryPrayer = liturgyMasters.EasterSunday.LaudesThirdPsalm.HasGloryPrayer;
            break;
        case GlobalKeys.P_SETMANES:
            psalmody.FirstPsalm.Title = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Title;
            psalmody.FirstPsalm.Comment = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Comment;
            psalmody.FirstPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Psalm;
            psalmody.FirstPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.FirstPsalm.HasGloryPrayer;
            psalmody.SecondPsalm.Title = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Title;
            psalmody.SecondPsalm.Comment = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Comment;
            psalmody.SecondPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Psalm;
            psalmody.SecondPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.SecondPsalm.HasGloryPrayer;
            psalmody.ThirdPsalm.Title = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Title;
            psalmody.ThirdPsalm.Comment = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Comment;
            psalmody.ThirdPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Psalm;
            psalmody.ThirdPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.HasGloryPrayer;

            if(liturgyDayInformation.DayOfTheWeek === 0){
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
            psalmody.FirstPsalm.Title = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Title;
            psalmody.FirstPsalm.Comment = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Comment;
            psalmody.FirstPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Psalm;
            psalmody.FirstPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.FirstPsalm.HasGloryPrayer;
            psalmody.SecondPsalm.Title = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Title;
            psalmody.SecondPsalm.Comment = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Comment;
            psalmody.SecondPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Psalm;
            psalmody.SecondPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.SecondPsalm.HasGloryPrayer;
            psalmody.ThirdPsalm.Title = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Title;
            psalmody.ThirdPsalm.Comment = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Comment;
            psalmody.ThirdPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Psalm;
            psalmody.ThirdPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.HasGloryPrayer;

            if(liturgyDayInformation.DayOfTheWeek === 0){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.AdventSundayParts.LaudesFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.AdventSundayParts.LaudesSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.AdventSundayParts.LaudesThirdAntiphon;
            }
            else{
                psalmody.FirstPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Antiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Antiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Antiphon;
            }
            break;
        case GlobalKeys.N_OCTAVA:
            psalmody.FirstPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Antiphon;
            psalmody.FirstPsalm.Title = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Title;
            psalmody.FirstPsalm.Comment = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Comment;
            psalmody.FirstPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Psalm;
            psalmody.FirstPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.FirstPsalm.HasGloryPrayer;
            psalmody.SecondPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Antiphon;
            psalmody.SecondPsalm.Title = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Title;
            psalmody.SecondPsalm.Comment = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Comment;
            psalmody.SecondPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.SecondPsalm.Psalm;
            psalmody.SecondPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.SecondPsalm.HasGloryPrayer;
            psalmody.ThirdPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Antiphon;
            psalmody.ThirdPsalm.Title = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Title;
            psalmody.ThirdPsalm.Comment = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Comment;
            psalmody.ThirdPsalm.Psalm = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.Psalm;
            psalmody.ThirdPsalm.HasGloryPrayer = liturgyMasters.LaudesCommonPsalter.ThirdPsalm.HasGloryPrayer;

            if(liturgyDayInformation.Date.getDate() === 25 && liturgyDayInformation.Date.getMonth() === 11){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Antiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Antiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.LaudesCommonPsalter.FirstPsalm.Antiphon;
            }
            else {
                psalmody.FirstPsalm.Antiphon = liturgyMasters.SolemnityAndFestivityParts.LaudesFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.SolemnityAndFestivityParts.LaudesSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.SolemnityAndFestivityParts.LaudesThirdAntiphon;
            }
            break;
    }

    if(celebrationLaudes.FirstPsalm.Antiphon !== '-'){
        psalmody.FirstPsalm.Antiphon = celebrationLaudes.FirstPsalm.Antiphon;
    }
    if(celebrationLaudes.FirstPsalm.Title !== '-'){
        psalmody.FirstPsalm.Title = celebrationLaudes.FirstPsalm.Title;
        psalmody.FirstPsalm.Comment = "-";
    }
    if(celebrationLaudes.FirstPsalm.Psalm !== '-')
    {
        psalmody.FirstPsalm.Psalm = celebrationLaudes.FirstPsalm.Psalm;
        psalmody.FirstPsalm.HasGloryPrayer = celebrationLaudes.FirstPsalm.HasGloryPrayer;
    }
    if(celebrationLaudes.SecondPsalm.Antiphon !== '-'){
        psalmody.SecondPsalm.Antiphon = celebrationLaudes.SecondPsalm.Antiphon;
    }
    if(celebrationLaudes.SecondPsalm.Title !== '-'){
        psalmody.SecondPsalm.Title = celebrationLaudes.SecondPsalm.Title;
        psalmody.SecondPsalm.Comment = "-";
    }
    if(celebrationLaudes.SecondPsalm.Psalm !== '-')
    {
        psalmody.SecondPsalm.Psalm = celebrationLaudes.SecondPsalm.Psalm;
        psalmody.SecondPsalm.HasGloryPrayer = celebrationLaudes.SecondPsalm.HasGloryPrayer;
    }
    if(celebrationLaudes.ThirdPsalm.Antiphon !== '-'){
        psalmody.ThirdPsalm.Antiphon = celebrationLaudes.ThirdPsalm.Antiphon;
    }
    if(celebrationLaudes.ThirdPsalm.Title !== '-'){
        psalmody.ThirdPsalm.Title = celebrationLaudes.ThirdPsalm.Title;
        psalmody.ThirdPsalm.Comment = "-";
    }
    if(celebrationLaudes.ThirdPsalm.Psalm !== '-')
    {
        psalmody.ThirdPsalm.Psalm = celebrationLaudes.ThirdPsalm.Psalm;
        psalmody.ThirdPsalm.HasGloryPrayer = celebrationLaudes.ThirdPsalm.HasGloryPrayer;
    }

    return psalmody;
}

function GetShortReading(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationLaudes : Laudes) : ShortReading{
    if(celebrationLaudes.ShortReading.Quote !== "-"){
        return celebrationLaudes.ShortReading;
    }

    let shortReading = liturgyMasters.LaudesCommonPsalter.ShortReading;
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.Q_CENDRA:
            return liturgyMasters.PartsOfLentTime.LaudesShortReading;
        case GlobalKeys.Q_SETMANES:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.LaudesShortReading;
        case GlobalKeys.Q_DIUM_RAMS:
            return liturgyMasters.PalmSundayParts.LaudesShortReading;
        case GlobalKeys.Q_SET_SANTA:
            return liturgyMasters.PartsOfHolyWeek.LaudesShortReading;
        case GlobalKeys.Q_TRIDU:
            return liturgyMasters.PartsOfEasterTriduum.LaudesShortReading;
        case GlobalKeys.P_OCTAVA:
            return liturgyMasters.PartsOfEasterOctave.LaudesShortReading;
        case GlobalKeys.P_SETMANES:
            return liturgyMasters.EasterWeekParts.LaudesShortReading;
        case GlobalKeys.A_SETMANES:
            return liturgyMasters.AdventWeekParts.LaudesShortReading;
        case GlobalKeys.A_FERIES:
            return liturgyMasters.AdventFairDaysParts.LaudesShortReading;
        case GlobalKeys.N_OCTAVA:
            return liturgyMasters.ChristmasWhenOctaveParts.LaudesShortReading;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                return liturgyMasters.ChristmasBeforeEpiphanyParts.LaudesShortReading;
            }
            break;
    }
    return shortReading;
}

function GetShortResponsory(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationLaudes : Laudes) : ShortResponsory{
    if(liturgyDayInformation.SpecificLiturgyTime === GlobalKeys.Q_DIUM_PASQUA ||
        celebrationLaudes.ShortResponsory.FirstPart !== "-"){
        return celebrationLaudes.ShortResponsory;
    }
    else{
        if(liturgyDayInformation.SpecificLiturgyTime === GlobalKeys.Q_TRIDU){
            return liturgyMasters.PartsOfEasterTriduum.LaudesShortResponsory;
        }
        else if(liturgyDayInformation.SpecificLiturgyTime === GlobalKeys.P_OCTAVA){
            return liturgyMasters.PartsOfEasterOctave.LaudesShortResponsory;
        }
    }

    let shortResponsory = liturgyMasters.LaudesCommonPsalter.ShortResponsory;
    shortResponsory.HasSpecialAntiphon = false;
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.Q_CENDRA:
            return liturgyMasters.PartsOfLentTime.LaudesShortResponsory;
        case GlobalKeys.Q_SETMANES:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.LaudesShortResponsory;
        case GlobalKeys.Q_DIUM_RAMS:
            return liturgyMasters.PalmSundayParts.LaudesShortResponsory;
        case GlobalKeys.Q_SET_SANTA:
            return liturgyMasters.PartsOfHolyWeek.LaudesShortResponsory;
        case GlobalKeys.P_SETMANES:
            return liturgyMasters.EasterWeekParts.LaudesShortResponsory;
        case GlobalKeys.A_SETMANES:
            return liturgyMasters.AdventWeekParts.LaudesShortResponsory;
        case GlobalKeys.A_FERIES:
            return liturgyMasters.AdventFairDaysParts.LaudesShortResponsory;
        case GlobalKeys.N_OCTAVA:
            return liturgyMasters.ChristmasWhenOctaveParts.LaudesShortResponsory;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                return liturgyMasters.ChristmasBeforeEpiphanyParts.LaudesShortResponsory;
            }
            break;
    }
    return shortResponsory;
}

function GetEvangelicalAntiphon(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationLaudes : Laudes) : string{
    if(celebrationLaudes.EvangelicalAntiphon !== "-"){
        return celebrationLaudes.EvangelicalAntiphon;
    }

    let evangelicalAntiphon = liturgyMasters.LaudesCommonPsalter.EvangelicalAntiphon;
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.O_ORDINARI:
            if(liturgyDayInformation.DayOfTheWeek === 0){
                switch (liturgyDayInformation.YearType) {
                    case YearType.A:
                        return liturgyMasters.PrayersOfOrdinaryTime.LaudesEvangelicalAntiphonYearA;
                    case YearType.B:
                        return liturgyMasters.PrayersOfOrdinaryTime.LaudesEvangelicalAntiphonYearB;
                    case YearType.C:
                        return liturgyMasters.PrayersOfOrdinaryTime.LaudesEvangelicalAntiphonYearC;
                }
            }
            break;
        case GlobalKeys.Q_CENDRA:
            return liturgyMasters.PartsOfLentTime.LaudesEvangelicalAntiphon;
        case GlobalKeys.Q_SETMANES:
            if(liturgyDayInformation.DayOfTheWeek !== 0){
                return liturgyMasters.PartsOfFiveWeeksOfLentTime.LaudesEvangelicalAntiphon;
            }
            else{
                switch (liturgyDayInformation.YearType) {
                    case YearType.A:
                        return liturgyMasters.FiveWeeksOfSundayLentParts.LaudesEvangelicalAntiphonYearA;
                    case YearType.B:
                        return liturgyMasters.FiveWeeksOfSundayLentParts.LaudesEvangelicalAntiphonYearB;
                    case YearType.C:
                        return liturgyMasters.FiveWeeksOfSundayLentParts.LaudesEvangelicalAntiphonYearC;
                }
            }
            break;
        case GlobalKeys.Q_DIUM_RAMS:
            switch (liturgyDayInformation.YearType) {
                case YearType.A:
                    return liturgyMasters.PalmSundayParts.LaudesEvangelicalAntiphonYearA;
                case YearType.B:
                    return liturgyMasters.PalmSundayParts.LaudesEvangelicalAntiphonYearB;
                case YearType.C:
                    return liturgyMasters.PalmSundayParts.LaudesEvangelicalAntiphonYearC;
            }
            break;
        case GlobalKeys.Q_SET_SANTA:
            return liturgyMasters.PartsOfHolyWeek.LaudesEvangelicalAntiphon;
        case GlobalKeys.Q_TRIDU:
            return liturgyMasters.PartsOfEasterTriduum.LaudesEvangelicalAntiphon;
        case GlobalKeys.P_OCTAVA:
            return liturgyMasters.PartsOfEasterOctave.LaudesEvangelicalAntiphon;
        case GlobalKeys.P_SETMANES:
            if(liturgyDayInformation.DayOfTheWeek !== 0){
                return liturgyMasters.EasterWeekParts.LaudesEvangelicalAntiphon;
            }
            else{
                switch (liturgyDayInformation.YearType) {
                    case YearType.A:
                        return liturgyMasters.EasterSundayParts.LaudesEvangelicalAntiphonYearA;
                    case YearType.B:
                        return liturgyMasters.EasterSundayParts.LaudesEvangelicalAntiphonYearB;
                    case YearType.C:
                        return liturgyMasters.EasterSundayParts.LaudesEvangelicalAntiphonYearC;
                }
            }
            break;
        case GlobalKeys.A_SETMANES:
            if(liturgyDayInformation.DayOfTheWeek !== 0){
                 return liturgyMasters.AdventWeekParts.LaudesEvangelicalAntiphon;
            }
            else{
                switch (liturgyDayInformation.YearType) {
                    case YearType.A:
                        return liturgyMasters.AdventSundayParts.LaudesEvangelicalAntiphonYearA;
                    case YearType.B:
                        return liturgyMasters.AdventSundayParts.LaudesEvangelicalAntiphonYearB;
                    case YearType.C:
                        return liturgyMasters.AdventSundayParts.LaudesEvangelicalAntiphonYearC;
                }
            }
            break;
        case GlobalKeys.A_FERIES:
            return liturgyMasters.AdventFairDaysParts.LaudesEvangelicalAntiphon;
        case GlobalKeys.N_OCTAVA:
            return liturgyMasters.ChristmasWhenOctaveParts.LaudesEvangelicalAntiphon;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                return liturgyMasters.ChristmasBeforeEpiphanyParts.LaudesEvangelicalAntiphon;
            }
            break;
    }
    return evangelicalAntiphon;
}

function GetPrayers(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationLaudes : Laudes) : string{
    if(celebrationLaudes.Prayers !== "-"){
        return celebrationLaudes.Prayers;
    }

    let prayers = liturgyMasters.LaudesCommonPsalter.Prayers;
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.Q_CENDRA:
            return liturgyMasters.PartsOfLentTime.LaudesPrayers;
        case GlobalKeys.Q_SETMANES:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.LaudesPrayers;
        case GlobalKeys.Q_DIUM_RAMS:
            return liturgyMasters.PalmSundayParts.LaudesPrayers;
        case GlobalKeys.Q_SET_SANTA:
            return liturgyMasters.PartsOfHolyWeek.LaudesPrayers;
        case GlobalKeys.Q_TRIDU:
            return liturgyMasters.PartsOfEasterTriduum.LaudesPrayers;
        case GlobalKeys.P_OCTAVA:
            return liturgyMasters.PartsOfEasterOctave.LaudesPrayers;
        case GlobalKeys.P_SETMANES:
            return liturgyMasters.EasterWeekParts.LaudesPrayers;
        case GlobalKeys.A_SETMANES:
            return liturgyMasters.AdventWeekParts.LaudesPrayers;
        case GlobalKeys.A_FERIES:
            return liturgyMasters.AdventFairDaysParts.LaudesPrayers;
        case GlobalKeys.N_OCTAVA:
            return liturgyMasters.ChristmasWhenOctaveParts.LaudesPrayers;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                return liturgyMasters.ChristmasBeforeEpiphanyParts.LaudesPrayers;
            }
            break;
    }
    return prayers;
}

function GetFinalPrayer(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationLaudes : Laudes) : string{
    if(celebrationLaudes.FinalPrayer !== "-"){
        return celebrationLaudes.FinalPrayer;
    }

    let finalPrayer = liturgyMasters.LaudesCommonPsalter.FinalPrayer;
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.O_ORDINARI:
            if(liturgyDayInformation.DayOfTheWeek === 0) {
                return liturgyMasters.PrayersOfOrdinaryTime.FinalPrayer;
            }
            break;
        case GlobalKeys.Q_CENDRA:
            return liturgyMasters.PartsOfLentTime.LaudesFinalPrayer;
        case GlobalKeys.Q_SETMANES:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.LaudesFinalPrayer;
        case GlobalKeys.Q_DIUM_RAMS:
            return liturgyMasters.PalmSundayParts.LaudesFinalPrayer;
        case GlobalKeys.Q_SET_SANTA:
            return liturgyMasters.PartsOfHolyWeek.LaudesFinalPrayer;
        case GlobalKeys.Q_TRIDU:
            return liturgyMasters.PartsOfEasterTriduum.LaudesFinalPrayer;
        case GlobalKeys.P_OCTAVA:
            return liturgyMasters.PartsOfEasterOctave.LaudesFinalPrayer;
        case GlobalKeys.P_SETMANES:
            return liturgyMasters.EasterWeekParts.LaudesFinalPrayer;
        case GlobalKeys.A_SETMANES:
            return liturgyMasters.AdventWeekParts.LaudesFinalPrayer;
        case GlobalKeys.A_FERIES:
            return liturgyMasters.AdventFairDaysParts.LaudesFinalPrayer;
        case GlobalKeys.N_OCTAVA:
            return liturgyMasters.ChristmasWhenOctaveParts.LaudesFinalPrayer;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                return liturgyMasters.ChristmasBeforeEpiphanyParts.LaudesFinalPrayer;
            }
            break;
    }
    return finalPrayer;
}