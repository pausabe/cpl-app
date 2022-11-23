import Office, {TeDeumInformation} from "../../Models/HoursLiturgy/Office";
import GlobalViewFunctions from "../../Utils/GlobalViewFunctions";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import {LiturgySpecificDayInformation, SpecialCelebrationTypeEnum} from "../../Models/LiturgyDayInformation";
import {Settings} from "../../Models/Settings";
import OfficeCommonPsalter from "../../Models/LiturgyMasters/OfficeCommonPsalter";
import {ReadingOfTheOffice, Psalm, Responsory} from "../../Models/LiturgyMasters/CommonParts";
import {SpecificLiturgyTimeType} from "../CelebrationTimeEnums";
import {StringManagement} from "../../Utils/StringManagement";
import * as CelebrationIdentifier from "../CelebrationIdentifierService";

export function ObtainOffice(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationOffice : Office, settings : Settings) : Office{
    let office = new Office();

    let currentOfficeCommonPsalter = liturgyMasters.OfficeCommonPsalter;
    if(liturgyDayInformation.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.StrongTime){
        currentOfficeCommonPsalter = Object.assign(Object.create(Object.getPrototypeOf(liturgyMasters.OfficeCommonPsalter)), liturgyMasters.OfficeCommonPsalter) as OfficeCommonPsalter;
        currentOfficeCommonPsalter.AdaptWithStrongTimes(liturgyMasters.CommonOfficeWhenStrongTimesPsalter);
    }

    if(liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
        office = celebrationOffice;
    }
    else{
        office.IsDarkAnthem = IsDarkAnthem();
        office.Anthem = GetAnthem(office.IsDarkAnthem, currentOfficeCommonPsalter, liturgyMasters, liturgyDayInformation, celebrationOffice, settings);
        const psalmody = GetPsalmody(currentOfficeCommonPsalter, liturgyMasters, liturgyDayInformation, celebrationOffice);
        office.FirstPsalm = psalmody.FirstPsalm;
        office.SecondPsalm = psalmody.SecondPsalm;
        office.ThirdPsalm = psalmody.ThirdPsalm;
        office.Responsory = GetResponsory(currentOfficeCommonPsalter, liturgyMasters, liturgyDayInformation, celebrationOffice);
        const readings = GetReadings(currentOfficeCommonPsalter, liturgyMasters, liturgyDayInformation, celebrationOffice);
        office.FirstReading = readings.FirstReading;
        office.SecondReading = readings.SecondReading;
        office.TeDeumInformation = GetTeDeumInformation(currentOfficeCommonPsalter, liturgyMasters, liturgyDayInformation, celebrationOffice, settings);
        office.FinalPrayer = GetFinalPrayer(currentOfficeCommonPsalter, liturgyMasters, liturgyDayInformation, celebrationOffice);
    }
    return office;
}

function IsDarkAnthem(){
    const nowDate = new Date();
    const hour = nowDate.getHours();
    return hour < 6;
}

