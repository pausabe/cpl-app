import HoursLiturgy from "../../Models/HoursLiturgy/HoursLiturgy";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import LiturgyDayInformation, {
    LiturgySpecificDayInformation,
    SpecialCelebration
} from "../../Models/LiturgyDayInformation";
import {Settings} from "../../Models/Settings";
import {CelebrationType, YearType} from "../DatabaseEnums";
import Vespers from "../../Models/HoursLiturgy/Vespers";
import { SpecificLiturgyTimeType } from "../CelebrationTimeEnums";
import CelebrationInformation from "../../Models/HoursLiturgy/CelebrationInformation";
import SaintsSolemnities from "../../Models/LiturgyMasters/SaintsSolemnities";
import SaintsMemories from "../../Models/LiturgyMasters/SaintsMemories";
import { WeekDayName } from "../../Utils/DateManagement";
import * as CelebrationIdentifierService from "../CelebrationIdentifierService";
import SpecialDaysParts from "../../Models/LiturgyMasters/SpecialDaysParts";
import EasterSunday from "../../Models/LiturgyMasters/EasterSunday";
import {ReadingOfTheOffice} from "../../Models/LiturgyMasters/CommonParts";
import SolemnityAndFestivityParts from "../../Models/LiturgyMasters/SolemnityAndFestivityParts";
import CommonOffice from "../../Models/LiturgyMasters/CommonOffices";
import {StringManagement} from "../../Utils/StringManagement";
import PalmSundayParts from "../../Models/LiturgyMasters/PalmSundayParts";

export function ObtainCelebrationHoursLiturgy(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgyDayInformation, settings: Settings): HoursLiturgy{
    let hoursLiturgy: HoursLiturgy;

    // TODO: by defualt, everithing was "-" (now will be undefined, enough? change !== '-'?)
    // TODO: ho estic deixant com a undefined.. aixi qe shaura d'adaptar

    if(liturgyDayInformation.Today.SpecialCelebration.SpecialDaysMasterIdentifier !== -1){
        hoursLiturgy = GetSpecialDayHoursLiturgy(liturgyMasters.SpecialDaysParts, settings);
    }
    else if(liturgyDayInformation.Today.SpecialCelebration.StrongTimesMasterIdentifier !== -1){
        hoursLiturgy = GetSolemnityAndFestivityHoursLiturgy(liturgyMasters.SolemnityAndFestivityParts, liturgyDayInformation.Today, settings);
    }
    else if(liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_DIUM_PASQUA){
        hoursLiturgy = GetEasterSundayHoursLiturgy(liturgyMasters.EasterSunday, settings);
    }
    else{
        hoursLiturgy = GetNormalCelebrationHoursLiturgy(liturgyMasters, liturgyDayInformation.Today, settings);
    }

    hoursLiturgy.VespersOptions.TomorrowFirstVespersWithCelebration =
        GetFirstVespersWithCelebration(liturgyMasters, liturgyDayInformation.Tomorrow);

    // Special vesper title code when tomorrow is Easter sunday
    if(liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_TRIDU &&
        liturgyDayInformation.Today.Date.getDay() === 6){
        // TODO: this code is used to avoid showing Vespers.Title and MassVespertinas.Title the saturday before Easter Sunday
        // TODO: find another way to do the same
        hoursLiturgy.Vespers.Title = "dium-pasqua";
    }

    return hoursLiturgy;
}

