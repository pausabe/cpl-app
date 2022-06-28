export default class AdventFairDaysAntiphons {
    static MasterName: string = "tempsAdventFeriesAnt";

    constructor(databaseRow) {
        this.Id = databaseRow.id;
        this.WeekDay = databaseRow.diaSetmana;
        this.LaudesFirstAntiphon = databaseRow.ant1;
        this.LaudesSecondAntiphon = databaseRow.ant2;
        this.LaudesThirdAntiphon = databaseRow.ant3;
    }

    Id: number;
    WeekDay: string;
    LaudesFirstAntiphon: string;
    LaudesSecondAntiphon: string;
    LaudesThirdAntiphon: string;
}