function GetAnthem(isDarkAnthem: boolean, currentOfficeCommonPsalter : OfficeCommonPsalter, liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationOffice : Office, settings : Settings) : string{
    if(StringManagement.HasLiturgyContent(celebrationOffice.Anthem)) {
        return celebrationOffice.Anthem;
    }

    let anthem;
    if(isDarkAnthem){
        if(settings.UseLatin){
            anthem = liturgyMasters.OfficeCommonPsalter.NightLatinAnthem;
        }
        else{
            anthem = liturgyMasters.OfficeCommonPsalter.NightCatalanAnthem;
        }
    }
    else{
        if(settings.UseLatin){
            anthem = liturgyMasters.OfficeCommonPsalter.DayLatinAnthem;
        }
        else{
            anthem = liturgyMasters.OfficeCommonPsalter.DayCatalanAnthem;
        }
    }
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case SpecificLiturgyTimeType.LentAshes:
        case SpecificLiturgyTimeType.LentWeeks:
            if(liturgyDayInformation.DayOfTheWeek===0){
                if(settings.UseLatin){
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.OfficeSundaysLatinAnthem;
                }
                else{
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.OfficeSundaysCatalanAnthem;
                }
            }
            else{
                if(settings.UseLatin){
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.OfficeFairsLatinAnthem;
                }
                else{
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.OfficeFairsCatalanAnthem;
                }
            }
            break;
        case SpecificLiturgyTimeType.PalmSunday:
        case SpecificLiturgyTimeType.HolyWeek:
            if(settings.UseLatin){
                anthem = liturgyMasters.CommonPartsOfHolyWeek.OfficeLatinAnthem;
            }
            else{
                anthem = liturgyMasters.CommonPartsOfHolyWeek.OfficeCatalanAnthem;
            }
            break;
        case SpecificLiturgyTimeType.LentTriduum:
            if(settings.UseLatin){
                anthem = liturgyMasters.PartsOfEasterTriduum.OfficeLatinAnthem;
            }
            else{
                anthem = liturgyMasters.PartsOfEasterTriduum.OfficeCatalanAnthem;
            }
            break;
        case SpecificLiturgyTimeType.EasterOctave:
            if(settings.UseLatin){
                anthem = liturgyMasters.PartsOfEasterBeforeAscension.OfficeWeekendLatinAnthem;
            }
            else{
                anthem = liturgyMasters.PartsOfEasterBeforeAscension.OfficeWeekendCatalanAnthem;
            }
            break;
        case SpecificLiturgyTimeType.EasterWeeks:
            if(liturgyDayInformation.Week === '7'){
                if(settings.UseLatin){
                    anthem = liturgyMasters.PartsOfEasterAfterAscension.OfficeLatinAnthem;
                }
                else{
                    anthem = liturgyMasters.PartsOfEasterAfterAscension.OfficeCatalanAnthem;
                }
            }
            else{
                if(liturgyDayInformation.DayOfTheWeek === 6 || liturgyDayInformation.DayOfTheWeek === 0){
                    if(settings.UseLatin){
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.OfficeWeekendLatinAnthem;
                    }
                    else{
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.OfficeWeekendCatalanAnthem;
                    }
                }
                else{
                    if(settings.UseLatin){
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.OfficeWorkdaysLatinAnthem;
                    }
                    else{
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.OfficeWorkdaysCatalanAnthem;
                    }
                }
            }
            break;
        case SpecificLiturgyTimeType.AdventWeeks:
        case SpecificLiturgyTimeType.AdventFairs:
        case SpecificLiturgyTimeType.ChristmasOctave:
        case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
            if(liturgyDayInformation.SpecificLiturgyTime != SpecificLiturgyTimeType.ChristmasBeforeOrdinary ||
                (liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13)){
                if(settings.UseLatin){
                    anthem = liturgyMasters.CommonAdventAndChristmasParts.OfficeLatinAnthem;
                }
                else{
                    anthem = liturgyMasters.CommonAdventAndChristmasParts.OfficeCatalanAnthem;
                }
            }
            break;
    }
    return anthem;
}

