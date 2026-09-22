import { HourCommonParts, ReadingOfTheOffice, Psalm, Responsory, ShortReading, ShortResponsory } from './CommonParts';

export default class PartsOfEasterOctave {
  static masterName: string = 'tempsPasquaOct';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;

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
      this.officeSecondReading.quote = databaseRow.citaLect2Ofici;
      this.officeSecondReading.title = databaseRow.titolLect2Ofici;
      this.officeSecondReading.reading = databaseRow.lectura2;
      this.officeSecondReading.responsory.quote = databaseRow.citaResp2Ofici;
      this.officeSecondReading.responsory.firstPart = databaseRow.resp2Part1Ofici;
      this.officeSecondReading.responsory.secondPart = databaseRow.resp2Part2Ofici;
      this.officeSecondReading.responsory.thirdPart = databaseRow.resp2Part3Ofici;

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

      this.thirdHourParts.antiphon = databaseRow.antMenorTercia;
      this.thirdHourParts.shortReading.quote = databaseRow.citaLBTercia;
      this.thirdHourParts.shortReading.shortReading = databaseRow.lecturaBreuTercia;
      this.thirdHourParts.finalPrayer = databaseRow.oraFiMenor;

      this.sixthHourParts.antiphon = databaseRow.antMenorSexta;
      this.sixthHourParts.shortReading.quote = databaseRow.citaLBSexta;
      this.sixthHourParts.shortReading.shortReading = databaseRow.lecturaBreuSexta;
      this.sixthHourParts.finalPrayer = databaseRow.oraFiMenor;

      this.ninthHourParts.antiphon = databaseRow.antMenorNona;
      this.ninthHourParts.shortReading.quote = databaseRow.citaLBNona;
      this.ninthHourParts.shortReading.shortReading = databaseRow.lecturaBreuNona;
      this.ninthHourParts.finalPrayer = databaseRow.oraFiMenor;

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
  officeFirstPsalm: Psalm = new Psalm();
  officeSecondPsalm: Psalm = new Psalm();
  officeThirdPsalm: Psalm = new Psalm();
  officeResponsory: Responsory = new Responsory();
  officeFirstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  officeSecondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  laudesLatinAnthem: string;
  laudesCatalanAnthem: string;
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
  hoursResponsory: Responsory = new Responsory();
  vespersShortReading: ShortReading = new ShortReading();
  vespersShortResponsory: ShortResponsory = new ShortResponsory();
  vespersEvangelicalAntiphon: string;
  vespersPrayers: string;
  vespersFinalPrayer: string;
  nightPrayerAntiphon: string;
}
