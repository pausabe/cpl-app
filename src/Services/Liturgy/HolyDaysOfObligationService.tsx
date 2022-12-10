import * as CelebrationIdentifier from "../CelebrationIdentifierService";
import {Celebration} from "../CelebrationIdentifierService";
import {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";

export function IsHolyDaysOfObligation(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    return CelebrationIdentifier.CheckCelebration(Celebration.MatherOfGod, liturgySpecificDayInformation) ||
        CelebrationIdentifier.CheckCelebration(Celebration.Epiphany, liturgySpecificDayInformation) ||
        CelebrationIdentifier.CheckCelebration(Celebration.Assumption, liturgySpecificDayInformation) ||
        CelebrationIdentifier.CheckCelebration(Celebration.AllSaints, liturgySpecificDayInformation) ||
        CelebrationIdentifier.CheckCelebration(Celebration.ImmaculateConception, liturgySpecificDayInformation) ||
        CelebrationIdentifier.CheckCelebration(Celebration.Christmas, liturgySpecificDayInformation);
}

export function IsHolyDaysButNotObligated(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    return CelebrationIdentifier.CheckCelebration(Celebration.SaintJoseph, liturgySpecificDayInformation) ||
        CelebrationIdentifier.CheckCelebration(Celebration.SaintJohnBaptist, liturgySpecificDayInformation) ||
        CelebrationIdentifier.CheckCelebration(Celebration.SaintsPereAndPau, liturgySpecificDayInformation) ||
        CelebrationIdentifier.CheckCelebration(Celebration.SaintJames, liturgySpecificDayInformation);
}