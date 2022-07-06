import Hours from "../../Models/HoursLiturgy/Hours";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";
import {Settings} from "../../Models/Settings";
import {Psalm, Responsory, ShortReading} from "../../Models/LiturgyMasters/CommonParts";
import {SpecificLiturgyTimeType} from "../CelebrationTimeEnums";
import {StringManagement} from "../../Utils/StringManagement";

export function ObtainHours(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationHours : Hours, settings : Settings) : Hours {
    let hours = new Hours();
    if (liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_DIUM_PASQUA) {
        hours = celebrationHours;
    } 
    else {
        const hourAnthems = GetHourAnthems(liturgyMasters, liturgyDayInformation, celebrationHours, settings);
        const hourPsalmody = GetHoursPsalmody(liturgyMasters, liturgyDayInformation, celebrationHours);
        const hourResponsory = GetResponsory(liturgyMasters, liturgyDayInformation, celebrationHours);
        const hourShortReading = GetShortReading(liturgyMasters, liturgyDayInformation, celebrationHours);
        const hourFinalPraying = GetFinalPraying(liturgyMasters, liturgyDayInformation, celebrationHours);

        hours.ThirdHour.Anthem = hourAnthems.ThirdValue;
        hours.ThirdHour.HasMultipleAntiphons = hourPsalmody.ThirdValue.HasMultipleAntiphons;
        hours.ThirdHour.UniqueAntiphon = hourPsalmody.ThirdValue.UniqueAntiphon;
        hours.ThirdHour.FirstPsalm = hourPsalmody.ThirdValue.FirstPsalm;
        hours.ThirdHour.SecondPsalm = hourPsalmody.ThirdValue.SecondPsalm;
        hours.ThirdHour.ThirdPsalm = hourPsalmody.ThirdValue.ThirdPsalm;
        hours.ThirdHour.Responsory = hourResponsory.ThirdValue;
        hours.ThirdHour.ShortReading = hourShortReading.ThirdValue;
        hours.ThirdHour.FinalPrayer = hourFinalPraying.ThirdValue;

        hours.SixthHour.Anthem = hourAnthems.SixthValue;
        hours.SixthHour.HasMultipleAntiphons = hourPsalmody.SixthValue.HasMultipleAntiphons;
        hours.SixthHour.UniqueAntiphon = hourPsalmody.SixthValue.UniqueAntiphon;
        hours.SixthHour.FirstPsalm = hourPsalmody.SixthValue.FirstPsalm;
        hours.SixthHour.SecondPsalm = hourPsalmody.SixthValue.SecondPsalm;
        hours.SixthHour.ThirdPsalm = hourPsalmody.SixthValue.ThirdPsalm;
        hours.SixthHour.Responsory = hourResponsory.SixthValue;
        hours.SixthHour.ShortReading = hourShortReading.SixthValue;
        hours.SixthHour.FinalPrayer = hourFinalPraying.SixthValue;

        hours.NinthHour.Anthem = hourAnthems.NinthValue;
        hours.NinthHour.HasMultipleAntiphons = hourPsalmody.NinthValue.HasMultipleAntiphons;
        hours.NinthHour.UniqueAntiphon = hourPsalmody.NinthValue.UniqueAntiphon;
        hours.NinthHour.FirstPsalm = hourPsalmody.NinthValue.FirstPsalm;
        hours.NinthHour.SecondPsalm = hourPsalmody.NinthValue.SecondPsalm;
        hours.NinthHour.ThirdPsalm = hourPsalmody.NinthValue.ThirdPsalm;
        hours.NinthHour.Responsory = hourResponsory.NinthValue;
        hours.NinthHour.ShortReading = hourShortReading.NinthValue;
        hours.NinthHour.FinalPrayer = hourFinalPraying.NinthValue;
    }
    return hours;
}