function GetNormalCelebrationHoursLiturgy(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgySpecificDayInformation, settings: Settings): HoursLiturgy{
    let hoursLiturgy = new HoursLiturgy();
    switch (liturgyDayInformation.CelebrationType) {
        case CelebrationType.Solemnity:
            hoursLiturgy = makeSF(liturgyMasters.SaintsSolemnities, true, true);
            break;
        case CelebrationType.Festivity:
            if(liturgyDayInformation.Date.getDay() !== 0) {
                hoursLiturgy = makeSF(liturgyMasters.SaintsSolemnities, true, true);
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

function GetFirstVespersWithCelebration(liturgyMasters: LiturgyMasters, tomorrowLiturgyInformation: LiturgySpecificDayInformation) : Vespers{
   if(tomorrowLiturgyInformation.SpecialCelebration.SolemnityAndFestivityMasterIdentifier !== -1) {
       return makeVespres1TSF(liturgyMasters.SaintsSolemnitiesWhenFirstsVespersParts);
   }
   if(tomorrowLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_DIUM_RAMS) {
       return makeVespres1DR(liturgyMasters.PalmSundayParts);
   }
   if(tomorrowLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_TRIDU &&
       tomorrowLiturgyInformation.Date.getDay() === 5) {
       return makeVespres1T(liturgyMasters.PartsOfEasterTriduum);
   }
   if(tomorrowLiturgyInformation.Date.getDay() === 0 &&
       tomorrowLiturgyInformation.Week === '1' &&
       tomorrowLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.A_SETMANES) {
       return makeVespres1A(liturgyMasters);
   }
   if(tomorrowLiturgyInformation.SpecialCelebration.SpecialDaysMasterIdentifier !== -1) {
       return makeVespres1DE(liturgyMasters.SpecialDaysParts);
   }
   if(tomorrowLiturgyInformation.CelebrationType === CelebrationType.Solemnity ||
        tomorrowLiturgyInformation.CelebrationType === CelebrationType.Festivity){
       return makeVespres1SF(liturgyMasters);
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

function makeSF(saintsSolemnities: SaintsSolemnities, CelebrationIsSaintOrFestivity: boolean, EnableSomething: boolean, settings: Settings): HoursLiturgy{
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
    // TODO: continue here
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
        settings.UseLatin? saintsSolemnities.VespersLatinAnthem : saintsSolemnities.VespersCatalanAnthem;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem = settings.UseLatin?
            saintsSolemnities.CommonOffices.SecondVespersLatinAnthem : saintsSolemnities.CommonOffices.SecondVespersCatalanAnthem;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm = saintsSolemnities.VespersFirstPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm.Psalm) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm = saintsSolemnities.CommonOffices.SecondVespersFirstPsalm;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm = saintsSolemnities.VespersSecondPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm.Psalm) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm = saintsSolemnities.CommonOffices.SecondVespersSecondPsalm;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm = saintsSolemnities.VespersThirdPsalm;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm.Psalm) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm = saintsSolemnities.CommonOffices.SecondVespersThirdPsalm;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading = saintsSolemnities.VespersShortReading;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading.ShortReading) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading = saintsSolemnities.CommonOffices.SecondVespersShortReading;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory = saintsSolemnities.VespersShortResponsory;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory.FirstPart) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory = saintsSolemnities.CommonOffices.SecondVespersShortResponsory;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon = saintsSolemnities.VespersEvangelicalAntiphon;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon = saintsSolemnities.CommonOffices.SecondVespersEvangelicalAntiphon;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers = saintsSolemnities.VespersPrayers;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers = saintsSolemnities.CommonOffices.SecondVespersPrayers;
    }
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer = saintsSolemnities.VespersFinalPrayer;
    if(!StringManagement.HasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer) && saintsSolemnities.CommonOffices !== undefined){
        hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer = saintsSolemnities.CommonOffices.SecondVespersFinalPrayer;
    }

    return hoursLiturgy;


    //SF-LAUDES -> LECTURA BREU
    if(TABLES.santsSolemnitats.citaLBLaudes !== '-')
        this.LAUDES.vers = TABLES.santsSolemnitats.citaLBLaudes;
    else if(TABLES.OficisComuns !== null) this.LAUDES.vers = TABLES.OficisComuns.citaLBLaudes;
    if(TABLES.santsSolemnitats.lecturaBreuLaudes !== '-')
        this.LAUDES.lecturaBreu = TABLES.santsSolemnitats.lecturaBreuLaudes;
    else if(TABLES.OficisComuns !== null) this.LAUDES.lecturaBreu = TABLES.OficisComuns.lecturaBreuLaudes;
    //SF-LAUDES -> RESPONSORI
    this.LAUDES.calAntEspecial = false;
    if(TABLES.santsSolemnitats.resp2Part1Laudes !== '-')
        this.LAUDES.respBreu1 = TABLES.santsSolemnitats.resp2Part1Laudes;
    else if(TABLES.OficisComuns !== null) this.LAUDES.respBreu1 = TABLES.OficisComuns.respBreuLaudes1;
    if(TABLES.santsSolemnitats.resp2Part2Laudes !== '-')
        this.LAUDES.respBreu2 = TABLES.santsSolemnitats.resp2Part2Laudes;
    else if(TABLES.OficisComuns !== null) this.LAUDES.respBreu2 = TABLES.OficisComuns.respBreuLaudes2;
    if(TABLES.santsSolemnitats.resp2Part3Laudes !== '-')
        this.LAUDES.respBreu3 = TABLES.santsSolemnitats.resp2Part3Laudes;
    else if(TABLES.OficisComuns !== null) this.LAUDES.respBreu3 = TABLES.OficisComuns.respBreuLaudes3;
    //SF-LAUDES -> CÀNTIC
    if(TABLES.santsSolemnitats.antZacaries !== '-')
        this.LAUDES.antCantic = TABLES.santsSolemnitats.antZacaries;
    else if(TABLES.OficisComuns !== null) this.LAUDES.antCantic = TABLES.OficisComuns.antZacaries;
    //SF-LAUDES -> PREGÀRIES
    if(TABLES.santsSolemnitats.pregariesLaudes !== '-')
        this.LAUDES.pregaries = TABLES.santsSolemnitats.pregariesLaudes;
    else if(TABLES.OficisComuns !== null) this.LAUDES.pregaries = TABLES.OficisComuns.pregariesLaudes;
    //SF-LAUDES -> ORACIÓ
    // if(TABLES.santsSolemnitats.oraFiLaudes !== '-')
    this.LAUDES.oracio = TABLES.santsSolemnitats.oraFiLaudes;
    // else if(TABLES.OficisComuns !== null) this.LAUDES.oracio = TABLES.OficisComuns.oraFiLaudes;


    //::::::SF-TÈRCIA::::::
    //SF-TÈRCIA -> SALMÒDIA
    //ANT
    this.TERCIA.antifones = false;
    if(TABLES.santsSolemnitats.antMenorTercia !== '-'){
        this.TERCIA.ant = TABLES.santsSolemnitats.antMenorTercia;
    }
    else if(TABLES.OficisComuns !== null) {
        this.TERCIA.ant = TABLES.OficisComuns.antMenorTer;
    }
    else{
    }
    //S1
    this.TERCIA.titol1 = TABLES.santsSolemnitats.titolSalm1;
    this.TERCIA.com1 = ".";
    this.TERCIA.salm1 = TABLES.santsSolemnitats.salm1Menor;
    this.TERCIA.gloria1 = TABLES.santsSolemnitats.gloriaSalm1;
    //S2
    this.TERCIA.titol2 = TABLES.santsSolemnitats.titolSalm2;
    this.TERCIA.com2 = ".";
    this.TERCIA.salm2 = TABLES.santsSolemnitats.salm2Menor;
    this.TERCIA.gloria2 = TABLES.santsSolemnitats.gloriaSalm2;
    //S3
    this.TERCIA.titol3 = TABLES.santsSolemnitats.titolSalm3;
    this.TERCIA.com3 = ".";
    this.TERCIA.salm3 = TABLES.santsSolemnitats.salm3Menor;
    this.TERCIA.gloria3 = TABLES.santsSolemnitats.gloriaSaml3;
    //SF-TÈRCIA -> LECTURA BREU
    if(TABLES.santsSolemnitats.citaLBTercia !== '-')
        this.TERCIA.vers = TABLES.santsSolemnitats.citaLBTercia;
    else if(TABLES.OficisComuns !== null) this.TERCIA.vers = TABLES.OficisComuns.citaLBTercia;
    if(TABLES.santsSolemnitats.lecturaBreuTercia !== '-')
        this.TERCIA.lecturaBreu = TABLES.santsSolemnitats.lecturaBreuTercia;
    else if(TABLES.OficisComuns !== null) this.TERCIA.lecturaBreu = TABLES.OficisComuns.lecturaBreuTercia;
    //SF-TÈRCIA -> RESPONSORI
    if(TABLES.santsSolemnitats.responsoriVTercia !== '-')
        this.TERCIA.respV = TABLES.santsSolemnitats.responsoriVTercia;
    else if(TABLES.OficisComuns !== null) this.TERCIA.respV = TABLES.OficisComuns.respVTercia;
    if(TABLES.santsSolemnitats.responsoriRTercia !== '-')
        this.TERCIA.respR = TABLES.santsSolemnitats.responsoriRTercia;
    else if(TABLES.OficisComuns !== null) this.TERCIA.respR = TABLES.OficisComuns.respRTercia;
    //SF-TÈRCIA -> ORACIÓ
    // if(TABLES.santsSolemnitats.oraFiMenor !== '-')
    this.TERCIA.oracio = TABLES.santsSolemnitats.oraFiMenor;
    // else if(TABLES.OficisComuns !== null) this.TERCIA.oracio = TABLES.OficisComuns.oraFiMenor;


    //::::::SF-SEXTA::::::
    //SF-SEXTA -> SALMÒDIA
    //ANT
    this.SEXTA.antifones = false;
    if(TABLES.santsSolemnitats.antMenorSexta !== '-')
        this.SEXTA.ant = TABLES.santsSolemnitats.antMenorSexta;
    else if(TABLES.OficisComuns !== null) {
        this.SEXTA.ant = TABLES.OficisComuns.antMenorSextA;
    }
    else{
    }
    //S1
    this.SEXTA.titol1 = TABLES.santsSolemnitats.titolSalm1;
    this.SEXTA.com1 = ".";
    this.SEXTA.salm1 = TABLES.santsSolemnitats.salm1Menor;
    this.SEXTA.gloria1 = TABLES.santsSolemnitats.gloriaSalm1;
    //S2
    this.SEXTA.titol2 = TABLES.santsSolemnitats.titolSalm2;
    this.SEXTA.com2 = ".";
    this.SEXTA.salm2 = TABLES.santsSolemnitats.salm2Menor;
    this.SEXTA.gloria2 = TABLES.santsSolemnitats.gloriaSalm2;
    //S3
    this.SEXTA.titol3 = TABLES.santsSolemnitats.titolSalm3;
    this.SEXTA.com3 = ".";
    this.SEXTA.salm3 = TABLES.santsSolemnitats.salm3Menor;
    this.SEXTA.gloria3 = TABLES.santsSolemnitats.gloriaSaml3;
    //SF-SEXTA -> LECTURA BREU
    if(TABLES.santsSolemnitats.citaLBSexta !== '-')
        this.SEXTA.vers = TABLES.santsSolemnitats.citaLBSexta;
    else if(TABLES.OficisComuns !== null) this.SEXTA.vers = TABLES.OficisComuns.citaLBSexta;
    if(TABLES.santsSolemnitats.lecturaBreuSexta !== '-')
        this.SEXTA.lecturaBreu = TABLES.santsSolemnitats.lecturaBreuSexta;
    else if(TABLES.OficisComuns !== null) this.SEXTA.lecturaBreu = TABLES.OficisComuns.lecturaBreuSexta;
    //SF-SEXTA -> RESPONSORI BREU
    if(TABLES.santsSolemnitats.responsoriVSexta !== '-')
        this.SEXTA.respV = TABLES.santsSolemnitats.responsoriVSexta;
    else if(TABLES.OficisComuns !== null) this.SEXTA.respV = TABLES.OficisComuns.respVSexta;
    if(TABLES.santsSolemnitats.responsoriRSexta !== '-')
        this.SEXTA.respR = TABLES.santsSolemnitats.responsoriRSexta;
    else if(TABLES.OficisComuns !== null) this.SEXTA.respR = TABLES.OficisComuns.respRSexta;
    //SF-SEXTA -> ORACIÓ
    // if(TABLES.santsSolemnitats.oraFiMenor !== '-')
    this.SEXTA.oracio = TABLES.santsSolemnitats.oraFiMenor;
    // else if(TABLES.OficisComuns !== null) this.SEXTA.oracio = TABLES.OficisComuns.oraFiMenor;


    //::::::SF-NONA::::::
    //SF-NONA -> SALMÒDIA
    //ANT
    this.NONA.antifones = false;
    if(TABLES.santsSolemnitats.antMenorNona !== '-')
        this.NONA.ant = TABLES.santsSolemnitats.antMenorNona;
    else if(TABLES.OficisComuns !== null) this.NONA.ant = TABLES.OficisComuns.antMenorNona;
    //S1
    this.NONA.titol1 = TABLES.santsSolemnitats.titolSalm1;
    this.NONA.com1 = ".";
    this.NONA.salm1 = TABLES.santsSolemnitats.salm1Menor;
    this.NONA.gloria1 = TABLES.santsSolemnitats.gloriaSalm1;
    //S2
    this.NONA.titol2 = TABLES.santsSolemnitats.titolSalm2;
    this.NONA.com2 = ".";
    this.NONA.salm2 = TABLES.santsSolemnitats.salm2Menor;
    this.NONA.gloria2 = TABLES.santsSolemnitats.gloriaSalm2;
    //S3
    this.NONA.titol3 = TABLES.santsSolemnitats.titolSalm3;
    this.NONA.com3 = ".";
    this.NONA.salm3 = TABLES.santsSolemnitats.salm3Menor;
    this.NONA.gloria3 = TABLES.santsSolemnitats.gloriaSaml3;
    //SF-NONA -> LECTURA BREU
    if(TABLES.santsSolemnitats.citaLBNona !== '-')
        this.NONA.vers = TABLES.santsSolemnitats.citaLBNona;
    else if(TABLES.OficisComuns !== null) this.NONA.vers = TABLES.OficisComuns.citaLBNona;
    if(TABLES.santsSolemnitats.lecturaBreuNona !== '-')
        this.NONA.lecturaBreu = TABLES.santsSolemnitats.lecturaBreuNona;
    else if(TABLES.OficisComuns !== null) this.NONA.lecturaBreu = TABLES.OficisComuns.lecturaBreuNona;
    //SF-NONA -> RESPONSORI
    if(TABLES.santsSolemnitats.responsoriVNona !== '-')
        this.NONA.respV = TABLES.santsSolemnitats.responsoriVNona;
    else if(TABLES.OficisComuns !== null) this.NONA.respV = TABLES.OficisComuns.respVNona;
    if(TABLES.santsSolemnitats.responsoriRNona !== '-')
        this.NONA.respR = TABLES.santsSolemnitats.responsoriRNona;
    else if(TABLES.OficisComuns !== null) this.NONA.respR = TABLES.OficisComuns.respRNona;
    //SF-NONA -> ORACIÓ
    // if(TABLES.santsSolemnitats.oraFiMenor !== '-')
    this.NONA.oracio = TABLES.santsSolemnitats.oraFiMenor;
    // else if(TABLES.OficisComuns !== null) this.NONA.oracio = TABLES.OficisComuns.oraFiMenor;

    // TODO: vespers here will be SecondVespersWithCelebration
    if(!(EnableSomething && GlobalData.date.getDay() === 6) && !(CelebrationIsSaintOrFestivity && GlobalData.date.getDay() === 6 && GlobalData.LT === SpecificLiturgyTimeType.Q_SETMANES)){
        //::::::SF-VESPRES2::::::
        //SF-VESPRES2 -> HIMNE
        if(TABLES.santsSolemnitats.himneVespres2Llati !== '-'){
            if(settings.UseLatin) this.VESPRES.himne = TABLES.santsSolemnitats.himneVespres2Llati;
            else this.VESPRES.himne = TABLES.santsSolemnitats.himneVespres2Cat;
        }
        else if(TABLES.OficisComuns !== null){
            if(settings.UseLatin) this.VESPRES.himne = TABLES.OficisComuns.himneVespresLlati;
            else this.VESPRES.himne = TABLES.OficisComuns.himneVespresCat;
        }
        //SF-VESPRES2 -> SALMÒDIA
        //S1
        if(TABLES.santsSolemnitats.ant1Vespres2 !== '-')
            this.VESPRES.ant1 = TABLES.santsSolemnitats.ant1Vespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.ant1 = TABLES.OficisComuns.ant1Vespres;
        if(TABLES.santsSolemnitats.titol1Vespres2 !== '-')
            this.VESPRES.titol1 = TABLES.santsSolemnitats.titol1Vespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.titol1 = TABLES.OficisComuns.titol1Vespres;
        this.VESPRES.com1 = ".";
        if(TABLES.santsSolemnitats.text1Vespres2 !== '-')
            this.VESPRES.salm1 = TABLES.santsSolemnitats.text1Vespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.salm1 = TABLES.OficisComuns.Salm1Vespres;
        if(TABLES.santsSolemnitats.gloria1Vespres2 !== '-')
            this.VESPRES.gloria1 = TABLES.santsSolemnitats.gloria1Vespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.gloria1 = TABLES.OficisComuns.gloria1Vespres;
        //S2
        if(TABLES.santsSolemnitats.ant2Vespres2 !== '-')
            this.VESPRES.ant2 = TABLES.santsSolemnitats.ant2Vespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.ant2 = TABLES.OficisComuns.ant2Vespres;
        if(TABLES.santsSolemnitats.titol2Vespres2 !== '-')
            this.VESPRES.titol2 = TABLES.santsSolemnitats.titol2Vespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.titol2 = TABLES.OficisComuns.titol2Vespres;
        this.VESPRES.com2 = ".";
        if(TABLES.santsSolemnitats.text2Vespres2 !== '-')
            this.VESPRES.salm2 = TABLES.santsSolemnitats.text2Vespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.salm2 = TABLES.OficisComuns.Salm2Vespres;
        if(TABLES.santsSolemnitats.gloria2Vespres2 !== '-')
            this.VESPRES.gloria2 = TABLES.santsSolemnitats.gloria2Vespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.gloria2 = TABLES.OficisComuns.gloria2Vespres;
        //S3
        if(TABLES.santsSolemnitats.ant3Vespres2 !== '-')
            this.VESPRES.ant3 = TABLES.santsSolemnitats.ant3Vespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.ant3 = TABLES.OficisComuns.ant3Vespres;
        if(TABLES.santsSolemnitats.titol3Vespres2 !== '-')
            this.VESPRES.titol3 = TABLES.santsSolemnitats.titol3Vespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.titol3 = TABLES.OficisComuns.titol3Vespres;
        this.VESPRES.com3 = ".";
        if(TABLES.santsSolemnitats.text3Vespres2 !== '-')
            this.VESPRES.salm3 = TABLES.santsSolemnitats.text3Vespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.salm3 = TABLES.OficisComuns.Salm3Vespres;
        if(TABLES.santsSolemnitats.gloria3Vespres2 !== '-')
            this.VESPRES.gloria3 = TABLES.santsSolemnitats.gloria3Vespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.gloria3 = TABLES.OficisComuns.gloria3Vespres;
        //SF-VESPRES2 -> LECTURA BREU
        if(TABLES.santsSolemnitats.citaLBVespres2 !== '-')
            this.VESPRES.vers = TABLES.santsSolemnitats.citaLBVespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.vers = TABLES.OficisComuns.citaLBVespres;
        if(TABLES.santsSolemnitats.lecturaBreuVespres2 !== '-')
            this.VESPRES.lecturaBreu = TABLES.santsSolemnitats.lecturaBreuVespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.lecturaBreu = TABLES.OficisComuns.lecturaBreuVespres;
        //SF-VESPRES2 -> RESPONSORI
        this.VESPRES.calAntEspecial = false;
        if(TABLES.santsSolemnitats.respBreuVespres2Part1 !== '-')
            this.VESPRES.respBreu1 = TABLES.santsSolemnitats.respBreuVespres2Part1;
        else if(TABLES.OficisComuns !== null) this.VESPRES.respBreu1 = TABLES.OficisComuns.respBreuVespres1;
        if(TABLES.santsSolemnitats.respBreuVespres2Part2 !== '-')
            this.VESPRES.respBreu2 = TABLES.santsSolemnitats.respBreuVespres2Part2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.respBreu2 = TABLES.OficisComuns.respBreuVespres2;
        if(TABLES.santsSolemnitats.respBreuVespres2Part3 !== '-')
            this.VESPRES.respBreu3 = TABLES.santsSolemnitats.respBreuVespres2Part3;
        else if(TABLES.OficisComuns !== null) this.VESPRES.respBreu3 = TABLES.OficisComuns.respBreuVespres3;
        //SF-VESPRES2 -> CÀNTIC
        if(TABLES.santsSolemnitats.antMaria2 !== '-')
            this.VESPRES.antCantic = TABLES.santsSolemnitats.antMaria2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.antCantic = TABLES.OficisComuns.antMaria;
        //SF-VESPRES2 -> PREGÀRIES
        if(TABLES.santsSolemnitats.pregariesVespres2 !== '-')
            this.VESPRES.pregaries = TABLES.santsSolemnitats.pregariesVespres2;
        else if(TABLES.OficisComuns !== null) this.VESPRES.pregaries = TABLES.OficisComuns.pregariesVespres;
        //SF-VESPRES2 -> ORACIÓ
        this.VESPRES.oracio = TABLES.santsSolemnitats.oraFiVespres2;
    }
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

