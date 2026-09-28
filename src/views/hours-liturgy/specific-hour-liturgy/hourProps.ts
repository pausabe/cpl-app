import type HoursLiturgy from '../../../models/hours-liturgy/HoursLiturgy';
import type { LiturgySpecificDayInformation } from '../../../models/LiturgyDayInformation';
import type { Settings } from '../../../models/Settings';

// What every hour gets from HoursLiturgyPrayerScreen: the hours of the day, the day and the settings
export interface HourProps {
  hours: HoursLiturgy;
  today: LiturgySpecificDayInformation;
  settings: Settings;
}

// Lauds and the Office of Readings start with the invitatory, whose psalm cannot be one of the
// psalms of the day (titles); the psalm chosen is kept for the next time.
export interface InvitatoryHourProps extends HourProps {
  titles: string[];
  onInvitationPsalmChange: (psalmNumber: string) => void;
}