function GetHourAnthems(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationHours : Hours, settings : Settings) : {ThirdValue : string, SixthValue : string, NinthValue : string}{
    let hourAnthems = {
        ThirdValue: "",
        SixthValue: "",
        NinthValue: ""
    }
    
    if(StringManagement.HasLiturgyContent(celebrationHours.ThirdHour.Anthem)) {
        hourAnthems.ThirdValue = celebrationHours.ThirdHour.Anthem;
        hourAnthems.SixthValue = celebrationHours.SixthHour.Anthem;
        hourAnthems.NinthValue = celebrationHours.NinthHour.Anthem;
    }
    else {
        if(settings.UseLatin){
            hourAnthems.ThirdValue = liturgyMasters.Various.ThirdHourLatinFirstOptionAnthem;
            hourAnthems.SixthValue = liturgyMasters.Various.SixthHourLatinFirstOptionAnthem;
            hourAnthems.NinthValue = liturgyMasters.Various.NinthHourLatinFirstOptionAnthem;
        }
        else{
            hourAnthems.ThirdValue = liturgyMasters.Various.ThirdHourCatalanFirstOptionAnthem;
            hourAnthems.SixthValue = liturgyMasters.Various.SixthHourCatalanFirstOptionAnthem;
            hourAnthems.NinthValue = liturgyMasters.Various.NinthHourCatalanFirstOptionAnthem;
        }
        switch(liturgyDayInformation.SpecificLiturgyTime){
            case SpecificLiturgyTimeType.Q_CENDRA:
            case SpecificLiturgyTimeType.Q_SETMANES:
                if(settings.UseLatin){
                    hourAnthems.ThirdValue = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.ThirdHourLatinAnthem;
                    hourAnthems.SixthValue = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.SixthHourLatinAnthem;
                    hourAnthems.NinthValue = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.NinthHourLatinAnthem;
                }
                else{
                    hourAnthems.ThirdValue = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.ThirdHourCatalanAnthem;
                    hourAnthems.SixthValue = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.SixthHourCatalanAnthem;
                    hourAnthems.NinthValue = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.NinthHourCatalanAnthem;
                }
                break;
            case SpecificLiturgyTimeType.Q_DIUM_RAMS:
            case SpecificLiturgyTimeType.Q_SET_SANTA:
                if(settings.UseLatin){
                    hourAnthems.ThirdValue = liturgyMasters.CommonPartsOfHolyWeek.HoursLatinAnthem;
                    hourAnthems.SixthValue = liturgyMasters.CommonPartsOfHolyWeek.HoursLatinAnthem;
                    hourAnthems.NinthValue = liturgyMasters.CommonPartsOfHolyWeek.HoursLatinAnthem;
                }
                else{
                    hourAnthems.ThirdValue = liturgyMasters.CommonPartsOfHolyWeek.HoursCatalanAnthem;
                    hourAnthems.SixthValue = liturgyMasters.CommonPartsOfHolyWeek.HoursCatalanAnthem;
                    hourAnthems.NinthValue = liturgyMasters.CommonPartsOfHolyWeek.HoursCatalanAnthem;
                }
                break;
            case SpecificLiturgyTimeType.Q_TRIDU:
                if(settings.UseLatin){
                    hourAnthems.ThirdValue = liturgyMasters.PartsOfEasterTriduum.ThirdHourParts.LatinAnthem;
                    hourAnthems.SixthValue = liturgyMasters.PartsOfEasterTriduum.SixthHourParts.LatinAnthem;
                    hourAnthems.NinthValue = liturgyMasters.PartsOfEasterTriduum.NinthHourParts.LatinAnthem;
                }
                else{
                    hourAnthems.ThirdValue = liturgyMasters.PartsOfEasterTriduum.ThirdHourParts.CatalanAnthem;
                    hourAnthems.SixthValue = liturgyMasters.PartsOfEasterTriduum.SixthHourParts.CatalanAnthem;
                    hourAnthems.NinthValue = liturgyMasters.PartsOfEasterTriduum.NinthHourParts.CatalanAnthem;
                }
                break;
            case SpecificLiturgyTimeType.P_OCTAVA:
                if(settings.UseLatin){
                    hourAnthems.ThirdValue = liturgyMasters.PartsOfEasterBeforeAscension.ThirdHourLatinAnthem;
                    hourAnthems.SixthValue = liturgyMasters.PartsOfEasterBeforeAscension.SixthHourLatinAnthem;
                    hourAnthems.NinthValue = liturgyMasters.PartsOfEasterBeforeAscension.NinthHourLatinAnthem;
                }
                else{
                    hourAnthems.ThirdValue = liturgyMasters.PartsOfEasterBeforeAscension.ThirdHourCatalanAnthem;
                    hourAnthems.SixthValue = liturgyMasters.PartsOfEasterBeforeAscension.SixthHourCatalanAnthem;
                    hourAnthems.NinthValue = liturgyMasters.PartsOfEasterBeforeAscension.NinthHourCatalanAnthem;
                }
                break;
            case SpecificLiturgyTimeType.P_SETMANES:
                if(liturgyDayInformation.Week === '7'){
                    if(settings.UseLatin){
                        hourAnthems.ThirdValue = liturgyMasters.PartsOfEasterAfterAscension.ThirdHourLatinAnthem;
                        hourAnthems.SixthValue = liturgyMasters.PartsOfEasterAfterAscension.SixthHourLatinAnthem;
                        hourAnthems.NinthValue = liturgyMasters.PartsOfEasterAfterAscension.NinthHourLatinAnthem;
                    }
                    else{
                        hourAnthems.ThirdValue = liturgyMasters.PartsOfEasterAfterAscension.ThirdHourCatalanAnthem;
                        hourAnthems.SixthValue = liturgyMasters.PartsOfEasterAfterAscension.SixthHourCatalanAnthem;
                        hourAnthems.NinthValue = liturgyMasters.PartsOfEasterAfterAscension.NinthHourCatalanAnthem;
                    }
                }
                else{
                    if(settings.UseLatin){
                        hourAnthems.ThirdValue = liturgyMasters.PartsOfEasterBeforeAscension.ThirdHourLatinAnthem;
                        hourAnthems.SixthValue = liturgyMasters.PartsOfEasterBeforeAscension.SixthHourLatinAnthem;
                        hourAnthems.NinthValue = liturgyMasters.PartsOfEasterBeforeAscension.NinthHourLatinAnthem;
                    }
                    else{
                        hourAnthems.ThirdValue = liturgyMasters.PartsOfEasterBeforeAscension.ThirdHourCatalanAnthem;
                        hourAnthems.SixthValue = liturgyMasters.PartsOfEasterBeforeAscension.SixthHourCatalanAnthem;
                        hourAnthems.NinthValue = liturgyMasters.PartsOfEasterBeforeAscension.NinthHourCatalanAnthem;
                    }
                }
                break;
            case SpecificLiturgyTimeType.A_SETMANES:
            case SpecificLiturgyTimeType.A_FERIES:
            case SpecificLiturgyTimeType.N_OCTAVA:
            case SpecificLiturgyTimeType.N_ABANS:
                if(liturgyDayInformation.SpecificLiturgyTime != SpecificLiturgyTimeType.N_ABANS ||
                    (liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13)){
                    if(settings.UseLatin){
                        hourAnthems.ThirdValue = liturgyMasters.CommonAdventAndChristmasParts.ThirdHourLatinAnthem;
                        hourAnthems.SixthValue = liturgyMasters.CommonAdventAndChristmasParts.SixthHourLatinAnthem;
                        hourAnthems.NinthValue = liturgyMasters.CommonAdventAndChristmasParts.NinthHourLatinAnthem;
                    }
                    else{
                        hourAnthems.ThirdValue = liturgyMasters.CommonAdventAndChristmasParts.ThirdHourCatalanAnthem;
                        hourAnthems.SixthValue = liturgyMasters.CommonAdventAndChristmasParts.SixthHourCatalanAnthem;
                        hourAnthems.NinthValue = liturgyMasters.CommonAdventAndChristmasParts.NinthHourCatalanAnthem;
                    }
                }
                break;
        }
    }
    return hourAnthems;
}

