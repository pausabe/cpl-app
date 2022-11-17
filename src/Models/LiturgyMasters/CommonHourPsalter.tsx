import {HourCommonParts, Psalm} from "./CommonParts";

export default class CommonHourPsalter {
    static MasterName: string = "salteriComuHora";

    constructor(databaseRow: any = undefined) {
        if(databaseRow) {
            this.Id = databaseRow.id;

            this.FirstPsalm.Antiphon = databaseRow.ant1;
            this.FirstPsalm.Title = databaseRow.titol1;
            this.FirstPsalm.Comment = databaseRow.com1;
            this.FirstPsalm.Psalm = databaseRow.salm1;
            this.FirstPsalm.HasGloryPrayer = databaseRow.gloria1 === "1";

            this.SecondPsalm.Antiphon = databaseRow.ant2;
            this.SecondPsalm.Title = databaseRow.titol2;
            this.SecondPsalm.Comment = databaseRow.com2;
            this.SecondPsalm.Psalm = databaseRow.salm2;
            this.SecondPsalm.HasGloryPrayer = databaseRow.gloria2;

            this.ThirdPsalm.Antiphon = databaseRow.ant3;
            this.ThirdPsalm.Title = databaseRow.titol3;
            this.ThirdPsalm.Comment = databaseRow.com3;
            this.ThirdPsalm.Psalm = databaseRow.salm3;
            this.ThirdPsalm.HasGloryPrayer = databaseRow.gloria3;

            this.ThirdHourParts.ShortReading.Quote = databaseRow.versetLBTercia;
            this.ThirdHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuTercia;
            this.ThirdHourParts.Responsory.Versicle = databaseRow.respTercia1;
            this.ThirdHourParts.Responsory.Response = databaseRow.respTercia2;
            this.ThirdHourParts.FinalPrayer = databaseRow.oraTercia;

            this.SixthHourParts.ShortReading.Quote = databaseRow.versetLBSexta;
            this.SixthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuSexta;
            this.SixthHourParts.Responsory.Versicle = databaseRow.respSexta1;
            this.SixthHourParts.Responsory.Response = databaseRow.respSexta2;
            this.SixthHourParts.FinalPrayer = databaseRow.oraSexta;

            this.NinthHourParts.ShortReading.Quote = databaseRow.versetLBNona;
            this.NinthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuNona;
            this.NinthHourParts.Responsory.Versicle = databaseRow.respNona1;
            this.NinthHourParts.Responsory.Response = databaseRow.respNona2;
            this.NinthHourParts.FinalPrayer = databaseRow.oraNona;
        }
    }

    Id: number;
    FirstPsalm: Psalm = new Psalm();
    SecondPsalm: Psalm = new Psalm();
    ThirdPsalm: Psalm = new Psalm();
    ThirdHourParts: HourCommonParts = new HourCommonParts();
    SixthHourParts: HourCommonParts = new HourCommonParts();
    NinthHourParts: HourCommonParts = new HourCommonParts();
}