function GetPsalmody(currentOfficeCommonPsalter : OfficeCommonPsalter, liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationOffice : Office) : {FirstPsalm : Psalm, SecondPsalm : Psalm, ThirdPsalm : Psalm}{
    let psalmody = {
        FirstPsalm: currentOfficeCommonPsalter.FirstPsalm,
        SecondPsalm: currentOfficeCommonPsalter.SecondPsalm,
        ThirdPsalm: currentOfficeCommonPsalter.ThirdPsalm
    }

    switch(liturgyDayInformation.SpecificLiturgyTime){
        case SpecificLiturgyTimeType.LentTriduum:
            psalmody.FirstPsalm = liturgyMasters.PartsOfEasterTriduum.OfficeFirstPsalm;
            psalmody.FirstPsalm.Comment = "-";
            psalmody.SecondPsalm = liturgyMasters.PartsOfEasterTriduum.OfficeSecondPsalm;
            psalmody.SecondPsalm.Comment = "-";
            psalmody.ThirdPsalm = liturgyMasters.PartsOfEasterTriduum.OfficeThirdPsalm;
            psalmody.ThirdPsalm.Comment = "-";
            break;
        case SpecificLiturgyTimeType.EasterOctave:
            psalmody.FirstPsalm = liturgyMasters.PartsOfEasterOctave.OfficeFirstPsalm;
            psalmody.FirstPsalm.Comment = "-";
            psalmody.SecondPsalm = liturgyMasters.PartsOfEasterOctave.OfficeSecondPsalm;
            psalmody.SecondPsalm.Comment = "-";
            psalmody.ThirdPsalm = liturgyMasters.PartsOfEasterOctave.OfficeThirdPsalm;
            psalmody.ThirdPsalm.Comment = "-";
            break;
        case SpecificLiturgyTimeType.EasterWeeks:
            if(liturgyDayInformation.DayOfTheWeek === 0){
                if(liturgyDayInformation.Week === "7"){
                    psalmody.FirstPsalm.Antiphon = liturgyMasters.SpecialCommonPartsOfEasterSundays.OfficeFirstAntiphonSundayWeekVII;
                    psalmody.SecondPsalm.Antiphon = liturgyMasters.SpecialCommonPartsOfEasterSundays.OfficeSecondAntiphonSundayWeekVII;
                    psalmody.ThirdPsalm.Antiphon = liturgyMasters.SpecialCommonPartsOfEasterSundays.OfficeThirdAntiphonSundayWeekVII;
                }
                else{
                    psalmody.FirstPsalm.Antiphon = liturgyMasters.SpecialCommonPartsOfEasterSundays.OfficeFirstAntiphonSundayNotWeekVII;
                    psalmody.SecondPsalm.Antiphon = liturgyMasters.SpecialCommonPartsOfEasterSundays.OfficeSecondAntiphonSundayNotWeekVII;
                    psalmody.ThirdPsalm.Antiphon = liturgyMasters.SpecialCommonPartsOfEasterSundays.OfficeThirdAntiphonSundayNotWeekVII;
                }
            }
            else{
                if(!(liturgyDayInformation.WeekCycle === '3' && liturgyDayInformation.DayOfTheWeek === 4) && 
                    !(liturgyDayInformation.WeekCycle === '4' && liturgyDayInformation.DayOfTheWeek === 2) && 
                    !(liturgyDayInformation.WeekCycle === '2' && liturgyDayInformation.DayOfTheWeek === 1) && 
                    !(liturgyDayInformation.WeekCycle === '2' && liturgyDayInformation.DayOfTheWeek === 3) && 
                    !(liturgyDayInformation.WeekCycle === '2' && liturgyDayInformation.DayOfTheWeek === 5)){
                    psalmody.FirstPsalm.Antiphon += " Al·leluia.";
                }
                if(!(liturgyDayInformation.WeekCycle === '2' && liturgyDayInformation.DayOfTheWeek === 3) && 
                    !(liturgyDayInformation.WeekCycle === '2' && liturgyDayInformation.DayOfTheWeek === 4) && 
                    !(liturgyDayInformation.WeekCycle === '2' && liturgyDayInformation.DayOfTheWeek === 6) && 
                    !(liturgyDayInformation.WeekCycle === '3' && liturgyDayInformation.DayOfTheWeek === 5) && 
                    !(liturgyDayInformation.WeekCycle === '4' && liturgyDayInformation.DayOfTheWeek === 1) && 
                    !(liturgyDayInformation.WeekCycle === '4' && liturgyDayInformation.DayOfTheWeek === 2)){
                    psalmody.SecondPsalm.Antiphon += " Al·leluia.";
                }
                if(!(liturgyDayInformation.WeekCycle === '4' && liturgyDayInformation.DayOfTheWeek === 4)){
                    psalmody.ThirdPsalm.Antiphon += " Al·leluia.";
                }
            }
            break;
        case SpecificLiturgyTimeType.AdventWeeks:
        case SpecificLiturgyTimeType.AdventFairs:
            if(liturgyDayInformation.DayOfTheWeek == 0){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.AdventSundayParts.OfficeFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.AdventSundayParts.OfficeSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.AdventSundayParts.OfficeThirdAntiphon;
            }
            break;
        case SpecificLiturgyTimeType.ChristmasOctave:
            if(!CelebrationIdentifier.IsChristmas(liturgyDayInformation.Date)){
                psalmody.FirstPsalm = liturgyMasters.ChristmasWhenOctaveParts.OfficeFirstPsalm;
                psalmody.FirstPsalm.Comment = "-";
                psalmody.SecondPsalm = liturgyMasters.ChristmasWhenOctaveParts.OfficeSecondPsalm;
                psalmody.SecondPsalm.Comment = "-";
                psalmody.ThirdPsalm = liturgyMasters.ChristmasWhenOctaveParts.OfficeThirdPsalm;
                psalmody.ThirdPsalm.Comment = "-";
            }
            break;
    }

    if(StringManagement.HasLiturgyContent(celebrationOffice.FirstPsalm.Antiphon)){
        psalmody.FirstPsalm.Antiphon = celebrationOffice.FirstPsalm.Antiphon;
    }
    if(StringManagement.HasLiturgyContent(celebrationOffice.FirstPsalm.Title)){
        psalmody.FirstPsalm = celebrationOffice.FirstPsalm;
    }
    if(StringManagement.HasLiturgyContent(celebrationOffice.SecondPsalm.Antiphon)){
        psalmody.SecondPsalm.Antiphon = celebrationOffice.SecondPsalm.Antiphon;
    }
    if(StringManagement.HasLiturgyContent(celebrationOffice.SecondPsalm.Title)){
        psalmody.SecondPsalm = celebrationOffice.SecondPsalm;
    }
    if(StringManagement.HasLiturgyContent(celebrationOffice.ThirdPsalm.Antiphon)){
        psalmody.ThirdPsalm.Antiphon = celebrationOffice.ThirdPsalm.Antiphon;
    }
    if(StringManagement.HasLiturgyContent(celebrationOffice.ThirdPsalm.Title)){
        psalmody.ThirdPsalm = celebrationOffice.ThirdPsalm;
    }

    if(liturgyDayInformation.DayOfTheWeek === 0 &&
        (liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.LentWeeks ||
            liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.LentAshes ||
            liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ||
            liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.HolyWeek)){
        if(psalmody.FirstPsalm.Antiphon.search(', al·leluia') !== -1){
            psalmody.FirstPsalm.Antiphon = psalmody.FirstPsalm.Antiphon.replace(', al·leluia','');
        }
        if(psalmody.SecondPsalm.Antiphon.search(', al·leluia') !== -1){
            psalmody.SecondPsalm.Antiphon = psalmody.SecondPsalm.Antiphon.replace(', al·leluia','');
        }
        if(psalmody.ThirdPsalm.Antiphon.search(', al·leluia') !== -1){
            psalmody.ThirdPsalm.Antiphon = psalmody.ThirdPsalm.Antiphon.replace(', al·leluia','');
        }
    }
    return psalmody;
}

