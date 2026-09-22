import * as CelebrationHoursLiturgyService from './celebrationHoursLiturgyService';
import HoursLiturgy, { VespersOptions } from '../../models/hours-liturgy/HoursLiturgy';
import liturgyDayInformation from '../../models/LiturgyDayInformation';
import LiturgyMasters from '../../models/liturgy-masters/LiturgyMasters';
import * as InvitationService from './invitationService';
import * as OfficeService from './officeService';
import * as LaudesService from './laudesService';
import * as VespersService from './vespersService';
import * as HoursService from './hoursService';
import * as NightPrayerService from './nightPrayerService';
import * as CelebrationInformationService from './celebrationInformationService';
import { Settings } from '../../models/Settings';
import LiturgyDayInformation from '../../models/LiturgyDayInformation';
import Vespers from '../../models/hours-liturgy/Vespers';
import CelebrationInformation from '../../models/hours-liturgy/CelebrationInformation';
import * as ConcreteNamesInPrayers from './concreteNamesInPrayersService';
import { StringManagement } from '../../utils/StringManagement';

export async function obtainHoursLiturgy(
  todayLiturgyMasters: LiturgyMasters,
  tomorrowLiturgyMasters: LiturgyMasters,
  liturgyDayInformation: liturgyDayInformation,
  settings: Settings,
): Promise<HoursLiturgy> {
  let hoursLiturgy = new HoursLiturgy();
  const celebrationHoursLiturgy = CelebrationHoursLiturgyService.obtainCelebrationHoursLiturgy(
    todayLiturgyMasters,
    tomorrowLiturgyMasters,
    liturgyDayInformation,
    settings,
  );
  hoursLiturgy.TodayCelebrationInformation = CelebrationInformationService.obtainCelebrationInformation(
    liturgyDayInformation.Today,
    celebrationHoursLiturgy.TodayCelebrationInformation,
  );
  hoursLiturgy.TomorrowCelebrationInformation = CelebrationInformationService.obtainCelebrationInformation(
    liturgyDayInformation.Tomorrow,
    celebrationHoursLiturgy.TomorrowCelebrationInformation,
  );
  hoursLiturgy.ConcreteNamesInPrayers = ConcreteNamesInPrayers.obtainConcreteNamesInPrayers(
    todayLiturgyMasters,
    settings,
  );
  hoursLiturgy.Invitation = InvitationService.obtainInvitation(
    todayLiturgyMasters,
    liturgyDayInformation.Today,
    celebrationHoursLiturgy.Invitation,
  );
  hoursLiturgy.Office = OfficeService.obtainOffice(
    todayLiturgyMasters,
    liturgyDayInformation.Today,
    celebrationHoursLiturgy.Office,
    settings,
  );
  hoursLiturgy.Laudes = LaudesService.obtainLaudes(
    todayLiturgyMasters,
    liturgyDayInformation.Today,
    celebrationHoursLiturgy.Laudes,
    settings,
  );
  hoursLiturgy.VespersOptions.TomorrowFirstVespersWithCelebration =
    celebrationHoursLiturgy.VespersOptions.TomorrowFirstVespersWithCelebration;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration =
    celebrationHoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration;
  hoursLiturgy.VespersOptions.VespersWithoutCelebration = VespersService.obtainVespers(
    todayLiturgyMasters,
    liturgyDayInformation.Today,
    settings,
  );
  hoursLiturgy.Vespers = getVespersWithLowerPrecedence(
    todayLiturgyMasters,
    liturgyDayInformation,
    hoursLiturgy.TodayCelebrationInformation,
    hoursLiturgy.TomorrowCelebrationInformation,
    settings,
    hoursLiturgy.VespersOptions,
  );
  hoursLiturgy.Hours = HoursService.obtainHours(
    todayLiturgyMasters,
    liturgyDayInformation.Today,
    celebrationHoursLiturgy.Hours,
    settings,
  );
  hoursLiturgy.NightPrayer = NightPrayerService.obtainNightPrayer(
    todayLiturgyMasters,
    liturgyDayInformation.Today,
    settings,
  );
  return hoursLiturgy;
}

export function getVespersWithLowerPrecedence(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgyDayInformation,
  todayCelebrationInformation: CelebrationInformation,
  tomorrowCelebrationInformation: CelebrationInformation,
  settings: Settings,
  vespersOptions: VespersOptions,
): Vespers {
  /* Tomorrow could be more important but that doesn't mean we must have First vespers.
     If tomorrow is Festivity, it could seems that tomorrow is more important but Festivity usually don't have first vespers.
     Therefore, in these cases, Vespers Without Celebration will actually be empty and the merge will actually do nothing.
    */

  if (
    tomorrowIsMoreImportant(
      todayCelebrationInformation.Precedence,
      tomorrowCelebrationInformation.Precedence,
      vespersOptions.TodaySecondVespersWithCelebration,
      vespersOptions.TomorrowFirstVespersWithCelebration,
    )
  ) {
    return VespersService.mergeVespersWithCelebration(
      liturgyMasters,
      liturgyDayInformation.Tomorrow,
      settings,
      vespersOptions.VespersWithoutCelebration,
      vespersOptions.TomorrowFirstVespersWithCelebration,
    );
  } else {
    return VespersService.mergeVespersWithCelebration(
      liturgyMasters,
      liturgyDayInformation.Today,
      settings,
      vespersOptions.VespersWithoutCelebration,
      vespersOptions.TodaySecondVespersWithCelebration,
    );
  }
}

function tomorrowIsMoreImportant(
  todayPrecedence: number,
  tomorrowPrecedence: number,
  todayFirstVespersWithCelebration: Vespers,
  tomorrowSecondVespersWithCelebration: Vespers,
): boolean {
  if (todayPrecedence === tomorrowPrecedence) {
    // When is the same precedence, we decide by the emptiness of the content.
    // TODO: If both celebrations have content, we should decide by another factor. We could create a "hardcoded" list of celebrations.
    return (
      StringManagement.hasLiturgyContent(tomorrowSecondVespersWithCelebration.EvangelicalAntiphon) &&
      !StringManagement.hasLiturgyContent(todayFirstVespersWithCelebration.EvangelicalAntiphon)
    );
  }

  return tomorrowPrecedence < todayPrecedence;
}
