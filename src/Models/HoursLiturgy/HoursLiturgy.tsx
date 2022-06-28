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
    FirstVespers : Vespers;
    SecondVespers : Vespers;
    NightPrayer : NightPrayer;
    // TODO:
    papa: TABLES.diversos.item(38).oracio,
    bisbe: TABLES.diversos.item(GF.bisbeId(diocesiName)).oracio,
}