function GetHoursPsalmody(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationHours : Hours) : {ThirdValue: { HasMultipleAntiphons: boolean, UniqueAntiphon: string, FirstPsalm: Psalm, SecondPsalm: Psalm, ThirdPsalm: Psalm} , SixthValue: { HasMultipleAntiphons: boolean, UniqueAntiphon: string, FirstPsalm: Psalm, SecondPsalm: Psalm, ThirdPsalm: Psalm}, NinthValue: { HasMultipleAntiphons: boolean, UniqueAntiphon: string, FirstPsalm: Psalm, SecondPsalm: Psalm, ThirdPsalm: Psalm}} {
    let psalmodyAnthems = {
        ThirdValue: { HasMultipleAntiphons: true, UniqueAntiphon: "", FirstPsalm: new Psalm(), SecondPsalm: new Psalm(), ThirdPsalm: new Psalm() },
        SixthValue: { HasMultipleAntiphons: true, UniqueAntiphon: "", FirstPsalm: new Psalm(), SecondPsalm: new Psalm(), ThirdPsalm: new Psalm() },
        NinthValue: { HasMultipleAntiphons: true, UniqueAntiphon: "", FirstPsalm: new Psalm(), SecondPsalm: new Psalm(), ThirdPsalm: new Psalm() }
    }

    if(StringManagement.HasLiturgyContent(celebrationHours.ThirdHour.FirstPsalm.Title)) {
        psalmodyAnthems.ThirdValue.HasMultipleAntiphons = celebrationHours.ThirdHour.HasMultipleAntiphons;
        psalmodyAnthems.ThirdValue.UniqueAntiphon = celebrationHours.ThirdHour.UniqueAntiphon;
        psalmodyAnthems.ThirdValue.FirstPsalm = celebrationHours.ThirdHour.FirstPsalm;
        psalmodyAnthems.ThirdValue.SecondPsalm = celebrationHours.ThirdHour.SecondPsalm;
        psalmodyAnthems.ThirdValue.ThirdPsalm = celebrationHours.ThirdHour.ThirdPsalm;
        psalmodyAnthems.SixthValue.HasMultipleAntiphons = celebrationHours.SixthHour.HasMultipleAntiphons;
        psalmodyAnthems.SixthValue.UniqueAntiphon = celebrationHours.SixthHour.UniqueAntiphon;
        psalmodyAnthems.SixthValue.FirstPsalm = celebrationHours.SixthHour.FirstPsalm;
        psalmodyAnthems.SixthValue.SecondPsalm = celebrationHours.SixthHour.SecondPsalm;
        psalmodyAnthems.SixthValue.ThirdPsalm = celebrationHours.SixthHour.ThirdPsalm;
        psalmodyAnthems.NinthValue.HasMultipleAntiphons = celebrationHours.NinthHour.HasMultipleAntiphons;
        psalmodyAnthems.NinthValue.UniqueAntiphon = celebrationHours.NinthHour.UniqueAntiphon;
        psalmodyAnthems.NinthValue.FirstPsalm = celebrationHours.NinthHour.FirstPsalm;
        psalmodyAnthems.NinthValue.SecondPsalm = celebrationHours.NinthHour.SecondPsalm;
        psalmodyAnthems.NinthValue.ThirdPsalm = celebrationHours.NinthHour.ThirdPsalm;
    }
    else{
        psalmodyAnthems.ThirdValue.FirstPsalm = liturgyMasters.CommonHourPsalter.FirstPsalm;
        psalmodyAnthems.SixthValue.SecondPsalm = liturgyMasters.CommonHourPsalter.SecondPsalm;
        psalmodyAnthems.NinthValue.ThirdPsalm = liturgyMasters.CommonHourPsalter.ThirdPsalm;
        switch(liturgyDayInformation.SpecificLiturgyTime){
            case SpecificLiturgyTimeType.Q_CENDRA:
            case SpecificLiturgyTimeType.Q_SETMANES:
                psalmodyAnthems.ThirdValue.HasMultipleAntiphons = false;
                psalmodyAnthems.SixthValue.HasMultipleAntiphons = false;
                psalmodyAnthems.NinthValue.HasMultipleAntiphons = false;
                psalmodyAnthems.ThirdValue.UniqueAntiphon = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.ThirdHourAntiphon;
                psalmodyAnthems.SixthValue.UniqueAntiphon = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.SixthHourAntiphon;
                psalmodyAnthems.NinthValue.UniqueAntiphon = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.NinthHourAntiphon;
                break;
            case SpecificLiturgyTimeType.Q_DIUM_RAMS:
            case SpecificLiturgyTimeType.Q_SET_SANTA:
                psalmodyAnthems.ThirdValue.HasMultipleAntiphons = false;
                psalmodyAnthems.SixthValue.HasMultipleAntiphons = false;
                psalmodyAnthems.NinthValue.HasMultipleAntiphons = false;
                psalmodyAnthems.ThirdValue.UniqueAntiphon = liturgyMasters.CommonPartsOfHolyWeek.ThirdHourAntiphon;
                psalmodyAnthems.SixthValue.UniqueAntiphon = liturgyMasters.CommonPartsOfHolyWeek.SixthHourAntiphon;
                psalmodyAnthems.NinthValue.UniqueAntiphon = liturgyMasters.CommonPartsOfHolyWeek.NinthHourAntiphon;
                break;
            case SpecificLiturgyTimeType.Q_TRIDU:
                psalmodyAnthems.ThirdValue.HasMultipleAntiphons = false;
                psalmodyAnthems.SixthValue.HasMultipleAntiphons = false;
                psalmodyAnthems.NinthValue.HasMultipleAntiphons = false;

                // TODO: if HasMultipleAntiphons == false... why this? check..
                psalmodyAnthems.ThirdValue.FirstPsalm = liturgyMasters.PartsOfEasterTriduum.HourPrayerThirdPsalm;
                psalmodyAnthems.ThirdValue.FirstPsalm.Comment = "-";
                psalmodyAnthems.ThirdValue.FirstPsalm.HasGloryPrayer = true;
                psalmodyAnthems.ThirdValue.SecondPsalm.Comment = "-";
                psalmodyAnthems.ThirdValue.SecondPsalm.HasGloryPrayer = true;
                psalmodyAnthems.ThirdValue.ThirdPsalm.Comment = "-";
                psalmodyAnthems.ThirdValue.ThirdPsalm.HasGloryPrayer = true;
                psalmodyAnthems.SixthValue.SecondPsalm = liturgyMasters.PartsOfEasterTriduum.HourPrayerSecondPsalm;
                psalmodyAnthems.SixthValue.FirstPsalm.Comment = "-";
                psalmodyAnthems.SixthValue.FirstPsalm.HasGloryPrayer = true;
                psalmodyAnthems.SixthValue.SecondPsalm.Comment = "-";
                psalmodyAnthems.SixthValue.SecondPsalm.HasGloryPrayer = true;
                psalmodyAnthems.SixthValue.ThirdPsalm.Comment = "-";
                psalmodyAnthems.SixthValue.ThirdPsalm.HasGloryPrayer = true;
                psalmodyAnthems.NinthValue.ThirdPsalm = liturgyMasters.PartsOfEasterTriduum.HourPrayerThirdPsalm;
                psalmodyAnthems.NinthValue.FirstPsalm.Comment = "-";
                psalmodyAnthems.NinthValue.FirstPsalm.HasGloryPrayer = true;
                psalmodyAnthems.NinthValue.SecondPsalm.Comment = "-";
                psalmodyAnthems.NinthValue.SecondPsalm.HasGloryPrayer = true;
                psalmodyAnthems.NinthValue.ThirdPsalm.Comment = "-";
                psalmodyAnthems.NinthValue.ThirdPsalm.HasGloryPrayer = true;

                psalmodyAnthems.ThirdValue.UniqueAntiphon = liturgyMasters.PartsOfEasterTriduum.ThirdHourParts.Antiphon;
                psalmodyAnthems.SixthValue.UniqueAntiphon = liturgyMasters.PartsOfEasterTriduum.SixthHourParts.Antiphon;
                psalmodyAnthems.NinthValue.UniqueAntiphon = liturgyMasters.PartsOfEasterTriduum.NinthHourParts.Antiphon;
                break;
            case SpecificLiturgyTimeType.P_OCTAVA:
                psalmodyAnthems.ThirdValue.HasMultipleAntiphons = false;
                psalmodyAnthems.SixthValue.HasMultipleAntiphons = false;
                psalmodyAnthems.NinthValue.HasMultipleAntiphons = false;

                // TODO: if HasMultipleAntiphons == false... why this? check..
                psalmodyAnthems.ThirdValue.FirstPsalm = liturgyMasters.PartsOfEasterOctave.HourPrayerThirdPsalm;
                psalmodyAnthems.ThirdValue.FirstPsalm.Comment = "-";
                psalmodyAnthems.ThirdValue.FirstPsalm.HasGloryPrayer = true;
                psalmodyAnthems.ThirdValue.SecondPsalm.Comment = "-";
                psalmodyAnthems.ThirdValue.SecondPsalm.HasGloryPrayer = true;
                psalmodyAnthems.ThirdValue.ThirdPsalm.Comment = "-";
                psalmodyAnthems.ThirdValue.ThirdPsalm.HasGloryPrayer = true;
                psalmodyAnthems.SixthValue.SecondPsalm = liturgyMasters.PartsOfEasterOctave.HourPrayerSecondPsalm;
                psalmodyAnthems.SixthValue.FirstPsalm.Comment = "-";
                psalmodyAnthems.SixthValue.FirstPsalm.HasGloryPrayer = true;
                psalmodyAnthems.SixthValue.SecondPsalm.Comment = "-";
                psalmodyAnthems.SixthValue.SecondPsalm.HasGloryPrayer = true;
                psalmodyAnthems.SixthValue.ThirdPsalm.Comment = "-";
                psalmodyAnthems.SixthValue.ThirdPsalm.HasGloryPrayer = true;
                psalmodyAnthems.NinthValue.ThirdPsalm = liturgyMasters.PartsOfEasterOctave.HourPrayerThirdPsalm;
                psalmodyAnthems.NinthValue.FirstPsalm.Comment = "-";
                psalmodyAnthems.NinthValue.FirstPsalm.HasGloryPrayer = true;
                psalmodyAnthems.NinthValue.SecondPsalm.Comment = "-";
                psalmodyAnthems.NinthValue.SecondPsalm.HasGloryPrayer = true;
                psalmodyAnthems.NinthValue.ThirdPsalm.Comment = "-";
                psalmodyAnthems.NinthValue.ThirdPsalm.HasGloryPrayer = true;

                psalmodyAnthems.ThirdValue.UniqueAntiphon = liturgyMasters.PartsOfEasterOctave.ThirdHourParts.Antiphon;
                psalmodyAnthems.SixthValue.UniqueAntiphon = liturgyMasters.PartsOfEasterOctave.SixthHourParts.Antiphon;
                psalmodyAnthems.NinthValue.UniqueAntiphon = liturgyMasters.PartsOfEasterOctave.NinthHourParts.Antiphon;
                break;
            case SpecificLiturgyTimeType.P_SETMANES:
                psalmodyAnthems.ThirdValue.HasMultipleAntiphons = false;
                psalmodyAnthems.SixthValue.HasMultipleAntiphons = false;
                psalmodyAnthems.NinthValue.HasMultipleAntiphons = false;
                psalmodyAnthems.ThirdValue.UniqueAntiphon = "Al·leluia, al·leluia, al·leluia.";
                psalmodyAnthems.SixthValue.UniqueAntiphon = "Al·leluia, al·leluia, al·leluia.";
                psalmodyAnthems.NinthValue.UniqueAntiphon = "Al·leluia, al·leluia, al·leluia.";
                break;
            case SpecificLiturgyTimeType.A_SETMANES:
            case SpecificLiturgyTimeType.N_OCTAVA:
            case SpecificLiturgyTimeType.A_FERIES:
            case SpecificLiturgyTimeType.N_ABANS:
                if(liturgyDayInformation.SpecificLiturgyTime != SpecificLiturgyTimeType.N_ABANS ||
                    (liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13)){
                    psalmodyAnthems.ThirdValue.HasMultipleAntiphons = false;
                    psalmodyAnthems.SixthValue.HasMultipleAntiphons = false;
                    psalmodyAnthems.NinthValue.HasMultipleAntiphons = false;
                    psalmodyAnthems.ThirdValue.UniqueAntiphon = liturgyMasters.CommonAdventAndChristmasParts.ThirdHourAntiphon;
                    psalmodyAnthems.SixthValue.UniqueAntiphon = liturgyMasters.CommonAdventAndChristmasParts.SixthHourAntiphon;
                    psalmodyAnthems.NinthValue.UniqueAntiphon = liturgyMasters.CommonAdventAndChristmasParts.NinthHourAntiphon;
                }
                break;
        }
    }
    return psalmodyAnthems;
}