function GetResponsory(currentOfficeCommonPsalter : OfficeCommonPsalter, liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationOffice : Office) : Responsory{
    if(StringManagement.HasLiturgyContent(celebrationOffice.Responsory.Response)){
        return celebrationOffice.Responsory;
    }
    
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case SpecificLiturgyTimeType.LentAshes:
            return liturgyMasters.PartsOfLentTime.OfficeResponsory;
        case SpecificLiturgyTimeType.LentWeeks:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.OfficeResponsory;
        case SpecificLiturgyTimeType.PalmSunday:
            return liturgyMasters.PalmSundayParts.OfficeResponsory;
        case SpecificLiturgyTimeType.HolyWeek:
            return liturgyMasters.PartsOfHolyWeek.OfficeResponsory
        case SpecificLiturgyTimeType.LentTriduum:
            return liturgyMasters.PartsOfEasterTriduum.OfficeResponsory;
        case SpecificLiturgyTimeType.EasterOctave:
            return liturgyMasters.PartsOfEasterOctave.OfficeResponsory;
        case SpecificLiturgyTimeType.EasterWeeks:
            return liturgyMasters.EasterWeekParts.OfficeResponsory;
        case SpecificLiturgyTimeType.AdventWeeks:
            return liturgyMasters.AdventWeekParts.OfficeResponsory;
        case SpecificLiturgyTimeType.AdventFairs:
            return liturgyMasters.AdventFairDaysParts.OfficeResponsory;
        case SpecificLiturgyTimeType.ChristmasOctave:
            return liturgyMasters.ChristmasWhenOctaveParts.OfficeResponsory;
        case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                return liturgyMasters.ChristmasBeforeEpiphanyParts.OfficeResponsory;
            }
            break;
    }
    return currentOfficeCommonPsalter.Responsory;
}

