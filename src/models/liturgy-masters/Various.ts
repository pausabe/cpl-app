// The Dies iræ that may be said instead of the hymn of the day in the last week of Ordinary Time,
// for one hour: the Latin text and the Catalan one
export interface DiesIraeHymn {
  latin: string;
  catalan: string;
}

export interface DiesIraeHymns {
  office: DiesIraeHymn | null;
  laudes: DiesIraeHymn | null;
  vespers: DiesIraeHymn | null;
}

const NO_DIES_IRAE: DiesIraeHymns = { office: null, laudes: null, vespers: null };

// The rows of the Dies iræ came after the bishops, so they are found by their name and not by their
// place: «Himne Dies iræ, Laudes (setmana XXXIV)», the Latin one first and the Catalan one after, as
// with the other hymns of the table. A database without them (all of them before 2026) has none.
function diesIraeHymns(databaseTable: { concepte?: string; oracio: string }[]): DiesIraeHymns {
  const plain = (text: string) =>
    text
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  const ofHour = (hour: string): DiesIraeHymn | null => {
    const rows = databaseTable.filter((row) => {
      const name = plain(row.concepte ?? '');
      return name.includes('dies irae') && name.includes(hour);
    });
    return rows.length >= 2 ? { latin: rows[0].oracio, catalan: rows[1].oracio } : null;
  };
  return { office: ofHour('ofici'), laudes: ofHour('laudes'), vespers: ofHour('vespres') };
}

export default class Various {
  static masterName: string = 'diversos';