function makeVespres1TSF(saintsSolemnities: SaintsSolemnities): Vespers{
    llati = GlobalData.llati;
    anyABC = GlobalData.ABC;

    //::::::>>>>>TSF<<<<<::::::
    //::::::TSF-INFO_CEL::::::
    //TODO: VESPRES.Title = ...
    this.INFO_CEL.nomCelTom = TABLES.tempsSolemnitatsFestesVespres1.nomMemoria;
    //::::::TSF-VESPRES1::::::
    if(settings.UseLatin) this.VESPRES1.himne = TABLES.tempsSolemnitatsFestesVespres1.himneVespres1Llati;
    else this.VESPRES1.himne = TABLES.tempsSolemnitatsFestesVespres1.himneVespres1Cat;
    this.VESPRES1.ant1 = TABLES.tempsSolemnitatsFestesVespres1.ant1Vespres1;
    this.VESPRES1.titol1 = TABLES.tempsSolemnitatsFestesVespres1.titol1Vespres1;
    this.VESPRES1.com1 = ".";
    this.VESPRES1.salm1 = TABLES.tempsSolemnitatsFestesVespres1.text1Vespres1;
    this.VESPRES1.gloria1 = TABLES.tempsSolemnitatsFestesVespres1.gloria1Vespres1;
    this.VESPRES1.ant2 = TABLES.tempsSolemnitatsFestesVespres1.ant2Vespres1;
    this.VESPRES1.titol2 = TABLES.tempsSolemnitatsFestesVespres1.titol2Vespres1;
    this.VESPRES1.com2 = ".";
    this.VESPRES1.salm2 = TABLES.tempsSolemnitatsFestesVespres1.text2Vespres1;
    this.VESPRES1.gloria2 = TABLES.tempsSolemnitatsFestesVespres1.gloria2Vespres1;
    this.VESPRES1.ant3 = TABLES.tempsSolemnitatsFestesVespres1.ant3Vespres1;
    this.VESPRES1.titol3 = TABLES.tempsSolemnitatsFestesVespres1.titol3Vespres1;
    this.VESPRES1.com3 = ".";
    this.VESPRES1.salm3 = TABLES.tempsSolemnitatsFestesVespres1.text3Vespres1;
    this.VESPRES1.gloria3 = TABLES.tempsSolemnitatsFestesVespres1.gloria3Vespres1;
    this.VESPRES1.vers = TABLES.tempsSolemnitatsFestesVespres1.citaLBVespres1;
    this.VESPRES1.lecturaBreu = TABLES.tempsSolemnitatsFestesVespres1.lecturaBreuVespres1;
    this.VESPRES1.calAntEspecial = false;
    this.VESPRES1.respBreu1 = TABLES.tempsSolemnitatsFestesVespres1.respBreuVespres1Part1;
    this.VESPRES1.respBreu2 = TABLES.tempsSolemnitatsFestesVespres1.respBreuVespres1Part2;
    this.VESPRES1.respBreu3 = TABLES.tempsSolemnitatsFestesVespres1.respBreuVespres1Part3;
    switch (anyABC) {
        case "A":
            this.VESPRES1.antCantic = TABLES.tempsSolemnitatsFestesVespres1.antMaria1A;
            break;
        case "B":
            this.VESPRES1.antCantic = TABLES.tempsSolemnitatsFestesVespres1.antMaria1B;
            break;
        case "C":
            this.VESPRES1.antCantic = TABLES.tempsSolemnitatsFestesVespres1.antMaria1C;
            break;
    }
    this.VESPRES1.pregaries = TABLES.tempsSolemnitatsFestesVespres1.pregariesVespres1;
    this.VESPRES1.oracio = TABLES.tempsSolemnitatsFestesVespres1.oraFiVespres1;
}

