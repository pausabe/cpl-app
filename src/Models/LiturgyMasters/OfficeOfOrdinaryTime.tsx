export default class OfficeOfOrdinaryTime {
    static MasterName: string = "tempsOrdinariOfici";

    constructor(databaseRow) {
        this.Id = databaseRow.id;

        this.OfficeFirstReading.Reference = databaseRow.referencia1;
        this.OfficeFirstReading.Quote = databaseRow.cita1;
        this.OfficeFirstReading.Title = databaseRow.titol1;
        this.OfficeFirstReading.Lecture = databaseRow.lectura1;
        this.OfficeFirstReading.Responsory.Quote = databaseRow.citaResp1;
        this.OfficeFirstReading.Responsory.FirstPart = databaseRow.resp1Part1;
        this.OfficeFirstReading.Responsory.SecondPart = databaseRow.resp1Part2;
        this.OfficeFirstReading.Responsory.ThirdPart = databaseRow.resp1Part3;

        this.OfficeSecondReading.Reference = databaseRow.referencia2;
        this.OfficeSecondReading.Quote = databaseRow.cita2;
        this.OfficeSecondReading.Title = databaseRow.titol2;
        this.OfficeSecondReading.Lecture = databaseRow.lectura2;
        this.OfficeSecondReading.Responsory.Quote = databaseRow.versResp2;
        this.OfficeSecondReading.Responsory.FirstPart = databaseRow.resp2Part1;
        this.OfficeSecondReading.Responsory.SecondPart = databaseRow.resp2Part2;
        this.OfficeSecondReading.Responsory.ThirdPart = databaseRow.resp2Part3;
    }

    Id: number;
    OfficeFirstReading: LectureOfTheOffice;
    OfficeSecondReading: LectureOfTheOffice;
}