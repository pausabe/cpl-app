import Vespers from "../../Models/HoursLiturgy/Vespers";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";
import {Settings} from "../../Models/Settings";
import {Psalm, ShortReading, ShortResponsory} from "../../Models/LiturgyMasters/CommonParts";
import {YearType} from "../DatabaseEnums";
import {SpecificLiturgyTimeType} from "../CelebrationTimeEnums";
import {StringManagement} from "../../Utils/StringManagement";
import * as CelebrationIdentifier from "../CelebrationIdentifierService";
import {Celebration} from "../CelebrationIdentifierService";

export function ObtainVespers(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgySpecificDayInformation, settings: Settings): Vespers {
    let vespers = new Vespers();
    vespers.Anthem = GetAnthem(liturgyMasters, liturgyDayInformation, settings);
    const psalmody = GetPsalmody(liturgyMasters, liturgyDayInformation);
    vespers.FirstPsalm = psalmody.FirstPsalm;
    vespers.SecondPsalm = psalmody.SecondPsalm;
    vespers.ThirdPsalm = psalmody.ThirdPsalm;
    vespers.ShortReading = GetShortReading(liturgyMasters, liturgyDayInformation);
    vespers.ShortResponsory = GetShortResponsory(liturgyMasters, liturgyDayInformation);
    vespers.EvangelicalAntiphon = GetEvangelicalAntiphon(liturgyMasters, liturgyDayInformation);
    vespers.Prayers = GetPrayers(liturgyMasters, liturgyDayInformation);
    vespers.FinalPrayer = GetFinalPrayer(liturgyMasters, liturgyDayInformation);
    vespers.EvangelicalChant = liturgyMasters.Various.VespersEvangelicalChant;
    vespers.Title = liturgyDayInformation.DayOfTheWeek === 6 ? "Primeres vespres de diumenge" : "";
    return vespers;
}

export function MergeVespersWithCelebration(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgySpecificDayInformation, settings: Settings, withoutCelebrationVespers: Vespers, withCelebrationVespers: Vespers): Vespers {
    let vespers = withoutCelebrationVespers;
    if (liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
        vespers = withCelebrationVespers;
    } else {
        let weUsedSomeCelebrationPart = false;
        if (StringManagement.HasLiturgyContent(withCelebrationVespers.Anthem)) {
            weUsedSomeCelebrationPart = true;
            vespers.Anthem = withCelebrationVespers.Anthem;
        }
        if (StringManagement.HasLiturgyContent(withCelebrationVespers.FirstPsalm.Antiphon)) {
            weUsedSomeCelebrationPart = true;
            vespers.FirstPsalm.Antiphon = withCelebrationVespers.FirstPsalm.Antiphon;
        }
        if (StringManagement.HasLiturgyContent(withCelebrationVespers.FirstPsalm.Title)) {
            weUsedSomeCelebrationPart = true;
            vespers.FirstPsalm = withCelebrationVespers.FirstPsalm;
        }
        if (StringManagement.HasLiturgyContent(withCelebrationVespers.SecondPsalm.Antiphon)) {
            weUsedSomeCelebrationPart = true;
            vespers.SecondPsalm.Antiphon = withCelebrationVespers.SecondPsalm.Antiphon;
        }
        if (StringManagement.HasLiturgyContent(withCelebrationVespers.SecondPsalm.Title)) {
            weUsedSomeCelebrationPart = true;
            vespers.SecondPsalm = withCelebrationVespers.SecondPsalm;
        }
        if (StringManagement.HasLiturgyContent(withCelebrationVespers.ThirdPsalm.Antiphon)) {
            weUsedSomeCelebrationPart = true;
            vespers.ThirdPsalm.Antiphon = withCelebrationVespers.ThirdPsalm.Antiphon;
        }
        if (StringManagement.HasLiturgyContent(withCelebrationVespers.ThirdPsalm.Title)) {
            weUsedSomeCelebrationPart = true;
            vespers.ThirdPsalm = withCelebrationVespers.ThirdPsalm;
        }
        if (StringManagement.HasLiturgyContent(withCelebrationVespers.ShortReading.ShortReading)) {
            weUsedSomeCelebrationPart = true;
            vespers.ShortReading = withCelebrationVespers.ShortReading;
        }
        if (StringManagement.HasLiturgyContent(withCelebrationVespers.ShortResponsory.FirstPart)) {
            weUsedSomeCelebrationPart = true;
            vespers.ShortResponsory = withCelebrationVespers.ShortResponsory;
        }
        if (StringManagement.HasLiturgyContent(withCelebrationVespers.EvangelicalAntiphon)) {
            weUsedSomeCelebrationPart = true;
            vespers.EvangelicalAntiphon = withCelebrationVespers.EvangelicalAntiphon;
        }
        if (StringManagement.HasLiturgyContent(withCelebrationVespers.Prayers)) {
            weUsedSomeCelebrationPart = true;
            vespers.Prayers = withCelebrationVespers.Prayers;
        }
        if (StringManagement.HasLiturgyContent(withCelebrationVespers.FinalPrayer)) {
            weUsedSomeCelebrationPart = true;
            vespers.FinalPrayer = withCelebrationVespers.FinalPrayer;
        }

        if (weUsedSomeCelebrationPart) {
            vespers.Title = withCelebrationVespers.Title;
        }
    }
    return vespers;
}

