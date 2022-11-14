import HoursLiturgy from "../../Models/HoursLiturgy/HoursLiturgy";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import LiturgyDayInformation, {
    LiturgySpecificDayInformation,
    SpecialCelebrationTypeEnum
} from "../../Models/LiturgyDayInformation";
import {Settings} from "../../Models/Settings";
import {CelebrationType, YearType} from "../DatabaseEnums";
import Vespers from "../../Models/HoursLiturgy/Vespers";
import {SpecificLiturgyTimeType} from "../CelebrationTimeEnums";
import SaintsSolemnities from "../../Models/LiturgyMasters/SaintsSolemnities";
import SaintsMemories from "../../Models/LiturgyMasters/SaintsMemories";
import SpecialDaysParts from "../../Models/LiturgyMasters/SpecialDaysParts";
import EasterSunday from "../../Models/LiturgyMasters/EasterSunday";
import SolemnityAndFestivityParts from "../../Models/LiturgyMasters/SolemnityAndFestivityParts";
import {StringManagement} from "../../Utils/StringManagement";
import PalmSundayParts from "../../Models/LiturgyMasters/PalmSundayParts";
import CommonPartsOfHolyWeek from "../../Models/LiturgyMasters/CommonPartsOfHolyWeek";
import PartsOfEasterTriduum from "../../Models/LiturgyMasters/PartsOfEasterTriduum";
import CommonAdventAndChristmasParts from "../../Models/LiturgyMasters/CommonAdventAndChristmasParts";
import AdventWeekParts from "../../Models/LiturgyMasters/AdventWeekParts";
import AdventSundayParts from "../../Models/LiturgyMasters/AdventSundayParts";

export function ObtainCelebrationHoursLiturgy(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgyDayInformation, settings: Settings): HoursLiturgy{
    let hoursLiturgy: HoursLiturgy;

    if(liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.SpecialDay){
        hoursLiturgy = GetSpecialDayHoursLiturgy(liturgyMasters.SpecialDaysParts, settings);
    }
    else if(liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.StrongTime){
        hoursLiturgy = GetSolemnityAndFestivityHoursLiturgy(liturgyMasters.SolemnityAndFestivityParts, liturgyDayInformation.Today, settings);
    }
    else if(liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_DIUM_PASQUA){
        hoursLiturgy = GetEasterSundayHoursLiturgy(liturgyMasters.EasterSunday, settings);
    }
    else{
        hoursLiturgy = GetNormalCelebrationHoursLiturgy(liturgyMasters, liturgyDayInformation.Today, settings);
    }

    hoursLiturgy.VespersOptions.TomorrowFirstVespersWithCelebration =
        GetFirstVespersWithCelebration(liturgyMasters, liturgyDayInformation.Tomorrow, settings);

    return hoursLiturgy;
}

function GetNormalCelebrationHoursLiturgy(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgySpecificDayInformation, settings: Settings): HoursLiturgy{
    let hoursLiturgy = new HoursLiturgy();
    switch (liturgyDayInformation.CelebrationType) {
        case CelebrationType.Solemnity:
            hoursLiturgy = GetSaintsSolemnitiesHoursLiturgy(liturgyMasters.SaintsSolemnities, settings);
            break;
        case CelebrationType.Festivity:
            if(liturgyDayInformation.Date.getDay() !== 0) {
                hoursLiturgy = GetSaintsSolemnitiesHoursLiturgy(liturgyMasters.SaintsSolemnities, settings);
            }
            break;
        case CelebrationType.OptionalMemory:
        case CelebrationType.OptionalVirginMemory:
            if(liturgyDayInformation.Date.getDay() !== 0 &&
                settings.OptionalFestivityEnabled === true){
                hoursLiturgy = GetSaintsMemoriesHoursLiturgy(liturgyMasters.SaintsMemories, liturgyDayInformation, settings);
            }
            break;
        case CelebrationType.Memory:
            if(liturgyDayInformation.Date.getDay() !== 0) {
                hoursLiturgy = GetSaintsMemoriesHoursLiturgy(liturgyMasters.SaintsMemories, liturgyDayInformation, settings);
            }
            break;
    }
    return hoursLiturgy;
}

function GetFirstVespersWithCelebration(liturgyMasters: LiturgyMasters, tomorrowLiturgyInformation: LiturgySpecificDayInformation, settings: Settings) : Vespers{
   if(tomorrowLiturgyInformation.SpecialCelebration.SolemnityAndFestivityMasterIdentifier !== -1) {
       return GetSolemnityAndFestivityFirstVespersOfTomorrow(liturgyMasters.SolemnityAndFestivityWhenFirstVespersParts, tomorrowLiturgyInformation, settings);
   }
   if(tomorrowLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_DIUM_RAMS) {
       return GetPalmSundayFistVespersOfTomorrow(liturgyMasters.PalmSundayParts, liturgyMasters.CommonPartsOfHolyWeek, tomorrowLiturgyInformation, settings);
   }
   if(tomorrowLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_TRIDU &&
       tomorrowLiturgyInformation.Date.getDay() === 5) {
       return GetEasterTriduumFistVespersOfTomorrow(liturgyMasters.PartsOfEasterTriduum, settings);
   }
   if(tomorrowLiturgyInformation.Date.getDay() === 0 &&
       tomorrowLiturgyInformation.Week === '1' &&
       tomorrowLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.A_SETMANES) {
       return GetAdventSundayFirstVespersOfTomorrow(
           liturgyMasters.AdventFirstVespersOfSundayParts,
           liturgyMasters.AdventWeekParts,
           liturgyMasters.CommonAdventAndChristmasParts,
           tomorrowLiturgyInformation,
           settings);
   }
   if(tomorrowLiturgyInformation.SpecialCelebration.SpecialDaysMasterIdentifier !== -1) {
       return GetSpecialDaysFirstVespersOfTomorrow(liturgyMasters.SpecialDaysParts, tomorrowLiturgyInformation, settings);
   }
   if(tomorrowLiturgyInformation.CelebrationType === CelebrationType.Solemnity/* TODO: only Solemnity right? ||
       tomorrowLiturgyInformation.CelebrationType === CelebrationType.Festivity*/){
       return GetSaintsSolemnitiesFirstVespersOfTomorrow(liturgyMasters.SaintsSolemnitiesWhenFirstsVespersParts, tomorrowLiturgyInformation, settings);
   }
   return new Vespers();
}