function GetResponsory(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationHours : Hours) : {ThirdValue : Responsory, SixthValue : Responsory, NinthValue : Responsory}{
    let hourAnthems = {
        ThirdValue: new Responsory(),
        SixthValue: new Responsory(),
        NinthValue: new Responsory()
    }

    if(StringManagement.HasLiturgyContent(celebrationHours.ThirdHour.Responsory.Versicle)) {
        hourAnthems.ThirdValue = celebrationHours.ThirdHour.Responsory;
        hourAnthems.SixthValue = celebrationHours.SixthHour.Responsory;
        hourAnthems.NinthValue = celebrationHours.NinthHour.Responsory;
    }
    else {
        hourAnthems.ThirdValue = liturgyMasters.CommonHourPsalter.ThirdHourParts.Responsory;
        hourAnthems.SixthValue = liturgyMasters.CommonHourPsalter.SixthHourParts.Responsory;
        hourAnthems.NinthValue = liturgyMasters.CommonHourPsalter.NinthHourParts.Responsory;
        switch(liturgyDayInformation.SpecificLiturgyTime){
            case SpecificLiturgyTimeType.Q_CENDRA:
                hourAnthems.ThirdValue = liturgyMasters.PartsOfLentTime.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.PartsOfLentTime.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.PartsOfLentTime.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.Q_SETMANES:
                hourAnthems.ThirdValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.Q_DIUM_RAMS:
                hourAnthems.ThirdValue = liturgyMasters.PalmSundayParts.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.PalmSundayParts.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.PalmSundayParts.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.Q_SET_SANTA:
                hourAnthems.ThirdValue = liturgyMasters.PartsOfHolyWeek.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.PartsOfHolyWeek.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.PartsOfHolyWeek.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.Q_TRIDU:
                hourAnthems.ThirdValue = liturgyMasters.PartsOfEasterTriduum.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.PartsOfEasterTriduum.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.PartsOfEasterTriduum.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.P_OCTAVA:
                hourAnthems.ThirdValue.Versicle = "Avui és el dia en què ha obrat el Senyor, al·leluia.";
                hourAnthems.ThirdValue.Response = "Alegrem-nos i celebrem-lo, al·leluia.";
                hourAnthems.SixthValue.Versicle = "Avui és el dia en què ha obrat el Senyor, al·leluia.";
                hourAnthems.SixthValue.Response = "Alegrem-nos i celebrem-lo, al·leluia.";
                hourAnthems.NinthValue.Versicle = "Avui és el dia en què ha obrat el Senyor, al·leluia.";
                hourAnthems.NinthValue.Response = "Alegrem-nos i celebrem-lo, al·leluia.";
                break;
            case SpecificLiturgyTimeType.P_SETMANES:
                hourAnthems.ThirdValue = liturgyMasters.EasterWeekParts.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.EasterWeekParts.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.EasterWeekParts.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.A_SETMANES:
                hourAnthems.ThirdValue = liturgyMasters.AdventWeekParts.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.AdventWeekParts.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.AdventWeekParts.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.A_FERIES:
                hourAnthems.ThirdValue = liturgyMasters.AdventFairDaysParts.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.AdventFairDaysParts.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.AdventFairDaysParts.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.N_OCTAVA:
                hourAnthems.ThirdValue = liturgyMasters.ChristmasWhenOctaveParts.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.ChristmasWhenOctaveParts.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.ChristmasWhenOctaveParts.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.N_ABANS:
                if(liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                    hourAnthems.ThirdValue = liturgyMasters.ChristmasBeforeEpiphanyParts.ThirdHourParts.Responsory;
                    hourAnthems.SixthValue = liturgyMasters.ChristmasBeforeEpiphanyParts.SixthHourParts.Responsory;
                    hourAnthems.NinthValue = liturgyMasters.ChristmasBeforeEpiphanyParts.NinthHourParts.Responsory;
                }
                break;
        }
    }
    return hourAnthems;
}

