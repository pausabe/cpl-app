export default class CommonNightPrayerPsalter {
    static MasterName: string = "salteriComuCompletes";

    constructor(databaseRow) {
        this.Id = databaseRow.id;

        this.FirstPsalm.Antiphon = databaseRow.ant1;
        this.FirstPsalm.Title = databaseRow.titol1;
        this.FirstPsalm.Comment = databaseRow.com1;
        this.FirstPsalm.Psalm = databaseRow.salm1;
        this.FirstPsalm.HasGloryPrayer = databaseRow.gloria1 === "1";

        this.HasTwoPsalms = databaseRow.dosSalms === "1";

        this.SecondPsalm.Antiphon = databaseRow.ant2;
        this.SecondPsalm.Title = databaseRow.titol2;
        this.SecondPsalm.Comment = databaseRow.com2;
        this.SecondPsalm.Psalm = databaseRow.salm2;
        this.SecondPsalm.HasGloryPrayer = databaseRow.gloria2 === "1";

        this.ShortReading.Quote = databaseRow.versetLB;
        this.ShortReading.ShortReading = databaseRow.lecturaBreu;

        this.FinalPrayer = databaseRow.oraFi;
    }

    Id: number;
    FirstPsalm: Psalm;
    HasTwoPsalms: boolean;
    SecondPsalm: Psalm;
    ShortReading: ShortReading;
    FinalPrayer: string;
}