function GetEasterSundayHoursLiturgy(easterSunday: EasterSunday, settings: Settings): HoursLiturgy{
    let hoursLiturgy = new HoursLiturgy();
    
    hoursLiturgy.CelebrationInformation.Title = 'Diumenge de Pasqua';

    hoursLiturgy.Invitation.InvitationAntiphon = easterSunday.InvitationAntiphon;
    
    hoursLiturgy.Office.FirstReading = easterSunday.OfficeFirstReading;
    hoursLiturgy.Office.FirstPsalm.Antiphon = easterSunday.OfficeFirstPsalm.Antiphon;
    hoursLiturgy.Office.FirstPsalm.Comment = easterSunday.OfficeFirstPsalm.Comment;
    hoursLiturgy.Office.FirstPsalm.Psalm = easterSunday.OfficeFirstPsalm.Psalm;
    hoursLiturgy.Office.FirstPsalm.Prayer = easterSunday.OfficeFirstPsalm.Prayer;
    hoursLiturgy.Office.SecondReading = easterSunday.OfficeSecondReading;
    hoursLiturgy.Office.SecondPsalm.Antiphon = easterSunday.OfficeSecondPsalm.Antiphon;
    hoursLiturgy.Office.SecondPsalm.Comment = easterSunday.OfficeSecondPsalm.Comment;
    hoursLiturgy.Office.SecondPsalm.Psalm = easterSunday.OfficeSecondPsalm.Psalm;
    hoursLiturgy.Office.SecondPsalm.Prayer = easterSunday.OfficeSecondPsalm.Prayer;
    hoursLiturgy.Office.ThirdReading = easterSunday.OfficeThirdReading;
    hoursLiturgy.Office.ThirdPsalm.Antiphon = easterSunday.OfficeThirdPsalm.Antiphon;
    hoursLiturgy.Office.ThirdPsalm.Comment = easterSunday.OfficeThirdPsalm.Comment;
    hoursLiturgy.Office.ThirdPsalm.Psalm = easterSunday.OfficeThirdPsalm.Psalm;
    hoursLiturgy.Office.ThirdPsalm.Prayer = easterSunday.OfficeThirdPsalm.Prayer;
    hoursLiturgy.Office.FourthReading = easterSunday.OfficeFourthReading;
    hoursLiturgy.Office.FourthPsalm.Antiphon = easterSunday.OfficeFourthPsalm.Antiphon;
    hoursLiturgy.Office.FourthPsalm.Comment = easterSunday.OfficeFourthPsalm.Comment;
    hoursLiturgy.Office.FourthPsalm.Psalm = easterSunday.OfficeFourthPsalm.Psalm;
    hoursLiturgy.Office.FourthPsalm.Prayer = easterSunday.OfficeFourthPsalm.Prayer;
    hoursLiturgy.Office.TeDeumInformation.Enabled = true;

    hoursLiturgy.Laudes.Anthem = settings.UseLatin? easterSunday.LaudesLatinAnthem : easterSunday.LaudesCatalanAnthem;
    hoursLiturgy.Laudes.FirstPsalm = easterSunday.LaudesFirstPsalm;
    hoursLiturgy.Laudes.SecondPsalm = easterSunday.LaudesSecondPsalm;
    hoursLiturgy.Laudes.ThirdPsalm = easterSunday.LaudesThirdPsalm;
    hoursLiturgy.Laudes.ShortReading = easterSunday.LaudesShortReading;
    hoursLiturgy.Laudes.ShortResponsory = easterSunday.LaudesShortResponsory;
    hoursLiturgy.Laudes.EvangelicalAntiphon = easterSunday.LaudesEvangelicalAntiphon;
    hoursLiturgy.Laudes.Prayers = easterSunday.LaudesPrayers;
    hoursLiturgy.Laudes.FinalPrayer = easterSunday.LaudesFinalPrayer;

    hoursLiturgy.Hours.ThirdHour.HasMultipleAntiphons = true;
    hoursLiturgy.Hours.ThirdHour.Anthem = settings.UseLatin? easterSunday.ThirdHourParts.LatinAnthem : easterSunday.ThirdHourParts.CatalanAnthem;
    hoursLiturgy.Hours.ThirdHour.FirstPsalm = easterSunday.HourPrayerFirstPsalm;
    hoursLiturgy.Hours.ThirdHour.SecondPsalm = easterSunday.HourPrayerSecondPsalm;
    hoursLiturgy.Hours.ThirdHour.ThirdPsalm = easterSunday.HourPrayerThirdPsalm;
    hoursLiturgy.Hours.ThirdHour.ShortReading = easterSunday.ThirdHourParts.ShortReading;
    hoursLiturgy.Hours.ThirdHour.Responsory = easterSunday.ThirdHourParts.Responsory;
    hoursLiturgy.Hours.ThirdHour.FinalPrayer = easterSunday.ThirdHourParts.FinalPrayer;
    hoursLiturgy.Hours.SixthHour.HasMultipleAntiphons = true;
    hoursLiturgy.Hours.SixthHour.Anthem = settings.UseLatin? easterSunday.SixthHourParts.LatinAnthem : easterSunday.SixthHourParts.CatalanAnthem;
    hoursLiturgy.Hours.SixthHour.FirstPsalm = easterSunday.HourPrayerFirstPsalm;
    hoursLiturgy.Hours.SixthHour.SecondPsalm = easterSunday.HourPrayerSecondPsalm;
    hoursLiturgy.Hours.SixthHour.ThirdPsalm = easterSunday.HourPrayerThirdPsalm;
    hoursLiturgy.Hours.SixthHour.ShortReading = easterSunday.SixthHourParts.ShortReading;
    hoursLiturgy.Hours.SixthHour.Responsory = easterSunday.SixthHourParts.Responsory;
    hoursLiturgy.Hours.SixthHour.FinalPrayer = easterSunday.SixthHourParts.FinalPrayer;
    hoursLiturgy.Hours.NinthHour.HasMultipleAntiphons = true;
    hoursLiturgy.Hours.NinthHour.Anthem = settings.UseLatin? easterSunday.NinthHourParts.LatinAnthem : easterSunday.NinthHourParts.CatalanAnthem;
    hoursLiturgy.Hours.NinthHour.FirstPsalm = easterSunday.HourPrayerFirstPsalm;
    hoursLiturgy.Hours.NinthHour.SecondPsalm = easterSunday.HourPrayerSecondPsalm;
    hoursLiturgy.Hours.NinthHour.ThirdPsalm = easterSunday.HourPrayerThirdPsalm;
    hoursLiturgy.Hours.NinthHour.ShortReading = easterSunday.NinthHourParts.ShortReading;
    hoursLiturgy.Hours.NinthHour.Responsory = easterSunday.NinthHourParts.Responsory;
    hoursLiturgy.Hours.NinthHour.FinalPrayer = easterSunday.NinthHourParts.FinalPrayer;

    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem =
        settings.UseLatin? easterSunday.VespersLatinAnthem : easterSunday.VespersCatalanAnthem;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm = easterSunday.VespersFirstPsalm;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm = easterSunday.VespersSecondPsalm;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm = easterSunday.VespersThirdPsalm;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading = easterSunday.VespersShortReading;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory = easterSunday.VespersShortResponsory;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon = easterSunday.VespersEvangelicalAntiphon;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers = easterSunday.VespersPrayers;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer = easterSunday.VespersFinalPrayer;
    
    return hoursLiturgy;
}

