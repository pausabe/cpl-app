export default class AdventFairDaysParts {
    static MasterName: string = "tempsAdventFeries";

    constructor(databaseRow) {
        this.Id = databaseRow.id;

        this.Responsory.Versicle = databaseRow.respVOfici;
        this.Responsory.Versicle = databaseRow.respROfici;

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

        this.LaudesShortReading.Quote = databaseRow.citaLBLaudes;
        this.LaudesShortReading.ShortReading = databaseRow.lecturaBreuLaudes;

        this.LaudesShortResponsory.FirstPart = databaseRow.respBreuLaudes1;
        this.LaudesShortResponsory.SecondPart = databaseRow.respBreuLaudes2;
        this.LaudesShortResponsory.ThirdPart = databaseRow.respBreuLaudes3;

        this.LaudesEvangelicalAntiphon = databaseRow.antZacaries;
        this.LaudesPrayers = databaseRow.pregariesLaudes;
        this.LaudesFinalPrayer = databaseRow.oraFiLaudes;

        this. = databaseRow.citaLBTercia;
        this. = databaseRow.lecturaBreuTercia;
        this. = databaseRow.respVTercia;
        this. = databaseRow.respRTercia;
        this. = databaseRow.citaLBSexta;
        this. = databaseRow.lecturaBreuSexta;
        this. = databaseRow.respVSexta;
        this. = databaseRow.respRSexta;
        this. = databaseRow.citaLBNona;
        this. = databaseRow.lecturaBreuNona;
        this. = databaseRow.respVNona;
        this. = databaseRow.respRNona;
        this. = databaseRow.citaLBVespres;
        this. = databaseRow.lecturaBreuVespres;
        this. = databaseRow.respBreuVespres1;
        this. = databaseRow.respBreuVespres2;
        this. = databaseRow.respBreuVespres3;
        this. = databaseRow.antMaria;
        this. = databaseRow.pregariesVespres;
        this. = databaseRow.oraFiVespres;
    }

    Id: number;
    Responsory: Responsory;
    OfficeFirstReading: LectureOfTheOffice;
    OfficeSecondReading: LectureOfTheOffice;
    LaudesShortReading: ShortReading;
    LaudesShortResponsory: ShortResponsory;
    LaudesEvangelicalAntiphon: string;
    LaudesPrayers: string;
    LaudesFinalPrayer: string;
}