function GetAnthem(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgySpecificDayInformation, settings: Settings): string {
    let anthem = settings.UseLatin ? liturgyMasters.VespersCommonPsalter.LatinAnthem : liturgyMasters.VespersCommonPsalter.CatalanAnthem;
    switch (liturgyDayInformation.SpecificLiturgyTime) {
        case SpecificLiturgyTimeType.LentAshes:
        case SpecificLiturgyTimeType.LentWeeks:
            if (liturgyDayInformation.DayOfTheWeek === 0 || liturgyDayInformation.DayOfTheWeek === 6) {
                if (settings.UseLatin) {
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.VespersSundaysLatinAnthem;
                } else {
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.VespersSundaysCatalanAnthem;
                }
            } else {
                if (settings.UseLatin) {
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.VespersFairsLatinAnthem;
                } else {
                    anthem = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.VespersFairsCatalanAnthem;
                }
            }
            break;
        case SpecificLiturgyTimeType.PalmSunday:
        case SpecificLiturgyTimeType.HolyWeek:
            if (settings.UseLatin) {
                anthem = liturgyMasters.CommonPartsOfHolyWeek.VespersLatinAnthem;
            } else {
                anthem = liturgyMasters.CommonPartsOfHolyWeek.VespersCatalanAnthem;
            }
            break;
        case SpecificLiturgyTimeType.LentTriduum:
            if (settings.UseLatin) {
                anthem = liturgyMasters.PartsOfEasterTriduum.VespersLatinAnthem;
            } else {
                anthem = liturgyMasters.PartsOfEasterTriduum.VespersCatalanAnthem;
            }
            break;
        case SpecificLiturgyTimeType.EasterOctave:
            if (settings.UseLatin) {
                anthem = liturgyMasters.PartsOfEasterBeforeAscension.VespersWeekendLatinAnthem;
            } else {
                anthem = liturgyMasters.PartsOfEasterBeforeAscension.VespersWeekendCatalanAnthem;
            }
            break;
        case SpecificLiturgyTimeType.EasterWeeks:
            if (liturgyDayInformation.Week === '7') {
                if (settings.UseLatin) {
                    anthem = liturgyMasters.PartsOfEasterAfterAscension.VespersLatinAnthem;
                } else {
                    anthem = liturgyMasters.PartsOfEasterAfterAscension.VespersCatalanAnthem;
                }
            } else {
                if (liturgyDayInformation.DayOfTheWeek === 6 || liturgyDayInformation.DayOfTheWeek === 0) {
                    if (settings.UseLatin) {
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.VespersWeekendLatinAnthem;
                    } else {
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.VespersWeekendCatalanAnthem;
                    }
                } else {
                    if (settings.UseLatin) {
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.VespersWorkdaysLatinAnthem;
                    } else {
                        anthem = liturgyMasters.PartsOfEasterBeforeAscension.VespersWorkdaysCatalanAnthem;
                    }
                }
            }
            break;
        case SpecificLiturgyTimeType.AdventWeeks:
        case SpecificLiturgyTimeType.AdventFairs:
        case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
            if (liturgyDayInformation.SpecificLiturgyTime != SpecificLiturgyTimeType.ChristmasBeforeOrdinary ||
                (liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
                    liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13)) {
                if (settings.UseLatin) {
                    anthem = liturgyMasters.CommonAdventAndChristmasParts.VespersLatinAnthem;
                } else {
                    anthem = liturgyMasters.CommonAdventAndChristmasParts.VespersCatalanAnthem;
                }
            }
            break;
        case SpecificLiturgyTimeType.ChristmasOctave:
            if (settings.UseLatin) {
                anthem = liturgyMasters.SolemnityAndFestivityParts.SecondVespersLatinAnthem;
            } else {
                anthem = liturgyMasters.SolemnityAndFestivityParts.SecondVespersCatalanAnthem;
            }
            break;
    }
    return anthem;
}

