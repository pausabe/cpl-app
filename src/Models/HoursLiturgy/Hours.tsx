import {Psalm, Responsory, ShortReading} from "../LiturgyMasters/CommonParts";

export default class Hours {
    ThirdHour: SpecificHour = new SpecificHour();
    SixthHour: SpecificHour = new SpecificHour();
    NinthHour: SpecificHour = new SpecificHour();
}

export class SpecificHour{
    Anthem: string;
    HasMultipleAntiphons: boolean;
    UniqueAntiphon: string;
    FirstPsalm: Psalm = new Psalm();
    SecondPsalm: Psalm = new Psalm();
    ThirdPsalm: Psalm = new Psalm();
    ShortReading: ShortReading = new ShortReading();
    Responsory: Responsory = new Responsory();
    FinalPrayer: string;
}