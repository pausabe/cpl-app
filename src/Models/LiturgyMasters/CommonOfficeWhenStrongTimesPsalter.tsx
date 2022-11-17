import {Psalm, Responsory} from "./CommonParts";

export default class CommonOfficeWhenStrongTimesPsalter {
    static MasterName: string = "salteriComuOficiTF";

    constructor(databaseRow: any = undefined) {
        if(databaseRow) {
            this.Id = databaseRow.id;
            this.LatinAnthem = databaseRow.himneNitLlati;
            this.CatalanAnthem = databaseRow.himneNitCat;

            this.FirstPsalm.Antiphon = databaseRow.ant1;
            this.FirstPsalm.Title = databaseRow.titol1;
            this.FirstPsalm.Comment = databaseRow.com1;
            this.FirstPsalm.Psalm = databaseRow.salm1;
            this.FirstPsalm.HasGloryPrayer = databaseRow.gloria1 === "1";

            this.SecondPsalm.Antiphon = databaseRow.ant2;
            this.SecondPsalm.Title = databaseRow.titol2;
            this.SecondPsalm.Comment = ""; // Missing com2 in the database
            this.SecondPsalm.Psalm = databaseRow.salm2;
            this.SecondPsalm.HasGloryPrayer = databaseRow.gloria2 === "1";

            this.ThirdPsalm.Antiphon = databaseRow.ant3;
            this.ThirdPsalm.Title = databaseRow.titol3;
            this.ThirdPsalm.Psalm = databaseRow.salm3;
            this.ThirdPsalm.Comment = ""; // Missing com3 in the database
            this.ThirdPsalm.HasGloryPrayer = databaseRow.gloria3 === "1";

            this.Responsory.Versicle = databaseRow.respV;
            this.Responsory.Response = databaseRow.respR;
        }
    }

    Id: number;
    LatinAnthem: string;
    CatalanAnthem: string;
    FirstPsalm: Psalm = new Psalm();
    SecondPsalm: Psalm = new Psalm();
    ThirdPsalm: Psalm = new Psalm();
    Responsory: Responsory = new Responsory();
}