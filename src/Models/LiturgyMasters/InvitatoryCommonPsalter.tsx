// salteriComuInvitatori
export default class InvitatoryCommonPsalter {
    constructor(databaseRow) {
        this.Id = databaseRow.id;
        this.Antiphon = databaseRow.ant;
    }

    Id: number;
    Antiphon: string;
}