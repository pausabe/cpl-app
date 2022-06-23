export default class OfficeCommonPsalter {
    static MasterName: string = "salteriComuOfici";

    constructor(databaseRow) {
        this.Id = databaseRow.id;
        this.NightLatinAnthem = databaseRow.himneNitLlati;
        this.NightCatalanAnthem = databaseRow.himneNitCat;
        this.DayLatinAnthem = databaseRow.himneDiaLlati;
        this.DayCatalanAnthem = databaseRow.himneDiaCat;

        this.FirstPsalm.Antiphon = databaseRow.ant1;
        this.FirstPsalm.Title = databaseRow.titol1;
        this.FirstPsalm.Comment = databaseRow.com1;
        this.FirstPsalm.Psalm = databaseRow.salm1;
        this.FirstPsalm.HasGloryPrayer = databaseRow.gloria1 === '1';

        this.SecondPsalm.Antiphon = databaseRow.ant2;
        this.SecondPsalm.Title = databaseRow.titol2;
        this.SecondPsalm.Comment = databaseRow.com2;
        this.SecondPsalm.Psalm = databaseRow.salm2;
        this.SecondPsalm.HasGloryPrayer = databaseRow.gloria2 === '1';

        this.ThirdPsalm.Antiphon = databaseRow.ant3;
        this.ThirdPsalm.Title = databaseRow.titol3;
        this.ThirdPsalm.Comment = databaseRow.com3;
        this.ThirdPsalm.Psalm = databaseRow.salm3;
        this.ThirdPsalm.HasGloryPrayer = databaseRow.gloria3 === '1';

        this.Responsory.Versicle = databaseRow.respV;
        this.Responsory.Response = databaseRow.respR;
    }

    Id: number;
    NightLatinAnthem: string;
    NightCatalanAnthem: string;
    DayLatinAnthem: string;
    DayCatalanAnthem: string;
    FirstPsalm: Psalm;
    SecondPsalm: Psalm;
    ThirdPsalm: Psalm;
    Responsory: Responsory;
}