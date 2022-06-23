export default class AdventFairDaysAntiphons {
    static MasterName: string = "tempsAdventFeriesAnt";

    constructor(databaseRow) {
        this.Id = databaseRow.id;
        this.WeekDay = databaseRow.diaSetmana;
        this.FirstAntiphon = databaseRow.ant1;
        this.SecondAntiphon = databaseRow.ant2;
        this.ThirdAntiphon = databaseRow.ant3;
    }

    Id: number;
    WeekDay: string;
    FirstAntiphon: string;
    SecondAntiphon: string;
    ThirdAntiphon: string;
}