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
  hoursLiturgy.todayCelebrationInformation = CelebrationInformationService.obtainCelebrationInformation(
    liturgyDayInformation.today,
    celebrationHoursLiturgy.todayCelebrationInformation,
  );
  hoursLiturgy.tomorrowCelebrationInformation = CelebrationInformationService.obtainCelebrationInformation(
    liturgyDayInformation.tomorrow,
    celebrationHoursLiturgy.tomorrowCelebrationInformation,
  );
  hoursLiturgy.concreteNamesInPrayers = ConcreteNamesInPrayers.obtainConcreteNamesInPrayers(
    todayLiturgyMasters,
    settings,
  );
  hoursLiturgy.invitation = InvitationService.obtainInvitation(
    todayLiturgyMasters,
    liturgyDayInformation.today,
    celebrationHoursLiturgy.invitation,
  );
  hoursLiturgy.office = OfficeService.obtainOffice(
    todayLiturgyMasters,
    liturgyDayInformation.today,
    celebrationHoursLiturgy.office,
    settings,
  );
  hoursLiturgy.laudes = LaudesService.obtainLaudes(
    todayLiturgyMasters,
    liturgyDayInformation.today,
    celebrationHoursLiturgy.laudes,
    settings,
  );
  hoursLiturgy.vespersOptions.tomorrowFirstVespersWithCelebration =
    celebrationHoursLiturgy.vespersOptions.tomorrowFirstVespersWithCelebration;
  hoursLiturgy.vespersOptions.todaySecondVespersWithCelebration =
    celebrationHoursLiturgy.vespersOptions.todaySecondVespersWithCelebration;
  hoursLiturgy.vespersOptions.vespersWithoutCelebration = VespersService.obtainVespers(
    todayLiturgyMasters,
    liturgyDayInformation.today,
    settings,
  );
  hoursLiturgy.vespers = getVespersWithLowerPrecedence(
    todayLiturgyMasters,
    liturgyDayInformation,
    hoursLiturgy.todayCelebrationInformation,
    hoursLiturgy.tomorrowCelebrationInformation,
    settings,
    hoursLiturgy.vespersOptions,
  );
  hoursLiturgy.hours = HoursService.obtainHours(
    todayLiturgyMasters,
    liturgyDayInformation.today,
    celebrationHoursLiturgy.hours,
    settings,
  );
  hoursLiturgy.nightPrayer = NightPrayerService.obtainNightPrayer(
    todayLiturgyMasters,
    liturgyDayInformation.today,
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
      todayCelebrationInformation.precedence,
      tomorrowCelebrationInformation.precedence,
      vespersOptions.todaySecondVespersWithCelebration,
      vespersOptions.tomorrowFirstVespersWithCelebration,
    )
  ) {
    return VespersService.mergeVespersWithCelebration(
      liturgyMasters,
      liturgyDayInformation.tomorrow,
      settings,
      vespersOptions.vespersWithoutCelebration,
      vespersOptions.tomorrowFirstVespersWithCelebration,
    );
  } else {
    return VespersService.mergeVespersWithCelebration(
      liturgyMasters,
      liturgyDayInformation.today,
      settings,
      vespersOptions.vespersWithoutCelebration,
      vespersOptions.todaySecondVespersWithCelebration,
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
      StringManagement.hasLiturgyContent(tomorrowSecondVespersWithCelebration.evangelicalAntiphon) &&
      !StringManagement.hasLiturgyContent(todayFirstVespersWithCelebration.evangelicalAntiphon)
    );
  }

  return tomorrowPrecedence < todayPrecedence;
}
