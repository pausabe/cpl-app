import * as CelebrationHoursLiturgyService from "./CelebrationHoursLiturgyService";
import HoursLiturgy, {VespersOptions} from "../../Models/HoursLiturgy/HoursLiturgy";
import {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import * as InvitationService from "./InvitationService";
import * as OfficeService from "./OfficeService";
import * as LaudesService from "./LaudesService";
import * as VespersService from "./VespersService";
import * as HoursService from "./HoursService";
import * as NightPrayerService from "./NightPrayerService";
import * as PrecedenceService from "../PrecedenceService";
import {VesperOptionEnum} from "../PrecedenceService";
import {Settings} from "../../Models/Settings";
import Vespers from "../../Models/HoursLiturgy/Vespers";

export async function ObtainHoursLiturgy(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, settings : Settings) : Promise<HoursLiturgy> {
  let hoursLiturgy = new HoursLiturgy();
  const celebrationHoursLiturgy = CelebrationHoursLiturgyService.ObtainCelebrationHoursLiturgy(liturgyMasters, liturgyDayInformation, settings);
  hoursLiturgy.Invitation = InvitationService.ObtainInvitation(liturgyMasters, liturgyDayInformation, celebrationHoursLiturgy.Invitation);
  hoursLiturgy.Office = OfficeService.ObtainOffice(liturgyMasters, liturgyDayInformation, celebrationHoursLiturgy.Office, settings);
  hoursLiturgy.Laudes = LaudesService.ObtainLaudes(liturgyMasters, liturgyDayInformation, celebrationHoursLiturgy.Laudes, settings);
  hoursLiturgy.VespersOptions.TomorrowFirstVespersWithCelebration = celebrationHoursLiturgy.VespersOptions.TomorrowFirstVespersWithCelebration;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration = celebrationHoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration;
  hoursLiturgy.VespersOptions.TomorrowFirstVespersWithoutCelebration = VespersService.ObtainFirstVespers(liturgyMasters, liturgyDayInformation, settings);
  hoursLiturgy.VespersOptions.TodaySecondVespersWithoutCelebration = VespersService.ObtainSecondVespers(liturgyMasters, liturgyDayInformation, settings);
  hoursLiturgy.Vespers = GetVespersWithLowerPrecedence(liturgyMasters, liturgyDayInformation, settings, hoursLiturgy.VespersOptions);
  hoursLiturgy.Hours = HoursService.ObtainHours(liturgyMasters, liturgyDayInformation, celebrationHoursLiturgy.Hours, settings);
  hoursLiturgy.NightPrayer = NightPrayerService.ObtainNightPrayer(liturgyMasters, liturgyDayInformation, celebrationHoursLiturgy.NightPrayer, settings);
  return hoursLiturgy;
}

export function GetVespersWithLowerPrecedence(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, settings : Settings, vespersOptions: VespersOptions) : VesperOptionEnum{
  // Low precedence level value implies more importance

  let withoutCelebrationVespers = vespersOptions.TodaySecondVespersWithoutCelebration;
  if(vespersOptions.TomorrowFirstVespersWithoutCelebration.PrecedenceLevel <= vespersOptions.TodaySecondVespersWithoutCelebration.PrecedenceLevel){
    withoutCelebrationVespers = vespersOptions.TomorrowFirstVespersWithoutCelebration;
  }
  let withCelebrationVespers = vespersOptions.TodaySecondVespersWithCelebration;
  if(vespersOptions.TomorrowFirstVespersWithCelebration.PrecedenceLevel <= vespersOptions.TodaySecondVespersWithCelebration.PrecedenceLevel){
    withCelebrationVespers = vespersOptions.TomorrowFirstVespersWithCelebration;
  }
  if(withoutCelebrationVespers.PrecedenceLevel <= withCelebrationVespers.PrecedenceLevel){
    return withoutCelebrationVespers;
  }
  else{
    return VespersService.MergeVespersWithCelebration(liturgyMasters, liturgyDayInformation, settings, withoutCelebrationVespers, withCelebrationVespers);
  }
}