  constructor(databaseTable: any = undefined) {
    if (databaseTable) {
      this.psalm94 = databaseTable[0].oracio;
      this.teDeumLatinAnthem = databaseTable[1].oracio;
      this.teDeumCatalanAnthem = databaseTable[2].oracio;
      this.laudesEvangelicalChant = databaseTable[3].oracio;
      this.ourFatherPrayer = databaseTable[4].oracio;
      this.vespersEvangelicalChant = databaseTable[5].oracio;
      this.thirdHourLatinFirstOptionAnthem = databaseTable[6].oracio;
      this.thirdHourCatalanFirstOptionAnthem = databaseTable[7].oracio;
      this.thirdHourLatinSecondOptionAnthem = databaseTable[8].oracio;
      this.thirdHourCatalanSecondOptionAnthem = databaseTable[9].oracio;
      this.sixthHourLatinFirstOptionAnthem = databaseTable[10].oracio;
      this.sixthHourCatalanFirstOptionAnthem = databaseTable[11].oracio;
      this.sixthHourLatinSecondOptionAnthem = databaseTable[12].oracio;
      this.sixthHourCatalSecondOptionAnthem = databaseTable[13].oracio;
      this.ninthHourLatinFirstOptionAnthem = databaseTable[14].oracio;
      this.ninthHourCatalanFirstOptionAnthem = databaseTable[15].oracio;
      this.ninthHourLatinSecondOptionAnthem = databaseTable[16].oracio;
      this.ninthHourCatalanSecondOptionAnthem = databaseTable[17].oracio;
      this.nightPrayerLatinFirstOptionAnthem = databaseTable[18].oracio;
      this.nightPrayerCatalanFirstOptionAnthem = databaseTable[19].oracio;
      this.nightPrayerLatinSecondOptionAnthem = databaseTable[20].oracio;
      this.nightPrayerCatalanSecondOptionAnthem = databaseTable[21].oracio;
      this.nightPrayerEvangelicalChant = databaseTable[22].oracio;
      this.nightPrayerFinalAntiphonLatinFirstOption = databaseTable[23].oracio;
      this.nightPrayerFinalAntiphonCatalanFirstOption = databaseTable[24].oracio;
      this.nightPrayerFinalAntiphonLatinSecondOption = databaseTable[25].oracio;
      this.nightPrayerFinalAntiphonCatalanSecondOption = databaseTable[26].oracio;
      this.nightPrayerFinalAntiphonLatinThirdOption = databaseTable[27].oracio;
      this.nightPrayerFinalAntiphonCatalanThirdOption = databaseTable[28].oracio;
      this.nightPrayerFinalAntiphonLatinFourthOption = databaseTable[29].oracio;
      this.nightPrayerFinalAntiphonCatalanFourthOption = databaseTable[30].oracio;
      this.nightPrayerFinalAntiphonLatinFifthOption = databaseTable[31].oracio;
      this.nightPrayerFinalAntiphonCatalanFifthOption = databaseTable[32].oracio;
      this.specialVesperChant = databaseTable[33].oracio;
      this.psalm99 = databaseTable[34].oracio;
      this.psalm66 = databaseTable[35].oracio;
      this.psalm23 = databaseTable[36].oracio;
      this.penitentialAct = databaseTable[37].oracio;
      this.pope = databaseTable[38].oracio;
      this.barcelonaBishop = databaseTable[39].oracio;
      this.gironaBishop = databaseTable[40].oracio;
      this.lleidaBishop = databaseTable[41].oracio;
      this.santFeliuBishop = databaseTable[42].oracio;
      this.solsonaBishop = databaseTable[43].oracio;
      this.tarragonaBishop = databaseTable[44].oracio;
      this.terrassaBishop = databaseTable[45].oracio;
      this.tortosaBishop = databaseTable[46].oracio;
      this.urgellBishop = databaseTable[47].oracio;
      this.vicBishop = databaseTable[48].oracio;
      this.andorraBishop = databaseTable[49].oracio;
      this.mallorcaBishop = databaseTable[50].oracio;
      this.menorcaBishop = databaseTable[51].oracio;
      this.diesIrae = diesIraeHymns(databaseTable);
    }
  }
  diesIrae: DiesIraeHymns = NO_DIES_IRAE;
  psalm94: string;
  teDeumLatinAnthem: string;
  teDeumCatalanAnthem: string;
  laudesEvangelicalChant: string;
  ourFatherPrayer: string;
  vespersEvangelicalChant: string;
  thirdHourLatinFirstOptionAnthem: string;
  thirdHourCatalanFirstOptionAnthem: string;
  thirdHourLatinSecondOptionAnthem: string;
  thirdHourCatalanSecondOptionAnthem: string;
  sixthHourLatinFirstOptionAnthem: string;
  sixthHourCatalanFirstOptionAnthem: string;
  sixthHourLatinSecondOptionAnthem: string;
  sixthHourCatalSecondOptionAnthem: string;
  ninthHourLatinFirstOptionAnthem: string;
  ninthHourCatalanFirstOptionAnthem: string;
  ninthHourLatinSecondOptionAnthem: string;
  ninthHourCatalanSecondOptionAnthem: string;
  nightPrayerLatinFirstOptionAnthem: string;
  nightPrayerCatalanFirstOptionAnthem: string;
  nightPrayerLatinSecondOptionAnthem: string;
  nightPrayerCatalanSecondOptionAnthem: string;
  nightPrayerEvangelicalChant: string;
  nightPrayerFinalAntiphonLatinFirstOption: string;
  nightPrayerFinalAntiphonCatalanFirstOption: string;
  nightPrayerFinalAntiphonLatinSecondOption: string;
  nightPrayerFinalAntiphonCatalanSecondOption: string;
  nightPrayerFinalAntiphonLatinThirdOption: string;
  nightPrayerFinalAntiphonCatalanThirdOption: string;
  nightPrayerFinalAntiphonLatinFourthOption: string;
  nightPrayerFinalAntiphonCatalanFourthOption: string;
  nightPrayerFinalAntiphonLatinFifthOption: string;
  nightPrayerFinalAntiphonCatalanFifthOption: string;
  specialVesperChant: string;
  psalm99: string;
  psalm66: string;
  psalm23: string;
  penitentialAct: string;
  pope: string;
  barcelonaBishop: string;
  gironaBishop: string;
  lleidaBishop: string;
  santFeliuBishop: string;
  solsonaBishop: string;
  tarragonaBishop: string;
  terrassaBishop: string;
  tortosaBishop: string;
  urgellBishop: string;
  vicBishop: string;
  andorraBishop: string;
  mallorcaBishop: string;
  menorcaBishop: string;
}
