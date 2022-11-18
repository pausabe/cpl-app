import {GenericLiturgyTimeType, SpecificLiturgyTimeType} from "../Services/CelebrationTimeEnums";

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
    GenericLiturgyTime: GenericLiturgyTimeType;
    SpecificLiturgyTime: SpecificLiturgyTimeType;
    WeekCycle: string; //1-4
    Week: string; //Ordinary: 1-34, Easter: 2-7 and Lent: 1-5 or 2-7
    YearType: string;
    YearIsEven: boolean;
    DayOfTheWeek: number;
    SpecialCelebration: SpecialCelebration = new SpecialCelebration();
}

class MovedDay{
    Date: string;
    DioceseCode: string
}

export class SpecialCelebration{
    SpecialCelebrationType: SpecialCelebrationTypeEnum = SpecialCelebrationTypeEnum.CelebrationNotSpecial;

    _specialDaysMasterIdentifier: number = NoIdentifierNumber;
    get SpecialDaysMasterIdentifier() {
        return this._specialDaysMasterIdentifier;
    }
    set SpecialDaysMasterIdentifier(value) {
        this.updateType();
        this._specialDaysMasterIdentifier = value;
    }

    _solemnityAndFestivityMasterIdentifier: number = NoIdentifierNumber;
    get SolemnityAndFestivityMasterIdentifier() {
        return this._solemnityAndFestivityMasterIdentifier;
    }
    set SolemnityAndFestivityMasterIdentifier(value) {
        this.updateType();
        this._solemnityAndFestivityMasterIdentifier = value;
    }

    _strongTimesMasterIdentifier: number = NoIdentifierNumber;
    get StrongTimesMasterIdentifier() {
        return this._strongTimesMasterIdentifier;
    }
    set StrongTimesMasterIdentifier(value) {
        this.updateType();
        this._strongTimesMasterIdentifier = value;
    }

    updateType(){
        // In case of coincidences: SpecialDay > SolemnityAndFestivity > StrongTimes
        if(this._specialDaysMasterIdentifier !== NoIdentifierNumber){
            this.SpecialCelebrationType = SpecialCelebrationTypeEnum.SpecialDay;
        }
        else if(this._solemnityAndFestivityMasterIdentifier !== NoIdentifierNumber){
            this.SpecialCelebrationType = SpecialCelebrationTypeEnum.SolemnityAndFestivity;
        }
        else if(this._strongTimesMasterIdentifier !== NoIdentifierNumber){
            this.SpecialCelebrationType = SpecialCelebrationTypeEnum.StrongTime;
        }
        else{
            this.SpecialCelebrationType = SpecialCelebrationTypeEnum.CelebrationNotSpecial;
        }
    }
}

export const NoIdentifierNumber = -1;

export enum SpecialCelebrationTypeEnum{
    CelebrationNotSpecial,
    SpecialDay,
    SolemnityAndFestivity,
    StrongTime
}