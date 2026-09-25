import { HourCommonParts, ReadingOfTheOffice, Psalm, Responsory, ShortReading, ShortResponsory } from './CommonParts';

export default class PartsOfEasterTriduum {
  static masterName: string = 'tempsQuaresmaTridu';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;

      this.invitationAntiphon = databaseRow.antInvitatori;

      this.officeLatinAnthem = databaseRow.himneDSOLLlati;
      this.officeCatalanAnthem = databaseRow.himneDSOLCat;

      this.officeFirstPsalm.antiphon = databaseRow.ant1Ofici;
      this.officeFirstPsalm.title = databaseRow.titolSalm1Ofici;
      this.officeFirstPsalm.psalm = databaseRow.salm1Ofici;
      this.officeFirstPsalm.hasGloryPrayer = databaseRow.gloriaOfici1 === '1';

      this.officeSecondPsalm.antiphon = databaseRow.ant2Ofici;
      this.officeSecondPsalm.title = databaseRow.titolSalm2Ofici;
      this.officeSecondPsalm.psalm = databaseRow.salm2Ofici;
      this.officeSecondPsalm.hasGloryPrayer = databaseRow.gloriaOfici2 === '1';

      this.officeThirdPsalm.antiphon = databaseRow.ant3Ofici;
      this.officeThirdPsalm.title = databaseRow.titolSalm3Ofici;
      this.officeThirdPsalm.psalm = databaseRow.salm3Ofici;
      this.officeThirdPsalm.hasGloryPrayer = databaseRow.gloriaOfici3 === '1';

      this.officeResponsory.versicle = databaseRow.respVOfici;
      this.officeResponsory.response = databaseRow.respROfici;

      this.officeFirstReading.reference = databaseRow.referencia1;
      this.officeFirstReading.quote = databaseRow.citaLect1Ofici;
      this.officeFirstReading.title = databaseRow.titolLect1Ofici;
      this.officeFirstReading.reading = databaseRow.lectura1;
      this.officeFirstReading.responsory.quote = databaseRow.citaResp1Ofici;
      this.officeFirstReading.responsory.firstPart = databaseRow.resp1Part1Ofici;
      this.officeFirstReading.responsory.secondPart = databaseRow.resp1Part2Ofici;
      this.officeFirstReading.responsory.thirdPart = databaseRow.resp1Part3Ofici;

      this.officeSecondReading.reference = databaseRow.referencia2Ofici;
      this.officeSecondReading.quote = databaseRow.citaLec2Ofici;
      this.officeSecondReading.title = databaseRow.titolLect2Ofici;
      this.officeSecondReading.reading = databaseRow.lectura2;
      this.officeSecondReading.responsory.quote = databaseRow.citaResp2Ofici;
      this.officeSecondReading.responsory.firstPart = databaseRow.resp2Part1Ofici;
      this.officeSecondReading.responsory.secondPart = databaseRow.resp2Part2Ofici;
      this.officeSecondReading.responsory.thirdPart = databaseRow.resp2Part3Ofici;

      this.officeFinalPrayer = databaseRow.oraFiOfici;

      this.laudesLatinAnthem = databaseRow.himneDSOLaudesllati;
      this.laudesCatalanAnthem = databaseRow.himneDSOLaudescat;

      this.laudesFirstPsalm.antiphon = databaseRow.ant1Laudes;
      this.laudesFirstPsalm.title = databaseRow.titol1Laudes;
      this.laudesFirstPsalm.psalm = databaseRow.salm1Laudes;
      this.laudesFirstPsalm.hasGloryPrayer = databaseRow.gloriaLaudes1 === '1';

      this.laudesSecondPsalm.antiphon = databaseRow.ant2Laudes;
      this.laudesSecondPsalm.title = databaseRow.titol2Laudes;
      this.laudesSecondPsalm.psalm = databaseRow.salm2Laudes;
      this.laudesSecondPsalm.hasGloryPrayer = databaseRow.gloriaLaudes2 === '1';

      this.laudesThirdPsalm.antiphon = databaseRow.ant3Laudes;
      this.laudesThirdPsalm.title = databaseRow.titol3Laudes;
      this.laudesThirdPsalm.psalm = databaseRow.salm3Laudes;
      this.laudesThirdPsalm.hasGloryPrayer = databaseRow.gloriaLaudes3 === '1';

      this.laudesShortReading.quote = databaseRow.citaLBLaudes;
      this.laudesShortReading.shortReading = databaseRow.lecturaBreuLaudes;

      this.laudesShortResponsory.hasSpecialAntiphon = true;
      this.laudesShortResponsory.specialAntiphon = databaseRow.antEspecialLaudes;

      this.laudesEvangelicalAntiphon = databaseRow.antZacaries;
      this.laudesPrayers = databaseRow.pregariesLaudes;
      this.laudesFinalPrayer = databaseRow.oraFiLaudes;

      this.thirdHourParts.latinAnthem = databaseRow.himneLlatiTercia;
      this.thirdHourParts.catalanAnthem = databaseRow.himneCatTercia;
      this.thirdHourParts.antiphon = databaseRow.antTercia;
      this.thirdHourParts.shortReading.quote = databaseRow.citaLectBreuTercia;
      this.thirdHourParts.shortReading.shortReading = databaseRow.lecturaBreuTercia;
      this.thirdHourParts.responsory.versicle = databaseRow.respVTercia;
      this.thirdHourParts.responsory.response = databaseRow.respRTercia;
      this.thirdHourParts.finalPrayer = databaseRow.oraFiMenor;

