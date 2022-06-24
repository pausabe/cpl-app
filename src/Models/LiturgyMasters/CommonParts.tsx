import resolveAssetSource from "expo-asset/build/resolveAssetSource.web";

export class LectureOfTheOffice{
    Reference: string;
    Quote: string;
    Title: string;
    Lecture: string;
    Responsory: ShortResponsory;
}

export class HourCommonParts{
    LatinAnthem: string;
    CatalanAnthem: string;
    Antiphon: string;
    ShortReading: ShortReading;
    Responsory: Responsory;
    FinalPrayer: string;
}

export class ShortReading{
    Quote: string;
    ShortReading: string;
}

export class Psalm{
    constructor(input: {
                    antiphon: string;
                    title: string;
                    comment: string;
                    psalm: string,
                    hasGloryPrayer: boolean
                }) {
        this.Antiphon = input.antiphon;
        this.Title = input.title;
        this.Comment = input.comment;
        this.Psalm = input.psalm;
        this.HasGloryPrayer = input.hasGloryPrayer;
    }
    Antiphon: string;
    Title: string;
    Comment: string;
    Psalm: string;
    HasGloryPrayer: boolean;
}

export class Responsory{
    constructor({
        versicle,
        response
                }) {
        this.Versicle = versicle;
        this.Response = response;
    }
    Versicle: string;
    Response: string;
}

class ShortResponsory{
    Quote: string;
    FirstPart: string;
    SecondPart: string;
    ThirdPart: string;
}

export class Celebration{
    Diocese : string;
    Category : string;
    Precedence: string;
    Day : string;
    WeekDay: string;
    LiturgicalTime : string;
    Title : string;
    Description : string;
}