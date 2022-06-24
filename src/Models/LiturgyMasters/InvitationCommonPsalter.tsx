export default class InvitationCommonPsalter {
    static MasterName: string = "salteriComuInvitatori";

    constructor(databaseRow) {
        this.Id = databaseRow.id;
        this.Antiphon = databaseRow.ant;
    }

    Id: number;
    Antiphon: string;
}