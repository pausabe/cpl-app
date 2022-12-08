import * as CelebrationIdentifier from "../CelebrationIdentifierService";

export function IsHolyDaysOfObligation(date: Date): boolean {
    return CelebrationIdentifier.IsMatherOfGod(date) ||
        CelebrationIdentifier.IsEpiphany(date) ||
        CelebrationIdentifier.IsAssumption(date) ||
        CelebrationIdentifier.IsAllSaints(date) ||
        CelebrationIdentifier.IsImmaculateConception(date) ||
        CelebrationIdentifier.IsChristmas(date);
}

export function IsHolyDaysButNotObligated(date: Date): boolean {
    return CelebrationIdentifier.IsSaintJoseph(date) ||
        CelebrationIdentifier.IsSaintJohnBaptist(date) ||
        CelebrationIdentifier.IsSantsPerePau(date) ||
        CelebrationIdentifier.IsSaintJames(date);
}