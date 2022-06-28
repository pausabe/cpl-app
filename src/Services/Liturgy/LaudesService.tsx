import Laudes from "../../Models/HoursLiturgy/Laudes";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";
import GlobalKeys from "../../Utils/GlobalKeys";
import {Settings} from "../../Models/Settings";
import { Psalm } from "../../Models/LiturgyMasters/CommonParts";

export function ObtainLaudes(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationLaudes : Laudes, settings : Settings) : Laudes{
    let laudes = new Laudes();
    if(liturgyDayInformation.SpecificLiturgyTime === GlobalKeys.Q_DIUM_PASQUA) {
        laudes = celebrationLaudes;
        laudes.EvangelicalChant = liturgyMasters.Various.LaudesEvangelicalChant;
    }
    else{
        laudes.Anthem = GetAnthem(liturgyMasters, liturgyDayInformation, celebrationLaudes, settings);
        const psalmody = GetPsalmody(liturgyMasters, liturgyDayInformation, celebrationLaudes);
        laudes.FirstPsalm = psalmody.FirstPsalm;
        laudes.SecondPsalm = psalmody.SecondPsalm;
        laudes.ThirdPsalm = psalmody.ThirdPsalm;
        lecturaBreu(GlobalData.LT, CEL, date);
        responsori(GlobalData.LT, CEL, date);
        cantic(GlobalData.LT, liturgyDayInformation.Date.getDay(), GlobalData.ABC, CEL, date);
        pregaries(GlobalData.LT, CEL, date);
        oracio(GlobalData.LT, liturgyDayInformation.Date.getDay(), CEL, date);
    }
    return laudes;
}

function GetAnthem(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationLaudes : Laudes, settings : Settings) : string{
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
    return celebrationLaudes.Anthem === '-'? anthem : celebrationLaudes.Anthem;
}

function GetPsalmody(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationLaudes : Laudes) : {FirstPsalm : Psalm, SecondPsalm : Psalm, ThirdPsalm : Psalm}{
    let psalmody = {
        FirstPsalm = new Psalm(),
        SecondPsalm = new Psalm(),
        ThirdPsalm = new Psalm()
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

lecturaBreu(LT, CEL, date){
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.O_ORDINARI:
            vers = liturgyMasters.LaudesCommonPsalter.versetLB;
            lecturaBreu = liturgyMasters.LaudesCommonPsalter.lecturaBreu;
            break;
        case GlobalKeys.Q_CENDRA:
            vers = tempsQuaresmaCendra.citaLBLaudes;
            lecturaBreu = tempsQuaresmaCendra.lecturaBreuLaudes;
            break;
        case GlobalKeys.Q_SETMANES:
            vers = tempsQuaresmaVSetmanes.citaLBLaudes;
            lecturaBreu = tempsQuaresmaVSetmanes.lecturaBreuLaudes;
            break;
        case GlobalKeys.Q_DIUM_RAMS:
            vers = liturgyMasters.PalmSundayParts.citaLBLaudes;
            lecturaBreu = liturgyMasters.PalmSundayParts.lecturaBreuLaudes;
            break;
        case GlobalKeys.Q_SET_SANTA:
            vers = liturgyMasters.PartsOfHolyWeek.citaLBLaudes;
            lecturaBreu = liturgyMasters.PartsOfHolyWeek.lecturaBreuLaudes;
            break;
        case GlobalKeys.Q_TRIDU:
            vers = liturgyMasters.PartsOfEasterTriduum.citaLBLaudes;
            lecturaBreu = liturgyMasters.PartsOfEasterTriduum.lecturaBreuLaudes;
            break;
        case GlobalKeys.P_OCTAVA:
            vers = tempsPasquaOct.citaLBLaudes;
            lecturaBreu = tempsPasquaOct.lecturaBreuLaudes;
            break;
        case GlobalKeys.P_SETMANES:
            vers = tempsPasquaSetmanes.citaLBLaudes;
            lecturaBreu = tempsPasquaSetmanes.lecturaBreuLaudes;
            break;
        case GlobalKeys.A_SETMANES:
            vers = tempsAdventSetmanes.citaLBLaudes;
            lecturaBreu = tempsAdventSetmanes.lecturaBreuLaudes;
            break;
        case GlobalKeys.A_FERIES:
            vers = tempsAdventFeries.citaLBLaudes;
            lecturaBreu = tempsAdventFeries.lecturaBreuLaudes;
            break;
        case GlobalKeys.N_OCTAVA:
            vers = tempsNadalOctava.citaLBLaudes;
            lecturaBreu = tempsNadalOctava.lecturaBreuLaudes;
            break;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                vers = tempsNadalAbansEpifania.citaLBLaudes;
                lecturaBreu = tempsNadalAbansEpifania.lecturaBreuLaudes;
            }
            break;
    }
    if(CEL.vers === '-')
        LAUDES.vers = vers;
    else LAUDES.vers = CEL.vers;
    if(CEL.lecturaBreu === '-')
        LAUDES.lecturaBreu = lecturaBreu;
    else LAUDES.lecturaBreu = CEL.lecturaBreu;
}

