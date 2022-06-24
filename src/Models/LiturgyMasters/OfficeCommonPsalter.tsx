import {Psalm, Responsory} from "./CommonParts";

export default class OfficeCommonPsalter {
    static MasterName: string = "salteriComuOfici";

    constructor(databaseRow) {
        this.Id = databaseRow.id;
        this.NightLatinAnthem = databaseRow.himneNitLlati;
        this.NightCatalanAnthem = databaseRow.himneNitCat;
        this.DayLatinAnthem = databaseRow.himneDiaLlati;
        this.DayCatalanAnthem = databaseRow.himneDiaCat;

        this.FirstPsalm = new Psalm({
            antiphon: databaseRow.ant1,
            title: databaseRow.titol1,
            comment: databaseRow.com1,
            psalm: databaseRow.salm1,
            hasGloryPrayer: databaseRow.gloria1 === '1'
        });

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

        this.Responsory = new Responsory({
            versicle: databaseRow.respV,
            response: databaseRow.respR
        });
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