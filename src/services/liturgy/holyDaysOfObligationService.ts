import * as CelebrationIdentifier from '../celebrationIdentifierService';
import { Celebration } from '../celebrationIdentifierService';
import { LiturgySpecificDayInformation } from '../../models/LiturgyDayInformation';

export function isHolyDaysOfObligation(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
  return (
    CelebrationIdentifier.checkCelebration(Celebration.MatherOfGod, liturgySpecificDayInformation) ||
    CelebrationIdentifier.checkCelebration(Celebration.Epiphany, liturgySpecificDayInformation) ||
    CelebrationIdentifier.checkCelebration(Celebration.Assumption, liturgySpecificDayInformation) ||
    CelebrationIdentifier.checkCelebration(Celebration.AllSaints, liturgySpecificDayInformation) ||
    CelebrationIdentifier.checkCelebration(Celebration.ImmaculateConception, liturgySpecificDayInformation) ||
    CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgySpecificDayInformation)
  );
}

export function isHolyDaysButNotObligated(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
  return (
    CelebrationIdentifier.checkCelebration(Celebration.SaintJoseph, liturgySpecificDayInformation) ||
    CelebrationIdentifier.checkCelebration(Celebration.SaintJohnBaptist, liturgySpecificDayInformation) ||
    CelebrationIdentifier.checkCelebration(Celebration.SaintsPereAndPau, liturgySpecificDayInformation) ||
    CelebrationIdentifier.checkCelebration(Celebration.SaintJames, liturgySpecificDayInformation)
  );
}
