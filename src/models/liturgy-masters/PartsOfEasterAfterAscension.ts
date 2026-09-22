export default class PartsOfEasterAfterAscension {
  static masterName: string = 'tempsPasquaDA';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;
      this.vespersLatinAnthem = databaseRow.himneVespresLlati;
      this.vespersCatalanAnthem = databaseRow.himneVespresCat;
      this.nightPrayerLatinAnthem = databaseRow.himneCompletesLlati;
      this.nightPrayerCatalanAnthem = databaseRow.himneCompletesCat;
      this.invitationAntiphon = databaseRow.antInvitatori;
      this.officeLatinAnthem = databaseRow.himneOficiLlati;
      this.officeCatalanAnthem = databaseRow.himneOficiCat;
      this.laudesLatinAnthem = databaseRow.himneLaudesLlati;
      this.laudesCatalanAnthem = databaseRow.himneLaudesCat;
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
  vespersLatinAnthem: string;
  vespersCatalanAnthem: string;
  nightPrayerLatinAnthem: string;
  nightPrayerCatalanAnthem: string;
  invitationAntiphon: string;
  officeLatinAnthem: string;
  officeCatalanAnthem: string;
  laudesLatinAnthem: string;
  laudesCatalanAnthem: string;
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
