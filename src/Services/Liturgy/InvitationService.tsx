import Invitation from "../../Models/HoursLiturgy/Invitation";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";
import {SpecificLiturgyTimeType} from "../CelebrationTimeEnums";
import {StringManagement} from "../../Utils/StringManagement";

export function ObtainInvitation(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, celebrationInvitation : Invitation) : Invitation{
    let invitation = new Invitation();
    if(StringManagement.HasLiturgyContent(celebrationInvitation.InvitationAntiphon)){
        invitation.InvitationAntiphon = celebrationInvitation.InvitationAntiphon;
    }
    else{
        invitation.InvitationAntiphon = liturgyMasters.InvitationCommonPsalter.Antiphon;
        switch(liturgyDayInformation.SpecificLiturgyTime){
            case SpecificLiturgyTimeType.Q_CENDRA:
            case SpecificLiturgyTimeType.Q_SETMANES:
                invitation.InvitationAntiphon = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.InvitationAntiphonFirstOption;
                break;
            case SpecificLiturgyTimeType.Q_DIUM_RAMS:
            case SpecificLiturgyTimeType.Q_SET_SANTA:
                invitation.InvitationAntiphon = liturgyMasters.CommonPartsOfHolyWeek.InvitationAntiphon;
                break;
            case SpecificLiturgyTimeType.Q_TRIDU:
                invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterTriduum.InvitationAntiphon;
                break;
            case SpecificLiturgyTimeType.P_OCTAVA:
                invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterBeforeAscension.InvitationAntiphon;
                break;
            case SpecificLiturgyTimeType.P_SETMANES:
                if(liturgyDayInformation.Week === '7'){
                    invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterAfterAscension.InvitationAntiphon;
                }
                else{
                    invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterBeforeAscension.InvitationAntiphon;
                }
                break;
            case SpecificLiturgyTimeType.A_SETMANES:
            case SpecificLiturgyTimeType.A_FERIES:
            case SpecificLiturgyTimeType.N_ABANS:
                if(liturgyDayInformation.SpecificLiturgyTime != SpecificLiturgyTimeType.N_ABANS ||
                    (liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.N_ABANS && liturgyDayInformation.Date.getMonth() == 0 && liturgyDayInformation.Date.getDate() != 13)){
                    invitation.InvitationAntiphon = liturgyMasters.CommonAdventAndChristmasParts.InvitationAntiphon;
                }
                break;
            case SpecificLiturgyTimeType.N_OCTAVA:
                invitation.InvitationAntiphon = liturgyMasters.SolemnityAndFestivityParts.InvitationAntiphon;
                break;
        }
    }
    return invitation;
}