function GetSolemnityAndFestivityHoursLiturgy(solemnityAndFestivityParts: SolemnityAndFestivityParts, liturgyDayInformation: LiturgySpecificDayInformation, settings: Settings): HoursLiturgy{
    let hoursLiturgy = new HoursLiturgy();

    hoursLiturgy.CelebrationInformation = solemnityAndFestivityParts.Celebration;

    hoursLiturgy.Invitation.InvitationAntiphon = solemnityAndFestivityParts.InvitationAntiphon;

    hoursLiturgy.Office.Anthem = settings.UseLatin? solemnityAndFestivityParts.OfficeLatinAnthem : solemnityAndFestivityParts.OfficeCatalanAnthem;
    hoursLiturgy.Office.FirstPsalm = solemnityAndFestivityParts.OfficeFirstPsalm;
    hoursLiturgy.Office.SecondPsalm = solemnityAndFestivityParts.OfficeSecondPsalm;
    hoursLiturgy.Office.ThirdPsalm = solemnityAndFestivityParts.OfficeThirdPsalm;
    hoursLiturgy.Office.Responsory = solemnityAndFestivityParts.OfficeResponsory;
    hoursLiturgy.Office.FirstReading = solemnityAndFestivityParts.OfficeFirstReading;
    hoursLiturgy.Office.SecondReading = solemnityAndFestivityParts.OfficeSecondReading;
    hoursLiturgy.Office.TeDeumInformation.Enabled = true;
    hoursLiturgy.Office.FinalPrayer = solemnityAndFestivityParts.OfficeFinalPrayer;

    hoursLiturgy.Laudes.Anthem = settings.UseLatin? solemnityAndFestivityParts.LaudesLatinAnthem : solemnityAndFestivityParts.LaudesCatalanAnthem;
    hoursLiturgy.Laudes.FirstPsalm.Antiphon = solemnityAndFestivityParts.LaudesFirstAntiphon;
    hoursLiturgy.Laudes.SecondPsalm.Antiphon = solemnityAndFestivityParts.LaudesSecondAntiphon;
    hoursLiturgy.Laudes.ThirdPsalm.Antiphon = solemnityAndFestivityParts.LaudesThirdAntiphon;
    hoursLiturgy.Laudes.ShortReading = solemnityAndFestivityParts.LaudesShortReading;
    hoursLiturgy.Laudes.ShortResponsory = solemnityAndFestivityParts.LaudesShortResponsory;
    switch (liturgyDayInformation.YearType) {
        case YearType.A:
            hoursLiturgy.Laudes.EvangelicalAntiphon = solemnityAndFestivityParts.LaudesEvangelicalAntiphonYearA;
            break;
        case YearType.B:
            hoursLiturgy.Laudes.EvangelicalAntiphon = solemnityAndFestivityParts.LaudesEvangelicalAntiphonYearB;
            break;
        case YearType.C:
            hoursLiturgy.Laudes.EvangelicalAntiphon = solemnityAndFestivityParts.LaudesEvangelicalAntiphonYearC;
            break;
    }

    hoursLiturgy.Laudes.Prayers = solemnityAndFestivityParts.LaudesPrayers;
    hoursLiturgy.Laudes.FinalPrayer = solemnityAndFestivityParts.LaudesFinalPrayer;

    hoursLiturgy.Hours.ThirdHour.Anthem = settings.UseLatin? solemnityAndFestivityParts.ThirdHourParts.LatinAnthem : solemnityAndFestivityParts.ThirdHourParts.CatalanAnthem;
    hoursLiturgy.Hours.ThirdHour.HasMultipleAntiphons = false;
    hoursLiturgy.Hours.ThirdHour.UniqueAntiphon = solemnityAndFestivityParts.ThirdHourParts.Antiphon;
    hoursLiturgy.Hours.ThirdHour.FirstPsalm = solemnityAndFestivityParts.HoursFirstPsalm;
    hoursLiturgy.Hours.ThirdHour.SecondPsalm = solemnityAndFestivityParts.HoursSecondPsalm;
    hoursLiturgy.Hours.ThirdHour.ThirdPsalm = solemnityAndFestivityParts.HoursThirdPsalm;
    hoursLiturgy.Hours.ThirdHour.ShortReading = solemnityAndFestivityParts.ThirdHourParts.ShortReading;
    hoursLiturgy.Hours.ThirdHour.Responsory = solemnityAndFestivityParts.ThirdHourParts.Responsory;
    hoursLiturgy.Hours.ThirdHour.FinalPrayer = solemnityAndFestivityParts.ThirdHourParts.FinalPrayer;
    hoursLiturgy.Hours.SixthHour.Anthem = settings.UseLatin? solemnityAndFestivityParts.SixthHourParts.LatinAnthem : solemnityAndFestivityParts.SixthHourParts.CatalanAnthem;
    hoursLiturgy.Hours.SixthHour.HasMultipleAntiphons = false;
    hoursLiturgy.Hours.SixthHour.UniqueAntiphon = solemnityAndFestivityParts.SixthHourParts.Antiphon;
    hoursLiturgy.Hours.SixthHour.FirstPsalm = solemnityAndFestivityParts.HoursFirstPsalm;
    hoursLiturgy.Hours.SixthHour.SecondPsalm = solemnityAndFestivityParts.HoursSecondPsalm;
    hoursLiturgy.Hours.SixthHour.ThirdPsalm = solemnityAndFestivityParts.HoursThirdPsalm;
    hoursLiturgy.Hours.SixthHour.ShortReading = solemnityAndFestivityParts.SixthHourParts.ShortReading;
    hoursLiturgy.Hours.SixthHour.Responsory = solemnityAndFestivityParts.SixthHourParts.Responsory;
    hoursLiturgy.Hours.SixthHour.FinalPrayer = solemnityAndFestivityParts.SixthHourParts.FinalPrayer;
    hoursLiturgy.Hours.NinthHour.Anthem = settings.UseLatin? solemnityAndFestivityParts.NinthHourParts.LatinAnthem : solemnityAndFestivityParts.NinthHourParts.CatalanAnthem;
    hoursLiturgy.Hours.NinthHour.HasMultipleAntiphons = false;
    hoursLiturgy.Hours.NinthHour.UniqueAntiphon = solemnityAndFestivityParts.NinthHourParts.Antiphon;
    hoursLiturgy.Hours.NinthHour.FirstPsalm = solemnityAndFestivityParts.HoursFirstPsalm;
    hoursLiturgy.Hours.NinthHour.SecondPsalm = solemnityAndFestivityParts.HoursSecondPsalm;
    hoursLiturgy.Hours.NinthHour.ThirdPsalm = solemnityAndFestivityParts.HoursThirdPsalm;
    hoursLiturgy.Hours.NinthHour.ShortReading = solemnityAndFestivityParts.NinthHourParts.ShortReading;
    hoursLiturgy.Hours.NinthHour.Responsory = solemnityAndFestivityParts.NinthHourParts.Responsory;
    hoursLiturgy.Hours.NinthHour.FinalPrayer = solemnityAndFestivityParts.NinthHourParts.FinalPrayer;

    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem =
        settings.UseLatin? solemnityAndFestivityParts.SecondVespersLatinAnthem : solemnityAndFestivityParts.SecondVespersCatalanAnthem;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm = solemnityAndFestivityParts.SecondVespersFirstPsalm;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm = solemnityAndFestivityParts.SecondVespersSecondPsalm;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm = solemnityAndFestivityParts.SecondVespersThirdPsalm;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading = solemnityAndFestivityParts.SecondVespersShortReading;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory = solemnityAndFestivityParts.SecondVespersShortResponsory;
    switch (liturgyDayInformation.YearType) {
        case YearType.A:
            hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon = solemnityAndFestivityParts.SecondVespersEvangelicalAntiphonYearA;
            break;
        case YearType.B:
            hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon = solemnityAndFestivityParts.SecondVespersEvangelicalAntiphonYearB;
            break;
        case YearType.C:
            hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon = solemnityAndFestivityParts.SecondVespersEvangelicalAntiphonYearC;
            break;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers = solemnityAndFestivityParts.SecondVespersPrayers;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer = solemnityAndFestivityParts.SecondVespersFinalPrayer;

    return hoursLiturgy;
}

function GetSpecialDayHoursLiturgy(specialDaysParts: SpecialDaysParts, settings: Settings): HoursLiturgy{
    let hoursLiturgy = new HoursLiturgy();

    hoursLiturgy.CelebrationInformation = specialDaysParts.Celebration;

    hoursLiturgy.Invitation.InvitationAntiphon = specialDaysParts.InvitationAntiphon;

    hoursLiturgy.Office.Anthem = settings.UseLatin? specialDaysParts.OfficeLatinAnthem : specialDaysParts.OfficeCatalanAnthem;
    hoursLiturgy.Office.FirstPsalm = specialDaysParts.OfficeFirstPsalm;
    hoursLiturgy.Office.SecondPsalm = specialDaysParts.OfficeSecondPsalm;
    hoursLiturgy.Office.ThirdPsalm = specialDaysParts.OfficeThirdPsalm;
    hoursLiturgy.Office.Responsory = specialDaysParts.OfficeResponsory;
    hoursLiturgy.Office.FirstReading = specialDaysParts.OfficeFirstReading;
    hoursLiturgy.Office.SecondReading = specialDaysParts.OfficeSecondReading;
    hoursLiturgy.Office.TeDeumInformation.Enabled = true;
    hoursLiturgy.Office.FinalPrayer = specialDaysParts.OfficeFinalPrayer;

    hoursLiturgy.Laudes.Anthem = settings.UseLatin? specialDaysParts.LaudesLatinAnthem : specialDaysParts.LaudesCatalanAnthem;
    hoursLiturgy.Laudes.FirstPsalm = specialDaysParts.LaudesFirstPsalm;
    hoursLiturgy.Laudes.SecondPsalm = specialDaysParts.LaudesSecondPsalm;
    hoursLiturgy.Laudes.ThirdPsalm = specialDaysParts.LaudesThirdPsalm;
    hoursLiturgy.Laudes.ShortReading = specialDaysParts.LaudesShortReading;
    hoursLiturgy.Laudes.ShortResponsory = specialDaysParts.LaudesShortResponsory;
    hoursLiturgy.Laudes.EvangelicalAntiphon = specialDaysParts.LaudesEvangelicalAntiphon;
    hoursLiturgy.Laudes.Prayers = specialDaysParts.LaudesPrayers;
    hoursLiturgy.Laudes.FinalPrayer = specialDaysParts.LaudesFinalPrayer;

    hoursLiturgy.Hours.ThirdHour.Anthem = settings.UseLatin? specialDaysParts.ThirdHourParts.LatinAnthem : specialDaysParts.ThirdHourParts.CatalanAnthem;
    hoursLiturgy.Hours.ThirdHour.HasMultipleAntiphons = true;
    hoursLiturgy.Hours.ThirdHour.FirstPsalm = specialDaysParts.HoursFirstPsalm;
    hoursLiturgy.Hours.ThirdHour.SecondPsalm = specialDaysParts.HoursSecondPsalm;
    hoursLiturgy.Hours.ThirdHour.ThirdPsalm = specialDaysParts.HoursThirdPsalm;
    hoursLiturgy.Hours.ThirdHour.ShortReading = specialDaysParts.ThirdHourParts.ShortReading;
    hoursLiturgy.Hours.ThirdHour.Responsory = specialDaysParts.ThirdHourParts.Responsory;
    hoursLiturgy.Hours.ThirdHour.FinalPrayer = specialDaysParts.ThirdHourParts.FinalPrayer;
    hoursLiturgy.Hours.SixthHour.Anthem = settings.UseLatin? specialDaysParts.SixthHourParts.LatinAnthem : specialDaysParts.SixthHourParts.CatalanAnthem;
    hoursLiturgy.Hours.SixthHour.HasMultipleAntiphons = true;
    hoursLiturgy.Hours.SixthHour.FirstPsalm = specialDaysParts.HoursFirstPsalm;
    hoursLiturgy.Hours.SixthHour.SecondPsalm = specialDaysParts.HoursSecondPsalm;
    hoursLiturgy.Hours.SixthHour.ThirdPsalm = specialDaysParts.HoursThirdPsalm;
    hoursLiturgy.Hours.SixthHour.ShortReading = specialDaysParts.SixthHourParts.ShortReading;
    hoursLiturgy.Hours.SixthHour.Responsory = specialDaysParts.SixthHourParts.Responsory;
    hoursLiturgy.Hours.SixthHour.FinalPrayer = specialDaysParts.SixthHourParts.FinalPrayer;
    hoursLiturgy.Hours.NinthHour.Anthem = settings.UseLatin? specialDaysParts.NinthHourParts.LatinAnthem : specialDaysParts.NinthHourParts.CatalanAnthem;
    hoursLiturgy.Hours.NinthHour.HasMultipleAntiphons = true;
    hoursLiturgy.Hours.NinthHour.FirstPsalm = specialDaysParts.HoursFirstPsalm;
    hoursLiturgy.Hours.NinthHour.SecondPsalm = specialDaysParts.HoursSecondPsalm;
    hoursLiturgy.Hours.NinthHour.ThirdPsalm = specialDaysParts.HoursThirdPsalm;
    hoursLiturgy.Hours.NinthHour.ShortReading = specialDaysParts.NinthHourParts.ShortReading;
    hoursLiturgy.Hours.NinthHour.Responsory = specialDaysParts.NinthHourParts.Responsory;
    hoursLiturgy.Hours.NinthHour.FinalPrayer = specialDaysParts.NinthHourParts.FinalPrayer;

    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem =
        settings.UseLatin? specialDaysParts.SecondVespersLatinAnthem : specialDaysParts.SecondVespersCatalanAnthem;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm = specialDaysParts.SecondVespersFirstPsalm;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm = specialDaysParts.SecondVespersSecondPsalm;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm = specialDaysParts.SecondVespersThirdPsalm;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading = specialDaysParts.SecondVespersShortReading;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory = specialDaysParts.SecondVespersShortResponsory;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon = specialDaysParts.SecondVespersEvangelicalAntiphon;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers = specialDaysParts.SecondVespersPrayers;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer = specialDaysParts.SecondVespersFinalPrayer;

    return hoursLiturgy;
}

function GetSaintsSolemnitiesHoursLiturgy(saintsSolemnities: SaintsSolemnities, settings: Settings): HoursLiturgy{
    let hoursLiturgy = new HoursLiturgy();

    hoursLiturgy.CelebrationInformation = saintsSolemnities.Celebration;

    hoursLiturgy.Invitation.InvitationAntiphon = saintsSolemnities.InvitationAntiphon;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Invitation.InvitationAntiphon) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Invitation.InvitationAntiphon = saintsSolemnities.CommonOffices.InvitationAntiphon;
    }

    hoursLiturgy.Office.Anthem = settings.UseLatin? saintsSolemnities.OfficeLatinAnthem : saintsSolemnities.OfficeCatalanAnthem;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Office.Anthem) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Office.Anthem = settings.UseLatin? saintsSolemnities.CommonOffices.OfficeLatinAnthem : saintsSolemnities.CommonOffices.OfficeCatalanAnthem;
    }
    hoursLiturgy.Office.FirstPsalm = saintsSolemnities.OfficeFirstPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Office.FirstPsalm.Psalm) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Office.FirstPsalm = saintsSolemnities.CommonOffices.OfficeFirstPsalm;
    }
    hoursLiturgy.Office.SecondPsalm = saintsSolemnities.OfficeSecondPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Office.SecondPsalm.Psalm) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Office.SecondPsalm = saintsSolemnities.CommonOffices.OfficeSecondPsalm;
    }
    hoursLiturgy.Office.ThirdPsalm = saintsSolemnities.OfficeThirdPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Office.ThirdPsalm.Psalm) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Office.ThirdPsalm = saintsSolemnities.CommonOffices.OfficeThirdPsalm;
    }
    hoursLiturgy.Office.Responsory = saintsSolemnities.OfficeResponsory;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Office.FirstPsalm.Psalm) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Office.FirstPsalm = saintsSolemnities.CommonOffices.OfficeFirstPsalm;
    }
    hoursLiturgy.Office.FirstReading = saintsSolemnities.OfficeFirstReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Office.FirstReading.Reading) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Office.FirstReading = saintsSolemnities.CommonOffices.OfficeFirstReading;
    }
    hoursLiturgy.Office.SecondReading = saintsSolemnities.OfficeSecondReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Office.SecondReading.Reading) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Office.SecondReading = saintsSolemnities.CommonOffices.OfficeSecondReading;
    }
    hoursLiturgy.Office.TeDeumInformation.Enabled = true;
    hoursLiturgy.Office.FinalPrayer = saintsSolemnities.OfficeFinalPrayer;

    hoursLiturgy.Laudes.Anthem = settings.UseLatin? saintsSolemnities.LaudesLatinAnthem : saintsSolemnities.LaudesCatalanAnthem;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Laudes.Anthem) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Laudes.Anthem = settings.UseLatin? saintsSolemnities.CommonOffices.LaudesLatinAnthem : saintsSolemnities.CommonOffices.LaudesCatalanAnthem;
    }
    if(saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Laudes.FirstPsalm = saintsSolemnities.CommonOffices.LaudesFirstPsalm;
        hoursLiturgy.Laudes.SecondPsalm = saintsSolemnities.CommonOffices.LaudesSecondPsalm;
        hoursLiturgy.Laudes.ThirdPsalm = saintsSolemnities.CommonOffices.LaudesThirdPsalm;
    }
    if(StringManagement.HasLiturgyContent(saintsSolemnities.LaudesFirstAntiphon)){
        hoursLiturgy.Laudes.FirstPsalm.Antiphon = saintsSolemnities.LaudesFirstAntiphon;
    }
    if(StringManagement.HasLiturgyContent(saintsSolemnities.LaudesSecondAntiphon)){
        hoursLiturgy.Laudes.SecondPsalm.Antiphon = saintsSolemnities.LaudesSecondAntiphon;
    }
    if(StringManagement.HasLiturgyContent(saintsSolemnities.LaudesThirdAntiphon)){
        hoursLiturgy.Laudes.ThirdPsalm.Antiphon = saintsSolemnities.LaudesThirdAntiphon;
    }
    hoursLiturgy.Laudes.ShortReading = saintsSolemnities.LaudesShortReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Laudes.ShortReading.ShortReading) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Laudes.ShortReading = saintsSolemnities.CommonOffices.LaudesShortReading;
    }
    hoursLiturgy.Laudes.ShortResponsory = saintsSolemnities.LaudesShortResponsory;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Laudes.ShortResponsory.FirstPart) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Laudes.ShortResponsory = saintsSolemnities.CommonOffices.LaudesShortResponsory;
    }
    hoursLiturgy.Laudes.EvangelicalAntiphon = saintsSolemnities.LaudesEvangelicalAntiphon;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Laudes.EvangelicalAntiphon) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Laudes.EvangelicalAntiphon = saintsSolemnities.CommonOffices.LaudesEvangelicalAntiphon;
    }
    hoursLiturgy.Laudes.Prayers = saintsSolemnities.LaudesPrayers;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Laudes.Prayers) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Laudes.Prayers = saintsSolemnities.CommonOffices.LaudesPrayers;
    }
    hoursLiturgy.Laudes.FinalPrayer = saintsSolemnities.LaudesFinalPrayer;

    hoursLiturgy.Hours.ThirdHour.Anthem = settings.UseLatin? saintsSolemnities.ThirdHourParts.LatinAnthem : saintsSolemnities.ThirdHourParts.CatalanAnthem;
    hoursLiturgy.Hours.ThirdHour.HasMultipleAntiphons = false;
    hoursLiturgy.Hours.ThirdHour.UniqueAntiphon = saintsSolemnities.ThirdHourParts.Antiphon;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.ThirdHour.UniqueAntiphon) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Hours.ThirdHour.UniqueAntiphon = saintsSolemnities.CommonOffices.ThirdHourParts.Antiphon;
    }
    hoursLiturgy.Hours.ThirdHour.FirstPsalm = saintsSolemnities.HoursFirstPsalm;
    hoursLiturgy.Hours.ThirdHour.SecondPsalm = saintsSolemnities.HoursSecondPsalm;
    hoursLiturgy.Hours.ThirdHour.ThirdPsalm = saintsSolemnities.HoursThirdPsalm;
    hoursLiturgy.Hours.ThirdHour.ShortReading = saintsSolemnities.ThirdHourParts.ShortReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.ThirdHour.ShortReading.ShortReading) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Hours.ThirdHour.ShortReading = saintsSolemnities.CommonOffices.ThirdHourParts.ShortReading;
    }
    hoursLiturgy.Hours.ThirdHour.Responsory = saintsSolemnities.ThirdHourParts.Responsory;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.ThirdHour.Responsory.Response) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Hours.ThirdHour.Responsory = saintsSolemnities.CommonOffices.ThirdHourParts.Responsory;
    }
    hoursLiturgy.Hours.ThirdHour.FinalPrayer = saintsSolemnities.ThirdHourParts.FinalPrayer;
    hoursLiturgy.Hours.SixthHour.Anthem = settings.UseLatin? saintsSolemnities.SixthHourParts.LatinAnthem : saintsSolemnities.SixthHourParts.CatalanAnthem;
    hoursLiturgy.Hours.SixthHour.HasMultipleAntiphons = false;
    hoursLiturgy.Hours.SixthHour.UniqueAntiphon = saintsSolemnities.SixthHourParts.Antiphon;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.SixthHour.UniqueAntiphon) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Hours.SixthHour.UniqueAntiphon = saintsSolemnities.CommonOffices.SixthHourParts.Antiphon;
    }
    hoursLiturgy.Hours.SixthHour.FirstPsalm = saintsSolemnities.HoursFirstPsalm;
    hoursLiturgy.Hours.SixthHour.SecondPsalm = saintsSolemnities.HoursSecondPsalm;
    hoursLiturgy.Hours.SixthHour.ThirdPsalm = saintsSolemnities.HoursThirdPsalm;
    hoursLiturgy.Hours.SixthHour.ShortReading = saintsSolemnities.SixthHourParts.ShortReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.SixthHour.ShortReading.ShortReading) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Hours.SixthHour.ShortReading = saintsSolemnities.CommonOffices.SixthHourParts.ShortReading;
    }
    hoursLiturgy.Hours.SixthHour.Responsory = saintsSolemnities.SixthHourParts.Responsory;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.SixthHour.Responsory.Response) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Hours.SixthHour.Responsory = saintsSolemnities.CommonOffices.SixthHourParts.Responsory;
    }
    hoursLiturgy.Hours.SixthHour.FinalPrayer = saintsSolemnities.SixthHourParts.FinalPrayer;
    hoursLiturgy.Hours.NinthHour.Anthem = settings.UseLatin? saintsSolemnities.NinthHourParts.LatinAnthem : saintsSolemnities.NinthHourParts.CatalanAnthem;
    hoursLiturgy.Hours.NinthHour.HasMultipleAntiphons = false;
    hoursLiturgy.Hours.NinthHour.UniqueAntiphon = saintsSolemnities.NinthHourParts.Antiphon;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.NinthHour.UniqueAntiphon) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Hours.NinthHour.UniqueAntiphon = saintsSolemnities.CommonOffices.NinthHourParts.Antiphon;
    }
    hoursLiturgy.Hours.NinthHour.FirstPsalm = saintsSolemnities.HoursFirstPsalm;
    hoursLiturgy.Hours.NinthHour.SecondPsalm = saintsSolemnities.HoursSecondPsalm;
    hoursLiturgy.Hours.NinthHour.ThirdPsalm = saintsSolemnities.HoursThirdPsalm;
    hoursLiturgy.Hours.NinthHour.ShortReading = saintsSolemnities.NinthHourParts.ShortReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.NinthHour.ShortReading.ShortReading) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Hours.NinthHour.ShortReading = saintsSolemnities.CommonOffices.NinthHourParts.ShortReading;
    }
    hoursLiturgy.Hours.NinthHour.Responsory = saintsSolemnities.NinthHourParts.Responsory;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.NinthHour.Responsory.Response) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.Hours.NinthHour.Responsory = saintsSolemnities.CommonOffices.NinthHourParts.Responsory;
    }
    hoursLiturgy.Hours.NinthHour.FinalPrayer = saintsSolemnities.NinthHourParts.FinalPrayer;

    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem =
        settings.UseLatin? saintsSolemnities.SecondVespersLatinAnthem : saintsSolemnities.SecondVespersCatalanAnthem;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem = settings.UseLatin?
            saintsSolemnities.CommonOffices.SecondVespersLatinAnthem : saintsSolemnities.CommonOffices.SecondVespersCatalanAnthem;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm = saintsSolemnities.SecondVespersFirstPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm.Psalm) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm = saintsSolemnities.CommonOffices.SecondVespersFirstPsalm;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm = saintsSolemnities.SecondVespersSecondPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm.Psalm) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm = saintsSolemnities.CommonOffices.SecondVespersSecondPsalm;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm = saintsSolemnities.SecondVespersThirdPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm.Psalm) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm = saintsSolemnities.CommonOffices.SecondVespersThirdPsalm;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading = saintsSolemnities.SecondVespersShortReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading.ShortReading) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading = saintsSolemnities.CommonOffices.SecondVespersShortReading;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory = saintsSolemnities.SecondVespersShortResponsory;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory.FirstPart) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory = saintsSolemnities.CommonOffices.SecondVespersShortResponsory;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon = saintsSolemnities.SecondVespersEvangelicalAntiphon;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon = saintsSolemnities.CommonOffices.SecondVespersEvangelicalAntiphon;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers = saintsSolemnities.SecondVespersPrayers;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers = saintsSolemnities.CommonOffices.SecondVespersPrayers;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer = saintsSolemnities.SecondVespersFinalPrayer;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer = saintsSolemnities.CommonOffices.SecondVespersFinalPrayer;
    }

    return hoursLiturgy;
}

