import * as CelebrationHoursLiturgyService from "./CelebrationHoursLiturgyService";
import HoursLiturgy, {VespersOptions} from "../../Models/HoursLiturgy/HoursLiturgy";
import liturgyDayInformation from "../../Models/LiturgyDayInformation";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import * as InvitationService from "./InvitationService";
import * as OfficeService from "./OfficeService";
import * as LaudesService from "./LaudesService";
import * as VespersService from "./VespersService";
import * as HoursService from "./HoursService";
import * as NightPrayerService from "./NightPrayerService";
import * as CelebrationInformationService from "./CelebrationInformationService";
import {Settings} from "../../Models/Settings";
import LiturgyDayInformation from "../../Models/LiturgyDayInformation";
import Vespers from "../../Models/HoursLiturgy/Vespers";
import CelebrationInformation from "../../Models/HoursLiturgy/CelebrationInformation";
import * as ConcreteNamesInPrayers from "./ConcreteNamesInPrayersService";
import {StringManagement} from "../../Utils/StringManagement";

export async function ObtainHoursLiturgy(todayLiturgyMasters: LiturgyMasters, tomorrowLiturgyMasters: LiturgyMasters, liturgyDayInformation: liturgyDayInformation, settings: Settings): Promise<HoursLiturgy> {
    let hoursLiturgy = new HoursLiturgy();
    const celebrationHoursLiturgy = CelebrationHoursLiturgyService.ObtainCelebrationHoursLiturgy(todayLiturgyMasters, tomorrowLiturgyMasters, liturgyDayInformation, settings);
    hoursLiturgy.TodayCelebrationInformation =
        CelebrationInformationService.ObtainCelebrationInformation(liturgyDayInformation.Today, celebrationHoursLiturgy.TodayCelebrationInformation);
    hoursLiturgy.TomorrowCelebrationInformation =
        CelebrationInformationService.ObtainCelebrationInformation(liturgyDayInformation.Tomorrow, celebrationHoursLiturgy.TomorrowCelebrationInformation);
    hoursLiturgy.ConcreteNamesInPrayers = ConcreteNamesInPrayers.ObtainConcreteNamesInPrayers(todayLiturgyMasters, settings);
    hoursLiturgy.Invitation = InvitationService.ObtainInvitation(todayLiturgyMasters, liturgyDayInformation.Today, celebrationHoursLiturgy.Invitation);
    hoursLiturgy.Office = OfficeService.ObtainOffice(todayLiturgyMasters, liturgyDayInformation.Today, celebrationHoursLiturgy.Office, settings);
    hoursLiturgy.Laudes = LaudesService.ObtainLaudes(todayLiturgyMasters, liturgyDayInformation.Today, celebrationHoursLiturgy.Laudes, settings);
    hoursLiturgy.VespersOptions.TomorrowFirstVespersWithCelebration = celebrationHoursLiturgy.VespersOptions.TomorrowFirstVespersWithCelebration;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration = celebrationHoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration;
    hoursLiturgy.VespersOptions.VespersWithoutCelebration = VespersService.ObtainVespers(todayLiturgyMasters, liturgyDayInformation.Today, settings);
    hoursLiturgy.Vespers =
        GetVespersWithLowerPrecedence(todayLiturgyMasters, liturgyDayInformation, hoursLiturgy.TodayCelebrationInformation, hoursLiturgy.TomorrowCelebrationInformation, settings, hoursLiturgy.VespersOptions);
    hoursLiturgy.Hours = HoursService.ObtainHours(todayLiturgyMasters, liturgyDayInformation.Today, celebrationHoursLiturgy.Hours, settings);
    hoursLiturgy.NightPrayer = NightPrayerService.ObtainNightPrayer(todayLiturgyMasters, liturgyDayInformation.Today, settings);
    return hoursLiturgy;
}

export function GetVespersWithLowerPrecedence(liturgyMasters: LiturgyMasters, liturgyDayInformation: LiturgyDayInformation, todayCelebrationInformation: CelebrationInformation, tomorrowCelebrationInformation: CelebrationInformation, settings: Settings, vespersOptions: VespersOptions): Vespers {
    /* Tomorrow could be more important but that doesn't mean we must have First vespers.
     If tomorrow is Festivity, it could seems that tomorrow is more important but Festivity usually don't have first vespers.
     Therefore, in these cases, Vespers Without Celebration will actually be empty and the merge will actually do nothing.
    */
    
    if (TomorrowIsMoreImportant(
        todayCelebrationInformation.Precedence, 
        tomorrowCelebrationInformation.Precedence,
        vespersOptions.TodaySecondVespersWithCelebration,
        vespersOptions.TomorrowFirstVespersWithCelebration)) {
        return VespersService.MergeVespersWithCelebration(
            liturgyMasters, 
            liturgyDayInformation.Tomorrow, 
            settings,
            vespersOptions.VespersWithoutCelebration, 
            vespersOptions.TomorrowFirstVespersWithCelebration);
    } else {
        return VespersService.MergeVespersWithCelebration(
            liturgyMasters, 
            liturgyDayInformation.Today, 
            settings,
            vespersOptions.VespersWithoutCelebration, 
            vespersOptions.TodaySecondVespersWithCelebration);
    }
}

function TomorrowIsMoreImportant(
    todayPrecedence: number,
    tomorrowPrecedence: number,
    todayFirstVespersWithCelebration: Vespers,
    tomorrowSecondVespersWithCelebration: Vespers): boolean{

    if(todayPrecedence === tomorrowPrecedence){
        // When is the same precedence, we decide by the emptiness of the content.
        // TODO: If both celebrations have content, we should decide by another factor. We could create a "hardcoded" list of celebrations.
        return StringManagement.HasLiturgyContent(tomorrowSecondVespersWithCelebration.EvangelicalAntiphon)
            && !StringManagement.HasLiturgyContent(todayFirstVespersWithCelebration.EvangelicalAntiphon);
    }

    return tomorrowPrecedence < todayPrecedence;
}