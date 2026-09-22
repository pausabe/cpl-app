import { HourCommonParts, ReadingOfTheOffice, Psalm, Responsory, ShortReading, ShortResponsory } from './CommonParts';

export default class EasterSunday {
  static masterName: string = 'tempsQuaresmaDiumPasq';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;

      this.officeFirstReading.reference = databaseRow.referencia1;
      this.officeFirstReading.quote = databaseRow.citaLect1Ofici;
      this.officeFirstReading.title = databaseRow.titolLect1Ofici;
      this.officeFirstReading.reading = databaseRow.lectura1;
      this.officeFirstPsalm.antiphon = databaseRow.ant1Ofici;
      this.officeFirstPsalm.title = databaseRow.citaSalm1Ofici;
      this.officeFirstPsalm.psalm = databaseRow.salm1Ofici;
      this.officeFirstPsalm.prayer = databaseRow.oracioSalm1Ofici;

      this.officeSecondReading.reference = databaseRow.referencia2Ofici;
      this.officeSecondReading.quote = databaseRow.citaLec2Ofici;
      this.officeSecondReading.title = databaseRow.titolLect2Ofici;
      this.officeSecondReading.reading = databaseRow.lectura2;
      this.officeSecondPsalm.antiphon = databaseRow.ant2Ofici;
      this.officeSecondPsalm.title = databaseRow.citaSalm2Ofici;
      this.officeSecondPsalm.psalm = databaseRow.salm2Ofici;
      this.officeSecondPsalm.prayer = databaseRow.oracioSalm2Ofici;

      this.officeThirdReading.reference = databaseRow.referencia3Ofici;
      this.officeThirdReading.quote = databaseRow.citaLec3Ofici;
      this.officeThirdReading.title = databaseRow.titolLect3Ofici;
      this.officeThirdReading.reading = databaseRow.lectura3;
      this.officeThirdPsalm.antiphon = databaseRow.ant3Ofici;
      this.officeThirdPsalm.title = databaseRow.citaSalm3Ofici;
      this.officeThirdPsalm.psalm = databaseRow.salm3Ofici;
      this.officeThirdPsalm.prayer = ''; // Missing column

      this.officeFourthReading.reference = databaseRow.referencia4Ofici;
      this.officeFourthReading.quote = databaseRow.citaLec4Ofici;
      this.officeFourthReading.title = databaseRow.titolLect4Ofici;
      this.officeFourthReading.reading = databaseRow.lectura4;
      this.officeFourthPsalm.antiphon = ''; // Missing column
      this.officeFourthPsalm.title = ''; // Missing column
      this.officeFourthPsalm.psalm = ''; // Missing column
      this.officeFourthPsalm.prayer = databaseRow.oracioSalm4Ofici;

      this.officeFinalPrayer = databaseRow.oraFiLaudes;

      this.invitationAntiphon = databaseRow.antInvitatori;

      this.laudesLatinAnthem = databaseRow.himneLlatiLaudes;
      this.laudesCatalanAnthem = databaseRow.himneCatLaudes;

      this.laudesFirstPsalm.antiphon = databaseRow.ant1Laudes;
      this.laudesFirstPsalm.title = databaseRow.titol1Laudes;
      this.laudesFirstPsalm.psalm = databaseRow.text1Laudes;
      this.laudesFirstPsalm.hasGloryPrayer = databaseRow.gloria1Laudes === '1';

      this.laudesSecondPsalm.antiphon = databaseRow.ant2Laudes;
      this.laudesSecondPsalm.title = databaseRow.titol2Laudes;
      this.laudesSecondPsalm.psalm = databaseRow.text2Laudes;
      this.laudesSecondPsalm.hasGloryPrayer = databaseRow.gloria2Laudes === '1';

      this.laudesThirdPsalm.antiphon = databaseRow.ant3Laudes;
      this.laudesThirdPsalm.title = databaseRow.titol3Laudes;
      this.laudesThirdPsalm.psalm = databaseRow.text3Laudes;
      this.laudesThirdPsalm.hasGloryPrayer = databaseRow.gloria3Laudes === '1';

      this.laudesShortReading.quote = databaseRow.citaLBLaudes;
      this.laudesShortReading.shortReading = databaseRow.lecturaBreuLaudes;

      this.laudesShortResponsory.hasSpecialAntiphon = true;
      this.laudesShortResponsory.specialAntiphon = databaseRow.antEspecialLaudes;
      this.laudesEvangelicalAntiphon = databaseRow.antZacaries;
      this.laudesPrayers = databaseRow.pregariesLaudes;
      this.laudesFinalPrayer = databaseRow.oraFiLaudes;

      this.hourPrayerFirstPsalm.title = databaseRow.titol1salm117;
      this.hourPrayerFirstPsalm.psalm = databaseRow.part1Salm117;
      this.hourPrayerFirstPsalm.hasGloryPrayer = databaseRow.gloria1salm117 === '1';

      this.hourPrayerSecondPsalm.title = databaseRow.titol2salm117;
      this.hourPrayerSecondPsalm.psalm = databaseRow.part2Salm117;
      this.hourPrayerSecondPsalm.hasGloryPrayer = databaseRow.gloria2salm117 === '1';

      this.hourPrayerThirdPsalm.title = databaseRow.titol3salm117;
      this.hourPrayerThirdPsalm.psalm = databaseRow.part3Salm117;
      this.hourPrayerThirdPsalm.hasGloryPrayer = databaseRow.gloria3salm117 === '1';

