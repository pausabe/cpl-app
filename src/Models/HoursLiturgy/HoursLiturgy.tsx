import Office from "./Office";
import Hours from "./Hours";
import Laudes from "./Laudes";
import NightPrayer from "./NightPrayer";
import Vespers from "./Vespers";
import Invitation from "./Invitation";

export default class HoursLiturgy {
    Invitation : Invitation;
    Office : Office;
    Laudes : Laudes;
    Hours : Hours;
    VespersOptions: VespersOptions = new VespersOptions();
    Vespers : Vespers;
    NightPrayer : NightPrayer;
    // TODO: maybe in other place
    papa: TABLES.diversos.item(38).oracio,
    bisbe: TABLES.diversos.item(GF.bisbeId(diocesiName)).oracio,
}

export class VespersOptions{
    TomorrowFirstVespersWithoutCelebration : Vespers = new Vespers();
    TodaySecondVespersWithoutCelebration : Vespers = new Vespers();
    TomorrowFirstVespersWithCelebration : Vespers = new Vespers();
    TodaySecondVespersWithCelebration : Vespers = new Vespers();
}