function GetPsalmody(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgySpecificDayInformation): { FirstPsalm: Psalm, SecondPsalm: Psalm, ThirdPsalm: Psalm } {
    let psalmody = {
        FirstPsalm: liturgyMasters.VespersCommonPsalter.FirstPsalm,
        SecondPsalm: liturgyMasters.VespersCommonPsalter.SecondPsalm,
        ThirdPsalm: liturgyMasters.VespersCommonPsalter.ThirdPsalm
    }
    switch (liturgyDayInformation.SpecificLiturgyTime) {
        case SpecificLiturgyTimeType.AdventFairs:
            if (liturgyDayInformation.DayOfTheWeek !== 0) {
                psalmody.FirstPsalm.Antiphon = liturgyMasters.AdventFairDaysAntiphons.FirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.AdventFairDaysAntiphons.SecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.AdventFairDaysAntiphons.ThirdAntiphon;
            }
            break;
        case SpecificLiturgyTimeType.LentWeeks:
        case SpecificLiturgyTimeType.LentAshes:
            if (liturgyDayInformation.DayOfTheWeek === 6) {
                psalmody.FirstPsalm.Antiphon = liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts.FirstVespersFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts.FirstVespersSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts.FirstVespersThirdAntiphon;
            } else if (liturgyDayInformation.DayOfTheWeek === 0) {
                psalmody.FirstPsalm.Antiphon = liturgyMasters.FiveWeeksOfSundayLentParts.SecondVespersFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.FiveWeeksOfSundayLentParts.SecondVespersSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.FiveWeeksOfSundayLentParts.SecondVespersThirdAntiphon;
            }
            break;
        case SpecificLiturgyTimeType.PalmSunday:
            if (liturgyDayInformation.DayOfTheWeek === 0) {
                psalmody.FirstPsalm.Antiphon = liturgyMasters.PalmSundayParts.SecondVespersFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.PalmSundayParts.SecondVespersSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.PalmSundayParts.SecondVespersThirdAntiphon;
            }
            break;
        case SpecificLiturgyTimeType.HolyWeek:
            psalmody.FirstPsalm.Antiphon = liturgyMasters.PartsOfHolyWeek.VespersFirstAntiphon;
            psalmody.SecondPsalm.Antiphon = liturgyMasters.PartsOfHolyWeek.VespersSecondAntiphon;
            psalmody.ThirdPsalm.Antiphon = liturgyMasters.PartsOfHolyWeek.VespersThirdAntiphon;
            break;
        case SpecificLiturgyTimeType.LentTriduum:
            psalmody.FirstPsalm = liturgyMasters.PartsOfEasterTriduum.VespersFirstPsalm;
            psalmody.FirstPsalm.Comment = "-";
            psalmody.SecondPsalm = liturgyMasters.PartsOfEasterTriduum.VespersSecondPsalm;
            psalmody.SecondPsalm.Comment = "-";
            psalmody.ThirdPsalm = liturgyMasters.PartsOfEasterTriduum.VespersThirdPsalm;
            psalmody.ThirdPsalm.Comment = "-";
            break;
        case SpecificLiturgyTimeType.EasterOctave:
            psalmody.FirstPsalm = liturgyMasters.EasterSunday.VespersFirstPsalm;
            psalmody.FirstPsalm.Comment = "-";
            psalmody.SecondPsalm = liturgyMasters.EasterSunday.VespersSecondPsalm;
            psalmody.SecondPsalm.Comment = "-";
            psalmody.ThirdPsalm = liturgyMasters.EasterSunday.VespersThirdPsalm;
            psalmody.ThirdPsalm.Comment = "-";
            break;
        case SpecificLiturgyTimeType.EasterWeeks:
            if (liturgyDayInformation.DayOfTheWeek === 6 &&
                StringManagement.HasLiturgyContent(liturgyMasters.EasterFirstVespersOfSundayParts.FirstVespersFirstAntiphon)) {
                psalmody.FirstPsalm.Antiphon = liturgyMasters.EasterFirstVespersOfSundayParts.FirstVespersFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.EasterFirstVespersOfSundayParts.FirstVespersSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.EasterFirstVespersOfSundayParts.FirstVespersThirdAntiphon;
            } else if (liturgyDayInformation.DayOfTheWeek === 0) {
                psalmody.FirstPsalm.Antiphon = liturgyMasters.EasterSundayParts.SecondVespersFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.EasterSundayParts.SecondVespersSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.EasterSundayParts.SecondVespersThirdAntiphon;
            } else {
                psalmody.FirstPsalm.Antiphon = liturgyMasters.CommonSpecialPartsOfEaster.VespersFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.CommonSpecialPartsOfEaster.VespersSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.CommonSpecialPartsOfEaster.VespersThirdAntiphon;
            }
            break;
        case SpecificLiturgyTimeType.AdventWeeks:
            if (liturgyDayInformation.DayOfTheWeek === 6 &&
                StringManagement.HasLiturgyContent(liturgyMasters.AdventFirstVespersOfSundayParts.FirstVespersFirstAntiphon)) {
                psalmody.FirstPsalm.Antiphon = liturgyMasters.AdventFirstVespersOfSundayParts.FirstVespersFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.AdventFirstVespersOfSundayParts.FirstVespersSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.AdventFirstVespersOfSundayParts.FirstVespersThirdAntiphon;
            } else if (liturgyDayInformation.DayOfTheWeek === 0) {
                psalmody.FirstPsalm.Antiphon = liturgyMasters.AdventSundayParts.SecondVespersFirstAntiphon;
                psalmody.SecondPsalm.Antiphon = liturgyMasters.AdventSundayParts.SecondVespersSecondAntiphon;
                psalmody.ThirdPsalm.Antiphon = liturgyMasters.AdventSundayParts.SecondVespersThirdAntiphon;
            }
            break;
        case SpecificLiturgyTimeType.ChristmasOctave:
            psalmody.FirstPsalm = liturgyMasters.SolemnityAndFestivityParts.SecondVespersFirstPsalm;
            psalmody.FirstPsalm.Comment = "-";
            psalmody.FirstPsalm.HasGloryPrayer = true;
            psalmody.SecondPsalm = liturgyMasters.SolemnityAndFestivityParts.SecondVespersSecondPsalm;
            psalmody.SecondPsalm.Comment = "-";
            psalmody.SecondPsalm.HasGloryPrayer = true;
            psalmody.ThirdPsalm = liturgyMasters.SolemnityAndFestivityParts.SecondVespersThirdPsalm;
            psalmody.ThirdPsalm.Comment = "-";
            psalmody.ThirdPsalm.HasGloryPrayer = true;
            break;
    }

    if (liturgyDayInformation.DayOfTheWeek === 0 &&
        (liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.HolyWeek ||
            liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.LentWeeks ||
            liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday)) {
        psalmody.ThirdPsalm.Title = "Càntic 1Pe 2, 21-24\nLa passió voluntària del Crist, el servent de Déu";
        psalmody.ThirdPsalm.Comment = '-';
        psalmody.ThirdPsalm.Psalm = liturgyMasters.Various.SpecialVesperChant;
        psalmody.ThirdPsalm.HasGloryPrayer = true;
    }
    return psalmody;
}