function makeVespres1DE(specialDaysParts: SpecialDaysParts): Vespers{
    llati = GlobalData.llati;
    anyABC = GlobalData.ABC;

    //TODO: VESPRES.Title = ...
    this.INFO_CEL.nomCelTom = TABLES.diesespecials.nomMemoria;

    //::::::DE-VESPRES1::::::
    if(settings.UseLatin) this.VESPRES1.himne = TABLES.diesespecials.himneVespres1Llati;
    else this.VESPRES1.himne = TABLES.diesespecials.himneVespres1Cat;
    this.VESPRES1.ant1 = TABLES.diesespecials.ant1Vespres1;
    this.VESPRES1.titol1 = TABLES.diesespecials.titol1Vespres1;
    this.VESPRES1.com1 = ".";
    this.VESPRES1.salm1 = TABLES.diesespecials.text1Vespres1;
    this.VESPRES1.gloria1 = TABLES.diesespecials.gloria1Vespres1;
    this.VESPRES1.ant2 = TABLES.diesespecials.ant2Vespres1;
    this.VESPRES1.titol2 = TABLES.diesespecials.titol2Vespres1;
    this.VESPRES1.com2 = ".";
    this.VESPRES1.salm2 = TABLES.diesespecials.text2Vespres1;
    this.VESPRES1.gloria2 = TABLES.diesespecials.gloria2Vespres1;
    this.VESPRES1.ant3 = TABLES.diesespecials.ant3Vespres1;
    this.VESPRES1.titol3 = TABLES.diesespecials.titol3Vespres1;
    this.VESPRES1.com3 = ".";
    this.VESPRES1.salm3 = TABLES.diesespecials.text3Vespres1;
    this.VESPRES1.gloria3 = TABLES.diesespecials.gloria3Vespres1;
    this.VESPRES1.vers = TABLES.diesespecials.citaLBVespres1;
    this.VESPRES1.lecturaBreu = TABLES.diesespecials.lecturaBreuVespres1;
    this.VESPRES1.calAntEspecial = false;
    this.VESPRES1.respBreu1 = TABLES.diesespecials.respBreuVespres1Part1;
    this.VESPRES1.respBreu2 = TABLES.diesespecials.respBreuVespres1Part2;
    this.VESPRES1.respBreu3 = TABLES.diesespecials.respBreuVespres1Part3;
    this.VESPRES1.antCantic = TABLES.diesespecials.antMaria1A;
    this.VESPRES1.pregaries = TABLES.diesespecials.pregariesVespres1;
    this.VESPRES1.oracio = TABLES.diesespecials.oraFiVespres1;
}

