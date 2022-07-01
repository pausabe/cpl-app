import {Psalm, Responsory} from "./CommonParts";
import CommonOfficeWhenStrongTimesPsalter from "./CommonOfficeWhenStrongTimesPsalter";

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

    AdaptWithStrongTimes(commonOfficeWhenStrongTimesPsalter : CommonOfficeWhenStrongTimesPsalter){
        this.Id = commonOfficeWhenStrongTimesPsalter.Id;
        this.NightLatinAnthem = commonOfficeWhenStrongTimesPsalter.LatinAnthem;
        this.NightCatalanAnthem = commonOfficeWhenStrongTimesPsalter.CatalanAnthem;
        this.DayLatinAnthem = commonOfficeWhenStrongTimesPsalter.LatinAnthem;
        this.DayCatalanAnthem = commonOfficeWhenStrongTimesPsalter.CatalanAnthem;

        this.FirstPsalm.Antiphon = commonOfficeWhenStrongTimesPsalter.FirstPsalm.Antiphon;
        this.FirstPsalm.Title = commonOfficeWhenStrongTimesPsalter.FirstPsalm.Title;
        this.FirstPsalm.Comment = commonOfficeWhenStrongTimesPsalter.FirstPsalm.Comment;
        this.FirstPsalm.Psalm = commonOfficeWhenStrongTimesPsalter.FirstPsalm.Psalm;
        this.FirstPsalm.HasGloryPrayer = commonOfficeWhenStrongTimesPsalter.FirstPsalm.HasGloryPrayer;

        this.SecondPsalm.Antiphon = commonOfficeWhenStrongTimesPsalter.SecondPsalm.Antiphon;
        this.SecondPsalm.Title = commonOfficeWhenStrongTimesPsalter.SecondPsalm.Title;
        this.SecondPsalm.Comment = commonOfficeWhenStrongTimesPsalter.SecondPsalm.Comment;
        this.SecondPsalm.Psalm = commonOfficeWhenStrongTimesPsalter.SecondPsalm.Psalm;
        this.SecondPsalm.HasGloryPrayer = commonOfficeWhenStrongTimesPsalter.SecondPsalm.HasGloryPrayer;

        this.ThirdPsalm.Antiphon = commonOfficeWhenStrongTimesPsalter.ThirdPsalm.Antiphon;
        this.ThirdPsalm.Title = commonOfficeWhenStrongTimesPsalter.ThirdPsalm.Title;
        this.ThirdPsalm.Comment = commonOfficeWhenStrongTimesPsalter.ThirdPsalm.Comment;
        this.ThirdPsalm.Psalm = commonOfficeWhenStrongTimesPsalter.ThirdPsalm.Psalm;
        this.ThirdPsalm.HasGloryPrayer = commonOfficeWhenStrongTimesPsalter.ThirdPsalm.HasGloryPrayer;

        this.Responsory.Versicle = commonOfficeWhenStrongTimesPsalter.Responsory.Versicle;
        this.Responsory.Response = commonOfficeWhenStrongTimesPsalter.Responsory.Response;
    }

    Id: number;
    NightLatinAnthem: string;
    NightCatalanAnthem: string;
    DayLatinAnthem: string;
    DayCatalanAnthem: string;
    FirstPsalm: Psalm = new Psalm();
    SecondPsalm: Psalm = new Psalm();
    ThirdPsalm: Psalm = new Psalm();
    Responsory: Responsory = new Responsory();
}