function GetShortReading(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgySpecificDayInformation): ShortReading {
    let shortReading = liturgyMasters.VespersCommonPsalter.ShortReading;
    switch (liturgyDayInformation.SpecificLiturgyTime) {
        case SpecificLiturgyTimeType.LentAshes:
            return liturgyMasters.PartsOfLentTime.VespersShortReading;
        case SpecificLiturgyTimeType.LentWeeks:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.VespersShortReading;
        case SpecificLiturgyTimeType.PalmSunday:
            return liturgyMasters.PalmSundayParts.SecondVespersShortReading;
        case SpecificLiturgyTimeType.HolyWeek:
            return liturgyMasters.PartsOfHolyWeek.VespersShortReading;
        case SpecificLiturgyTimeType.LentTriduum:
            return liturgyMasters.PartsOfEasterTriduum.VespersShortReading;
        case SpecificLiturgyTimeType.EasterOctave:
            return liturgyMasters.PartsOfEasterOctave.VespersShortReading;
        case SpecificLiturgyTimeType.EasterWeeks:
            return liturgyMasters.EasterWeekParts.VespersShortReading;
        case SpecificLiturgyTimeType.AdventWeeks:
            return liturgyMasters.AdventWeekParts.VespersShortReading;
        case SpecificLiturgyTimeType.AdventFairs:
            return liturgyMasters.AdventFairDaysParts.VespersShortReading;
        case SpecificLiturgyTimeType.ChristmasOctave:
            if (!CelebrationIdentifier.CheckCelebration(Celebration.Christmas, liturgyDayInformation)) {
                return liturgyMasters.ChristmasWhenOctaveParts.VespersShortReading;
            }
            break;
        case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
            if (liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
                liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13) {
                return liturgyMasters.ChristmasBeforeEpiphanyParts.VespersShortReading;
            }
            break;
    }
    return shortReading;
}