function GetReadings(currentOfficeCommonPsalter : OfficeCommonPsalter, liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationOffice : Office) : {FirstReading : ReadingOfTheOffice, SecondReading : ReadingOfTheOffice}{
    let readings = {
        FirstReading: liturgyMasters.OfficeOfOrdinaryTime.OfficeFirstReading,
        SecondReading: liturgyMasters.OfficeOfOrdinaryTime.OfficeSecondReading
    }
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case SpecificLiturgyTimeType.LentAshes:
            readings.FirstReading = liturgyMasters.PartsOfLentTime.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.PartsOfLentTime.OfficeSecondReading;
            break;
        case SpecificLiturgyTimeType.LentWeeks:
            readings.FirstReading = liturgyMasters.PartsOfFiveWeeksOfLentTime.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.PartsOfFiveWeeksOfLentTime.OfficeSecondReading;
            break;
        case SpecificLiturgyTimeType.PalmSunday:
            readings.FirstReading = liturgyMasters.PalmSundayParts.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.PalmSundayParts.OfficeSecondReading;
            break;
        case SpecificLiturgyTimeType.HolyWeek:
            readings.FirstReading = liturgyMasters.PartsOfHolyWeek.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.PartsOfHolyWeek.OfficeSecondReading;
            break;
        case SpecificLiturgyTimeType.LentTriduum:
            readings.FirstReading = liturgyMasters.PartsOfEasterTriduum.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.PartsOfEasterTriduum.OfficeSecondReading;
            break;
        case SpecificLiturgyTimeType.EasterOctave:
            readings.FirstReading = liturgyMasters.PartsOfEasterOctave.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.PartsOfEasterOctave.OfficeSecondReading;
            break;
        case SpecificLiturgyTimeType.EasterWeeks:
            readings.FirstReading = liturgyMasters.EasterWeekParts.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.EasterWeekParts.OfficeSecondReading;
            break;
        case SpecificLiturgyTimeType.AdventWeeks:
            readings.FirstReading = liturgyMasters.AdventWeekParts.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.AdventWeekParts.OfficeSecondReading;
            break;
        case SpecificLiturgyTimeType.AdventFairs:
            readings.FirstReading = liturgyMasters.AdventFairDaysParts.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.AdventFairDaysParts.OfficeSecondReading;
            break;
        case SpecificLiturgyTimeType.ChristmasOctave:
            if(!CelebrationIdentifier.IsChristmas(liturgyDayInformation.Date)){
                readings.FirstReading = liturgyMasters.ChristmasWhenOctaveParts.OfficeFirstReading;
                readings.SecondReading = liturgyMasters.ChristmasWhenOctaveParts.OfficeSecondReading;
            }
            break;
        case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                readings.FirstReading = liturgyMasters.ChristmasBeforeEpiphanyParts.OfficeFirstReading;
                readings.SecondReading = liturgyMasters.ChristmasBeforeEpiphanyParts.OfficeSecondReading;
            }
            break;
    }
    if(StringManagement.HasLiturgyContent(celebrationOffice.FirstReading.Reading)){
        readings.FirstReading = celebrationOffice.FirstReading;
    }
    if(StringManagement.HasLiturgyContent(celebrationOffice.SecondReading.Reading)){
        readings.SecondReading = celebrationOffice.SecondReading;
    }
    return readings;
}