      this.sixthHourParts.latinAnthem = databaseRow.himneLlatiSexta;
      this.sixthHourParts.catalanAnthem = databaseRow.himneCatSexta;
      this.sixthHourParts.antiphon = databaseRow.antSexta;
      this.sixthHourParts.shortReading.quote = databaseRow.citaLectBreuSexta;
      this.sixthHourParts.shortReading.shortReading = databaseRow.lecturaBreuSexta;
      this.sixthHourParts.responsory.versicle = databaseRow.respVSexta;
      this.sixthHourParts.responsory.response = databaseRow.respRSexta;
      this.sixthHourParts.finalPrayer = databaseRow.oraFiMenor;

      this.ninthHourParts.latinAnthem = databaseRow.himneLlatiNona;
      this.ninthHourParts.catalanAnthem = databaseRow.himneCatNona;
      this.ninthHourParts.antiphon = databaseRow.antNona;
      this.ninthHourParts.shortReading.quote = databaseRow.citaLectBreuNona;
      this.ninthHourParts.shortReading.shortReading = databaseRow.lecturaBreuNona;
      this.ninthHourParts.responsory.versicle = databaseRow.respVNona;
      this.ninthHourParts.responsory.response = databaseRow.respRNona;
      this.ninthHourParts.finalPrayer = databaseRow.oraFiMenor;

      this.hourPrayerFirstPsalm.title = databaseRow.titolSalmMenor1;
      this.hourPrayerFirstPsalm.psalm = databaseRow.salmMenor1;
      this.hourPrayerFirstPsalm.hasGloryPrayer = databaseRow.gloriaMenor1 === '1';

      this.hourPrayerSecondPsalm.title = databaseRow.titolSalmMenor2;
      this.hourPrayerSecondPsalm.psalm = databaseRow.salmMenor2;
      this.hourPrayerSecondPsalm.hasGloryPrayer = databaseRow.gloriaMenor2 === '1';

      this.hourPrayerThirdPsalm.title = databaseRow.titolSalmMenor3;
      this.hourPrayerThirdPsalm.psalm = databaseRow.salmMenor3;
      this.hourPrayerThirdPsalm.hasGloryPrayer = databaseRow.gloriaMenor3 === '1';

      this.vespersLatinAnthem = databaseRow.himneDSOVespresllati;
      this.vespersCatalanAnthem = databaseRow.himneDSOVespresCat;

      this.vespersFirstPsalm.antiphon = databaseRow.ant1Vespres;
      this.vespersFirstPsalm.title = databaseRow.titol1Vespres;
      this.vespersFirstPsalm.psalm = databaseRow.salm1Vespres;
      this.vespersFirstPsalm.hasGloryPrayer = databaseRow.gloriaVespres1 === '1';

      this.vespersSecondPsalm.antiphon = databaseRow.ant2Vespres;
      this.vespersSecondPsalm.title = databaseRow.titol2Vespres;
      this.vespersSecondPsalm.psalm = databaseRow.salm2Vespres;
      this.vespersSecondPsalm.hasGloryPrayer = databaseRow.gloriaVespres2 === '1';

      this.vespersThirdPsalm.antiphon = databaseRow.ant3Vespres;
      this.vespersThirdPsalm.title = databaseRow.titol3Vespres;
      this.vespersThirdPsalm.psalm = databaseRow.salm3Vespres;
      this.vespersThirdPsalm.hasGloryPrayer = databaseRow.gloriaVespres3 === '1';

      this.vespersShortReading.quote = databaseRow.citaLBVespres;
      this.vespersShortReading.shortReading = databaseRow.lecturaBreuVespres;

      this.vespersShortResponsory.hasSpecialAntiphon = true;
      this.vespersShortResponsory.specialAntiphon = databaseRow.antifonaEspecialVespres;
      this.vespersEvangelicalAntiphon = databaseRow.antMaria;
      this.vespersPrayers = databaseRow.pregariesVespres;
      this.vespersFinalPrayer = databaseRow.oraFiVespres;

      this.nightPrayerAntiphon = databaseRow.antCompletes;
    }
  }

  id: number;
  invitationAntiphon: string;
  officeLatinAnthem: string;
  officeCatalanAnthem: string;
  officeFirstPsalm: Psalm = new Psalm();
  officeSecondPsalm: Psalm = new Psalm();
  officeThirdPsalm: Psalm = new Psalm();
  officeResponsory: Responsory = new Responsory();
  officeFirstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  officeSecondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  officeFinalPrayer: string;
  laudesLatinAnthem: string;
  laudesCatalanAnthem: string;
  laudesFirstPsalm: Psalm = new Psalm();
  laudesSecondPsalm: Psalm = new Psalm();
  laudesThirdPsalm: Psalm = new Psalm();
  laudesShortReading: ShortReading = new ShortReading();
  laudesShortResponsory: ShortResponsory = new ShortResponsory();
  laudesEvangelicalAntiphon: string;
  laudesPrayers: string;
  laudesFinalPrayer: string;
  thirdHourParts: HourCommonParts = new HourCommonParts();
  sixthHourParts: HourCommonParts = new HourCommonParts();
  ninthHourParts: HourCommonParts = new HourCommonParts();
  hourPrayerFirstPsalm: Psalm = new Psalm();
  hourPrayerSecondPsalm: Psalm = new Psalm();
  hourPrayerThirdPsalm: Psalm = new Psalm();
  vespersLatinAnthem: string;
  vespersCatalanAnthem: string;
  vespersFirstPsalm: Psalm = new Psalm();
  vespersSecondPsalm: Psalm = new Psalm();
  vespersThirdPsalm: Psalm = new Psalm();
  vespersShortReading: ShortReading = new ShortReading();
  vespersEvangelicalAntiphon: string;
  vespersShortResponsory: ShortResponsory = new ShortResponsory();
  vespersPrayers: string;
  vespersFinalPrayer: string;
  nightPrayerAntiphon: string;
}
