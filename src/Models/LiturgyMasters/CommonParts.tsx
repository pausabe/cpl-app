export class ReadingOfTheOffice {
    Reference: string;
    Quote: string;
    Title: string;
    Reading: string;
    Responsory: ShortResponsory = new ShortResponsory();
}

export class HourCommonParts{
    LatinAnthem: string;
    CatalanAnthem: string;
    Antiphon: string;
    ShortReading: ShortReading = new ShortReading();
    Responsory: Responsory = new Responsory();
    FinalPrayer: string;
}

export class ShortReading{
    Quote: string;
    ShortReading: string;
}

export class Psalm{
    Antiphon: string;
    Title: string;
    Comment: string;
    Psalm: string;
    HasGloryPrayer: boolean;
}

export class Responsory{
    Versicle: string;
    Response: string;
}

export class ShortResponsory{
    Quote: string;
    FirstPart: string;
    SecondPart: string;
    ThirdPart: string;
    HasSpecialAntiphon: boolean;
    SpecialAntiphon: string;
}

export class Celebration{
    Diocese : string;
    Category : string;
    CelebrationType: string;
    Precedence: string;
    Day : string;
    WeekDay: string;
    LiturgicalTime : string;
    Title : string;
    Description : string;
}