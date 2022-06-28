import Invitation from "../../Models/HoursLiturgy/Invitation";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";
import GlobalKeys from "../../Utils/GlobalKeys";

export function ObtainInvitation(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationInvitation : Invitation) : Invitation{
    let invitation = new Invitation();
    if(celebrationInvitation.InvitationAntiphon !== "-"){
        invitation.InvitationAntiphon = celebrationInvitation.InvitationAntiphon;
    }
    else{
        invitation.InvitationAntiphon = liturgyMasters.InvitationCommonPsalter.Antiphon;
        switch(liturgyDayInformation.SpecificLiturgyTime){
            case GlobalKeys.Q_CENDRA:
            case GlobalKeys.Q_SETMANES:
                invitation.InvitationAntiphon = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.InvitationAntiphonFirstOption;
                break;
            case GlobalKeys.Q_DIUM_RAMS:
            case GlobalKeys.Q_SET_SANTA:
                invitation.InvitationAntiphon = liturgyMasters.CommonPartsOfHolyWeek.InvitationAntiphon;
                break;
            case GlobalKeys.Q_TRIDU:
                invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterTriduum.InvitationAntiphon;
                break;
            case GlobalKeys.P_OCTAVA:
                invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterBeforeAscension.InvitationAntiphon;
                break;
            case GlobalKeys.P_SETMANES:
                if(liturgyDayInformation.Week === '7'){
                    invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterAfterAscension.InvitationAntiphon;
                }
                else{
                    invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterBeforeAscension.InvitationAntiphon;
                }
                break;
            case GlobalKeys.A_SETMANES:
            case GlobalKeys.A_FERIES:
            case GlobalKeys.N_ABANS:
                if(liturgyDayInformation.SpecificLiturgyTime != GlobalKeys.N_ABANS ||
                    (liturgyDayInformation.SpecificLiturgyTime == GlobalKeys.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13)){
                    invitation.InvitationAntiphon = liturgyMasters.CommonAdventAndChristmasParts.InvitationAntiphon;
                }
                break;
            case GlobalKeys.N_OCTAVA:
                invitation.InvitationAntiphon = liturgyMasters.SolemnityAndFestivityParts.InvitationAntiphon;
                break;
        }
    }
    return invitation;
}