function GetShortReading(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationHours : Hours) : {ThirdValue : ShortReading, SixthValue : ShortReading, NinthValue : ShortReading}{
    let hourShortReading = {
        ThirdValue: new ShortReading(),
        SixthValue: new ShortReading(),
        NinthValue: new ShortReading()
    }

    if(StringManagement.HasLiturgyContent(celebrationHours.ThirdHour.ShortReading.ShortReading)) {
        hourShortReading.ThirdValue = celebrationHours.ThirdHour.ShortReading;
        hourShortReading.SixthValue = celebrationHours.SixthHour.ShortReading;
        hourShortReading.NinthValue = celebrationHours.NinthHour.ShortReading;
    }
    else {
        hourShortReading.ThirdValue = liturgyMasters.CommonHourPsalter.ThirdHourParts.ShortReading;
        hourShortReading.SixthValue = liturgyMasters.CommonHourPsalter.SixthHourParts.ShortReading;
        hourShortReading.NinthValue = liturgyMasters.CommonHourPsalter.NinthHourParts.ShortReading;
        switch(liturgyDayInformation.SpecificLiturgyTime){
            case SpecificLiturgyTimeType.Q_CENDRA:
                hourShortReading.ThirdValue = liturgyMasters.PartsOfLentTime.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.PartsOfLentTime.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.PartsOfLentTime.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.Q_SETMANES:
                hourShortReading.ThirdValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.Q_DIUM_RAMS:
                hourShortReading.ThirdValue = liturgyMasters.PalmSundayParts.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.PalmSundayParts.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.PalmSundayParts.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.Q_SET_SANTA:
                hourShortReading.ThirdValue = liturgyMasters.PartsOfHolyWeek.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.PartsOfHolyWeek.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.PartsOfHolyWeek.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.Q_TRIDU:
                hourShortReading.ThirdValue = liturgyMasters.PartsOfEasterTriduum.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.PartsOfEasterTriduum.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.PartsOfEasterTriduum.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.P_OCTAVA:
                hourShortReading.ThirdValue = liturgyMasters.PartsOfEasterOctave.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.PartsOfEasterOctave.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.PartsOfEasterOctave.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.P_SETMANES:
                hourShortReading.ThirdValue = liturgyMasters.EasterWeekParts.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.EasterWeekParts.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.EasterWeekParts.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.A_SETMANES:
                hourShortReading.ThirdValue = liturgyMasters.AdventWeekParts.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.AdventWeekParts.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.AdventWeekParts.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.A_FERIES:
                hourShortReading.ThirdValue = liturgyMasters.AdventFairDaysParts.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.AdventFairDaysParts.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.AdventFairDaysParts.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.N_OCTAVA:
                hourShortReading.ThirdValue = liturgyMasters.ChristmasWhenOctaveParts.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.ChristmasWhenOctaveParts.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.ChristmasWhenOctaveParts.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.N_ABANS:
                if(liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                    hourShortReading.ThirdValue = liturgyMasters.ChristmasBeforeEpiphanyParts.ThirdHourParts.ShortReading;
                    hourShortReading.SixthValue = liturgyMasters.ChristmasBeforeEpiphanyParts.SixthHourParts.ShortReading;
                    hourShortReading.NinthValue = liturgyMasters.ChristmasBeforeEpiphanyParts.NinthHourParts.ShortReading;
                }
                break;
        }
    }
    return hourShortReading;
}