function GetSaintsMemoriesHoursLiturgy(saintsMemories: SaintsMemories, liturgyDayInformation: LiturgySpecificDayInformation, settings: Settings): HoursLiturgy{
    let hoursLiturgy = new HoursLiturgy();

    hoursLiturgy.CelebrationInformation = saintsMemories.Celebration;

    hoursLiturgy.Invitation.InvitationAntiphon = saintsMemories.InvitationAntiphon;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Invitation.InvitationAntiphon) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Invitation.InvitationAntiphon = saintsMemories.CommonOffices.InvitationAntiphon;
    }

    hoursLiturgy.Office.Anthem = settings.UseLatin? saintsMemories.OfficeLatinAnthem : saintsMemories.OfficeCatalanAnthem;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Office.Anthem) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Office.Anthem = settings.UseLatin? saintsMemories.CommonOffices.OfficeLatinAnthem : saintsMemories.CommonOffices.OfficeCatalanAnthem;
    }
    hoursLiturgy.Office.FirstPsalm = saintsMemories.OfficeFirstPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Office.FirstPsalm.Psalm) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Office.FirstPsalm = saintsMemories.CommonOffices.OfficeFirstPsalm;
    }
    hoursLiturgy.Office.SecondPsalm = saintsMemories.OfficeSecondPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Office.SecondPsalm.Psalm) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Office.SecondPsalm = saintsMemories.CommonOffices.OfficeSecondPsalm;
    }
    hoursLiturgy.Office.ThirdPsalm = saintsMemories.OfficeThirdPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Office.ThirdPsalm.Psalm) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Office.ThirdPsalm = saintsMemories.CommonOffices.OfficeThirdPsalm;
    }
    hoursLiturgy.Office.Responsory = saintsMemories.OfficeResponsory;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Office.FirstPsalm.Psalm) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Office.FirstPsalm = saintsMemories.CommonOffices.OfficeFirstPsalm;
    }
    hoursLiturgy.Office.FirstReading = saintsMemories.OfficeFirstReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Office.FirstReading.Reading) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Office.FirstReading = saintsMemories.CommonOffices.OfficeFirstReading;
    }
    hoursLiturgy.Office.SecondReading = saintsMemories.OfficeSecondReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Office.SecondReading.Reading) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Office.SecondReading = saintsMemories.CommonOffices.OfficeSecondReading;
    }
    hoursLiturgy.Office.TeDeumInformation.Enabled = false; // TODO: not sure
    hoursLiturgy.Office.FinalPrayer = saintsMemories.OfficeFinalPrayer;

    hoursLiturgy.Laudes.Anthem = settings.UseLatin? saintsMemories.LaudesLatinAnthem : saintsMemories.LaudesCatalanAnthem;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Laudes.Anthem) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Laudes.Anthem = settings.UseLatin? saintsMemories.CommonOffices.LaudesLatinAnthem : saintsMemories.CommonOffices.LaudesCatalanAnthem;
    }
    hoursLiturgy.Laudes.FirstPsalm = saintsMemories.LaudesFirstPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Laudes.FirstPsalm.Psalm) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Laudes.FirstPsalm = saintsMemories.CommonOffices.LaudesFirstPsalm;
    }
    hoursLiturgy.Laudes.SecondPsalm = saintsMemories.LaudesSecondPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Laudes.SecondPsalm.Psalm) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Laudes.SecondPsalm = saintsMemories.CommonOffices.LaudesSecondPsalm;
    }
    hoursLiturgy.Laudes.ThirdPsalm = saintsMemories.LaudesThirdPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Laudes.ThirdPsalm.Psalm) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Laudes.ThirdPsalm = saintsMemories.CommonOffices.LaudesThirdPsalm;
    }
    hoursLiturgy.Laudes.ShortReading = saintsMemories.LaudesShortReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Laudes.ShortReading.ShortReading) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Laudes.ShortReading = saintsMemories.CommonOffices.LaudesShortReading;
    }
    hoursLiturgy.Laudes.ShortResponsory = saintsMemories.LaudesShortResponsory;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Laudes.ShortResponsory.FirstPart) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Laudes.ShortResponsory = saintsMemories.CommonOffices.LaudesShortResponsory;
    }
    hoursLiturgy.Laudes.EvangelicalAntiphon = saintsMemories.LaudesEvangelicalAntiphon;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Laudes.EvangelicalAntiphon) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Laudes.EvangelicalAntiphon = saintsMemories.CommonOffices.LaudesEvangelicalAntiphon;
    }
    hoursLiturgy.Laudes.Prayers = saintsMemories.LaudesPrayers;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Laudes.Prayers) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Laudes.Prayers = saintsMemories.CommonOffices.LaudesPrayers;
    }
    hoursLiturgy.Laudes.FinalPrayer = saintsMemories.LaudesFinalPrayer;

    hoursLiturgy.Hours.ThirdHour.Anthem = settings.UseLatin? saintsMemories.ThirdHourParts.LatinAnthem : saintsMemories.ThirdHourParts.CatalanAnthem;
    hoursLiturgy.Hours.ThirdHour.HasMultipleAntiphons = false;
    hoursLiturgy.Hours.ThirdHour.UniqueAntiphon = saintsMemories.ThirdHourParts.Antiphon;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.ThirdHour.UniqueAntiphon) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Hours.ThirdHour.UniqueAntiphon = saintsMemories.CommonOffices.ThirdHourParts.Antiphon;
    }
    hoursLiturgy.Hours.ThirdHour.FirstPsalm = saintsMemories.HoursFirstPsalm;
    hoursLiturgy.Hours.ThirdHour.SecondPsalm = saintsMemories.HoursSecondPsalm;
    hoursLiturgy.Hours.ThirdHour.ThirdPsalm = saintsMemories.HoursThirdPsalm;
    hoursLiturgy.Hours.ThirdHour.ShortReading = saintsMemories.ThirdHourParts.ShortReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.ThirdHour.ShortReading.ShortReading) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Hours.ThirdHour.ShortReading = saintsMemories.CommonOffices.ThirdHourParts.ShortReading;
    }
    hoursLiturgy.Hours.ThirdHour.Responsory = saintsMemories.ThirdHourParts.Responsory;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.ThirdHour.Responsory.Response) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Hours.ThirdHour.Responsory = saintsMemories.CommonOffices.ThirdHourParts.Responsory;
    }
    hoursLiturgy.Hours.ThirdHour.FinalPrayer = saintsMemories.ThirdHourParts.FinalPrayer;
    hoursLiturgy.Hours.SixthHour.Anthem = settings.UseLatin? saintsMemories.SixthHourParts.LatinAnthem : saintsMemories.SixthHourParts.CatalanAnthem;
    hoursLiturgy.Hours.SixthHour.HasMultipleAntiphons = false;
    hoursLiturgy.Hours.SixthHour.UniqueAntiphon = saintsMemories.SixthHourParts.Antiphon;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.SixthHour.UniqueAntiphon) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Hours.SixthHour.UniqueAntiphon = saintsMemories.CommonOffices.SixthHourParts.Antiphon;
    }
    hoursLiturgy.Hours.SixthHour.FirstPsalm = saintsMemories.HoursFirstPsalm;
    hoursLiturgy.Hours.SixthHour.SecondPsalm = saintsMemories.HoursSecondPsalm;
    hoursLiturgy.Hours.SixthHour.ThirdPsalm = saintsMemories.HoursThirdPsalm;
    hoursLiturgy.Hours.SixthHour.ShortReading = saintsMemories.SixthHourParts.ShortReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.SixthHour.ShortReading.ShortReading) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Hours.SixthHour.ShortReading = saintsMemories.CommonOffices.SixthHourParts.ShortReading;
    }
    hoursLiturgy.Hours.SixthHour.Responsory = saintsMemories.SixthHourParts.Responsory;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.SixthHour.Responsory.Response) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Hours.SixthHour.Responsory = saintsMemories.CommonOffices.SixthHourParts.Responsory;
    }
    hoursLiturgy.Hours.SixthHour.FinalPrayer = saintsMemories.SixthHourParts.FinalPrayer;
    hoursLiturgy.Hours.NinthHour.Anthem = settings.UseLatin? saintsMemories.NinthHourParts.LatinAnthem : saintsMemories.NinthHourParts.CatalanAnthem;
    hoursLiturgy.Hours.NinthHour.HasMultipleAntiphons = false;
    hoursLiturgy.Hours.NinthHour.UniqueAntiphon = saintsMemories.NinthHourParts.Antiphon;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.NinthHour.UniqueAntiphon) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Hours.NinthHour.UniqueAntiphon = saintsMemories.CommonOffices.NinthHourParts.Antiphon;
    }
    hoursLiturgy.Hours.NinthHour.FirstPsalm = saintsMemories.HoursFirstPsalm;
    hoursLiturgy.Hours.NinthHour.SecondPsalm = saintsMemories.HoursSecondPsalm;
    hoursLiturgy.Hours.NinthHour.ThirdPsalm = saintsMemories.HoursThirdPsalm;
    hoursLiturgy.Hours.NinthHour.ShortReading = saintsMemories.NinthHourParts.ShortReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.NinthHour.ShortReading.ShortReading) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Hours.NinthHour.ShortReading = saintsMemories.CommonOffices.NinthHourParts.ShortReading;
    }
    hoursLiturgy.Hours.NinthHour.Responsory = saintsMemories.NinthHourParts.Responsory;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.Hours.NinthHour.Responsory.Response) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.Hours.NinthHour.Responsory = saintsMemories.CommonOffices.NinthHourParts.Responsory;
    }
    hoursLiturgy.Hours.NinthHour.FinalPrayer = saintsMemories.NinthHourParts.FinalPrayer;

    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem =
        settings.UseLatin? saintsMemories.VespersLatinAnthem : saintsMemories.VespersCatalanAnthem;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem = settings.UseLatin?
            saintsMemories.CommonOffices.SecondVespersLatinAnthem : saintsMemories.CommonOffices.SecondVespersCatalanAnthem;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm = saintsMemories.VespersFirstPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm.Psalm) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm = saintsMemories.CommonOffices.SecondVespersFirstPsalm;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm = saintsMemories.VespersSecondPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm.Psalm) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm = saintsMemories.CommonOffices.SecondVespersSecondPsalm;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm = saintsMemories.VespersThirdPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm.Psalm) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm = saintsMemories.CommonOffices.SecondVespersThirdPsalm;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading = saintsMemories.VespersShortReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading.ShortReading) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading = saintsMemories.CommonOffices.SecondVespersShortReading;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory = saintsMemories.VespersShortResponsory;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory.FirstPart) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory = saintsMemories.CommonOffices.SecondVespersShortResponsory;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon = saintsMemories.VespersEvangelicalAntiphon;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon = saintsMemories.CommonOffices.SecondVespersEvangelicalAntiphon;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers = saintsMemories.VespersPrayers;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers = saintsMemories.CommonOffices.SecondVespersPrayers;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer = saintsMemories.VespersFinalPrayer;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer) && saintsMemories.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer = saintsMemories.CommonOffices.SecondVespersFinalPrayer;
    }

    return hoursLiturgy;
}

