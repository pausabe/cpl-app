import Office from './Office';
import Hours from './Hours';
import Laudes from './Laudes';
import NightPrayer from './NightPrayer';
import Vespers from './Vespers';
import Invitation from './Invitation';
import CelebrationInformation from './CelebrationInformation';
import ConcreteNamesInPrayers from './ConcreteNamesInPrayers';

export default class HoursLiturgy {
  todayCelebrationInformation: CelebrationInformation = new CelebrationInformation();
  tomorrowCelebrationInformation: CelebrationInformation = new CelebrationInformation();
  concreteNamesInPrayers: ConcreteNamesInPrayers = new ConcreteNamesInPrayers();
  invitation: Invitation = new Invitation();
  office: Office = new Office();
  laudes: Laudes = new Laudes();
  hours: Hours = new Hours();
  vespersOptions: VespersOptions = new VespersOptions();
  vespers: Vespers = new Vespers();
  nightPrayer: NightPrayer = new NightPrayer();
}

export class VespersOptions {
  vespersWithoutCelebration: Vespers = new Vespers();
  tomorrowFirstVespersWithCelebration: Vespers = new Vespers();
  todaySecondVespersWithCelebration: Vespers = new Vespers();
}
