export default class LiturgyDayInformation {
    Today : LiturgySpecificDayInformation = new LiturgySpecificDayInformation();
    Tomorrow : LiturgySpecificDayInformation = new LiturgySpecificDayInformation();
}

export class LiturgySpecificDayInformation {
    CelebrationType: string;
    MovedDay: MovedDay = new MovedDay();
    LiturgyColor: string;
    PentecostDay: Date;
    GenericLiturgyTime: string;
    SpecificLiturgyTime: string;
    WeekCycle: number; //1-4
    Week: number; //Ordinary: 1-34, Easter: 2-7 and Lent: 1-5 or 2-7
    YearType: string;
    YearIsEven: boolean;
    DayOfTheWeek: number;
    TomorrowInformation: TomorrowInformation = new TomorrowInformation();
}

class TomorrowInformation{
    CelebrationType: string;
}

class MovedDay{
    Date: string;
    DioceseName: string
}