responsori(LT, CEL, date){
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.O_ORDINARI:
            respBreu1 = liturgyMasters.LaudesCommonPsalter.respBreu1
            respBreu2 = liturgyMasters.LaudesCommonPsalter.respBreu2
            respBreu3 = liturgyMasters.LaudesCommonPsalter.respBreu3
            break;
        case GlobalKeys.Q_CENDRA:
            respBreu1 = tempsQuaresmaCendra.respBreuLaudes1
            respBreu2 = tempsQuaresmaCendra.respBreuLaudes2
            respBreu3 = tempsQuaresmaCendra.respBreuLaudes3
            break;
        case GlobalKeys.Q_SETMANES:
            respBreu1 = tempsQuaresmaVSetmanes.respBreuLaudes1
            respBreu2 = tempsQuaresmaVSetmanes.respBreuLaudes2
            respBreu3 = tempsQuaresmaVSetmanes.respBreuLaudes3
            break;
        case GlobalKeys.Q_DIUM_RAMS:
            respBreu1 = liturgyMasters.PalmSundayParts.respBreu1Laudes
            respBreu2 = liturgyMasters.PalmSundayParts.respBreu2Laudes
            respBreu3 = liturgyMasters.PalmSundayParts.respBreu3Laudes
            break;
        case GlobalKeys.Q_SET_SANTA:
            respBreu1 = liturgyMasters.PartsOfHolyWeek.respBreu1Laudes
            respBreu2 = liturgyMasters.PartsOfHolyWeek.respBreu2Laudes
            respBreu3 = liturgyMasters.PartsOfHolyWeek.respBreu3Laudes
            break;
        case GlobalKeys.P_SETMANES:
            respBreu1 = tempsPasquaSetmanes.respBreuLaudes1
            respBreu2 = tempsPasquaSetmanes.respBreuLaudes2
            respBreu3 = tempsPasquaSetmanes.respBreuLaudes3
            break;
        case GlobalKeys.A_SETMANES:
            respBreu1 = tempsAdventSetmanes.respBreuLaudes1
            respBreu2 = tempsAdventSetmanes.respBreuLaudes2
            respBreu3 = tempsAdventSetmanes.respBreuLaudes3
            break;
        case GlobalKeys.A_FERIES:
            respBreu1 = tempsAdventFeries.respBreuLaudes1
            respBreu2 = tempsAdventFeries.respBreuLaudes2
            respBreu3 = tempsAdventFeries.respBreuLaudes3
            break;
        case GlobalKeys.N_OCTAVA:
            respBreu1 = tempsNadalOctava.resp2Breu1Laudes
            respBreu2 = tempsNadalOctava.resp2Breu2Laudes
            respBreu3 = tempsNadalOctava.resp2Breu3Laudes
            break;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                respBreu1 = tempsNadalAbansEpifania.respBreuLaudes1
                respBreu2 = tempsNadalAbansEpifania.respBreuLaudes2
                respBreu3 = tempsNadalAbansEpifania.respBreuLaudes3
            }
            break;
    }
    if(CEL.diumPasqua){
        LAUDES.calAntEspecial = true;
        LAUDES.antEspecialLaudes = CEL.antEspecialLaudes;
    }
    else{
        if(CEL.respBreu1 === '-'){
            if(liturgyDayInformation.SpecificLiturgyTime === GlobalKeys.Q_TRIDU){
                LAUDES.calAntEspecial = true;
                LAUDES.antEspecialLaudes = liturgyMasters.PartsOfEasterTriduum.antEspecialLaudes;
            }
            else if(liturgyDayInformation.SpecificLiturgyTime === GlobalKeys.P_OCTAVA){
                LAUDES.calAntEspecial = true;
                LAUDES.antEspecialLaudes = tempsPasquaOct.antEspecialLaudes;
            }
            else{
                LAUDES.calAntEspecial = false;
                LAUDES.respBreu1 = respBreu1;
                LAUDES.respBreu2 = respBreu2;
                LAUDES.respBreu3 = respBreu3;
            }
        }
        else {
            LAUDES.calAntEspecial = false;
            LAUDES.respBreu1 = CEL.respBreu1;
            LAUDES.respBreu2 = CEL.respBreu2;
            LAUDES.respBreu3 = CEL.respBreu3;
        }
    }
}

