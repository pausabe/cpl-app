import Hours from "../../../Models/HoursLiturgy/Hours";
import LiturgyMasters from "../../../Models/LiturgyMasters/LiturgyMasters";
import {LiturgySpecificDayInformation} from "../../../Models/LiturgyDayInformation";
import {Settings} from "../../../Models/Settings";
import {Psalm, Responsory, ShortReading} from "../../../Models/LiturgyMasters/CommonParts";
import {SpecificLiturgyTimeType} from "../CelebrationTimeEnums";
import {StringManagement} from "../../../Utils/StringManagement";
import * as CelebrationIdentifier from "../CelebrationIdentifierService";
import {Celebration} from "../CelebrationIdentifierService";

export function ObtainHours(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationHours : Hours, settings : Settings) : Hours {
    let hours = new Hours();
    if (liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
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
            case SpecificLiturgyTimeType.LentAshes:
            case SpecificLiturgyTimeType.LentWeeks:
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
            case SpecificLiturgyTimeType.PalmSunday:
            case SpecificLiturgyTimeType.HolyWeek:
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
            case SpecificLiturgyTimeType.PaschalTriduum:
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
            case SpecificLiturgyTimeType.EasterOctave:
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
            case SpecificLiturgyTimeType.EasterWeeks:
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
            case SpecificLiturgyTimeType.AdventWeeks:
            case SpecificLiturgyTimeType.AdventFairs:
            case SpecificLiturgyTimeType.ChristmasOctave:
            case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
                const beforeChristmasConditions = liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
                    liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13;
                const christmasOctaveConditions = liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave &&
                    !CelebrationIdentifier.CheckCelebration(Celebration.Christmas, liturgyDayInformation)
                if((liturgyDayInformation.SpecificLiturgyTime !== SpecificLiturgyTimeType.ChristmasBeforeOrdinary || beforeChristmasConditions) &&
                    (liturgyDayInformation.SpecificLiturgyTime !== SpecificLiturgyTimeType.ChristmasOctave || christmasOctaveConditions)){
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
    let psalmody = {
        ThirdValue: { HasMultipleAntiphons: true, UniqueAntiphon: "", FirstPsalm: new Psalm(), SecondPsalm: new Psalm(), ThirdPsalm: new Psalm() },
        SixthValue: { HasMultipleAntiphons: true, UniqueAntiphon: "", FirstPsalm: new Psalm(), SecondPsalm: new Psalm(), ThirdPsalm: new Psalm() },
        NinthValue: { HasMultipleAntiphons: true, UniqueAntiphon: "", FirstPsalm: new Psalm(), SecondPsalm: new Psalm(), ThirdPsalm: new Psalm() }
    }

    // Antiphon
    if(StringManagement.HasLiturgyContent(celebrationHours.ThirdHour.UniqueAntiphon)) {
        psalmody.ThirdValue.HasMultipleAntiphons = celebrationHours.ThirdHour.HasMultipleAntiphons;
        psalmody.ThirdValue.UniqueAntiphon = celebrationHours.ThirdHour.UniqueAntiphon;
        psalmody.SixthValue.HasMultipleAntiphons = celebrationHours.SixthHour.HasMultipleAntiphons;
        psalmody.SixthValue.UniqueAntiphon = celebrationHours.SixthHour.UniqueAntiphon;
        psalmody.NinthValue.HasMultipleAntiphons = celebrationHours.NinthHour.HasMultipleAntiphons;
        psalmody.NinthValue.UniqueAntiphon = celebrationHours.NinthHour.UniqueAntiphon;
    }
    else {
        switch(liturgyDayInformation.SpecificLiturgyTime){
            case SpecificLiturgyTimeType.LentAshes:
            case SpecificLiturgyTimeType.LentWeeks:
                psalmody.ThirdValue.HasMultipleAntiphons = false;
                psalmody.SixthValue.HasMultipleAntiphons = false;
                psalmody.NinthValue.HasMultipleAntiphons = false;
                psalmody.ThirdValue.UniqueAntiphon = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.ThirdHourAntiphon;
                psalmody.SixthValue.UniqueAntiphon = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.SixthHourAntiphon;
                psalmody.NinthValue.UniqueAntiphon = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.NinthHourAntiphon;
                break;
            case SpecificLiturgyTimeType.PalmSunday:
            case SpecificLiturgyTimeType.HolyWeek:
                psalmody.ThirdValue.HasMultipleAntiphons = false;
                psalmody.SixthValue.HasMultipleAntiphons = false;
                psalmody.NinthValue.HasMultipleAntiphons = false;
                psalmody.ThirdValue.UniqueAntiphon = liturgyMasters.CommonPartsOfHolyWeek.ThirdHourAntiphon;
                psalmody.SixthValue.UniqueAntiphon = liturgyMasters.CommonPartsOfHolyWeek.SixthHourAntiphon;
                psalmody.NinthValue.UniqueAntiphon = liturgyMasters.CommonPartsOfHolyWeek.NinthHourAntiphon;
                break;
            case SpecificLiturgyTimeType.PaschalTriduum:
                psalmody.ThirdValue.HasMultipleAntiphons = false;
                psalmody.SixthValue.HasMultipleAntiphons = false;
                psalmody.NinthValue.HasMultipleAntiphons = false;
                psalmody.ThirdValue.UniqueAntiphon = liturgyMasters.PartsOfEasterTriduum.ThirdHourParts.Antiphon;
                psalmody.SixthValue.UniqueAntiphon = liturgyMasters.PartsOfEasterTriduum.SixthHourParts.Antiphon;
                psalmody.NinthValue.UniqueAntiphon = liturgyMasters.PartsOfEasterTriduum.NinthHourParts.Antiphon;
                break;
            case SpecificLiturgyTimeType.EasterOctave:
                psalmody.ThirdValue.HasMultipleAntiphons = false;
                psalmody.SixthValue.HasMultipleAntiphons = false;
                psalmody.NinthValue.HasMultipleAntiphons = false;
                psalmody.ThirdValue.UniqueAntiphon = liturgyMasters.PartsOfEasterOctave.ThirdHourParts.Antiphon;
                psalmody.SixthValue.UniqueAntiphon = liturgyMasters.PartsOfEasterOctave.SixthHourParts.Antiphon;
                psalmody.NinthValue.UniqueAntiphon = liturgyMasters.PartsOfEasterOctave.NinthHourParts.Antiphon;
                break;
            case SpecificLiturgyTimeType.EasterWeeks:
                psalmody.ThirdValue.HasMultipleAntiphons = false;
                psalmody.SixthValue.HasMultipleAntiphons = false;
                psalmody.NinthValue.HasMultipleAntiphons = false;
                psalmody.ThirdValue.UniqueAntiphon = "Al·leluia, al·leluia, al·leluia.";
                psalmody.SixthValue.UniqueAntiphon = "Al·leluia, al·leluia, al·leluia.";
                psalmody.NinthValue.UniqueAntiphon = "Al·leluia, al·leluia, al·leluia.";
                break;
            case SpecificLiturgyTimeType.AdventWeeks:
            case SpecificLiturgyTimeType.ChristmasOctave:
            case SpecificLiturgyTimeType.AdventFairs:
            case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
                const beforeChristmasConditions = liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
                    liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13;
                const christmasOctaveConditions = liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave &&
                    !CelebrationIdentifier.CheckCelebration(Celebration.Christmas, liturgyDayInformation)
                if((liturgyDayInformation.SpecificLiturgyTime !== SpecificLiturgyTimeType.ChristmasBeforeOrdinary || beforeChristmasConditions) &&
                    (liturgyDayInformation.SpecificLiturgyTime !== SpecificLiturgyTimeType.ChristmasOctave || christmasOctaveConditions)){
                    psalmody.ThirdValue.HasMultipleAntiphons = false;
                    psalmody.SixthValue.HasMultipleAntiphons = false;
                    psalmody.NinthValue.HasMultipleAntiphons = false;
                    psalmody.ThirdValue.UniqueAntiphon = liturgyMasters.CommonAdventAndChristmasParts.ThirdHourAntiphon;
                    psalmody.SixthValue.UniqueAntiphon = liturgyMasters.CommonAdventAndChristmasParts.SixthHourAntiphon;
                    psalmody.NinthValue.UniqueAntiphon = liturgyMasters.CommonAdventAndChristmasParts.NinthHourAntiphon;
                }
                break;
        }
    }

    // Psalms
    if(StringManagement.HasLiturgyContent(celebrationHours.ThirdHour.FirstPsalm.Psalm)) {
        psalmody.ThirdValue.FirstPsalm = celebrationHours.ThirdHour.FirstPsalm;
        psalmody.ThirdValue.SecondPsalm = celebrationHours.ThirdHour.SecondPsalm;
        psalmody.ThirdValue.ThirdPsalm = celebrationHours.ThirdHour.ThirdPsalm;
        psalmody.SixthValue.FirstPsalm = celebrationHours.SixthHour.FirstPsalm;
        psalmody.SixthValue.SecondPsalm = celebrationHours.SixthHour.SecondPsalm;
        psalmody.SixthValue.ThirdPsalm = celebrationHours.SixthHour.ThirdPsalm;
        psalmody.NinthValue.FirstPsalm = celebrationHours.NinthHour.FirstPsalm;
        psalmody.NinthValue.SecondPsalm = celebrationHours.NinthHour.SecondPsalm;
        psalmody.NinthValue.ThirdPsalm = celebrationHours.NinthHour.ThirdPsalm;
    }
    else {
        psalmody.ThirdValue.FirstPsalm = liturgyMasters.CommonHourPsalter.FirstPsalm;
        psalmody.ThirdValue.SecondPsalm = liturgyMasters.CommonHourPsalter.SecondPsalm;
        psalmody.ThirdValue.ThirdPsalm = liturgyMasters.CommonHourPsalter.ThirdPsalm;
        psalmody.SixthValue.FirstPsalm = liturgyMasters.CommonHourPsalter.FirstPsalm;
        psalmody.SixthValue.SecondPsalm = liturgyMasters.CommonHourPsalter.SecondPsalm;
        psalmody.SixthValue.ThirdPsalm = liturgyMasters.CommonHourPsalter.ThirdPsalm;
        psalmody.NinthValue.FirstPsalm = liturgyMasters.CommonHourPsalter.FirstPsalm;
        psalmody.NinthValue.SecondPsalm = liturgyMasters.CommonHourPsalter.SecondPsalm;
        psalmody.NinthValue.ThirdPsalm = liturgyMasters.CommonHourPsalter.ThirdPsalm;
        switch(liturgyDayInformation.SpecificLiturgyTime){
            case SpecificLiturgyTimeType.PaschalTriduum:
                psalmody.ThirdValue.FirstPsalm = liturgyMasters.PartsOfEasterTriduum.HourPrayerFirstPsalm;
                psalmody.ThirdValue.FirstPsalm.Comment = "-";
                psalmody.ThirdValue.FirstPsalm.HasGloryPrayer = true;
                psalmody.ThirdValue.SecondPsalm = liturgyMasters.PartsOfEasterTriduum.HourPrayerSecondPsalm;
                psalmody.ThirdValue.SecondPsalm.Comment = "-";
                psalmody.ThirdValue.SecondPsalm.HasGloryPrayer = true;
                psalmody.ThirdValue.ThirdPsalm = liturgyMasters.PartsOfEasterTriduum.HourPrayerThirdPsalm;
                psalmody.ThirdValue.ThirdPsalm.Comment = "-";
                psalmody.ThirdValue.ThirdPsalm.HasGloryPrayer = true;
                psalmody.SixthValue.FirstPsalm = liturgyMasters.PartsOfEasterTriduum.HourPrayerFirstPsalm;
                psalmody.SixthValue.FirstPsalm.Comment = "-";
                psalmody.SixthValue.FirstPsalm.HasGloryPrayer = true;
                psalmody.SixthValue.SecondPsalm = liturgyMasters.PartsOfEasterTriduum.HourPrayerSecondPsalm;
                psalmody.SixthValue.SecondPsalm.Comment = "-";
                psalmody.SixthValue.SecondPsalm.HasGloryPrayer = true;
                psalmody.SixthValue.ThirdPsalm = liturgyMasters.PartsOfEasterTriduum.HourPrayerThirdPsalm;
                psalmody.SixthValue.ThirdPsalm.Comment = "-";
                psalmody.SixthValue.ThirdPsalm.HasGloryPrayer = true;
                psalmody.NinthValue.FirstPsalm = liturgyMasters.PartsOfEasterTriduum.HourPrayerFirstPsalm;
                psalmody.NinthValue.FirstPsalm.Comment = "-";
                psalmody.NinthValue.FirstPsalm.HasGloryPrayer = true;
                psalmody.NinthValue.SecondPsalm = liturgyMasters.PartsOfEasterTriduum.HourPrayerSecondPsalm;
                psalmody.NinthValue.SecondPsalm.Comment = "-";
                psalmody.NinthValue.SecondPsalm.HasGloryPrayer = true;
                psalmody.NinthValue.ThirdPsalm = liturgyMasters.PartsOfEasterTriduum.HourPrayerThirdPsalm;
                psalmody.NinthValue.ThirdPsalm.Comment = "-";
                psalmody.NinthValue.ThirdPsalm.HasGloryPrayer = true;
                break;
            case SpecificLiturgyTimeType.EasterOctave:
                psalmody.ThirdValue.FirstPsalm = liturgyMasters.PartsOfEasterOctave.HourPrayerFirstPsalm;
                psalmody.ThirdValue.FirstPsalm.Comment = "-";
                psalmody.ThirdValue.FirstPsalm.HasGloryPrayer = true;
                psalmody.ThirdValue.SecondPsalm = liturgyMasters.PartsOfEasterOctave.HourPrayerSecondPsalm;
                psalmody.ThirdValue.SecondPsalm.Comment = "-";
                psalmody.ThirdValue.SecondPsalm.HasGloryPrayer = true;
                psalmody.ThirdValue.ThirdPsalm = liturgyMasters.PartsOfEasterOctave.HourPrayerThirdPsalm;
                psalmody.ThirdValue.ThirdPsalm.Comment = "-";
                psalmody.ThirdValue.ThirdPsalm.HasGloryPrayer = true;
                psalmody.SixthValue.FirstPsalm = liturgyMasters.PartsOfEasterOctave.HourPrayerFirstPsalm;
                psalmody.SixthValue.FirstPsalm.Comment = "-";
                psalmody.SixthValue.FirstPsalm.HasGloryPrayer = true;
                psalmody.SixthValue.SecondPsalm = liturgyMasters.PartsOfEasterOctave.HourPrayerSecondPsalm;
                psalmody.SixthValue.SecondPsalm.Comment = "-";
                psalmody.SixthValue.SecondPsalm.HasGloryPrayer = true;
                psalmody.SixthValue.ThirdPsalm = liturgyMasters.PartsOfEasterOctave.HourPrayerThirdPsalm;
                psalmody.SixthValue.ThirdPsalm.Comment = "-";
                psalmody.SixthValue.ThirdPsalm.HasGloryPrayer = true;
                psalmody.NinthValue.FirstPsalm = liturgyMasters.PartsOfEasterOctave.HourPrayerFirstPsalm;
                psalmody.NinthValue.FirstPsalm.Comment = "-";
                psalmody.NinthValue.FirstPsalm.HasGloryPrayer = true;
                psalmody.NinthValue.SecondPsalm = liturgyMasters.PartsOfEasterOctave.HourPrayerSecondPsalm;
                psalmody.NinthValue.SecondPsalm.Comment = "-";
                psalmody.NinthValue.SecondPsalm.HasGloryPrayer = true;
                psalmody.NinthValue.ThirdPsalm = liturgyMasters.PartsOfEasterOctave.HourPrayerThirdPsalm;
                psalmody.NinthValue.ThirdPsalm.Comment = "-";
                psalmody.NinthValue.ThirdPsalm.HasGloryPrayer = true;
                break;
        }
    }

    return psalmody;
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
            case SpecificLiturgyTimeType.LentAshes:
                hourAnthems.ThirdValue = liturgyMasters.PartsOfLentTime.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.PartsOfLentTime.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.PartsOfLentTime.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.LentWeeks:
                hourAnthems.ThirdValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.PalmSunday:
                hourAnthems.ThirdValue = liturgyMasters.PalmSundayParts.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.PalmSundayParts.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.PalmSundayParts.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.HolyWeek:
                hourAnthems.ThirdValue = liturgyMasters.PartsOfHolyWeek.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.PartsOfHolyWeek.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.PartsOfHolyWeek.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.PaschalTriduum:
                hourAnthems.ThirdValue = liturgyMasters.PartsOfEasterTriduum.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.PartsOfEasterTriduum.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.PartsOfEasterTriduum.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.EasterOctave:
                hourAnthems.ThirdValue.Versicle = "Avui és el dia en què ha obrat el Senyor, al·leluia.";
                hourAnthems.ThirdValue.Response = "Alegrem-nos i celebrem-lo, al·leluia.";
                hourAnthems.SixthValue.Versicle = "Avui és el dia en què ha obrat el Senyor, al·leluia.";
                hourAnthems.SixthValue.Response = "Alegrem-nos i celebrem-lo, al·leluia.";
                hourAnthems.NinthValue.Versicle = "Avui és el dia en què ha obrat el Senyor, al·leluia.";
                hourAnthems.NinthValue.Response = "Alegrem-nos i celebrem-lo, al·leluia.";
                break;
            case SpecificLiturgyTimeType.EasterWeeks:
                hourAnthems.ThirdValue = liturgyMasters.EasterWeekParts.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.EasterWeekParts.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.EasterWeekParts.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.AdventWeeks:
                hourAnthems.ThirdValue = liturgyMasters.AdventWeekParts.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.AdventWeekParts.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.AdventWeekParts.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.AdventFairs:
                hourAnthems.ThirdValue = liturgyMasters.AdventFairDaysParts.ThirdHourParts.Responsory;
                hourAnthems.SixthValue = liturgyMasters.AdventFairDaysParts.SixthHourParts.Responsory;
                hourAnthems.NinthValue = liturgyMasters.AdventFairDaysParts.NinthHourParts.Responsory;
                break;
            case SpecificLiturgyTimeType.ChristmasOctave:
                if(!CelebrationIdentifier.CheckCelebration(Celebration.Christmas, liturgyDayInformation)){
                    hourAnthems.ThirdValue = liturgyMasters.ChristmasWhenOctaveParts.ThirdHourParts.Responsory;
                    hourAnthems.SixthValue = liturgyMasters.ChristmasWhenOctaveParts.SixthHourParts.Responsory;
                    hourAnthems.NinthValue = liturgyMasters.ChristmasWhenOctaveParts.NinthHourParts.Responsory;
                }
                break;
            case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
                if(liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
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
            case SpecificLiturgyTimeType.LentAshes:
                hourShortReading.ThirdValue = liturgyMasters.PartsOfLentTime.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.PartsOfLentTime.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.PartsOfLentTime.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.LentWeeks:
                hourShortReading.ThirdValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.PalmSunday:
                hourShortReading.ThirdValue = liturgyMasters.PalmSundayParts.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.PalmSundayParts.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.PalmSundayParts.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.HolyWeek:
                hourShortReading.ThirdValue = liturgyMasters.PartsOfHolyWeek.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.PartsOfHolyWeek.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.PartsOfHolyWeek.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.PaschalTriduum:
                hourShortReading.ThirdValue = liturgyMasters.PartsOfEasterTriduum.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.PartsOfEasterTriduum.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.PartsOfEasterTriduum.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.EasterOctave:
                hourShortReading.ThirdValue = liturgyMasters.PartsOfEasterOctave.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.PartsOfEasterOctave.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.PartsOfEasterOctave.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.EasterWeeks:
                hourShortReading.ThirdValue = liturgyMasters.EasterWeekParts.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.EasterWeekParts.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.EasterWeekParts.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.AdventWeeks:
                hourShortReading.ThirdValue = liturgyMasters.AdventWeekParts.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.AdventWeekParts.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.AdventWeekParts.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.AdventFairs:
                hourShortReading.ThirdValue = liturgyMasters.AdventFairDaysParts.ThirdHourParts.ShortReading;
                hourShortReading.SixthValue = liturgyMasters.AdventFairDaysParts.SixthHourParts.ShortReading;
                hourShortReading.NinthValue = liturgyMasters.AdventFairDaysParts.NinthHourParts.ShortReading;
                break;
            case SpecificLiturgyTimeType.ChristmasOctave:
                if(!CelebrationIdentifier.CheckCelebration(Celebration.Christmas, liturgyDayInformation)){
                    hourShortReading.ThirdValue = liturgyMasters.ChristmasWhenOctaveParts.ThirdHourParts.ShortReading;
                    hourShortReading.SixthValue = liturgyMasters.ChristmasWhenOctaveParts.SixthHourParts.ShortReading;
                    hourShortReading.NinthValue = liturgyMasters.ChristmasWhenOctaveParts.NinthHourParts.ShortReading;
                }
                break;
            case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
                if(liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
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
        switch(liturgyDayInformation.SpecificLiturgyTime){
            case SpecificLiturgyTimeType.LentAshes:
                finalPraying.ThirdValue = liturgyMasters.PartsOfLentTime.LaudesFinalPrayer;
                finalPraying.SixthValue = liturgyMasters.PartsOfLentTime.LaudesFinalPrayer;
                finalPraying.NinthValue = liturgyMasters.PartsOfLentTime.LaudesFinalPrayer;
                break;
            case SpecificLiturgyTimeType.LentWeeks:
                finalPraying.ThirdValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.LaudesFinalPrayer;
                finalPraying.SixthValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.LaudesFinalPrayer;
                finalPraying.NinthValue = liturgyMasters.PartsOfFiveWeeksOfLentTime.LaudesFinalPrayer;
                break;
            case SpecificLiturgyTimeType.PalmSunday:
                finalPraying.ThirdValue = liturgyMasters.PalmSundayParts.LaudesFinalPrayer;
                finalPraying.SixthValue = liturgyMasters.PalmSundayParts.LaudesFinalPrayer;
                finalPraying.NinthValue = liturgyMasters.PalmSundayParts.LaudesFinalPrayer;
                break;
            case SpecificLiturgyTimeType.HolyWeek:
                finalPraying.ThirdValue = liturgyMasters.PartsOfHolyWeek.LaudesFinalPrayer;
                finalPraying.SixthValue = liturgyMasters.PartsOfHolyWeek.LaudesFinalPrayer;
                finalPraying.NinthValue = liturgyMasters.PartsOfHolyWeek.LaudesFinalPrayer;
                break;
            case SpecificLiturgyTimeType.PaschalTriduum:
                finalPraying.ThirdValue = liturgyMasters.PartsOfEasterTriduum.ThirdHourParts.FinalPrayer;
                finalPraying.SixthValue = liturgyMasters.PartsOfEasterTriduum.SixthHourParts.FinalPrayer;
                finalPraying.NinthValue = liturgyMasters.PartsOfEasterTriduum.NinthHourParts.FinalPrayer;
                break;
            case SpecificLiturgyTimeType.EasterOctave:
                finalPraying.ThirdValue = liturgyMasters.PartsOfEasterOctave.ThirdHourParts.FinalPrayer;
                finalPraying.SixthValue = liturgyMasters.PartsOfEasterOctave.SixthHourParts.FinalPrayer;
                finalPraying.NinthValue = liturgyMasters.PartsOfEasterOctave.NinthHourParts.FinalPrayer;
                break;
            case SpecificLiturgyTimeType.EasterWeeks:
                finalPraying.ThirdValue = liturgyMasters.EasterWeekParts.LaudesFinalPrayer;
                finalPraying.SixthValue = liturgyMasters.EasterWeekParts.LaudesFinalPrayer;
                finalPraying.NinthValue = liturgyMasters.EasterWeekParts.LaudesFinalPrayer;
                break;
            case SpecificLiturgyTimeType.AdventWeeks:
                finalPraying.ThirdValue = liturgyMasters.AdventWeekParts.LaudesFinalPrayer;
                finalPraying.SixthValue = liturgyMasters.AdventWeekParts.LaudesFinalPrayer;
                finalPraying.NinthValue = liturgyMasters.AdventWeekParts.LaudesFinalPrayer;
                break;
            case SpecificLiturgyTimeType.AdventFairs:
                finalPraying.ThirdValue = liturgyMasters.AdventFairDaysParts.LaudesFinalPrayer
                finalPraying.SixthValue = liturgyMasters.AdventFairDaysParts.LaudesFinalPrayer;
                finalPraying.NinthValue = liturgyMasters.AdventFairDaysParts.LaudesFinalPrayer;
                break;
            case SpecificLiturgyTimeType.ChristmasOctave:
                if(!CelebrationIdentifier.CheckCelebration(Celebration.Christmas, liturgyDayInformation)) {
                    finalPraying.ThirdValue = liturgyMasters.ChristmasWhenOctaveParts.LaudesFinalPrayer;
                    finalPraying.SixthValue = liturgyMasters.ChristmasWhenOctaveParts.LaudesFinalPrayer;
                    finalPraying.NinthValue = liturgyMasters.ChristmasWhenOctaveParts.LaudesFinalPrayer;
                }
                break;
            case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
                if(liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
                    liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13){
                    finalPraying.ThirdValue = liturgyMasters.ChristmasBeforeEpiphanyParts.LaudesFinalPrayer;
                    finalPraying.SixthValue = liturgyMasters.ChristmasBeforeEpiphanyParts.LaudesFinalPrayer;
                    finalPraying.NinthValue = liturgyMasters.ChristmasBeforeEpiphanyParts.LaudesFinalPrayer;
                }
                break;
        }

        if(!StringManagement.HasLiturgyContent(finalPraying.ThirdValue) && liturgyDayInformation.DayOfTheWeek === 0){
            finalPraying.ThirdValue = liturgyMasters.PrayersOfOrdinaryTime.FinalPrayer;
            finalPraying.SixthValue = liturgyMasters.PrayersOfOrdinaryTime.FinalPrayer;
            finalPraying.NinthValue = liturgyMasters.PrayersOfOrdinaryTime.FinalPrayer;
        }
        else if(!StringManagement.HasLiturgyContent(finalPraying.ThirdValue)){
            finalPraying.ThirdValue = liturgyMasters.CommonHourPsalter.ThirdHourParts.FinalPrayer;
            finalPraying.SixthValue = liturgyMasters.CommonHourPsalter.SixthHourParts.FinalPrayer;
            finalPraying.NinthValue = liturgyMasters.CommonHourPsalter.NinthHourParts.FinalPrayer;
        }
    }
    return finalPraying;
}