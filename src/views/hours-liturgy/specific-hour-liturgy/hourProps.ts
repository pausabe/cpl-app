import type HoursLiturgy from '../../../models/hours-liturgy/HoursLiturgy';
import type { LiturgySpecificDayInformation } from '../../../models/LiturgyDayInformation';
import type { Settings } from '../../../models/Settings';

// Whether the Dies iræ is chosen instead of the hymn of the day, in the last week of Ordinary Time;
// the choice is kept for the next hour (onChange)
export interface DiesIraeChoice {
  chosen: boolean;
  onChange: (chosen: boolean) => void;
}

// What every hour gets from HoursLiturgyPrayerScreen: the hours of the day, the day, the settings
// and the choice of the Dies iræ
export interface HourProps {
  hours: HoursLiturgy;
  today: LiturgySpecificDayInformation;
  settings: Settings;
  diesIrae?: DiesIraeChoice;
}

// Lauds and the Office of Readings start with the invitatory, whose psalm cannot be one of the
// psalms of the day (titles); the psalm chosen is kept for the next time.
export interface InvitatoryHourProps extends HourProps {
  titles: string[];
  onInvitationPsalmChange: (psalmNumber: string) => void;
}
