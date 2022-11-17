import {HourCommonParts, ReadingOfTheOffice, Responsory, ShortReading, ShortResponsory} from "./CommonParts";

export default class PalmSundayParts {
    static MasterName: string = "tempsQuaresmaRams";

    constructor(databaseRow: any = undefined) {
        if(databaseRow) {
            this.Id = databaseRow.id;

            this.FirstVespersFirstAntiphon = databaseRow.ant1Vespres1;
            this.FirstVespersSecondAntiphon = databaseRow.ant2Vespres1;
            this.FirstVespersThirdAntiphon = databaseRow.ant3Vespres1;
            this.FirstVespersShortReading.Quote = databaseRow.citaLBVespres;
            this.FirstVespersShortReading.ShortReading = databaseRow.lecturaBreuVespres;
            this.FirstVespersShortResponsory.FirstPart = databaseRow.respBreuVespres1;
            this.FirstVespersShortResponsory.SecondPart = databaseRow.respBreuVespres2;
            this.FirstVespersShortResponsory.ThirdPart = databaseRow.respBreuVespres3;
            this.FirstVespersEvangelicalAntiphonYearA = databaseRow.antMaria1A;
            this.FirstVespersEvangelicalAntiphonYearB = databaseRow.antMaria1B;
            this.FirstVespersEvangelicalAntiphonYearC = databaseRow.antMaria1C;
            this.FirstVespersPrayers = databaseRow.pregariesVespres1;
            this.FirstVespersFinalPrayer = databaseRow.oraFiVespres1;

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

            this.LaudesEvangelicalAntiphonYearA = databaseRow.antZacariesA;
            this.LaudesEvangelicalAntiphonYearB = databaseRow.antZacariesB;
            this.LaudesEvangelicalAntiphonYearC = databaseRow.antZacariesC;
            this.LaudesPrayers = databaseRow.pregariesLaudes;
            this.LaudesFinalPrayer = databaseRow.oraFiLaudes;

            this.ThirdHourParts.ShortReading.Quote = databaseRow.citaLBTercia;
            this.ThirdHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuTercia;
            this.ThirdHourParts.Responsory.Versicle = databaseRow.respVTercia;
            this.ThirdHourParts.Responsory.Response = databaseRow.respRTercia;

            this.SixthHourParts.ShortReading.Quote = databaseRow.citaLBSexta;
            this.SixthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuSexta;
            this.SixthHourParts.Responsory.Versicle = databaseRow.respVSexta;
            this.SixthHourParts.Responsory.Response = databaseRow.respRSexta;

            this.NinthHourParts.ShortReading.Quote = databaseRow.citaLBNona;
            this.NinthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuNona;
            this.NinthHourParts.Responsory.Versicle = databaseRow.respVNona;
            this.NinthHourParts.Responsory.Response = databaseRow.respRNona;

            this.SecondVespersFirstAntiphon = databaseRow.ant1Vespres2;
            this.SecondVespersSecondAntiphon = databaseRow.ant2Vespres2;
            this.SecondVespersThirdAntiphon = databaseRow.ant3Vespres2;
            this.SecondVespersShortReading.Quote = databaseRow.citaLBVespres2;
            this.SecondVespersShortReading.ShortReading = databaseRow.lecturaBreuVespres2;
            this.SecondVespresShortResponsory.FirstPart = databaseRow.respBreuVespres12;
            this.SecondVespresShortResponsory.SecondPart = databaseRow.respBreuVespres22;
            this.SecondVespresShortResponsory.ThirdPart = databaseRow.respBreuVespres32;
            this.SecondVespersEvangelicalAntiphonYearA = databaseRow.antMaria1A2;
            this.SecondVespersEvangelicalAntiphonYearB = databaseRow.antMaria1B2;
            this.SecondVespersEvangelicalAntiphonYearC = databaseRow.antMaria1C2;
            this.SecondVespersPrayers = databaseRow.pregariesVespres12;
            this.SecondVespersFinalPrayer = databaseRow.oraFiVespres12;
        }
    }

    Id: number;
    FirstVespersFirstAntiphon: string;
    FirstVespersSecondAntiphon: string;
    FirstVespersThirdAntiphon: string;
    FirstVespersShortReading: ShortReading = new ShortReading();
    FirstVespersShortResponsory: ShortResponsory = new ShortResponsory();
    FirstVespersEvangelicalAntiphonYearA: string;
    FirstVespersEvangelicalAntiphonYearB: string;
    FirstVespersEvangelicalAntiphonYearC: string;
    FirstVespersPrayers: string;
    FirstVespersFinalPrayer: string;
    OfficeResponsory: Responsory = new Responsory();
    OfficeFirstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    OfficeSecondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    LaudesFirstAntiphon: string;
    LaudesSecondAntiphon: string;
    LaudesThirdAntiphon: string;
    LaudesShortReading: ShortReading = new ShortReading();
    LaudesShortResponsory: ShortResponsory = new ShortResponsory();
    LaudesEvangelicalAntiphonYearA: string;
    LaudesEvangelicalAntiphonYearB: string;
    LaudesEvangelicalAntiphonYearC: string;
    LaudesPrayers: string;
    LaudesFinalPrayer:string;
    ThirdHourParts: HourCommonParts = new HourCommonParts();
    SixthHourParts: HourCommonParts = new HourCommonParts();
    NinthHourParts: HourCommonParts = new HourCommonParts();
    SecondVespersFirstAntiphon: string;
    SecondVespersSecondAntiphon: string;
    SecondVespersThirdAntiphon: string;
    SecondVespersShortReading: ShortReading = new ShortReading();
    SecondVespresShortResponsory: ShortResponsory = new ShortResponsory();
    SecondVespersEvangelicalAntiphonYearA: string;
    SecondVespersEvangelicalAntiphonYearB: string;
    SecondVespersEvangelicalAntiphonYearC: string;
    SecondVespersPrayers: string;
    SecondVespersFinalPrayer: string;
}