function makeVespres1SF(liturgyMasters: LiturgyMasters): Vespers{
    llati = GlobalData.llati;
    anyABC = GlobalData.ABC;

    //TODO: VESPRES.Title = ...
    this.INFO_CEL.nomCelTom = TABLES.santsSolemnitatsFVespres1.nomMemoria;

    //::::::SF-VESPRES1::::::
    //SF-VESPRES1 -> HIMNE
    if(this.VESPRES1.himne = TABLES.santsSolemnitatsFVespres1.himneVespres1Llati !== '-'){
        if(settings.UseLatin) this.VESPRES1.himne = TABLES.santsSolemnitatsFVespres1.himneVespres1Llati;
        else this.VESPRES1.himne = TABLES.santsSolemnitatsFVespres1.himneVespres1Cat;
    }
    else if(TABLES.OficisComunsVespres1 !== null){
        if(settings.UseLatin) this.VESPRES1.himne = TABLES.OficisComunsVespres1.himneVespres1Llati;
        else this.VESPRES1.himne = TABLES.OficisComunsVespres1.himneVespres1Cat;
    }
    //SF-VESPRES1 -> SALMÒDIA
    //S1
    if(TABLES.santsSolemnitatsFVespres1.ant1Vespres1 !== '-')
        this.VESPRES1.ant1 = TABLES.santsSolemnitatsFVespres1.ant1Vespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.ant1 = TABLES.OficisComunsVespres1.ant1Vespres1;
    if(TABLES.santsSolemnitatsFVespres1.titol1Vespres1 !== '-')
        this.VESPRES1.titol1 = TABLES.santsSolemnitatsFVespres1.titol1Vespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.titol1 = TABLES.OficisComunsVespres1.titol1Vespres1;
    this.VESPRES1.com1 = ".";
    if(TABLES.santsSolemnitatsFVespres1.text1Vespres1 !== '-')
        this.VESPRES1.salm1 = TABLES.santsSolemnitatsFVespres1.text1Vespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.salm1 = TABLES.OficisComunsVespres1.text1Vespres1;
    if(TABLES.santsSolemnitatsFVespres1.gloria1Vespres1 !== '-')
        this.VESPRES1.gloria1 = TABLES.santsSolemnitatsFVespres1.gloria1Vespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.gloria1 = TABLES.OficisComunsVespres1.gloria1Vespres1;
    //S2
    if(TABLES.santsSolemnitatsFVespres1.ant2Vespres1 !== '-')
        this.VESPRES1.ant2 = TABLES.santsSolemnitatsFVespres1.ant2Vespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.ant2 = TABLES.OficisComunsVespres1.ant2Vespres1;
    if(TABLES.santsSolemnitatsFVespres1.titol2Vespres1 !== '-')
        this.VESPRES1.titol2 = TABLES.santsSolemnitatsFVespres1.titol2Vespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.titol2 = TABLES.OficisComunsVespres1.titol2Vespres1;
    this.VESPRES1.com2 = ".";
    if(TABLES.santsSolemnitatsFVespres1.text2Vespres1 !== '-')
        this.VESPRES1.salm2 = TABLES.santsSolemnitatsFVespres1.text2Vespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.salm2 = TABLES.OficisComunsVespres1.text2Vespres1;
    if(TABLES.santsSolemnitatsFVespres1.gloria2Vespres1 !== '-')
        this.VESPRES1.gloria2 = TABLES.santsSolemnitatsFVespres1.gloria2Vespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.gloria2 = TABLES.OficisComunsVespres1.gloria2Vespres1;
    //S3
    if(TABLES.santsSolemnitatsFVespres1.ant3Vespres1 !== '-')
        this.VESPRES1.ant3 = TABLES.santsSolemnitatsFVespres1.ant3Vespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.ant3 = TABLES.OficisComunsVespres1.ant3Vespres1;
    if(TABLES.santsSolemnitatsFVespres1.titol3Vespres1 !== '-')
        this.VESPRES1.titol3 = TABLES.santsSolemnitatsFVespres1.titol3Vespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.titol3 = TABLES.OficisComunsVespres1.titol3Vespres1;
    this.VESPRES1.com3 = ".";
    if(TABLES.santsSolemnitatsFVespres1.text3Vespres1 !== '-')
        this.VESPRES1.salm3 = TABLES.santsSolemnitatsFVespres1.text3Vespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.salm3 = TABLES.OficisComunsVespres1.text3Vespres1;
    if(TABLES.santsSolemnitatsFVespres1.gloria3Vespres1 !== '-')
        this.VESPRES1.gloria3 = TABLES.santsSolemnitatsFVespres1.gloria3Vespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.gloria3 = TABLES.OficisComunsVespres1.gloria3Vespres1;
    //SF-VESPRES1 -> LECTURA BREU
    if(TABLES.santsSolemnitatsFVespres1.citaLBVespres1 !== '-')
        this.VESPRES1.vers = TABLES.santsSolemnitatsFVespres1.citaLBVespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.vers = TABLES.OficisComunsVespres1.citaLBVespres1;
    if(TABLES.santsSolemnitatsFVespres1.lecturaBreuVespres1 !== '-')
        this.VESPRES1.lecturaBreu = TABLES.santsSolemnitatsFVespres1.lecturaBreuVespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.lecturaBreu = TABLES.OficisComunsVespres1.lecturaBreuVespres1;
    //SF-VESPRES1 -> RESPONSORI
    this.VESPRES1.calAntEspecial = false;
    if(TABLES.santsSolemnitatsFVespres1.respBreuVespres1Part1 !== '-')
        this.VESPRES1.respBreu1 = TABLES.santsSolemnitatsFVespres1.respBreuVespres1Part1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.respBreu1 = TABLES.OficisComunsVespres1.respBreuVespres1Part1;
    if(TABLES.santsSolemnitatsFVespres1.respBreuVespres1Part2 !== '-')
        this.VESPRES1.respBreu2 = TABLES.santsSolemnitatsFVespres1.respBreuVespres1Part2;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.respBreu2 = TABLES.OficisComunsVespres1.respBreuVespres1Part2;
    if(TABLES.santsSolemnitatsFVespres1.respBreuVespres1Part3 !== '-')
        this.VESPRES1.respBreu3 = TABLES.santsSolemnitatsFVespres1.respBreuVespres1Part3;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.respBreu3 = TABLES.OficisComunsVespres1.respBreuVespres1Part3;
    //SF-VESPRES1 -> CÀNTIC
    if(TABLES.santsSolemnitatsFVespres1.antMaria1 !== '-')
        this.VESPRES1.antCantic = TABLES.santsSolemnitatsFVespres1.antMaria1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.antCantic = TABLES.OficisComunsVespres1.antMaria1A;
    //SF-VESPRES1 -> PREGÀRIES
    if(TABLES.santsSolemnitatsFVespres1.pregariesVespres1 !== '-')
        this.VESPRES1.pregaries = TABLES.santsSolemnitatsFVespres1.pregariesVespres1;
    else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.pregaries = TABLES.OficisComunsVespres1.pregariesVespres1;
    //SF-VESPRES1 -> ORACIÓ
    if(TABLES.santsSolemnitatsFVespres1.oraFiVespres1 !== '-')
        this.VESPRES1.oracio = TABLES.santsSolemnitatsFVespres1.oraFiVespres1;
    // else if(TABLES.OficisComunsVespres1 !== null) this.VESPRES1.oracio = TABLES.OficisComunsVespres1.oraFiVespres1;
}

