import {HourCommonParts, ReadingOfTheOffice, Responsory, ShortReading, ShortResponsory} from "./CommonParts";

export default class PartsOfHolyWeek {
    static MasterName: string = "tempsQuaresmaSetSanta";

    constructor(databaseRow: any = undefined) {
        if(databaseRow) {
            this.Id = databaseRow.id;

            this.OfficeResponsory.Versicle = databaseRow.respVOfici;
            this.OfficeResponsory.Response = databaseRow.respROfici;

            this.OfficeFirstReading.Reference = databaseRow.referencia1;
            this.OfficeFirstReading.Quote = databaseRow.cita1;
            this.OfficeFirstReading.Title = databaseRow.titol1;
            this.OfficeFirstReading.Reading = databaseRow.lectura1;
            this.OfficeFirstReading.Responsory.Quote = databaseRow.citaResp1;
            this.OfficeFirstReading.Responsory.FirstPart = databaseRow.resp1Part1;
            this.OfficeFirstReading.Responsory.SecondPart = databaseRow.resp1Part2;
            this.OfficeFirstReading.Responsory.ThirdPart = databaseRow.resp1Part3;

            this.OfficeSecondReading.Reference = databaseRow.referencia2;
            this.OfficeSecondReading.Quote = databaseRow.cita2;
            this.OfficeSecondReading.Title = databaseRow.titol2;
            this.OfficeSecondReading.Reading = databaseRow.lectura2;
            this.OfficeSecondReading.Responsory.Quote = databaseRow.versResp2;
            this.OfficeSecondReading.Responsory.FirstPart = databaseRow.resp2Part1;
            this.OfficeSecondReading.Responsory.SecondPart = databaseRow.resp2Part2;
            this.OfficeSecondReading.Responsory.ThirdPart = databaseRow.resp2Part3;

            this.LaudesFirstAntiphon = databaseRow.ant1Laudes;
            this.LaudesSecondAntiphon = databaseRow.ant2Laudes;
            this.LaudesThirdAntiphon = databaseRow.ant3Laudes;

            this.LaudesShortReading.Quote = databaseRow.citaLBLaudes;
            this.LaudesShortReading.ShortReading = databaseRow.lecturaBreuLaudes;

            this.LaudesShortResponsory.FirstPart = databaseRow.respBreu1Laudes;
            this.LaudesShortResponsory.SecondPart = databaseRow.respBreu2Laudes;
            this.LaudesShortResponsory.ThirdPart = databaseRow.respBreu3Laudes;

            this.LaudesEvangelicalAntiphon = databaseRow.antZacaries;
            this.LaudesPrayers = databaseRow.pregariesLaudes;
            this.LaudesFinalPrayer = databaseRow.oraFiLaudes;

            this.ThirdHourParts.Antiphon = databaseRow.antTercia;
            this.ThirdHourParts.ShortReading.Quote = databaseRow.citaLBTercia;
            this.ThirdHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuTercia;
            this.ThirdHourParts.Responsory.Versicle = databaseRow.respVTercia;
            this.ThirdHourParts.Responsory.Response = databaseRow.respRTercia;

            this.SixthHourParts.Antiphon = databaseRow.antSexta;
            this.SixthHourParts.ShortReading.Quote = databaseRow.citaLBSexta;
            this.SixthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuSexta;
            this.SixthHourParts.Responsory.Versicle = databaseRow.respVSexta;
            this.SixthHourParts.Responsory.Response = databaseRow.respRSexta;

            this.NinthHourParts.Antiphon = databaseRow.antNona;
            this.NinthHourParts.ShortReading.Quote = databaseRow.citaLBNona;
            this.NinthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuNona;
            this.NinthHourParts.Responsory.Versicle = databaseRow.respVNona;
            this.NinthHourParts.Responsory.Response = databaseRow.respRNona;

            this.VespersFirstAntiphon = databaseRow.ant1Vespres;
            this.VespersSecondAntiphon = databaseRow.ant2Vespres;
            this.VespersThirdAntiphon = databaseRow.ant3Vespres;

            this.VespersShortReading.Quote = databaseRow.citaLBVespres;
            this.VespersShortReading.ShortReading = databaseRow.lecturaBreuVespres;

            this.VespersShortResponsory.FirstPart = databaseRow.respBreuVespres1;
            this.VespersShortResponsory.SecondPart = databaseRow.respBreuVespres2;
            this.VespersShortResponsory.ThirdPart = databaseRow.respBreuVespres3;

            this.VespersEvangelicalAntiphon = databaseRow.antMaria;
            this.VespersPrayers = databaseRow.pregariesVespres;
            this.VespersFinalPrayer = databaseRow.oraFiVespres;
        }
    }

    Id: number;
    OfficeResponsory: Responsory = new Responsory();
    OfficeFirstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    OfficeSecondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    LaudesFirstAntiphon: string;
    LaudesSecondAntiphon: string;
    LaudesThirdAntiphon: string;
    LaudesShortReading: ShortReading = new ShortReading();
    LaudesShortResponsory: ShortResponsory = new ShortResponsory();
    LaudesEvangelicalAntiphon: string;
    LaudesPrayers: string;
    LaudesFinalPrayer: string;
    ThirdHourParts: HourCommonParts = new HourCommonParts();
    SixthHourParts: HourCommonParts = new HourCommonParts();
    NinthHourParts: HourCommonParts = new HourCommonParts();
    VespersFirstAntiphon: string;
    VespersSecondAntiphon: string;
    VespersThirdAntiphon: string;
    VespersShortReading: ShortReading = new ShortReading();
    VespersShortResponsory: ShortResponsory = new ShortResponsory();
    VespersEvangelicalAntiphon: string;
    VespersPrayers: string;
    VespersFinalPrayer: string;
}