      this.thirdHourParts.latinAnthem = databaseRow.himneTerciaLlati;
      this.thirdHourParts.catalanAnthem = databaseRow.himneTerciaCat;
      this.thirdHourParts.antiphon = databaseRow.antMenorTercia;
      this.thirdHourParts.shortReading.quote = databaseRow.citaLBTercia;
      this.thirdHourParts.shortReading.shortReading = databaseRow.lecturaBreuTercia;
      this.thirdHourParts.responsory.versicle = databaseRow.responsoriMenorV;
      this.thirdHourParts.responsory.response = databaseRow.responsoriMenorR;
      this.thirdHourParts.finalPrayer = databaseRow.oraFiMenor;

      this.sixthHourParts.latinAnthem = databaseRow.himneSextaLlati;
      this.sixthHourParts.catalanAnthem = databaseRow.himneSextaCat;
      this.sixthHourParts.antiphon = databaseRow.antMenorSexta;
      this.sixthHourParts.shortReading.quote = databaseRow.citaLBSexta;
      this.sixthHourParts.shortReading.shortReading = databaseRow.lecturaBreuSexta;
      this.sixthHourParts.responsory.versicle = databaseRow.responsoriMenorV;
      this.sixthHourParts.responsory.response = databaseRow.responsoriMenorR;
      this.sixthHourParts.finalPrayer = databaseRow.oraFiMenor;

      this.ninthHourParts.latinAnthem = databaseRow.himneNonaLlati;
      this.ninthHourParts.catalanAnthem = databaseRow.himneNonaCat;
      this.ninthHourParts.antiphon = databaseRow.antMenorNona;
      this.ninthHourParts.shortReading.quote = databaseRow.citaLBNona;
      this.ninthHourParts.shortReading.shortReading = databaseRow.lecturaBreuNona;
      this.ninthHourParts.responsory.versicle = databaseRow.responsoriMenorV;
      this.ninthHourParts.responsory.response = databaseRow.responsoriMenorR;
      this.ninthHourParts.finalPrayer = databaseRow.oraFiMenor;

      this.vespersLatinAnthem = databaseRow.himneLlatiVespres;
      this.vespersCatalanAnthem = databaseRow.himneCatVespres;

      this.vespersFirstPsalm.antiphon = databaseRow.ant1Vespres;
      this.vespersFirstPsalm.title = databaseRow.titol1Vespres;
      this.vespersFirstPsalm.psalm = databaseRow.text1Vespres;
      this.vespersFirstPsalm.hasGloryPrayer = databaseRow.gloria1Vespres === '1';

      this.vespersSecondPsalm.antiphon = databaseRow.ant2Vespres;
      this.vespersSecondPsalm.title = databaseRow.titol2Vespres;
      this.vespersSecondPsalm.psalm = databaseRow.text2Vespres;
      this.vespersSecondPsalm.hasGloryPrayer = databaseRow.gloria2Vespres === '1';

      this.vespersThirdPsalm.antiphon = databaseRow.ant3Vespres;
      this.vespersThirdPsalm.title = databaseRow.titol3Vespres;
      this.vespersThirdPsalm.psalm = databaseRow.text3Vespres;
      this.vespersThirdPsalm.hasGloryPrayer = databaseRow.gloria3Vespres === '1';

      this.vespersShortReading.quote = databaseRow.citaLBVespres;
      this.vespersShortReading.shortReading = databaseRow.lecturaBreuVespres;

      this.vespersShortResponsory.hasSpecialAntiphon = true;
      this.vespersShortResponsory.specialAntiphon = databaseRow.antEspecialVespres;
      this.vespersEvangelicalAntiphon = databaseRow.antMaria;
      this.vespersPrayers = databaseRow.pregariesVespres;
      this.vespersFinalPrayer = databaseRow.oraFiVespres;

      this.nightPrayerAntiphon = databaseRow.antCompletes;
    }
  }

  id: number;
  invitationAntiphon: string;
  officeFirstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  officeFirstPsalm: EasterOfficePsalm = new EasterOfficePsalm();
  officeSecondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  officeSecondPsalm: EasterOfficePsalm = new EasterOfficePsalm();
  officeThirdReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  officeThirdPsalm: EasterOfficePsalm = new EasterOfficePsalm();
  officeFourthReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  officeFourthPsalm: EasterOfficePsalm = new EasterOfficePsalm();
  officeFinalPrayer;
  string;
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
  hourPrayerFirstPsalm: Psalm = new Psalm();
  hourPrayerSecondPsalm: Psalm = new Psalm();
  hourPrayerThirdPsalm: Psalm = new Psalm();
  thirdHourParts: HourCommonParts = new HourCommonParts();
  sixthHourParts: HourCommonParts = new HourCommonParts();
  ninthHourParts: HourCommonParts = new HourCommonParts();
  vespersLatinAnthem: string;
  vespersCatalanAnthem: string;
  vespersFirstPsalm: Psalm = new Psalm();
  vespersSecondPsalm: Psalm = new Psalm();
  vespersThirdPsalm: Psalm = new Psalm();
  vespersShortReading: ShortReading = new ShortReading();
  vespersShortResponsory: ShortResponsory = new ShortResponsory();
  vespersEvangelicalAntiphon: string;
  vespersPrayers: string;
  vespersFinalPrayer: string;
  nightPrayerAntiphon: string;
}

class EasterOfficePsalm {
  antiphon: string;
  title: string;
  psalm: string;
  prayer: string;
}