function GetTeDeumInformation(currentOfficeCommonPsalter : OfficeCommonPsalter, liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationOffice : Office, settings : Settings) : TeDeumInformation{
    let teDeumInformationEnabled = liturgyDayInformation.DayOfTheWeek === 0;
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case SpecificLiturgyTimeType.EasterOctave:
            teDeumInformationEnabled = true;
            break;
        case SpecificLiturgyTimeType.EasterWeeks:
            if(liturgyDayInformation.DayOfTheWeek == 0) {
                teDeumInformationEnabled = true;
            }
            break;
        case SpecificLiturgyTimeType.AdventWeeks:
            if(liturgyDayInformation.DayOfTheWeek == 0) {
                teDeumInformationEnabled = true;
            }
            break;
        case SpecificLiturgyTimeType.ChristmasOctave:
            teDeumInformationEnabled = true;
            break;
        case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
            if(liturgyDayInformation.DayOfTheWeek == 0) {
                teDeumInformationEnabled = true;
            }
            break;
    }
    let teDeumInformation = new TeDeumInformation();
    teDeumInformation.Enabled = teDeumInformationEnabled || celebrationOffice.TeDeumInformation.Enabled;
    teDeumInformation.Anthem = settings.UseLatin? liturgyMasters.Various.TeDeumLatinAnthem : liturgyMasters.Various.TeDeumCatalanAnthem;
    return teDeumInformation;
}

function GetFinalPrayer(currentOfficeCommonPsalter : OfficeCommonPsalter, liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationOffice : Office) : string{
    if(StringManagement.HasLiturgyContent(celebrationOffice.FinalPrayer)){
        return celebrationOffice.FinalPrayer;
    }

    let finalPrayer = liturgyMasters.PrayersOfOrdinaryTime.FinalPrayer;
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case SpecificLiturgyTimeType.LentAshes:
            return liturgyMasters.PartsOfLentTime.LaudesFinalPrayer;
        case SpecificLiturgyTimeType.LentWeeks:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.LaudesFinalPrayer;
        case SpecificLiturgyTimeType.PalmSunday:
            return liturgyMasters.PalmSundayParts.LaudesFinalPrayer;
        case SpecificLiturgyTimeType.HolyWeek:
            return liturgyMasters.PartsOfHolyWeek.LaudesFinalPrayer;
        case SpecificLiturgyTimeType.LentTriduum:
            return liturgyMasters.PartsOfEasterTriduum.LaudesFinalPrayer;
        case SpecificLiturgyTimeType.EasterOctave:
            return liturgyMasters.PartsOfEasterOctave.LaudesFinalPrayer;
        case SpecificLiturgyTimeType.EasterWeeks:
            return liturgyMasters.EasterWeekParts.LaudesFinalPrayer;
        case SpecificLiturgyTimeType.AdventWeeks:
            return liturgyMasters.AdventWeekParts.LaudesFinalPrayer;
        case SpecificLiturgyTimeType.AdventFairs:
            return liturgyMasters.AdventFairDaysParts.LaudesFinalPrayer;
        case SpecificLiturgyTimeType.ChristmasOctave:
            return liturgyMasters.ChristmasWhenOctaveParts.LaudesFinalPrayer;
        case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                return liturgyMasters.ChristmasBeforeEpiphanyParts.LaudesFinalPrayer;
            }
            break;
    }
    return finalPrayer;
}