cantic(LT, liturgyDayInformation.DayOfTheWeek, litYear, CEL, date){
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.O_ORDINARI:
            if(liturgyDayInformation.DayOfTheWeek !== 0){ ///no diumenge
                antCantic = liturgyMasters.LaudesCommonPsalter.antEvangelic;
            }
            else{ //diumenge
                switch (litYear) {
                    case 'A':
                        antCantic = tempsOrdinariOracions.antZacariesA;
                        break;
                    case 'B':
                        antCantic = tempsOrdinariOracions.antZacariesB;
                        break;
                    case 'C':
                        antCantic = tempsOrdinariOracions.antZacariesC;
                        break;
                }
            }
            break;
        case GlobalKeys.Q_CENDRA:
            antCantic = tempsQuaresmaCendra.antZacaries;
            break;
        case GlobalKeys.Q_SETMANES:
            if(liturgyDayInformation.DayOfTheWeek !== 0){ ///no diumenge
                antCantic = tempsQuaresmaVSetmanes.antZacaries;
            }
            else{ //diumenge
                switch (litYear) {
                    case 'A':
                        antCantic = tempsQuaresmaVSetmanesDium.antZacariesA;
                        break;
                    case 'B':
                        antCantic = tempsQuaresmaVSetmanesDium.antZacariesB;
                        break;
                    case 'C':
                        antCantic = tempsQuaresmaVSetmanesDium.antZacariesC;
                        break;
                }
            }
            break;
        case GlobalKeys.Q_DIUM_RAMS:
            switch (litYear) {
                case 'A':
                    antCantic = liturgyMasters.PalmSundayParts.antZacariesA;
                    break;
                case 'B':
                    antCantic = liturgyMasters.PalmSundayParts.antZacariesB;
                    break;
                case 'C':
                    antCantic = liturgyMasters.PalmSundayParts.antZacariesC;
                    break;
            }
            break;
        case GlobalKeys.Q_SET_SANTA:
            antCantic = liturgyMasters.PartsOfHolyWeek.antZacaries;
            break;
        case GlobalKeys.Q_TRIDU:
            antCantic = liturgyMasters.PartsOfEasterTriduum.antZacaries;
            break;
        case GlobalKeys.P_OCTAVA:
            antCantic = tempsPasquaOct.antZacaries;
            break;
        case GlobalKeys.P_SETMANES:
            if(liturgyDayInformation.DayOfTheWeek !== 0){ ///no diumenge
                antCantic = tempsPasquaSetmanes.antZacaries;
            }
            else{ //diumenge
                switch (litYear) {
                    case 'A':
                        antCantic = liturgyMasters.EasterSundayParts.antZacariesA;
                        break;
                    case 'B':
                        antCantic = liturgyMasters.EasterSundayParts.antZacariesB;
                        break;
                    case 'C':
                        antCantic = liturgyMasters.EasterSundayParts.antZacariesC;
                        break;
                }
            }
            break;
        case GlobalKeys.A_SETMANES:
            if(liturgyDayInformation.DayOfTheWeek !== 0){ ///no diumenge
                antCantic = tempsAdventSetmanes.antZacaries;
            }
            else{ //diumenge
                switch (litYear) {
                    case 'A':
                        antCantic = liturgyMasters.AdventSundayParts.antZacariesA;
                        break;
                    case 'B':
                        antCantic = liturgyMasters.AdventSundayParts.antZacariesB;
                        break;
                    case 'C':
                        antCantic = liturgyMasters.AdventSundayParts.antZacariesC;
                        break;
                }
            }
            break;
        case GlobalKeys.A_FERIES:
            antCantic = tempsAdventFeries.antZacaries;
            break;
        case GlobalKeys.N_OCTAVA:
            antCantic = tempsNadalOctava.antZacaries;
            break;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                antCantic = tempsNadalAbansEpifania.antZacaries;
            }
            break;
    }
    LAUDES.cantic = benedictus;

    if(CEL.antCantic === '-')
        LAUDES.antCantic = antCantic;
    else LAUDES.antCantic = CEL.antCantic;
}

