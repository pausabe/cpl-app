import CelebrationInformation from '../../models/hours-liturgy/CelebrationInformation';
import { LiturgySpecificDayInformation, SpecialCelebrationTypeEnum } from '../../models/LiturgyDayInformation';
import { CelebrationType } from '../databaseEnums';
import { SpecificLiturgyTimeType } from '../celebrationTimeEnums';
import { StringManagement } from '../../utils/StringManagement';
import { DateManagement } from '../../utils/DateManagement';
import * as PrecedenceService from '../precedenceService';

export function obtainCelebrationInformation(
  liturgySpecificDayInformation: LiturgySpecificDayInformation,
  celebrationInformationFromCelebration: CelebrationInformation,
): CelebrationInformation {
  // With this service I'm trying to separate Celebration by some kind of Saint from Celebration from the liturgy time
  let celebrationInformation = buildCelebrationInformation(
    liturgySpecificDayInformation,
    celebrationInformationFromCelebration,
  );
  celebrationInformation.precedence = PrecedenceService.obtainPrecedenceByLiturgyTime(
    liturgySpecificDayInformation,
    celebrationInformationFromCelebration,
  );
  return celebrationInformation;
}

function buildCelebrationInformation(
  liturgySpecificDayInformation: LiturgySpecificDayInformation,
  celebrationInformationFromCelebration: CelebrationInformation,
): CelebrationInformation {
  let celebrationInformation = new CelebrationInformation();
  if (StringManagement.hasLiturgyContent(celebrationInformationFromCelebration.title)) {
    celebrationInformation = celebrationInformationFromCelebration;
  } else {
    celebrationInformation.title = '';
    celebrationInformation.description = '-';
    liturgySpecificDayInformation.celebrationType = CelebrationType.Fair;
    if (
      liturgySpecificDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.HolyWeek ||
      liturgySpecificDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum
    ) {
      celebrationInformation.title = DateManagement.weekDayName(liturgySpecificDayInformation.date.getDay()) + ' Sant';
    } else if (liturgySpecificDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.EasterOctave) {
      celebrationInformation.title = 'Octava de Pasqua';
    } else if (
      liturgySpecificDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave &&
      liturgySpecificDayInformation.specialCelebration.specialCelebrationType !==
        SpecialCelebrationTypeEnum.StrongTime &&
      liturgySpecificDayInformation.specialCelebration.specialCelebrationType !== SpecialCelebrationTypeEnum.SpecialDay
    ) {
      celebrationInformation.title = 'Octava de Nadal';
    } else if (liturgySpecificDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.LentAshes) {
      celebrationInformation.title = 'Cendra';
    } else if (liturgySpecificDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs) {
      celebrationInformation.title = 'Fèria d’Advent';
    } else if (liturgySpecificDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday) {
      celebrationInformation.title = 'Diumenge de Rams';
    }
  }
  return celebrationInformation;
}