function GetSolemnityAndFestivityFirstVespersOfTomorrow(solemnityAndFestivityParts: SolemnityAndFestivityParts, liturgyDayInformation: LiturgySpecificDayInformation, settings: Settings): Vespers{
    let vespers = new Vespers();
    vespers.Title = solemnityAndFestivityParts.Celebration.Title;
    vespers.Anthem = settings.UseLatin? solemnityAndFestivityParts.FirstVespersLatinAnthem : solemnityAndFestivityParts.FirstVespersCatalanAnthem;
    vespers.FirstPsalm = solemnityAndFestivityParts.FirstVespersFirstPsalm;
    vespers.SecondPsalm = solemnityAndFestivityParts.FirstVespersSecondPsalm;
    vespers.ThirdPsalm = solemnityAndFestivityParts.FirstVespersThirdPsalm;
    vespers.ShortReading = solemnityAndFestivityParts.FirstVespersShortReading;
    vespers.ShortResponsory = solemnityAndFestivityParts.FirstVespersShortResponsory;
    switch (liturgyDayInformation.YearType) {
        case YearType.A:
            vespers.EvangelicalAntiphon = solemnityAndFestivityParts.FirstVespersEvangelicalAntiphonYearA;
            break;
        case YearType.B:
            vespers.EvangelicalAntiphon = solemnityAndFestivityParts.FirstVespersEvangelicalAntiphonYearB;
            break;
        case YearType.C:
            vespers.EvangelicalAntiphon = solemnityAndFestivityParts.FirstVespersEvangelicalAntiphonYearC;
            break;
    }
    vespers.Prayers = solemnityAndFestivityParts.FirstVespersPrayers;
    vespers.FinalPrayer = solemnityAndFestivityParts.FirstVespersFinalPrayer;
    return vespers;
}

