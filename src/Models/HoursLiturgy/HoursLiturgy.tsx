import Office from "./Office";
import Hours from "./Hours";
import Laudes from "./Laudes";
import NightPrayer from "./NightPrayer";
import Vespers from "./Vespers";
import Invitation from "./Invitation";
import CelebrationInformation from "./CelebrationInformation";

export default class HoursLiturgy {
    CelebrationInformation: CelebrationInformation = new CelebrationInformation();
    Invitation : Invitation = new Invitation();
    Office : Office = new Office();
    Laudes : Laudes = new Laudes();
    Hours : Hours = new Hours();
    VespersOptions: VespersOptions = new VespersOptions();
    Vespers : Vespers = new Vespers();
    NightPrayer : NightPrayer = new NightPrayer();
    // TODO: maybe in other place
    //papa: TABLES.diversos.item(38).oracio,
    //bisbe: TABLES.diversos.item(GF.bisbeId(diocesiName)).oracio,
}

export class VespersOptions{
    VespersWithoutCelebration : Vespers = new Vespers();
    TomorrowFirstVespersWithCelebration : Vespers = new Vespers();
    TodaySecondVespersWithCelebration : Vespers = new Vespers();
}