function makeVespres1DR(palmSundayParts: PalmSundayParts): Vespers{
    llati = GlobalData.llati;
    anyABC = GlobalData.ABC;
    //TODO: VESPRES.Title = ...
    if(settings.UseLatin) this.VESPRES1.himne = TABLES.tempsQuaresmaComuSS.himneVespresLlati;
    else this.VESPRES1.himne = TABLES.tempsQuaresmaComuSS.himneVespresCat;
    this.VESPRES1.ant1 = TABLES.tempsQuaresmaRams.ant1Vespres1;
    this.VESPRES1.ant2 = TABLES.tempsQuaresmaRams.ant2Vespres1;
    this.VESPRES1.ant3 = TABLES.tempsQuaresmaRams.ant3Vespres1;
    this.VESPRES1.vers = TABLES.tempsQuaresmaRams.citaLBVespres;
    this.VESPRES1.lecturaBreu = TABLES.tempsQuaresmaRams.lecturaBreuVespres;
    this.VESPRES1.respBreu1 = TABLES.tempsQuaresmaRams.respBreuVespres1;
    this.VESPRES1.respBreu2 = TABLES.tempsQuaresmaRams.respBreuVespres2;
    this.VESPRES1.respBreu3 = TABLES.tempsQuaresmaRams.respBreuVespres3;
    switch (anyABC) {
        case YearType.A:
            this.VESPRES1.antCantic = TABLES.tempsQuaresmaRams.antMaria1A;
            break;
        case YearType.B:
            this.VESPRES1.antCantic = TABLES.tempsQuaresmaRams.antMaria1B;
            break;
        case YearType.C:
            this.VESPRES1.antCantic = TABLES.tempsQuaresmaRams.antMaria1C;
            break;
    }
    this.VESPRES1.pregaries = TABLES.tempsQuaresmaRams.pregariesVespres1;
    this.VESPRES1.oracio = TABLES.tempsQuaresmaRams.oraFiVespres1;
}