function GetShortResponsory(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgySpecificDayInformation): ShortResponsory {
    let shortResponsory = liturgyMasters.VespersCommonPsalter.ShortResponsory;
    shortResponsory.HasSpecialAntiphon = false;
    switch (liturgyDayInformation.SpecificLiturgyTime) {
        case SpecificLiturgyTimeType.LentAshes:
            return liturgyMasters.PartsOfLentTime.VespersShortResponsory;
        case SpecificLiturgyTimeType.LentWeeks:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.VespersShortResponsory;
        case SpecificLiturgyTimeType.PalmSunday:
            return liturgyMasters.PalmSundayParts.SecondVespresShortResponsory;
        case SpecificLiturgyTimeType.HolyWeek:
            return liturgyMasters.PartsOfHolyWeek.VespersShortResponsory;
        case SpecificLiturgyTimeType.EasterWeeks:
            return liturgyMasters.EasterWeekParts.VespersShortResponsory;
        case SpecificLiturgyTimeType.AdventWeeks:
            return liturgyMasters.AdventWeekParts.VespersShortResponsory;
        case SpecificLiturgyTimeType.AdventFairs:
            return liturgyMasters.AdventFairDaysParts.VespersShortResponsory;
        case SpecificLiturgyTimeType.ChristmasOctave:
            if (!CelebrationIdentifier.CheckCelebration(Celebration.Christmas, liturgyDayInformation)) {
                return liturgyMasters.ChristmasWhenOctaveParts.VespersShortResponsory;
            }
            break;
        case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
            if (liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13) {
                return liturgyMasters.ChristmasBeforeEpiphanyParts.VespersShortResponsory;
            }
            break;
        case SpecificLiturgyTimeType.LentTriduum:
            return liturgyMasters.PartsOfEasterTriduum.VespersShortResponsory;
        case SpecificLiturgyTimeType.EasterOctave:
            return liturgyMasters.PartsOfEasterOctave.VespersShortResponsory;
    }
    return shortResponsory;
}

