import {GenericLiturgyTimeType, SpecificLiturgyTimeType} from "../Services/CelebrationTimeEnums";
import {CelebrationType} from "../Services/DatabaseEnums";

export default class LiturgyDayInformation {
    Today : LiturgySpecificDayInformation = new LiturgySpecificDayInformation();
    Tomorrow : LiturgySpecificDayInformation = new LiturgySpecificDayInformation();
}

export class LiturgySpecificDayInformation {
    Date: Date;
    CelebrationType: CelebrationType;
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
    DayOfTheWeekNameShort: string;
    SpecialCelebration: SpecialCelebration = new SpecialCelebration();
    IsSpecialChristmas: boolean;
}

class MovedDay{
    TodayIsMoved: boolean;
    OriginDateShortDatabaseCode: string;
    OriginDate: Date;
    DioceseCode2Letters: string
}

export class SpecialCelebration{
    SpecialCelebrationType: SpecialCelebrationTypeEnum = SpecialCelebrationTypeEnum.CelebrationNotSpecial;

    _specialDaysMasterIdentifier: number = NoIdentifierNumber;
    get SpecialDaysMasterIdentifier() {
        return this._specialDaysMasterIdentifier;
    }
    set SpecialDaysMasterIdentifier(value) {
        this._specialDaysMasterIdentifier = value;
        this.updateType();
    }

    _solemnityAndFestivityMasterIdentifier: number = NoIdentifierNumber;
    get SolemnityAndFestivityMasterIdentifier() {
        return this._solemnityAndFestivityMasterIdentifier;
    }
    set SolemnityAndFestivityMasterIdentifier(value) {
        this._solemnityAndFestivityMasterIdentifier = value;
        this.updateType();
    }

    _strongTimesMasterIdentifier: number = NoIdentifierNumber;
    get StrongTimesMasterIdentifier() {
        return this._strongTimesMasterIdentifier;
    }
    set StrongTimesMasterIdentifier(value) {
        this._strongTimesMasterIdentifier = value;
        this.updateType();
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
    CelebrationNotSpecial = "CelebrationNotSpecial",
    SpecialDay = "SpecialDay",
    SolemnityAndFestivity = "SolemnityAndFestivity",
    StrongTime = "StrongTime"
}