function GetSpecialDaysFirstVespersOfTomorrow(specialDaysParts: SpecialDaysParts, liturgyDayInformation: LiturgySpecificDayInformation, settings: Settings): Vespers{
    let vespers = new Vespers();
    vespers.Title = specialDaysParts.Celebration.Title;
    vespers.Anthem = settings.UseLatin? specialDaysParts.FirstVespersLatinAnthem : specialDaysParts.FirstVespersCatalanAnthem;
    vespers.FirstPsalm = specialDaysParts.FirstVespersFirstPsalm;
    vespers.SecondPsalm = specialDaysParts.FirstVespersSecondPsalm;
    vespers.ThirdPsalm = specialDaysParts.FirstVespersThirdPsalm;
    vespers.ShortReading = specialDaysParts.FirstVespersShortReading;
    vespers.ShortResponsory = specialDaysParts.FirstVespersShortResponsory;
    switch (liturgyDayInformation.YearType) {
        case YearType.A:
            vespers.EvangelicalAntiphon = specialDaysParts.FirstVespersEvangelicalAntiphonYearA;
            break;
        case YearType.B:
            vespers.EvangelicalAntiphon = specialDaysParts.FirstVespersEvangelicalAntiphonYearB;
            break;
        case YearType.C:
            vespers.EvangelicalAntiphon = specialDaysParts.FirstVespersEvangelicalAntiphonYearC;
            break;
    }
    vespers.Prayers = specialDaysParts.FirstVespersPrayers;
    vespers.FinalPrayer = specialDaysParts.FirstVespersFinalPrayer;
    return vespers;
}

