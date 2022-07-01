import Invitation from "../../Models/HoursLiturgy/Invitation";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";
import {SpecificCelebrationType} from "../CelebrationTimeEnums";

export function ObtainInvitation(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationInvitation : Invitation) : Invitation{
    let invitation = new Invitation();
    if(celebrationInvitation.InvitationAntiphon !== "-"){
        invitation.InvitationAntiphon = celebrationInvitation.InvitationAntiphon;
    }
    else{
        invitation.InvitationAntiphon = liturgyMasters.InvitationCommonPsalter.Antiphon;
        switch(liturgyDayInformation.SpecificLiturgyTime){
            case SpecificCelebrationType.Q_CENDRA:
            case SpecificCelebrationType.Q_SETMANES:
                invitation.InvitationAntiphon = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.InvitationAntiphonFirstOption;
                break;
            case SpecificCelebrationType.Q_DIUM_RAMS:
            case SpecificCelebrationType.Q_SET_SANTA:
                invitation.InvitationAntiphon = liturgyMasters.CommonPartsOfHolyWeek.InvitationAntiphon;
                break;
            case SpecificCelebrationType.Q_TRIDU:
                invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterTriduum.InvitationAntiphon;
                break;
            case SpecificCelebrationType.P_OCTAVA:
                invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterBeforeAscension.InvitationAntiphon;
                break;
            case SpecificCelebrationType.P_SETMANES:
                if(liturgyDayInformation.Week === '7'){
                    invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterAfterAscension.InvitationAntiphon;
                }
                else{
                    invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterBeforeAscension.InvitationAntiphon;
                }
                break;
            case SpecificCelebrationType.A_SETMANES:
            case SpecificCelebrationType.A_FERIES:
            case SpecificCelebrationType.N_ABANS:
                if(liturgyDayInformation.SpecificLiturgyTime != SpecificCelebrationType.N_ABANS ||
                    (liturgyDayInformation.SpecificLiturgyTime == SpecificCelebrationType.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13)){
                    invitation.InvitationAntiphon = liturgyMasters.CommonAdventAndChristmasParts.InvitationAntiphon;
                }
                break;
            case SpecificCelebrationType.N_OCTAVA:
                invitation.InvitationAntiphon = liturgyMasters.SolemnityAndFestivityParts.InvitationAntiphon;
                break;
        }
    }
    return invitation;
}