function GetEvangelicalAntiphon(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgySpecificDayInformation): string {
    let evangelicalAntiphon;
    if (liturgyDayInformation.DayOfTheWeek !== 0 && liturgyDayInformation.DayOfTheWeek !== 6) {
        evangelicalAntiphon = liturgyMasters.VespersCommonPsalter.EvangelicalAntiphon;
    } else {
        if (liturgyDayInformation.DayOfTheWeek === 6 &&
            StringManagement.HasLiturgyContent(liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers.FirstVespersEvangelicalAntiphonYearA)) {
            switch (liturgyDayInformation.YearType) {
                case YearType.A:
                    evangelicalAntiphon = liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers.FirstVespersEvangelicalAntiphonYearA;
                    break;
                case YearType.B:
                    evangelicalAntiphon = liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers.FirstVespersEvangelicalAntiphonYearB;
                    break;
                case YearType.C:
                    evangelicalAntiphon = liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers.FirstVespersEvangelicalAntiphonYearC;
                    break;
            }
        } else {
            switch (liturgyDayInformation.YearType) {
                case YearType.A:
                    evangelicalAntiphon = liturgyMasters.PrayersOfOrdinaryTime.SecondVespersEvangelicalAntiphonYearA;
                    break;
                case YearType.B:
                    evangelicalAntiphon = liturgyMasters.PrayersOfOrdinaryTime.SecondVespersEvangelicalAntiphonYearB;
                    break;
                case YearType.C:
                    evangelicalAntiphon = liturgyMasters.PrayersOfOrdinaryTime.SecondVespersEvangelicalAntiphonYearC;
                    break;
            }
        }
    }
    switch (liturgyDayInformation.SpecificLiturgyTime) {
        case SpecificLiturgyTimeType.LentAshes:
            switch (liturgyDayInformation.YearType) {
                case YearType.A:
                    evangelicalAntiphon = liturgyMasters.PartsOfLentTime.VespersEvangelicalAntiphonYearA;
                    break;
                case YearType.B:
                    evangelicalAntiphon = liturgyMasters.PartsOfLentTime.VespersEvangelicalAntiphonYearB;
                    break;
                case YearType.C:
                    evangelicalAntiphon = liturgyMasters.PartsOfLentTime.VespersEvangelicalAntiphonYearC;
                    break;
            }
            if (evangelicalAntiphon === '-') {
                evangelicalAntiphon = liturgyMasters.PartsOfLentTime.VespersEvangelicalAntiphon;
            }
            break;
        case SpecificLiturgyTimeType.LentWeeks:
            if (liturgyDayInformation.DayOfTheWeek !== 0 && liturgyDayInformation.DayOfTheWeek !== 6) {
                evangelicalAntiphon = liturgyMasters.PartsOfFiveWeeksOfLentTime.VespersEvangelicalAntiphon;
            } else {
                if (liturgyDayInformation.DayOfTheWeek === 6 &&
                    StringManagement.HasLiturgyContent(liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts.FirstVespersEvangelicalAntiphonYearA)) {
                    switch (liturgyDayInformation.YearType) {
                        case YearType.A:
                            evangelicalAntiphon = liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts.FirstVespersEvangelicalAntiphonYearA;
                            break;
                        case YearType.B:
                            evangelicalAntiphon = liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts.FirstVespersEvangelicalAntiphonYearB;
                            break;
                        case YearType.C:
                            evangelicalAntiphon = liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts.FirstVespersEvangelicalAntiphonYearC;
                            break;
                    }
                } else {
                    switch (liturgyDayInformation.YearType) {
                        case YearType.A:
                            evangelicalAntiphon = liturgyMasters.FiveWeeksOfSundayLentParts.SecondVespersEvangelicalAntiphonYearA;
                            break;
                        case YearType.B:
                            evangelicalAntiphon = liturgyMasters.FiveWeeksOfSundayLentParts.SecondVespersEvangelicalAntiphonYearB;
                            break;
                        case YearType.C:
                            evangelicalAntiphon = liturgyMasters.FiveWeeksOfSundayLentParts.SecondVespersEvangelicalAntiphonYearC;
                            break;
                    }
                }
            }
            break;
        case SpecificLiturgyTimeType.PalmSunday:
            switch (liturgyDayInformation.YearType) {
                case YearType.A:
                    evangelicalAntiphon = liturgyMasters.PalmSundayParts.SecondVespersEvangelicalAntiphonYearA;
                    break;
                case YearType.B:
                    evangelicalAntiphon = liturgyMasters.PalmSundayParts.SecondVespersEvangelicalAntiphonYearB;
                    break;
                case YearType.C:
                    evangelicalAntiphon = liturgyMasters.PalmSundayParts.SecondVespersEvangelicalAntiphonYearC;
                    break;
            }
            break;
        case SpecificLiturgyTimeType.HolyWeek:
            evangelicalAntiphon = liturgyMasters.PartsOfHolyWeek.VespersEvangelicalAntiphon;
            break;
        case SpecificLiturgyTimeType.LentTriduum:
            evangelicalAntiphon = liturgyMasters.PartsOfEasterTriduum.VespersEvangelicalAntiphon;
            break;
        case SpecificLiturgyTimeType.EasterOctave:
            evangelicalAntiphon = liturgyMasters.PartsOfEasterOctave.VespersEvangelicalAntiphon;
            break;
        case SpecificLiturgyTimeType.EasterWeeks:
            if (liturgyDayInformation.DayOfTheWeek !== 6 && liturgyDayInformation.DayOfTheWeek !== 0) {
                evangelicalAntiphon = liturgyMasters.EasterWeekParts.VespersEvangelicalAntiphon;
            } else {
                if (liturgyDayInformation.DayOfTheWeek === 6 &&
                    StringManagement.HasLiturgyContent(liturgyMasters.EasterFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearA)) {
                    switch (liturgyDayInformation.YearType) {
                        case YearType.A:
                            evangelicalAntiphon = liturgyMasters.EasterFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearA;
                            break;
                        case YearType.B:
                            evangelicalAntiphon = liturgyMasters.EasterFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearB;
                            break;
                        case YearType.C:
                            evangelicalAntiphon = liturgyMasters.EasterFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearC;
                            break;
                    }
                } else {
                    switch (liturgyDayInformation.YearType) {
                        case YearType.A:
                            evangelicalAntiphon = liturgyMasters.EasterSundayParts.SecondVespersEvangelicalAntiphonYearA;
                            break;
                        case YearType.B:
                            evangelicalAntiphon = liturgyMasters.EasterSundayParts.SecondVespersEvangelicalAntiphonYearB;
                            break;
                        case YearType.C:
                            evangelicalAntiphon = liturgyMasters.EasterSundayParts.SecondVespersEvangelicalAntiphonYearC;
                            break;
                    }
                }
            }
            break;
        case SpecificLiturgyTimeType.AdventWeeks:
            if (liturgyDayInformation.DayOfTheWeek !== 6 && liturgyDayInformation.DayOfTheWeek !== 0) {
                evangelicalAntiphon = liturgyMasters.AdventWeekParts.VespersEvangelicalAntiphon;
            } else {
                if (liturgyDayInformation.DayOfTheWeek === 6 &&
                    StringManagement.HasLiturgyContent(liturgyMasters.AdventFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearA)) {
                    switch (liturgyDayInformation.YearType) {
                        case YearType.A:
                            evangelicalAntiphon = liturgyMasters.AdventFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearA;
                            break;
                        case YearType.B:
                            evangelicalAntiphon = liturgyMasters.AdventFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearB;
                            break;
                        case YearType.C:
                            evangelicalAntiphon = liturgyMasters.AdventFirstVespersOfSundayParts.FirstVespersEvangelicalAntiphonYearC;
                            break;
                    }
                } else {
                    switch (liturgyDayInformation.YearType) {
                        case YearType.A:
                            evangelicalAntiphon = liturgyMasters.AdventSundayParts.SecondVespersEvangelicalAntiphonYearA;
                            break;
                        case YearType.B:
                            evangelicalAntiphon = liturgyMasters.AdventSundayParts.SecondVespersEvangelicalAntiphonYearB;
                            break;
                        case YearType.C:
                            evangelicalAntiphon = liturgyMasters.AdventSundayParts.SecondVespersEvangelicalAntiphonYearC;
                            break;
                    }
                }
            }
            break;
        case SpecificLiturgyTimeType.AdventFairs:
            evangelicalAntiphon = liturgyMasters.AdventFairDaysParts.VespersEvangelicalAntiphon;
            break;
        case SpecificLiturgyTimeType.ChristmasOctave:
            if (!CelebrationIdentifier.CheckCelebration(Celebration.Christmas, liturgyDayInformation)) {
                evangelicalAntiphon = liturgyMasters.ChristmasWhenOctaveParts.VespersEvangelicalAntiphon;
            }
            break;
        case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
            if (liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13) {
                evangelicalAntiphon = liturgyMasters.ChristmasBeforeEpiphanyParts.VespersEvangelicalAntiphon;
            }
            break;
    }
    return evangelicalAntiphon;
}

