import CelebrationInformation from "../../Models/HoursLiturgy/CelebrationInformation";
import LiturgyDayInformation, {SpecialCelebrationTypeEnum} from "../../Models/LiturgyDayInformation";
import {CelebrationType} from "../DatabaseEnums";
import {SpecificLiturgyTimeType} from "../CelebrationTimeEnums";
import {StringManagement} from "../../Utils/StringManagement";
import {DateManagement} from "../../Utils/DateManagement";
import * as PrecedenceService from "../PrecedenceService";

export function ObtainCelebrationInformation(liturgyDayInformation: LiturgyDayInformation, celebrationInformationFromCelebration: CelebrationInformation): CelebrationInformation {
    // With this service I'm trying to separate Celebration by some kind of Saint from Celebration from the liturgy time
    let celebrationInformation = new CelebrationInformation();
    if(StringManagement.HasLiturgyContent(celebrationInformationFromCelebration.Title)) {
        celebrationInformation = celebrationInformationFromCelebration;
    }
    else{
        celebrationInformation.Title = "";
        celebrationInformation.Description = "-";
        liturgyDayInformation.Today.CelebrationType = CelebrationType.Fair;
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.HolyWeek ||
            liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentTriduum) {
            celebrationInformation.Title = DateManagement.WeekDayName(liturgyDayInformation.Today.Date.getDay()) + " Sant";
        }
        else if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterOctave) {
            celebrationInformation.Title = "Octava de Pasqua";
        }
        else if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave &&
            liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType !== SpecialCelebrationTypeEnum.StrongTime &&
            liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType !== SpecialCelebrationTypeEnum.SpecialDay) {
            celebrationInformation.Title = "Octava de Nadal";
        }
        else if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentAshes) {
            celebrationInformation.Title = "Cendra";
        }
        else if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventFairs) {
            celebrationInformation.Title = "Fèria d’Advent";
        }
    }
    celebrationInformation.TodayPrecedence = PrecedenceService.ObtainPrecedenceByLiturgyTime(liturgyDayInformation.Today, celebrationInformation);
    celebrationInformation.TomorrowPrecedence = PrecedenceService.ObtainPrecedenceByLiturgyTime(liturgyDayInformation.Tomorrow, celebrationInformation);
    return celebrationInformation;
}