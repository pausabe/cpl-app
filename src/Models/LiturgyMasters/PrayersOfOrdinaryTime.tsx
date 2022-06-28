export default class PrayersOfOrdinaryTime {
    static MasterName: string = "tempsOrdinariOracions";

    constructor(databaseRow) {
        this.Id = databaseRow.id;
        this.FinalPrayer = databaseRow.oracio;
        this.FirstVespersEvangelicalAntiphonYearA = databaseRow.antMaria1A;
        this.FirstVespersEvangelicalAntiphonYearB = databaseRow.antMaria1B;
        this.FirstVespersEvangelicalAntiphonYearC = databaseRow.antMaria1C;
        this.LaudesEvangelicalAntiphonYearA = databaseRow.antZacariesA;
        this.LaudesEvangelicalAntiphonYearB = databaseRow.antZacariesB;
        this.LaudesEvangelicalAntiphonYearC = databaseRow.antZacariesC;
        this.SecondVespersEvangelicalAntiphonYearA = databaseRow.antMaria2A;
        this.SecondVespersEvangelicalAntiphonYearB = databaseRow.antMaria2B;
        this.SecondVespersEvangelicalAntiphonYearC = databaseRow.antMaria2C;
    }

    Id: number;
    FinalPrayer: string;
    FirstVespersEvangelicalAntiphonYearA: string;
    FirstVespersEvangelicalAntiphonYearB: string;
    FirstVespersEvangelicalAntiphonYearC: string;
    LaudesEvangelicalAntiphonYearA: string;
    LaudesEvangelicalAntiphonYearB: string;
    LaudesEvangelicalAntiphonYearC: string;
    SecondVespersEvangelicalAntiphonYearA: string;
    SecondVespersEvangelicalAntiphonYearB: string;
    SecondVespersEvangelicalAntiphonYearC: string;
}