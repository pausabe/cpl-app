// The optional memorials a day offers in the place of the settings, to choose one or none: the rows
// of santsMemories (services/databaseDataService, obtainOptionalMemorialsAsync).
export interface OptionalMemorial {
  // The row in santsMemories
  id: number;
  // «Sants Dionís, bisbe, i companys, màrtirs»
  title: string;
  // The story of the saint, or "-"
  description: string;
}

export interface OptionalMemorials {
  // In the order of the table; none on a day without optional memorials
  options: OptionalMemorial[];
  // The one whose texts are prayed, or null for the weekday
  chosen: number | null;
}

export const NO_OPTIONAL_MEMORIALS: OptionalMemorials = { options: [], chosen: null };