function makeVespres1T(TABLES): Vespers{
    llati = GlobalData.llati;
    anyABC = GlobalData.ABC;
    //TODO: VESPRES.Title = ...
    if(settings.UseLatin) this.VESPRES1.himne = TABLES.tempsQuaresmaTridu.himneDSOVespresllati;
    else this.VESPRES1.himne = TABLES.tempsQuaresmaTridu.himneDSOVespresCat;
    this.VESPRES1.ant1 = TABLES.tempsQuaresmaTridu.ant1Vespres;
    this.VESPRES1.titol1 = TABLES.tempsQuaresmaTridu.titol1Vespres;
    this.VESPRES1.com1 = "-";
    this.VESPRES1.salm1 = TABLES.tempsQuaresmaTridu.salm1Vespres;
    this.VESPRES1.gloria1 = TABLES.tempsQuaresmaTridu.gloriaVespres1;
    this.VESPRES1.ant2 = TABLES.tempsQuaresmaTridu.ant2Vespres;
    this.VESPRES1.titol2 = TABLES.tempsQuaresmaTridu.titol2Vespres;
    this.VESPRES1.com2 = "-";
    this.VESPRES1.salm2 = TABLES.tempsQuaresmaTridu.salm2Vespres;
    this.VESPRES1.gloria2 = TABLES.tempsQuaresmaTridu.gloriaVespres2;
    this.VESPRES1.ant3 = TABLES.tempsQuaresmaTridu.ant3Vespres;
    this.VESPRES1.titol3 = TABLES.tempsQuaresmaTridu.titol3Vespres;
    this.VESPRES1.com3 = "-";
    this.VESPRES1.salm3 = TABLES.tempsQuaresmaTridu.salm3Vespres;
    this.VESPRES1.gloria3 = TABLES.tempsQuaresmaTridu.gloriaVespres3;
    this.VESPRES1.vers = TABLES.tempsQuaresmaTridu.citaLBVespres;
    this.VESPRES1.lecturaBreu = TABLES.tempsQuaresmaTridu.lecturaBreuVespres;
    this.VESPRES1.calAntEspecial = true;
    this.VESPRES1.antEspecialVespres = TABLES.tempsQuaresmaTridu.antifonaEspecialVespres;
    this.VESPRES1.antCantic = TABLES.tempsQuaresmaTridu.antMaria;
    this.VESPRES1.pregaries = TABLES.tempsQuaresmaTridu.pregariesVespres;
    this.VESPRES1.oracio = TABLES.tempsQuaresmaTridu.oraFiVespres;
}

