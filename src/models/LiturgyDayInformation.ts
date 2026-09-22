import { GenericLiturgyTimeType, SpecificLiturgyTimeType } from '../services/celebrationTimeEnums';
import { CelebrationType } from '../services/databaseEnums';

export default class LiturgyDayInformation {
  today: LiturgySpecificDayInformation = new LiturgySpecificDayInformation();
  tomorrow: LiturgySpecificDayInformation = new LiturgySpecificDayInformation();
}

export class LiturgySpecificDayInformation {
  date: Date;
  celebrationType: CelebrationType;
  movedDay: MovedDay = new MovedDay();
  liturgyColor: string;
  pentecostDay: Date;
  genericLiturgyTime: GenericLiturgyTimeType;
  specificLiturgyTime: SpecificLiturgyTimeType;
  weekCycle: string; //1-4
  week: string; //Ordinary: 1-34, Easter: 2-7 and Lent: 1-5 or 2-7
  yearType: string;
  yearIsEven: boolean;
  dayOfTheWeek: number;
  dayOfTheWeekNameShort: string;
  specialCelebration: SpecialCelebration = new SpecialCelebration();
  isSpecialChristmas: boolean;
}

class MovedDay {
  todayIsMoved: boolean;
  originDateShortDatabaseCode: string;
  originDate: Date;
  dioceseCode2Letters: string;
}

export class SpecialCelebration {
  specialCelebrationType: SpecialCelebrationTypeEnum = SpecialCelebrationTypeEnum.CelebrationNotSpecial;

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

  updateType() {
    // In case of coincidences: SpecialDay > SolemnityAndFestivity > StrongTimes
    if (this._specialDaysMasterIdentifier !== NoIdentifierNumber) {
      this.specialCelebrationType = SpecialCelebrationTypeEnum.SpecialDay;
    } else if (this._solemnityAndFestivityMasterIdentifier !== NoIdentifierNumber) {
      this.specialCelebrationType = SpecialCelebrationTypeEnum.SolemnityAndFestivity;
    } else if (this._strongTimesMasterIdentifier !== NoIdentifierNumber) {
      this.specialCelebrationType = SpecialCelebrationTypeEnum.StrongTime;
    } else {
      this.specialCelebrationType = SpecialCelebrationTypeEnum.CelebrationNotSpecial;
    }
  }
}

export const NoIdentifierNumber = -1;

export enum SpecialCelebrationTypeEnum {
  CelebrationNotSpecial = 'CelebrationNotSpecial',
  SpecialDay = 'SpecialDay',
  SolemnityAndFestivity = 'SolemnityAndFestivity',
  StrongTime = 'StrongTime',
}