pregaries(LT, CEL, date){
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.O_ORDINARI:
            pregaries = liturgyMasters.LaudesCommonPsalter.pregaries;
            break;
        case GlobalKeys.Q_CENDRA:
            pregaries = tempsQuaresmaCendra.pregariesLaudes;
            break;
        case GlobalKeys.Q_SETMANES:
            pregaries = tempsQuaresmaVSetmanes.pregariesLaudes;
            break;
        case GlobalKeys.Q_DIUM_RAMS:
            pregaries = liturgyMasters.PalmSundayParts.pregariesLaudes;
            break;
        case GlobalKeys.Q_SET_SANTA:
            pregaries = liturgyMasters.PartsOfHolyWeek.pregariesLaudes;
            break;
        case GlobalKeys.Q_TRIDU:
            pregaries = liturgyMasters.PartsOfEasterTriduum.pregariesLaudes;
            break;
        case GlobalKeys.P_OCTAVA:
            pregaries = tempsPasquaOct.pregariesLaudes;
            break;
        case GlobalKeys.P_SETMANES:
            pregaries = tempsPasquaSetmanes.pregariesLaudes;
            break;
        case GlobalKeys.A_SETMANES:
            pregaries = tempsAdventSetmanes.pregariesLaudes;
            break;
        case GlobalKeys.A_FERIES:
            pregaries = tempsAdventFeries.pregariesLaudes;
            break;
        case GlobalKeys.N_OCTAVA:
            pregaries = tempsNadalOctava.pregariesLaudes;
            break;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                pregaries = tempsNadalAbansEpifania.pregariesLaudes;
            }
            break;
    }
    if(CEL.pregaries === '-')
        LAUDES.pregaries = pregaries;
    else LAUDES.pregaries = CEL.pregaries;
}

oracio(LT, liturgyDayInformation.DayOfTheWeek, CEL, date){
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case GlobalKeys.O_ORDINARI:
            if(liturgyDayInformation.DayOfTheWeek !== 0){ ///no diumenge
                oracio = liturgyMasters.LaudesCommonPsalter.oraFi;
            }
            else{ //diumenge
                oracio = tempsOrdinariOracions.oracio;
            }
            break;
        case GlobalKeys.Q_CENDRA:
            oracio = tempsQuaresmaCendra.oraFiLaudes;
            break;
        case GlobalKeys.Q_SETMANES:
            oracio = tempsQuaresmaVSetmanes.oraFiLaudes;
            break;
        case GlobalKeys.Q_DIUM_RAMS:
            oracio = liturgyMasters.PalmSundayParts.oraFiLaudes;
            break;
        case GlobalKeys.Q_SET_SANTA:
            oracio = liturgyMasters.PartsOfHolyWeek.oraFiLaudes;
            break;
        case GlobalKeys.Q_TRIDU:
            oracio = liturgyMasters.PartsOfEasterTriduum.oraFiLaudes;
            break;
        case GlobalKeys.P_OCTAVA:
            oracio = tempsPasquaOct.oraFiLaudes;
            break;
        case GlobalKeys.P_SETMANES:
            oracio = tempsPasquaSetmanes.oraFiLaudes;
            break;
        case GlobalKeys.A_SETMANES:
            oracio = tempsAdventSetmanes.oraFiLaudes;
            break;
        case GlobalKeys.A_FERIES:
            oracio = tempsAdventFeries.oraFiLaudes;
            break;
        case GlobalKeys.N_OCTAVA:
            oracio = tempsNadalOctava.oraFiLaudes;
            break;
        case GlobalKeys.N_ABANS:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                oracio = tempsNadalAbansEpifania.oraFiLaudes;
            }
            break;
    }
    if(CEL.oracio === '-')
        LAUDES.oracio = oracio;
    else LAUDES.oracio = CEL.oracio;
}