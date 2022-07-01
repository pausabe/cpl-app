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
import {Settings} from "../../Models/Settings";
import LiturgyDayInformation from "../../Models/LiturgyDayInformation";
import Vespers from "../../Models/HoursLiturgy/Vespers";
import {CelebrationType} from "../DatabaseEnums";

export async function ObtainHoursLiturgy(liturgyMasters : LiturgyMasters, liturgyDayInformation : liturgyDayInformation, settings : Settings) : Promise<HoursLiturgy> {
  let hoursLiturgy = new HoursLiturgy();
  const celebrationHoursLiturgy = CelebrationHoursLiturgyService.ObtainCelebrationHoursLiturgy(liturgyMasters, liturgyDayInformation.Today, settings);
  hoursLiturgy.CelebrationInformation = celebrationHoursLiturgy.CelebrationInformation;
  hoursLiturgy.Invitation = InvitationService.ObtainInvitation(liturgyMasters, liturgyDayInformation.Today, celebrationHoursLiturgy.Invitation);
  hoursLiturgy.Office = OfficeService.ObtainOffice(liturgyMasters, liturgyDayInformation.Today, celebrationHoursLiturgy.Office, settings);
  hoursLiturgy.Laudes = LaudesService.ObtainLaudes(liturgyMasters, liturgyDayInformation.Today, celebrationHoursLiturgy.Laudes, settings);
  hoursLiturgy.VespersOptions.TomorrowFirstVespersWithCelebration = celebrationHoursLiturgy.VespersOptions.TomorrowFirstVespersWithCelebration;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration = celebrationHoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration;
  hoursLiturgy.VespersOptions.VespersWithoutCelebration = VespersService.ObtainVespers(liturgyMasters, liturgyDayInformation.Today, settings);
  hoursLiturgy.Vespers = GetVespersWithLowerPrecedence(liturgyMasters, liturgyDayInformation, settings, hoursLiturgy.VespersOptions);
  hoursLiturgy.Hours = HoursService.ObtainHours(liturgyMasters, liturgyDayInformation.Today, celebrationHoursLiturgy.Hours, settings);
  hoursLiturgy.NightPrayer = NightPrayerService.ObtainNightPrayer(liturgyMasters, liturgyDayInformation.Today, celebrationHoursLiturgy.NightPrayer, settings);
  return hoursLiturgy;
}

export function GetVespersWithLowerPrecedence(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgyDayInformation, settings : Settings, vespersOptions: VespersOptions) : Vespers{
  // Low precedence level value implies more importance

  if(liturgyDayInformation.Today.PrecedenceLevel <= liturgyDayInformation.Tomorrow.PrecedenceLevel){
    if(liturgyDayInformation.Today.CelebrationType === CelebrationType.Fair){
      return vespersOptions.VespersWithoutCelebration;
    }
    else{
      return VespersService.MergeVespersWithCelebration(liturgyMasters, liturgyDayInformation.Today, settings, vespersOptions.VespersWithoutCelebration, vespersOptions.TodaySecondVespersWithCelebration);
    }
  }
  else{
    if(liturgyDayInformation.Tomorrow.CelebrationType === CelebrationType.Fair){
      return vespersOptions.VespersWithoutCelebration;
    }
    else{
      return VespersService.MergeVespersWithCelebration(liturgyMasters, liturgyDayInformation.Tomorrow, settings, vespersOptions.VespersWithoutCelebration, vespersOptions.TomorrowFirstVespersWithCelebration);
    }
  }
}