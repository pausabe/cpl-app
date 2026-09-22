export default class CommonPartsOfHolyWeek {
  static masterName: string = 'tempsQuaresmaComuSS';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;
      this.vespersLatinAnthem = databaseRow.himneVespresLlati;
      this.vespersCatalanAnthem = databaseRow.himneVespresCat;
      this.invitationAntiphon = databaseRow.antInvitatori;
      this.officeLatinAnthem = databaseRow.himneOficiLlati;
      this.officeCatalanAnthem = databaseRow.himneOficiCat;
      this.laudesLatinAnthem = databaseRow.himneLaudesLlati;
      this.laudesCatalanAnthem = databaseRow.himneLaudesCat;
      this.hoursLatinAnthem = databaseRow.himneHoraLlati;
      this.hoursCatalanAnthem = databaseRow.himneHoraCat;
      this.thirdHourAntiphon = databaseRow.antTercia;
      this.sixthHourAntiphon = databaseRow.antSexta;
      this.ninthHourAntiphon = databaseRow.antNona;
    }
  }

  id: number;
  vespersLatinAnthem: string;
  vespersCatalanAnthem: string;
  invitationAntiphon: string;
  officeLatinAnthem: string;
  officeCatalanAnthem: string;
  laudesLatinAnthem: string;
  laudesCatalanAnthem: string;
  hoursLatinAnthem: string;
  hoursCatalanAnthem: string;
  thirdHourAntiphon: string;
  sixthHourAntiphon: string;
  ninthHourAntiphon: string;
}
