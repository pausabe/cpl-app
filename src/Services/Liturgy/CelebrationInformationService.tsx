import CelebrationInformation from "../../Models/HoursLiturgy/CelebrationInformation";
import {LiturgySpecificDayInformation, SpecialCelebrationTypeEnum} from "../../Models/LiturgyDayInformation";
import {CelebrationType} from "../DatabaseEnums";
import {SpecificLiturgyTimeType} from "../CelebrationTimeEnums";
import {StringManagement} from "../../Utils/StringManagement";
import {DateManagement} from "../../Utils/DateManagement";

export function ObtainCelebrationInformation(celebrationInformationFromCelebration: CelebrationInformation, liturgyDayInformation: LiturgySpecificDayInformation): CelebrationInformation {
    // With this service I'm trying to separate Celebration by some kind of Saint from Celebration from the liturgy time
    let celebrationInformation = new CelebrationInformation();
    if(!StringManagement.HasLiturgyContent(celebrationInformationFromCelebration.Title)) {
        celebrationInformation.Title = "";
        celebrationInformation.Description = "-";
        liturgyDayInformation.CelebrationType = CelebrationType.Fair;
        if (liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_SET_SANTA ||
            liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_TRIDU) {
            celebrationInformation.Title = DateManagement.WeekDayName(liturgyDayInformation.Date.getDay()) + " Sant";
        }
        else if (liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.P_OCTAVA) {
            celebrationInformation.Title = "Octava de Pasqua";
        }
        else if (liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.N_OCTAVA &&
            liturgyDayInformation.SpecialCelebration.SpecialCelebrationType !== SpecialCelebrationTypeEnum.StrongTime &&
            liturgyDayInformation.SpecialCelebration.SpecialCelebrationType !== SpecialCelebrationTypeEnum.SpecialDay) {
            celebrationInformation.Title = "Octava de Nadal";
        }
        else if (liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_CENDRA) {
            celebrationInformation.Title = "Cendra";
        }
        else if (liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.A_FERIES) {
            celebrationInformation.Title = "Fèria d’Advent";
        }
    }
    return celebrationInformation;
}