function GetSaintsSolemnitiesFirstVespersOfTomorrow(saintsSolemnities: SaintsSolemnities, liturgyDayInformation: LiturgySpecificDayInformation, settings: Settings): Vespers{
    let vespers = new Vespers();
    vespers.Title = saintsSolemnities.Celebration.Title;
    vespers.Anthem = settings.UseLatin? saintsSolemnities.FirstVespersLatinAnthem : saintsSolemnities.FirstVespersCatalanAnthem;
    if(!StringManagement.HasLiturgyContent(vespers.Anthem) && saintsSolemnities.CommonOffices !== undefined){
        vespers.Anthem = settings.UseLatin? saintsSolemnities.CommonOffices.FirstVespersLatinAnthem : saintsSolemnities.CommonOffices.FirstVespersCatalanAnthem;
    }
    vespers.FirstPsalm = saintsSolemnities.FirstVespersFirstPsalm;
    if(!StringManagement.HasLiturgyContent(vespers.FirstPsalm.Psalm) && saintsSolemnities.CommonOffices !== undefined){
        vespers.FirstPsalm = saintsSolemnities.CommonOffices.FirstVespersFirstPsalm;
    }
    vespers.SecondPsalm = saintsSolemnities.FirstVespersSecondPsalm;
    if(!StringManagement.HasLiturgyContent(vespers.SecondPsalm.Psalm) && saintsSolemnities.CommonOffices !== undefined){
        vespers.SecondPsalm = saintsSolemnities.CommonOffices.FirstVespersSecondPsalm;
    }
    vespers.ThirdPsalm = saintsSolemnities.FirstVespersThirdPsalm;
    if(!StringManagement.HasLiturgyContent(vespers.ThirdPsalm.Psalm) && saintsSolemnities.CommonOffices !== undefined){
        vespers.ThirdPsalm = saintsSolemnities.CommonOffices.FirstVespersThirdPsalm;
    }
    vespers.ShortReading = saintsSolemnities.FirstVespersShortReading;
    if(!StringManagement.HasLiturgyContent(vespers.ShortReading.ShortReading) && saintsSolemnities.CommonOffices !== undefined){
        vespers.ShortReading = saintsSolemnities.CommonOffices.FirstVespersShortReading;
    }
    vespers.ShortResponsory = saintsSolemnities.FirstVespersShortResponsory;
    if(!StringManagement.HasLiturgyContent(vespers.ShortResponsory.FirstPart) && saintsSolemnities.CommonOffices !== undefined){
        vespers.ShortResponsory = saintsSolemnities.CommonOffices.FirstVespersShortResponsory;
    }
    vespers.EvangelicalAntiphon = saintsSolemnities.FirstVespersEvangelicalAntiphon;
    if(!StringManagement.HasLiturgyContent(vespers.EvangelicalAntiphon) && saintsSolemnities.CommonOffices !== undefined){
        vespers.EvangelicalAntiphon = saintsSolemnities.CommonOffices.FirstVespersEvangelicalAntiphon;
    }
    vespers.Prayers = saintsSolemnities.FirstVespersPrayers;
    if(!StringManagement.HasLiturgyContent(vespers.Prayers) && saintsSolemnities.CommonOffices !== undefined){
        vespers.Prayers = saintsSolemnities.CommonOffices.FirstVespersPrayers;
    }
    vespers.FinalPrayer = saintsSolemnities.FirstVespersFinalPrayer;
    return vespers;
}

