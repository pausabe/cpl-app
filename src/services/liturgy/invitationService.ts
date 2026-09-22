import Invitation from '../../models/hours-liturgy/Invitation';
import LiturgyMasters from '../../models/liturgy-masters/LiturgyMasters';
import { LiturgySpecificDayInformation } from '../../models/LiturgyDayInformation';
import { SpecificLiturgyTimeType } from '../celebrationTimeEnums';
import { StringManagement } from '../../utils/StringManagement';

export function obtainInvitation(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  celebrationInvitation: Invitation,
): Invitation {
  let invitation = new Invitation();

  invitation.Psalm94 = liturgyMasters.Various.Psalm94;
  invitation.Psalm23 = liturgyMasters.Various.Psalm23;
  invitation.Psalm66 = liturgyMasters.Various.Psalm66;
  invitation.Psalm99 = liturgyMasters.Various.Psalm99;

  if (StringManagement.hasLiturgyContent(celebrationInvitation.InvitationAntiphon)) {
    invitation.InvitationAntiphon = celebrationInvitation.InvitationAntiphon;
  } else {
    invitation.InvitationAntiphon = liturgyMasters.InvitationCommonPsalter.Antiphon;
    switch (liturgyDayInformation.SpecificLiturgyTime) {
      case SpecificLiturgyTimeType.LentAshes:
      case SpecificLiturgyTimeType.LentWeeks:
        invitation.InvitationAntiphon =
          liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.InvitationAntiphonFirstOption;
        break;
      case SpecificLiturgyTimeType.PalmSunday:
      case SpecificLiturgyTimeType.HolyWeek:
        invitation.InvitationAntiphon = liturgyMasters.CommonPartsOfHolyWeek.InvitationAntiphon;
        break;
      case SpecificLiturgyTimeType.PaschalTriduum:
        invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterTriduum.InvitationAntiphon;
        break;
      case SpecificLiturgyTimeType.EasterOctave:
        invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterBeforeAscension.InvitationAntiphon;
        break;
      case SpecificLiturgyTimeType.EasterWeeks:
        if (liturgyDayInformation.Week === '7') {
          invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterAfterAscension.InvitationAntiphon;
        } else {
          invitation.InvitationAntiphon = liturgyMasters.PartsOfEasterBeforeAscension.InvitationAntiphon;
        }
        break;
      case SpecificLiturgyTimeType.AdventWeeks:
      case SpecificLiturgyTimeType.AdventFairs:
      case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
        if (
          liturgyDayInformation.SpecificLiturgyTime != SpecificLiturgyTimeType.ChristmasBeforeOrdinary ||
          (liturgyDayInformation.SpecificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
            liturgyDayInformation.Date.getMonth() == 0 &&
            liturgyDayInformation.Date.getDate() != 13)
        ) {
          invitation.InvitationAntiphon = liturgyMasters.CommonAdventAndChristmasParts.InvitationAntiphon;
        }
        break;
      case SpecificLiturgyTimeType.ChristmasOctave:
        invitation.InvitationAntiphon = liturgyMasters.SolemnityAndFestivityParts.InvitationAntiphon;
        break;
    }
  }
  return invitation;
}