function GetPrayers(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgySpecificDayInformation): string {
    let prayers = liturgyMasters.VespersCommonPsalter.Prayers;
    switch (liturgyDayInformation.SpecificLiturgyTime) {
        case SpecificLiturgyTimeType.LentAshes:
            return liturgyMasters.PartsOfLentTime.VespersPrayers;
        case SpecificLiturgyTimeType.LentWeeks:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.VespersPrayers;
        case SpecificLiturgyTimeType.PalmSunday:
            return liturgyMasters.PalmSundayParts.SecondVespersPrayers;
        case SpecificLiturgyTimeType.HolyWeek:
            return liturgyMasters.PartsOfHolyWeek.VespersPrayers;
        case SpecificLiturgyTimeType.LentTriduum:
            return liturgyMasters.PartsOfEasterTriduum.VespersPrayers;
        case SpecificLiturgyTimeType.EasterOctave:
            return liturgyMasters.PartsOfEasterOctave.VespersPrayers;
        case SpecificLiturgyTimeType.EasterWeeks:
            return liturgyMasters.EasterWeekParts.VespersPrayers;
        case SpecificLiturgyTimeType.AdventWeeks:
            return liturgyMasters.AdventWeekParts.VespersPrayers;
        case SpecificLiturgyTimeType.AdventFairs:
            return liturgyMasters.AdventFairDaysParts.VespersPrayers;
        case SpecificLiturgyTimeType.ChristmasOctave:
            if (!CelebrationIdentifier.CheckCelebration(Celebration.Christmas, liturgyDayInformation)) {
                return liturgyMasters.ChristmasWhenOctaveParts.VespersPrayers;
            }
            break;
        case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
            if (liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13) {
                return liturgyMasters.ChristmasBeforeEpiphanyParts.VespersPrayers;
            }
            break;
    }
    return prayers;
}

