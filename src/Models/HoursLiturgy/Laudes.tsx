import {Psalm, ShortReading, ShortResponsory} from "../LiturgyMasters/CommonParts";

export default class Laudes {
    Anthem: string;
    FirstPsalm: Psalm = new Psalm();
    SecondPsalm: Psalm = new Psalm();
    ThirdPsalm: Psalm = new Psalm();
    ShortReading: ShortReading = new ShortReading();
    ShortResponsory: ShortResponsory = new ShortResponsory();
    EvangelicalChant: string;
    EvangelicalAntiphon: string;
    Prayers: string;
    FinalPrayer: string;
}