import Office, {TeDeumInformation} from "../../Models/HoursLiturgy/Office";
import GlobalFunctions from "../../Utils/GlobalFunctions";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";
import {Settings} from "../../Models/Settings";
import OfficeCommonPsalter from "../../Models/LiturgyMasters/OfficeCommonPsalter";
import {ReadingOfTheOffice, Psalm, Responsory} from "../../Models/LiturgyMasters/CommonParts";
import {SpecificCelebrationType} from "../CelebrationTimeEnums";

export function ObtainOffice(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationOffice : Office, settings : Settings) : Office{
    let office = new Office();

    let currentOfficeCommonPsalter = liturgyMasters.OfficeCommonPsalter;
    if(liturgyDayInformation.SpecialCelebration.StrongTimesMasterIdentifier !== -1){
        // TODO: unit test this. I should get tow different objects: liturgyMasters.OfficeCommonPsalter vs currentOfficeCommonPsalter. Therefore, "AdaptWithStrongTimes" does not affect to liturgyMasters.OfficeCommonPsalter
        currentOfficeCommonPsalter = Object.assign(Object.create(Object.getPrototypeOf(liturgyMasters.OfficeCommonPsalter)), liturgyMasters.OfficeCommonPsalter) as OfficeCommonPsalter;
        currentOfficeCommonPsalter.AdaptWithStrongTimes(liturgyMasters.CommonOfficeWhenStrongTimesPsalter);
    }

    if(liturgyDayInformation.SpecificLiturgyTime === SpecificCelebrationType.Q_DIUM_PASQUA) {
        office = celebrationOffice;
    }
    else{
        office.Anthem = GetAnthem(currentOfficeCommonPsalter, liturgyMasters, liturgyDayInformation, celebrationOffice, settings);
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

function GetAnthem(currentOfficeCommonPsalter : OfficeCommonPsalter, liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationOffice : Office, settings : Settings) : string{
    if(celebrationOffice.Anthem !== '-') {
        return celebrationOffice.Anthem;
    }

    let anthem;
    if(GlobalFunctions.isDarkAnthem()){
        if(settings.UseLatin){
            anthem = this.state.salteriComuOfici.himneNitLlati;
        }
        else{
            anthem = this.state.salteriComuOfici.himneNitCat;
        }
    }
    else{
        if(settings.UseLatin){
            anthem = this.state.salteriComuOfici.himneDiaLlati;
        }
        else{
            anthem = this.state.salteriComuOfici.himneDiaCat;
        }
    }
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case SpecificCelebrationType.Q_CENDRA:
        case SpecificCelebrationType.Q_SETMANES:
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
        case SpecificCelebrationType.Q_DIUM_RAMS:
        case SpecificCelebrationType.Q_SET_SANTA:
            if(settings.UseLatin){
                anthem = liturgyMasters.CommonPartsOfHolyWeek.OfficeLatinAnthem;
            }
            else{
                anthem = liturgyMasters.CommonPartsOfHolyWeek.OfficeCatalanAnthem;
            }
            break;
        case SpecificCelebrationType.Q_TRIDU:
            if(settings.UseLatin){
                anthem = liturgyMasters.PartsOfEasterTriduum.OfficeLatinAnthem;
            }
            else{
                anthem = liturgyMasters.PartsOfEasterTriduum.OfficeCatalanAnthem;
            }
            break;
        case SpecificCelebrationType.P_OCTAVA:
            if(settings.UseLatin){
                anthem = liturgyMasters.PartsOfEasterBeforeAscension.OfficeWeekendLatinAnthem;
            }
            else{
                anthem = liturgyMasters.PartsOfEasterBeforeAscension.OfficeWeekendCatalanAnthem;
            }
            break;
        case SpecificCelebrationType.P_SETMANES:
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
        case SpecificCelebrationType.A_SETMANES:
        case SpecificCelebrationType.A_FERIES:
        case SpecificCelebrationType.N_OCTAVA:
        case SpecificCelebrationType.N_ABANS:
            if(liturgyDayInformation.SpecificLiturgyTime != SpecificCelebrationType.N_ABANS ||
                (liturgyDayInformation.SpecificLiturgyTime == SpecificCelebrationType.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13)){
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
    psalmody.FirstPsalm = currentOfficeCommonPsalter.FirstPsalm;
    psalmody.SecondPsalm = currentOfficeCommonPsalter.SecondPsalm;
    psalmody.ThirdPsalm = currentOfficeCommonPsalter.ThirdPsalm;

    switch(liturgyDayInformation.SpecificLiturgyTime){
        case SpecificCelebrationType.Q_TRIDU:
            psalmody.FirstPsalm = liturgyMasters.PartsOfEasterTriduum.OfficeFirstPsalm;
            psalmody.FirstPsalm.Comment = "-";
            psalmody.SecondPsalm = liturgyMasters.PartsOfEasterTriduum.OfficeSecondPsalm;
            psalmody.SecondPsalm.Comment = "-";
            psalmody.ThirdPsalm = liturgyMasters.PartsOfEasterTriduum.OfficeThirdPsalm;
            psalmody.ThirdPsalm.Comment = "-";
            break;
        case SpecificCelebrationType.P_OCTAVA:
            psalmody.FirstPsalm = liturgyMasters.PartsOfEasterOctave.OfficeFirstPsalm;
            psalmody.FirstPsalm.Comment = "-";
            psalmody.SecondPsalm = liturgyMasters.PartsOfEasterOctave.OfficeSecondPsalm;
            psalmody.SecondPsalm.Comment = "-";
            psalmody.ThirdPsalm = liturgyMasters.PartsOfEasterOctave.OfficeThirdPsalm;
            psalmody.ThirdPsalm.Comment = "-";
            break;
        case SpecificCelebrationType.P_SETMANES:
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
        case SpecificCelebrationType.A_SETMANES:
        case SpecificCelebrationType.A_FERIES:
            if(liturgyDayInformation.DayOfTheWeek == 0){
                psalmody.FirstPsalm.Antiphon = liturgyMasters.AdventSundayParts.OfficeFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.AdventSundayParts.OfficeSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.AdventSundayParts.OfficeThirdAntiphon;
            }
            break;
        case SpecificCelebrationType.N_OCTAVA:
            psalmody.FirstPsalm = liturgyMasters.ChristmasWhenOctaveParts.OfficeFirstPsalm;
            psalmody.FirstPsalm.Comment = "-";
            psalmody.SecondPsalm = liturgyMasters.ChristmasWhenOctaveParts.OfficeSecondPsalm;
            psalmody.SecondPsalm.Comment = "-";
            psalmody.ThirdPsalm = liturgyMasters.ChristmasWhenOctaveParts.OfficeThirdPsalm;
            psalmody.ThirdPsalm.Comment = "-";
            break;
    }

    if(celebrationOffice.FirstPsalm.Antiphon !== "-"){
        psalmody.FirstPsalm.Antiphon = celebrationOffice.FirstPsalm.Antiphon;
    }
    if(celebrationOffice.FirstPsalm.Title !== "-"){
        psalmody.FirstPsalm = celebrationOffice.FirstPsalm;
    }
    if(celebrationOffice.SecondPsalm.Antiphon !== "-"){
        psalmody.SecondPsalm.Antiphon = celebrationOffice.SecondPsalm.Antiphon;
    }
    if(celebrationOffice.SecondPsalm.Title !== "-"){
        psalmody.SecondPsalm = celebrationOffice.SecondPsalm;
    }
    if(celebrationOffice.ThirdPsalm.Antiphon !== "-"){
        psalmody.ThirdPsalm.Antiphon = celebrationOffice.ThirdPsalm.Antiphon;
    }
    if(celebrationOffice.ThirdPsalm.Title !== "-"){
        psalmody.ThirdPsalm = celebrationOffice.ThirdPsalm;
    }

    if(liturgyDayInformation.DayOfTheWeek === 0 &&
        (liturgyDayInformation.SpecificLiturgyTime === SpecificCelebrationType.Q_SETMANES ||
            liturgyDayInformation.SpecificLiturgyTime === SpecificCelebrationType.Q_CENDRA ||
            liturgyDayInformation.SpecificLiturgyTime === SpecificCelebrationType.Q_DIUM_RAMS ||
            liturgyDayInformation.SpecificLiturgyTime === SpecificCelebrationType.Q_SET_SANTA)){
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
    if(celebrationOffice.Responsory.Response !== "-"){
        return celebrationOffice.Responsory;
    }
    
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case SpecificCelebrationType.Q_CENDRA:
            return liturgyMasters.PartsOfLentTime.OfficeResponsory;
        case SpecificCelebrationType.Q_SETMANES:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.OfficeResponsory;
        case SpecificCelebrationType.Q_DIUM_RAMS:
            return liturgyMasters.PalmSundayParts.OfficeResponsory;
        case SpecificCelebrationType.Q_SET_SANTA:
            return liturgyMasters.PartsOfHolyWeek.OfficeResponsory
        case SpecificCelebrationType.Q_TRIDU:
            return liturgyMasters.PartsOfEasterTriduum.OfficeResponsory;
        case SpecificCelebrationType.P_OCTAVA:
            return liturgyMasters.PartsOfEasterOctave.OfficeResponsory;
        case SpecificCelebrationType.P_SETMANES:
            return liturgyMasters.EasterWeekParts.OfficeResponsory;
        case SpecificCelebrationType.A_SETMANES:
            return liturgyMasters.AdventWeekParts.OfficeResponsory;
        case SpecificCelebrationType.A_FERIES:
            return liturgyMasters.AdventFairDaysParts.OfficeResponsory;
        case SpecificCelebrationType.N_OCTAVA:
            return liturgyMasters.ChristmasWhenOctaveParts.OfficeResponsory;
        case SpecificCelebrationType.N_ABANS:
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
        case SpecificCelebrationType.Q_CENDRA:
            readings.FirstReading = liturgyMasters.PartsOfLentTime.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.PartsOfLentTime.OfficeSecondReading;
            break;
        case SpecificCelebrationType.Q_SETMANES:
            readings.FirstReading = liturgyMasters.PartsOfFiveWeeksOfLentTime.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.PartsOfFiveWeeksOfLentTime.OfficeSecondReading;
            break;
        case SpecificCelebrationType.Q_DIUM_RAMS:
            readings.FirstReading = liturgyMasters.PalmSundayParts.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.PalmSundayParts.OfficeSecondReading;
            break;
        case SpecificCelebrationType.Q_SET_SANTA:
            readings.FirstReading = liturgyMasters.PartsOfHolyWeek.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.PartsOfHolyWeek.OfficeSecondReading;
            break;
        case SpecificCelebrationType.Q_TRIDU:
            readings.FirstReading = liturgyMasters.PartsOfEasterTriduum.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.PartsOfEasterTriduum.OfficeSecondReading;
            break;
        case SpecificCelebrationType.P_OCTAVA:
            readings.FirstReading = liturgyMasters.PartsOfEasterOctave.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.PartsOfEasterOctave.OfficeSecondReading;
            break;
        case SpecificCelebrationType.P_SETMANES:
            readings.FirstReading = liturgyMasters.EasterWeekParts.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.EasterWeekParts.OfficeSecondReading;
            break;
        case SpecificCelebrationType.A_SETMANES:
            readings.FirstReading = liturgyMasters.AdventWeekParts.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.AdventWeekParts.OfficeSecondReading;
            break;
        case SpecificCelebrationType.A_FERIES:
            readings.FirstReading = liturgyMasters.AdventFairDaysParts.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.AdventFairDaysParts.OfficeSecondReading;
            break;
        case SpecificCelebrationType.N_OCTAVA:
            readings.FirstReading = liturgyMasters.ChristmasWhenOctaveParts.OfficeFirstReading;
            readings.SecondReading = liturgyMasters.ChristmasWhenOctaveParts.OfficeSecondReading;
            break;
        case SpecificCelebrationType.N_ABANS:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                readings.FirstReading = liturgyMasters.ChristmasBeforeEpiphanyParts.OfficeFirstReading;
                readings.SecondReading = liturgyMasters.ChristmasBeforeEpiphanyParts.OfficeSecondReading;
            }
            break;
    }
    if(celebrationOffice.FirstReading.Reference !== "-"){
        readings.FirstReading.Reference = celebrationOffice.FirstReading.Reference;
    }
    if(celebrationOffice.FirstReading.Quote !== "-"){
        readings.FirstReading.Quote = celebrationOffice.FirstReading.Quote;
    }
    if(celebrationOffice.FirstReading.Title !== "-"){
        readings.FirstReading.Title = celebrationOffice.FirstReading.Title;
        readings.FirstReading.Reading = celebrationOffice.FirstReading.Reading;
    }
    if(celebrationOffice.FirstReading.Responsory.FirstPart !== "-"){
        readings.FirstReading.Responsory = celebrationOffice.FirstReading.Responsory;
    }
    if(celebrationOffice.SecondReading.Reference !== "-"){
        readings.SecondReading.Reference = celebrationOffice.SecondReading.Reference;
    }
    if(celebrationOffice.SecondReading.Quote !== "-"){
        readings.SecondReading.Quote = celebrationOffice.SecondReading.Quote;
    }
    if(celebrationOffice.SecondReading.Title !== "-"){
        readings.SecondReading.Title = celebrationOffice.SecondReading.Title;
        readings.SecondReading.Reading = celebrationOffice.SecondReading.Reading;
    }
    if(celebrationOffice.SecondReading.Responsory.FirstPart !== "-"){
        readings.SecondReading.Responsory = celebrationOffice.SecondReading.Responsory;
    }
    return readings;
}

function GetTeDeumInformation(currentOfficeCommonPsalter : OfficeCommonPsalter, liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationOffice : Office, settings : Settings) : TeDeumInformation{
    if(celebrationOffice.TeDeumInformation.Enabled){
        return celebrationOffice.TeDeumInformation;
    }

    let teDeumInformationEnabled = liturgyDayInformation.DayOfTheWeek === 0;
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case SpecificCelebrationType.P_OCTAVA:
            teDeumInformationEnabled = true;
            break;
        case SpecificCelebrationType.P_SETMANES:
            if(liturgyDayInformation.DayOfTheWeek == 0) {
                teDeumInformationEnabled = true;
            }
            break;
        case SpecificCelebrationType.A_SETMANES:
            if(liturgyDayInformation.DayOfTheWeek == 0) {
                teDeumInformationEnabled = true;
            }
            break;
        case SpecificCelebrationType.N_OCTAVA:
            teDeumInformationEnabled = true;
            break;
        case SpecificCelebrationType.N_ABANS:
            if(liturgyDayInformation.DayOfTheWeek == 0) {
                teDeumInformationEnabled = true;
            }
            break;
    }
    let teDeumInformation = new TeDeumInformation();
    teDeumInformation.Enabled = teDeumInformationEnabled;
    teDeumInformation.Anthem = settings.UseLatin? liturgyMasters.Various.TeDeumLatinAnthem : liturgyMasters.Various.TeDeumCatalanAnthem;
    return teDeumInformation;
}

function GetFinalPrayer(currentOfficeCommonPsalter : OfficeCommonPsalter, liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationOffice : Office) : string{
    if(celebrationOffice.FinalPrayer !== "-"){
        return celebrationOffice.FinalPrayer;
    }

    let finalPrayer = liturgyMasters.PrayersOfOrdinaryTime.FinalPrayer;
    switch(liturgyDayInformation.SpecificLiturgyTime){
        case SpecificCelebrationType.Q_CENDRA:
            return liturgyMasters.PartsOfLentTime.LaudesFinalPrayer;
        case SpecificCelebrationType.Q_SETMANES:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.LaudesFinalPrayer;
        case SpecificCelebrationType.Q_DIUM_RAMS:
            return liturgyMasters.PalmSundayParts.LaudesFinalPrayer;
        case SpecificCelebrationType.Q_SET_SANTA:
            return liturgyMasters.PartsOfHolyWeek.LaudesFinalPrayer;
        case SpecificCelebrationType.Q_TRIDU:
            return liturgyMasters.PartsOfEasterTriduum.LaudesFinalPrayer;
        case SpecificCelebrationType.P_OCTAVA:
            return liturgyMasters.PartsOfEasterOctave.LaudesFinalPrayer;
        case SpecificCelebrationType.P_SETMANES:
            return liturgyMasters.EasterWeekParts.LaudesFinalPrayer;
        case SpecificCelebrationType.A_SETMANES:
            return liturgyMasters.AdventWeekParts.LaudesFinalPrayer;
        case SpecificCelebrationType.A_FERIES:
            return liturgyMasters.AdventFairDaysParts.LaudesFinalPrayer;
        case SpecificCelebrationType.N_OCTAVA:
            return liturgyMasters.ChristmasWhenOctaveParts.LaudesFinalPrayer;
        case SpecificCelebrationType.N_ABANS:
            if(liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                return liturgyMasters.ChristmasBeforeEpiphanyParts.LaudesFinalPrayer;
            }
            break;
    }
    return finalPrayer;
}