export default class AdventSundayParts {
    static MasterName: string = "tempsAdventSetmanesDium";

    constructor(databaseRow) {
        this.Id = databaseRow.id;
        this.FirstVespersFirstAntiphon = databaseRow.ant1Vespres;
        this.FirstVespersSecondAntiphon = databaseRow.ant2Vespres;
        this.FirstVespersThirdAntiphon = databaseRow.ant3Vespres;
        this.FirstVespersEvangelicalAntiphonYearA = databaseRow.antMaria1A;
        this.FirstVespersEvangelicalAntiphonYearB = databaseRow.antMaria1B;
        this.FirstVespersEvangelicalAntiphonYearC = databaseRow.antMaria1C;
        this.OfficeFirstAntiphon = databaseRow.Ant1Ofici;
        this.OfficeSecondAntiphon = databaseRow.Ant2Ofici;
        this.OfficeThirdAntiphon = databaseRow.Ant3Ofici;
        this.LaudesFirstAntiphon = databaseRow.ant1Laudes;
        this.LaudesSecondAntiphon = databaseRow.ant2Laudes;
        this.LaudesThirdAntiphon = databaseRow.ant3Laudes;
        this.LaudesEvangelicalAntiphonYearA = databaseRow.antZacariesA;
        this.LaudesEvangelicalAntiphonYearB = databaseRow.antZacariesB;
        this.LaudesEvangelicalAntiphonYearC = databaseRow.antZacariesC;
        this.SecondVespersFirstAntiphon = databaseRow.ant1Vespres2;
        this.SecondVespersSecondAntiphon = databaseRow.ant2Vespres2;
        this.SecondVespersThirdAntiphon = databaseRow.ant3Vespres2;
        this.SecondVespersEvangelicalAntiphonYearA = databaseRow.antMaria2A;
        this.SecondVespersEvangelicalAntiphonYearB = databaseRow.antMaria2B;
        this.SecondVespersEvangelicalAntiphonYearC = databaseRow.antMaria2C;
    }

    Id: number;
    FirstVespersFirstAntiphon: string;
    FirstVespersSecondAntiphon: string;
    FirstVespersThirdAntiphon: string;
    FirstVespersEvangelicalAntiphonYearA: string;
    FirstVespersEvangelicalAntiphonYearB: string;
    FirstVespersEvangelicalAntiphonYearC: string;
    OfficeFirstAntiphon: string;
    OfficeSecondAntiphon: string;
    OfficeThirdAntiphon: string;
    LaudesFirstAntiphon: string;
    LaudesSecondAntiphon: string;
    LaudesThirdAntiphon: string;
    LaudesEvangelicalAntiphonYearA: string;
    LaudesEvangelicalAntiphonYearB: string;
    LaudesEvangelicalAntiphonYearC: string;
    SecondVespersFirstAntiphon: string;
    SecondVespersSecondAntiphon: string;
    SecondVespersThirdAntiphon: string;
    SecondVespersEvangelicalAntiphonYearA: string;
    SecondVespersEvangelicalAntiphonYearB: string;
    SecondVespersEvangelicalAntiphonYearC: string;
}