class LectureOfTheOffice{
    Reference: string;
    Quote: string;
    Title: string;
    Lecture: string;
    Responsory: ShortResponsory;
}

class HourCommonParts{
    LatinAnthem: string;
    CatalanAnthem: string;
    Antiphon: string;
    ShortReading: ShortReading;
    Responsory: Responsory;
    FinalPrayer: string;
}

class ShortReading{
    Quote: string;
    ShortReading: string;
}

class Psalm{
    Antiphon: string;
    Title: string;
    Comment: string;
    Psalm: string;
    HasGloryPrayer: boolean;
}

class Responsory{
    Versicle: string;
    Response: string;
}

class ShortResponsory{
    Quote: string;
    FirstPart: string;
    SecondPart: string;
    ThirdPart: string;
}