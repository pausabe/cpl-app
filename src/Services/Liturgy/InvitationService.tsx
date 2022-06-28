import Invitation from "../../Models/HoursLiturgy/Invitation";

export function ObtainInvitation() : Invitation{
    switch(LT){
        case GLOBAL.O_ORDINARI:
            antInvitatori = this.state.salteriComuInvitatori.ant;
            break;
        case GLOBAL.Q_CENDRA:
        case GLOBAL.Q_SETMANES:
            antInvitatori = this.state.tempsQuaresmaComuFV.antInvitatori1;
            break;
        case GLOBAL.Q_DIUM_RAMS:
        case GLOBAL.Q_SET_SANTA:
            antInvitatori = this.state.tempsQuaresmaComuSS.antInvitatori;
            break;
        case GLOBAL.Q_TRIDU:
            antInvitatori = this.state.tempsQuaresmaTridu.antInvitatori;
            break;
        case GLOBAL.P_OCTAVA:
            antInvitatori = this.state.tempsPasquaAA.antInvitatori;
            break;
        case GLOBAL.P_SETMANES:
            if(setmana === '7'){
                antInvitatori = this.state.tempsPasquaDA.antInvitatori;
            }
            else{
                antInvitatori = this.state.tempsPasquaAA.antInvitatori;
            }
            break;
        case GLOBAL.A_SETMANES:
        case GLOBAL.A_FERIES:
        case GLOBAL.N_ABANS:
            if(LT != GLOBAL.N_ABANS || (LT == GLOBAL.N_ABANS && date.getMonth() == 0 && date.getDate() != 13)){
                antInvitatori = this.state.tempsAdventNadalComu.antInvitatori;
            }
            break;
        case GLOBAL.N_OCTAVA:
            antInvitatori = this.state.tempsSolemnitatsFestes.antInvitatori;
            break;
    }
    if(CEL.antInvitatori === '-')
        this.LAUDES.antInvitatori = antInvitatori;
    else this.LAUDES.antInvitatori = CEL.antInvitatori;
}