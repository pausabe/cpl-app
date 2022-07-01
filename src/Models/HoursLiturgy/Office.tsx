import {ReadingOfTheOffice, Psalm, Responsory} from "../LiturgyMasters/CommonParts";

export default class Office {
    Anthem: string;
    FirstPsalm: Psalm = new Psalm();
    SecondPsalm: Psalm = new Psalm();
    ThirdPsalm: Psalm = new Psalm();
    Responsory: Responsory = new Responsory();
    FirstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    SecondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    TeDeumInformation: TeDeumInformation = new TeDeumInformation();
    FinalPrayer: string;
}

export class TeDeumInformation{
    Enabled: boolean;
    Anthem: string;
}