function GetFinalPrayer(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgySpecificDayInformation): string {
    let finalPrayer = liturgyMasters.VespersCommonPsalter.FinalPrayer;
    if (liturgyDayInformation.DayOfTheWeek === 0) {
        finalPrayer = liturgyMasters.PrayersOfOrdinaryTime.FinalPrayer;
    } else if (liturgyDayInformation.DayOfTheWeek === 6 &&
        StringManagement.HasLiturgyContent(liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers.FinalPrayer)) {
        finalPrayer = liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers.FinalPrayer;
    }
    switch (liturgyDayInformation.SpecificLiturgyTime) {
        case SpecificLiturgyTimeType.LentAshes:
            return liturgyMasters.PartsOfLentTime.VespersFinalPrayer;
        case SpecificLiturgyTimeType.LentWeeks:
            return liturgyMasters.PartsOfFiveWeeksOfLentTime.VespersFinalPrayer;
        case SpecificLiturgyTimeType.PalmSunday:
            return liturgyMasters.PalmSundayParts.SecondVespersFinalPrayer;
        case SpecificLiturgyTimeType.HolyWeek:
            return liturgyMasters.PartsOfHolyWeek.VespersFinalPrayer;
        case SpecificLiturgyTimeType.LentTriduum:
            return liturgyMasters.PartsOfEasterTriduum.VespersFinalPrayer;
        case SpecificLiturgyTimeType.EasterOctave:
            return liturgyMasters.PartsOfEasterOctave.VespersFinalPrayer;
        case SpecificLiturgyTimeType.EasterWeeks:
            return liturgyMasters.EasterWeekParts.VespersFinalPrayer;
        case SpecificLiturgyTimeType.AdventWeeks:
            return liturgyMasters.AdventWeekParts.VespersFinalPrayer;
        case SpecificLiturgyTimeType.AdventFairs:
            return liturgyMasters.AdventFairDaysParts.VespersFinalPrayer;
        case SpecificLiturgyTimeType.ChristmasOctave:
            if (!CelebrationIdentifier.CheckCelebration(Celebration.Christmas, liturgyDayInformation)) {
                return liturgyMasters.ChristmasWhenOctaveParts.VespersFinalPrayer;
            }
            break;
        case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
            if (liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
                liturgyDayInformation.Date.getMonth() == 0 &&
                liturgyDayInformation.Date.getDate() != 13) {
                return liturgyMasters.ChristmasBeforeEpiphanyParts.VespersFinalPrayer;
            }
            break;
    }
    return finalPrayer;
}