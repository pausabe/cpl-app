import {Psalm, Responsory, ShortReading, ShortResponsory} from "../LiturgyMasters/CommonParts";

export default class NightPrayer {
    Anthem: string;
    HasMultiplePsalms: boolean;
    FirstPsalm: Psalm = new Psalm();
    SecondPsalm: Psalm = new Psalm();
    ShortReading: ShortReading = new ShortReading();
    ShortResponsory: ShortResponsory = new ShortResponsory();
    Responsory: Responsory = new Responsory();
    EvangelicalAntiphon: string;
    EvangelicalChant: string;
    FinalPrayer: string;
}