function makeVespres1A(liturgyMasters: LiturgyMasters): Vespers{
    llati = GlobalData.llati;
    anyABC = GlobalData.ABC;
    //TODO: VESPRES.Title = ...
    if(settings.UseLatin)
        this.VESPRES1.himne = TABLES.tempsAdventNadalComu.himneVespresLlati;
    else this.VESPRES1.himne = TABLES.tempsAdventNadalComu.himneVespresCat;
    this.VESPRES1.ant1 = TABLES.tempsAdventSetmanesDiumVespres1.ant1Vespres;
    this.VESPRES1.ant2 = TABLES.tempsAdventSetmanesDiumVespres1.ant2Vespres;
    this.VESPRES1.ant3 = TABLES.tempsAdventSetmanesDiumVespres1.ant3Vespres;
    this.VESPRES1.vers = TABLES.tempsAdventSetmanes.citaLBVespres;
    this.VESPRES1.lecturaBreu = TABLES.tempsAdventSetmanes.lecturaBreuVespres;
    this.VESPRES1.respBreu1 = TABLES.tempsAdventSetmanes.respBreuVespres1;
    this.VESPRES1.respBreu2 = TABLES.tempsAdventSetmanes.respBreuVespres2;
    this.VESPRES1.respBreu3 = TABLES.tempsAdventSetmanes.respBreuVespres3;
    switch (anyABC) {
        case YearType.C:
            this.VESPRES1.antCantic = TABLES.tempsAdventSetmanesDiumVespres1.antMaria1A;
            break;
        case YearType.A:
            this.VESPRES1.antCantic = TABLES.tempsAdventSetmanesDiumVespres1.antMaria1B;
            break;
        case YearType.B:
            this.VESPRES1.antCantic = TABLES.tempsAdventSetmanesDiumVespres1.antMaria1C;
            break;
    }
    this.VESPRES1.pregaries = TABLES.tempsAdventSetmanes.pregariesVespres;
    this.VESPRES1.oracio = TABLES.tempsAdventSetmanes.oraFiVespres;
}