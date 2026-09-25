export default class PartsOfEasterBeforeAscension {
  static masterName: string = 'tempsPasquaAA';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;
      this.vespersWeekendLatinAnthem = databaseRow.himneVespresLlati1;
      this.vespersWeekendCatalanAnthem = databaseRow.himneVespresCat1;
      this.vespersWorkdaysLatinAnthem = databaseRow.himneVespresLlati2;
      this.vespersWorkdaysCatalanAnthem = databaseRow.himneVespresCat2;
      this.hourSpecialAntiphon = databaseRow.antEspecialMenor;
      this.invitationAntiphon = databaseRow.antInvitatori;
      this.officeWeekendLatinAnthem = databaseRow.himneOficiLlati1;
      this.officeWeekendCatalanAnthem = databaseRow.himneOficiCat1;
      this.officeWorkdaysLatinAnthem = databaseRow.himneOficiLlati2;
      this.officeWorkdaysCatalanAnthem = databaseRow.himneOficiCat2;
      this.laudesWeekendLatinAnthem = databaseRow.himneLaudesLlati1;
      this.laudesWeekendCatalanAnthem = databaseRow.himneLaudesCat1;
      this.laudesWorkdaysLatinAnthem = databaseRow.himneLaudesLlati2;
      this.laudesWorkdaysCatalanAnthem = databaseRow.himneLaudesCat2;
      this.thirdHourLatinAnthem = databaseRow.himneTerciaLlati;
      this.thirdHourCatalanAnthem = databaseRow.himneTerciaCat;
      this.thirdHourAntiphon = databaseRow.antTercia;
      this.sixthHourLatinAnthem = databaseRow.himneSextaLlati;
      this.sixthHourCatalanAnthem = databaseRow.himneSextaCat;
      this.sixthHourAntiphon = databaseRow.antSexta;
      this.ninthHourLatinAnthem = databaseRow.himneNonaLlati;
      this.ninthHourCatalanAnthem = databaseRow.himneNonaCat;
      this.ninthHourAntiphon = databaseRow.antNona;
    }
  }

  id: number;
  vespersWeekendLatinAnthem: string;
  vespersWeekendCatalanAnthem: string;
  vespersWorkdaysLatinAnthem: string;
  vespersWorkdaysCatalanAnthem: string;
  hourSpecialAntiphon: string;
  invitationAntiphon: string;
  officeWeekendLatinAnthem: string;
  officeWeekendCatalanAnthem: string;
  officeWorkdaysLatinAnthem: string;
  officeWorkdaysCatalanAnthem: string;
  laudesWeekendLatinAnthem: string;
  laudesWeekendCatalanAnthem: string;
  laudesWorkdaysLatinAnthem: string;
  laudesWorkdaysCatalanAnthem: string;
  thirdHourLatinAnthem: string;
  thirdHourCatalanAnthem: string;
  thirdHourAntiphon: string;
  sixthHourLatinAnthem: string;
  sixthHourCatalanAnthem: string;
  sixthHourAntiphon: string;
  ninthHourLatinAnthem: string;
  ninthHourCatalanAnthem: string;
  ninthHourAntiphon: string;
}
