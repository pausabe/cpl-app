export default class LiturgyDayInformation {
    Today : LiturgySpecificDayInformation = new LiturgySpecificDayInformation();
    Tomorrow : LiturgySpecificDayInformation = new LiturgySpecificDayInformation();
}

export class LiturgySpecificDayInformation {
    Date: Date;
    CelebrationType: string; // '-', 'F', 'S'
    MovedDay: MovedDay = new MovedDay();
    LiturgyColor: string;
    PentecostDay: Date;
    GenericLiturgyTime: string;
    SpecificLiturgyTime: string;
    WeekCycle: string; //1-4
    Week: string; //Ordinary: 1-34, Easter: 2-7 and Lent: 1-5 or 2-7
    YearType: string;
    YearIsEven: boolean;
    DayOfTheWeek: number;
    SpecialCelebration: SpecialCelebration = new SpecialCelebration();
}

class MovedDay{
    Date: string;
    DioceseName: string
}

export class SpecialCelebration{
    SomeCelebration: boolean = false;
    SpecialDaysMasterIdentifier: number = -1;
    SolemnityAndFestivityMasterIdentifier: number = -1;
    StrongTimesMasterIdentifier: number = -1;
}