function GetPalmSundayFistVespersOfTomorrow(palmSundayParts: PalmSundayParts, commonPartsOfHolyWeek: CommonPartsOfHolyWeek, liturgyDayInformation: LiturgySpecificDayInformation, settings: Settings): Vespers{
    let vespers = new Vespers();
    vespers.Title = "Diumenge de Rams";
    vespers.Anthem = settings.UseLatin? commonPartsOfHolyWeek.VespersLatinAnthem : commonPartsOfHolyWeek.VespersCatalanAnthem;
    vespers.FirstPsalm.Antiphon = palmSundayParts.FirstVespersFirstAntiphon;
    vespers.SecondPsalm.Antiphon = palmSundayParts.FirstVespersSecondAntiphon;
    vespers.ThirdPsalm.Antiphon = palmSundayParts.FirstVespersThirdAntiphon;
    vespers.ShortReading = palmSundayParts.FirstVespersShortReading;
    vespers.ShortResponsory = palmSundayParts.FirstVespersShortResponsory;
    switch (liturgyDayInformation.YearType) {
        case YearType.A:
            vespers.EvangelicalAntiphon = palmSundayParts.FirstVespersEvangelicalAntiphonYearA;
            break;
        case YearType.B:
            vespers.EvangelicalAntiphon = palmSundayParts.FirstVespersEvangelicalAntiphonYearB;
            break;
        case YearType.C:
            vespers.EvangelicalAntiphon = palmSundayParts.FirstVespersEvangelicalAntiphonYearC;
            break;
    }
    vespers.Prayers = palmSundayParts.FirstVespersPrayers;
    vespers.FinalPrayer = palmSundayParts.FirstVespersFinalPrayer;
    return vespers;
}

function GetEasterTriduumFistVespersOfTomorrow(partsOfEasterTriduum: PartsOfEasterTriduum, settings: Settings): Vespers{
    let vespers = new Vespers();
    vespers.Anthem = settings.UseLatin? partsOfEasterTriduum.VespersLatinAnthem : partsOfEasterTriduum.VespersCatalanAnthem;
    vespers.FirstPsalm = partsOfEasterTriduum.VespersFirstPsalm;
    vespers.SecondPsalm = partsOfEasterTriduum.VespersSecondPsalm;
    vespers.ThirdPsalm = partsOfEasterTriduum.VespersThirdPsalm;
    vespers.ShortReading = partsOfEasterTriduum.VespersShortReading;
    vespers.ShortResponsory = partsOfEasterTriduum.VespersShortResponsory;
    vespers.EvangelicalAntiphon = partsOfEasterTriduum.VespersEvangelicalAntiphon;
    vespers.Prayers = partsOfEasterTriduum.VespersPrayers;
    vespers.FinalPrayer = partsOfEasterTriduum.VespersFinalPrayer;
    return vespers;
}

function GetAdventSundayFirstVespersOfTomorrow(adventSundayParts: AdventSundayParts, adventWeekParts: AdventWeekParts, commonAdventAndChristmasParts: CommonAdventAndChristmasParts, liturgyDayInformation: LiturgySpecificDayInformation, settings: Settings): Vespers{
    let vespers = new Vespers();
    vespers.Anthem = settings.UseLatin? commonAdventAndChristmasParts.VespersLatinAnthem : commonAdventAndChristmasParts.VespersCatalanAnthem;
    vespers.FirstPsalm.Antiphon = adventSundayParts.FirstVespersFirstAntiphon;
    vespers.SecondPsalm.Antiphon = adventSundayParts.FirstVespersSecondAntiphon;
    vespers.ThirdPsalm.Antiphon = adventSundayParts.FirstVespersThirdAntiphon;
    vespers.ShortReading = adventWeekParts.VespersShortReading;
    vespers.ShortResponsory = adventWeekParts.VespersShortResponsory;
    switch (liturgyDayInformation.YearType) {
        case YearType.A:
            vespers.EvangelicalAntiphon = adventSundayParts.FirstVespersEvangelicalAntiphonYearA;
            break;
        case YearType.B:
            vespers.EvangelicalAntiphon = adventSundayParts.FirstVespersEvangelicalAntiphonYearB;
            break;
        case YearType.C:
            vespers.EvangelicalAntiphon = adventSundayParts.FirstVespersEvangelicalAntiphonYearC;
            break;
    }
    vespers.Prayers = adventWeekParts.VespersPrayers;
    vespers.FinalPrayer = adventWeekParts.VespersFinalPrayer;
    return vespers;
}