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

  invitation.psalm94 = liturgyMasters.various.psalm94;
  invitation.psalm23 = liturgyMasters.various.psalm23;
  invitation.psalm66 = liturgyMasters.various.psalm66;
  invitation.psalm99 = liturgyMasters.various.psalm99;

  if (StringManagement.hasLiturgyContent(celebrationInvitation.invitationAntiphon)) {
    invitation.invitationAntiphon = celebrationInvitation.invitationAntiphon;
  } else {
    invitation.invitationAntiphon = liturgyMasters.invitationCommonPsalter.antiphon;
    switch (liturgyDayInformation.specificLiturgyTime) {
      case SpecificLiturgyTimeType.LentAshes:
      case SpecificLiturgyTimeType.LentWeeks:
        invitation.invitationAntiphon =
          liturgyMasters.commonPartsUntilFifthWeekOfLentTime.invitationAntiphonFirstOption;
        break;
      case SpecificLiturgyTimeType.PalmSunday:
      case SpecificLiturgyTimeType.HolyWeek:
        invitation.invitationAntiphon = liturgyMasters.commonPartsOfHolyWeek.invitationAntiphon;
        break;
      case SpecificLiturgyTimeType.PaschalTriduum:
        invitation.invitationAntiphon = liturgyMasters.partsOfEasterTriduum.invitationAntiphon;
        break;
      case SpecificLiturgyTimeType.EasterOctave:
        invitation.invitationAntiphon = liturgyMasters.partsOfEasterBeforeAscension.invitationAntiphon;
        break;
      case SpecificLiturgyTimeType.EasterWeeks:
        if (liturgyDayInformation.week === '7') {
          invitation.invitationAntiphon = liturgyMasters.partsOfEasterAfterAscension.invitationAntiphon;
        } else {
          invitation.invitationAntiphon = liturgyMasters.partsOfEasterBeforeAscension.invitationAntiphon;
        }
        break;
      case SpecificLiturgyTimeType.AdventWeeks:
      case SpecificLiturgyTimeType.AdventFairs:
      case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
        if (
          liturgyDayInformation.specificLiturgyTime != SpecificLiturgyTimeType.ChristmasBeforeOrdinary ||
          (liturgyDayInformation.specificLiturgyTime == SpecificLiturgyTimeType.ChristmasBeforeOrdinary &&
            liturgyDayInformation.date.getMonth() == 0 &&
            liturgyDayInformation.date.getDate() != 13)
        ) {
          invitation.invitationAntiphon = liturgyMasters.commonAdventAndChristmasParts.invitationAntiphon;
        }
        break;
      case SpecificLiturgyTimeType.ChristmasOctave:
        invitation.invitationAntiphon = liturgyMasters.solemnityAndFestivityParts.invitationAntiphon;
        break;
    }
  }
  return invitation;
}