function GetFinalPraying(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationHours : Hours) : {ThirdValue : string, SixthValue : string, NinthValue : string} {
    let finalPraying = {
        ThirdValue: "",
        SixthValue: "",
        NinthValue: ""
    }

    if(StringManagement.HasLiturgyContent(celebrationHours.ThirdHour.FinalPrayer)) {
        finalPraying.ThirdValue = celebrationHours.ThirdHour.FinalPrayer;
        finalPraying.SixthValue = celebrationHours.SixthHour.FinalPrayer;
        finalPraying.NinthValue = celebrationHours.NinthHour.FinalPrayer;
    }
    else {
        if(liturgyDayInformation.DayOfTheWeek === 0){
            finalPraying.ThirdValue = liturgyMasters.PrayersOfOrdinaryTime.FinalPrayer;
            finalPraying.SixthValue = liturgyMasters.PrayersOfOrdinaryTime.FinalPrayer;
            finalPraying.NinthValue = liturgyMasters.PrayersOfOrdinaryTime.FinalPrayer;
        }
        else{
            finalPraying.ThirdValue = liturgyMasters.CommonHourPsalter.ThirdHourParts.FinalPrayer;
            finalPraying.SixthValue = liturgyMasters.CommonHourPsalter.SixthHourParts.FinalPrayer;
            finalPraying.NinthValue = liturgyMasters.CommonHourPsalter.NinthHourParts.FinalPrayer;
        }
        switch(liturgyDayInformation.SpecificLiturgyTime){
            case SpecificLiturgyTimeType.Q_CENDRA:
                finalPraying.ThirdValue = liturgyMasters.PartsOfLentTime.ThirdHourParts.FinalPrayer;
                finalPraying.SixthValue = liturgyMasters.PartsOfLentTime.SixthHourParts.FinalPrayer;
                finalPraying.NinthValue = liturgyMasters.PartsOfLentTime.NinthHourParts.FinalPrayer;
                break;
            case SpecificLiturgyTimeType.Q_SETMANES:
                finalPraying.ThirdValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.ThirdHourParts.FinalPrayer;
                finalPraying.SixthValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.SixthHourParts.FinalPrayer;
                finalPraying.NinthValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.NinthHourParts.FinalPrayer;
                break;
            case SpecificLiturgyTimeType.Q_DIUM_RAMS:
                finalPraying.ThirdValue = liturgyMasters.PalmSundayParts.ThirdHourParts.FinalPrayer;
                finalPraying.SixthValue = liturgyMasters.PalmSundayParts.SixthHourParts.FinalPrayer;
                finalPraying.NinthValue = liturgyMasters.PalmSundayParts.NinthHourParts.FinalPrayer;
                break;
            case SpecificLiturgyTimeType.Q_SET_SANTA:
                finalPraying.ThirdValue = liturgyMasters.PartsOfHolyWeek.ThirdHourParts.FinalPrayer;
                finalPraying.SixthValue = liturgyMasters.PartsOfHolyWeek.SixthHourParts.FinalPrayer;
                finalPraying.NinthValue = liturgyMasters.PartsOfHolyWeek.NinthHourParts.FinalPrayer;
                break;
            case SpecificLiturgyTimeType.Q_TRIDU:
                finalPraying.ThirdValue = liturgyMasters.PartsOfEasterTriduum.ThirdHourParts.FinalPrayer;
                finalPraying.SixthValue = liturgyMasters.PartsOfEasterTriduum.SixthHourParts.FinalPrayer;
                finalPraying.NinthValue = liturgyMasters.PartsOfEasterTriduum.NinthHourParts.FinalPrayer;
                break;
            case SpecificLiturgyTimeType.P_OCTAVA:
                finalPraying.ThirdValue = liturgyMasters.PartsOfEasterOctave.ThirdHourParts.FinalPrayer;
                finalPraying.SixthValue = liturgyMasters.PartsOfEasterOctave.SixthHourParts.FinalPrayer;
                finalPraying.NinthValue = liturgyMasters.PartsOfEasterOctave.NinthHourParts.FinalPrayer;
                break;
            case SpecificLiturgyTimeType.P_SETMANES:
                finalPraying.ThirdValue = liturgyMasters.EasterWeekParts.ThirdHourParts.FinalPrayer;
                finalPraying.SixthValue = liturgyMasters.EasterWeekParts.SixthHourParts.FinalPrayer;
                finalPraying.NinthValue = liturgyMasters.EasterWeekParts.NinthHourParts.FinalPrayer;
                break;
            case SpecificLiturgyTimeType.A_SETMANES:
                finalPraying.ThirdValue = liturgyMasters.AdventWeekParts.ThirdHourParts.FinalPrayer;
                finalPraying.SixthValue = liturgyMasters.AdventWeekParts.SixthHourParts.FinalPrayer;
                finalPraying.NinthValue = liturgyMasters.AdventWeekParts.NinthHourParts.FinalPrayer;
                break;
            case SpecificLiturgyTimeType.A_FERIES:
                finalPraying.ThirdValue = liturgyMasters.AdventFairDaysParts.ThirdHourParts.FinalPrayer;
                finalPraying.SixthValue = liturgyMasters.AdventFairDaysParts.SixthHourParts.FinalPrayer;
                finalPraying.NinthValue = liturgyMasters.AdventFairDaysParts.NinthHourParts.FinalPrayer;
                break;
            case SpecificLiturgyTimeType.N_OCTAVA:
                finalPraying.ThirdValue = liturgyMasters.ChristmasWhenOctaveParts.ThirdHourParts.FinalPrayer;
                finalPraying.SixthValue = liturgyMasters.ChristmasWhenOctaveParts.SixthHourParts.FinalPrayer;
                finalPraying.NinthValue = liturgyMasters.ChristmasWhenOctaveParts.NinthHourParts.FinalPrayer;
                break;
            case SpecificLiturgyTimeType.N_ABANS:
                if(liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                    finalPraying.ThirdValue = liturgyMasters.ChristmasBeforeEpiphanyParts.ThirdHourParts.FinalPrayer;
                    finalPraying.SixthValue = liturgyMasters.ChristmasBeforeEpiphanyParts.SixthHourParts.FinalPrayer;
                    finalPraying.NinthValue = liturgyMasters.ChristmasBeforeEpiphanyParts.NinthHourParts.FinalPrayer;
                }
                break;
        }
    }
    return finalPraying;
}