export default class CommonPartsUntilFifthWeekOfLentTime {
  static masterName: string = 'tempsQuaresmaComuFV';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;
      this.vespersSundaysLatinAnthem = databaseRow.himneVespresLlatiDom;
      this.vespersSundaysCatalanAnthem = databaseRow.himneVespresCatDom;
      this.vespersFairsLatinAnthem = databaseRow.himneVespresLlatiFer;
      this.vespersFairsCatalanAnthem = databaseRow.himneVespresCatFer;
      this.invitationAntiphonFirstOption = databaseRow.antInvitatori1;
      this.invitationAntiphonSecondOption = databaseRow.antInvitatori2;
      this.officeSundaysLatinAnthem = databaseRow.himneOficiLlatiDom;
      this.officeSundaysCatalanAnthem = databaseRow.himneOficiCatDom;
      this.officeFairsLatinAnthem = databaseRow.himneOficiLlatiFer;
      this.officeFairsCatalanAnthem = databaseRow.himneOficiCatFer;
      this.laudesSundaysLatinAnthem = databaseRow.himneLaudesLlatiDom;
      this.laudesSundaysCatalanAnthem = databaseRow.himneLaudesCatDom;
      this.laudesFairsLatinAnthem = databaseRow.himneLaudesLlatiFer;
      this.laudesFairsCatalanAnthem = databaseRow.himneLaudesCatFer;
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
  vespersSundaysLatinAnthem: string;
  vespersSundaysCatalanAnthem: string;
  vespersFairsLatinAnthem: string;
  vespersFairsCatalanAnthem: string;
  invitationAntiphonFirstOption: string;
  invitationAntiphonSecondOption: string;
  officeSundaysLatinAnthem: string;
  officeSundaysCatalanAnthem: string;
  officeFairsLatinAnthem: string;
  officeFairsCatalanAnthem: string;
  laudesSundaysLatinAnthem: string;
  laudesSundaysCatalanAnthem: string;
  laudesFairsLatinAnthem: string;
  laudesFairsCatalanAnthem: string;
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
