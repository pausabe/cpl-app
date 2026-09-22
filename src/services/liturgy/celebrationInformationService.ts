import CelebrationInformation from '../../models/hours-liturgy/CelebrationInformation';
import { LiturgySpecificDayInformation, SpecialCelebrationTypeEnum } from '../../models/LiturgyDayInformation';
import { CelebrationType } from '../databaseEnums';
import { SpecificLiturgyTimeType } from '../celebrationTimeEnums';
import { StringManagement } from '../../utils/StringManagement';
import { DateManagement } from '../../utils/DateManagement';
import * as PrecedenceService from '../precedenceService';

export function ObtainCelebrationInformation(
  liturgySpecificDayInformation: LiturgySpecificDayInformation,
  celebrationInformationFromCelebration: CelebrationInformation,
): CelebrationInformation {
  // With this service I'm trying to separate Celebration by some kind of Saint from Celebration from the liturgy time
  let celebrationInformation = BuildCelebrationInformation(
    liturgySpecificDayInformation,
    celebrationInformationFromCelebration,
  );
  celebrationInformation.Precedence = PrecedenceService.ObtainPrecedenceByLiturgyTime(
    liturgySpecificDayInformation,
    celebrationInformationFromCelebration,
  );
  return celebrationInformation;
}

function BuildCelebrationInformation(
  liturgySpecificDayInformation: LiturgySpecificDayInformation,
  celebrationInformationFromCelebration: CelebrationInformation,
): CelebrationInformation {
  let celebrationInformation = new CelebrationInformation();
  if (StringManagement.HasLiturgyContent(celebrationInformationFromCelebration.Title)) {
    celebrationInformation = celebrationInformationFromCelebration;
  } else {
    celebrationInformation.Title = '';
    celebrationInformation.Description = '-';
    liturgySpecificDayInformation.CelebrationType = CelebrationType.Fair;
    if (
      liturgySpecificDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.HolyWeek ||
      liturgySpecificDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum
    ) {
      celebrationInformation.Title = DateManagement.WeekDayName(liturgySpecificDayInformation.Date.getDay()) + ' Sant';
    } else if (liturgySpecificDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterOctave) {
      celebrationInformation.Title = 'Octava de Pasqua';
    } else if (
      liturgySpecificDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave &&
      liturgySpecificDayInformation.SpecialCelebration.SpecialCelebrationType !==
        SpecialCelebrationTypeEnum.StrongTime &&
      liturgySpecificDayInformation.SpecialCelebration.SpecialCelebrationType !== SpecialCelebrationTypeEnum.SpecialDay
    ) {
      celebrationInformation.Title = 'Octava de Nadal';
    } else if (liturgySpecificDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.LentAshes) {
      celebrationInformation.Title = 'Cendra';
    } else if (liturgySpecificDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventFairs) {
      celebrationInformation.Title = 'Fèria d’Advent';
    } else if (liturgySpecificDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday) {
      celebrationInformation.Title = 'Diumenge de Rams';
    }
  }
  return celebrationInformation;
}
