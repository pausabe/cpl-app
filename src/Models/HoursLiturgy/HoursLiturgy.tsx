import Office from "./Office";
import Hours from "./Hours";
import Laudes from "./Laudes";
import NightPrayer from "./NightPrayer";
import Vespers from "./Vespers";
import Invitation from "./Invitation";
import CelebrationInformation from "./CelebrationInformation";
import ConcreteNamesInPrayers from "./ConcreteNamesInPrayers";

export default class HoursLiturgy {
    CelebrationInformation: CelebrationInformation = new CelebrationInformation();
    ConcreteNamesInPrayers: ConcreteNamesInPrayers = new ConcreteNamesInPrayers();
    Invitation : Invitation = new Invitation();
    Office : Office = new Office();
    Laudes : Laudes = new Laudes();
    Hours : Hours = new Hours();
    VespersOptions: VespersOptions = new VespersOptions();
    Vespers : Vespers = new Vespers();
    NightPrayer : NightPrayer = new NightPrayer();
}

export class VespersOptions{
    VespersWithoutCelebration : Vespers = new Vespers();
    TomorrowFirstVespersWithCelebration : Vespers = new Vespers();
    TodaySecondVespersWithCelebration : Vespers = new Vespers();
}