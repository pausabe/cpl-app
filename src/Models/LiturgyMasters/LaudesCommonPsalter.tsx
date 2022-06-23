export default class LaudesCommonPsalter {
    static MasterName: string = "salteriComuLaudes";

    constructor(databaseRow) {
        this.Id = databaseRow.id;
        this.LatinAnthem = databaseRow.himneLlati;
        this.CatalanAnthem = databaseRow.himneCat;

        this.FirstPsalm.Antiphon = databaseRow.ant1;
        this.FirstPsalm.Title = databaseRow.titol1;
        this.FirstPsalm.Comment = databaseRow.com1;
        this.FirstPsalm.Psalm = databaseRow.salm1;
        this.FirstPsalm.HasGloryPrayer = databaseRow.gloria1 === "1";

        this.SecondPsalm.Antiphon = databaseRow.ant2;
        this.SecondPsalm.Title = databaseRow.titol2;
        this.SecondPsalm.Comment = databaseRow.com2;
        this.SecondPsalm.Psalm = databaseRow.salm2;
        this.SecondPsalm.HasGloryPrayer = databaseRow.gloria2 === "1";

        this.ThirdPsalm.Antiphon = databaseRow.ant3;
        this.ThirdPsalm.Title = databaseRow.titol3;
        this.ThirdPsalm.Comment = databaseRow.com3;
        this.ThirdPsalm.Psalm = databaseRow.salm3;
        this.ThirdPsalm.HasGloryPrayer = databaseRow.gloria3 === "1";

        this.ShortReading.Quote = databaseRow.versetLB;
        this.ShortReading.ShortReading = databaseRow.lecturaBreu;
        this.ShortResponsory.FirstPart = databaseRow.respBreu1;
        this.ShortResponsory.SecondPart = databaseRow.respBreu2;
        this.ShortResponsory.ThirdPart = databaseRow.respBreu3;

        this.EvangelicalAntiphon = databaseRow.antEvangelic;
        this.Prayers = databaseRow.pregaries;
        this.FinalPrayer = databaseRow.oraFi;
    }

    Id: number;
    LatinAnthem: string;
    CatalanAnthem: string;
    FirstPsalm: Psalm;
    SecondPsalm: Psalm;
    ThirdPsalm: Psalm;
    ShortReading: ShortReading;
    ShortResponsory: ShortResponsory;
    EvangelicalAntiphon: string;
    Prayers: string;
    FinalPrayer: string;
}