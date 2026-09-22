export default class InvitationCommonPsalter {
  static masterName: string = 'salteriComuInvitatori';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;
      this.antiphon = databaseRow.ant;
    }
  }

  id: number;
  antiphon: string;
}
