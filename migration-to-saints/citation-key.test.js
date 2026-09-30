// A citation is the only thing the Catalan and the Spanish sides can be compared on while the
// Catalan cell is still empty, so fingerprint() decides both "is this the same reading?" in
// the review and "which Common does this day use?" in the proposal. Its failure mode is the
// dangerous one: a WRONG token that collides makes two different readings compare equal, and
// the review reports "cap divergència" over a real one.
//
// MIGRA-002: the chapter was read by stripping leading non-digits, so any book whose
// abbreviation opens with an ordinal handed back the ordinal instead — "1Pe 5, 1-4" and
// "1Pe 1, 22-23" both came out as 1PET|1. Both are live on 3 September 2026: the Common of
// Pastors gives 1Pe 5, 1-4 at Vespers and the weekday gives 1Pe 1, 22-23.

const { fingerprint, readingMatch } = require('./lib/citation-key');

const token = (s) => fingerprint(s).token;
const same = (a, b) => expect(token(a)).toBe(token(b));
const different = (a, b) => expect(token(a)).not.toBe(token(b));

describe('fingerprint', () => {
  describe('reads the chapter after the book, not the ordinal in front of it', () => {
    it('keeps two chapters of the same numbered book apart', () => {
      different('1Pe 5, 1-4', '1Pe 1, 22-23');
      expect(token('1Pe 5, 1-4')).toBe('1PET|5');
      expect(token('1Pe 1, 22-23')).toBe('1PET|1');
    });

    it('does the same for every numbered book the two editions use', () => {
      expect(token('2C 12, 9b-10')).toBe('2COR|12');
      expect(token('1C 7, 32.34')).toBe('1COR|7');
      expect(token('2Tm 2, 10-12a')).toBe('2TIM|2');
      expect(token('1Jn 2, 3-6')).toBe('1JN|2');
    });

    it('leaves the verses without the book name stuck to them', () => {
      expect(fingerprint('1Pe 5, 1-4').verses).toBe('1-4');
      expect(fingerprint('2 Co 12, 9b-10').verses).toBe('9b-10');
    });

    it('still reads unnumbered books and psalms', () => {
      expect(token('Rm 14, 17-19')).toBe('ROM|14');
      expect(token('Salm 79')).toBe('PS|79');
      expect(token('Càntic Cf. Ap 19, 1-2.5-7')).toBe('REV|19');
    });
  });

  describe('ignores how each edition spells the same book', () => {
    it('the Catalan and Spanish abbreviations of Hebrews', () => {
      // What tells us the Spanish saint tab of 3 September took the Common of Pastors
      // (He 13, 7-9a) and not the Common of Doctors (Sa 7, 13-14).
      same('He 13, 7-9a', 'Hb 13, 7-9a');
      different('He 13, 7-9a', 'Sa 7, 13-14');
    });

    it('the space the Spanish puts after an ordinal', () => {
      same('1Pe 5, 1-4', '1 P 5, 1-4');
      same('2C 12, 9b-10', '2 Co 12, 9b-10');
    });

    it('a psalm named at different precision', () => {
      same('Salm 109', 'Salmo 109, 1-5. 7');
    });
  });

  // MIGRA-015: the table only knew the books the days reviewed so far happened to use, and a
  // book it does not know falls to ANON — which fails in BOTH directions. Forwards, the join
  // of the Mass matches cpl-app's reading to the cell BY THE CITATION, so an unknown book
  // leaves the cell unmigrated: "Ecle 3,1-11" against "Ecles 3, 1-11" cost the whole first
  // reading of 25 September 2026, and 87 more citations across the calendar. Backwards, two
  // unknown books with the same chapter number compare EQUAL, and Judges passed for Judith.
  describe('knows every book the two editions name (MIGRA-015)', () => {
    const PAIRS = [
      ['Ecle 3,1-11', 'Ecles 3, 1-11', 'ECCL'],
      ['Sir 44, 1.10-15', 'Eclo 44, 1.10-15', 'SIR'],
      ['1S 3,1-10', '1 Sam 3, 1-10', '1SAM'],
      ['2S 18,9-10', '2 Sam 18, 9-10', '2SAM'],
      ['2M 7,1-2.9-14', '2 Mac 7, 1-2.9-14', '2MACC'],
      ['1M 4,36-37', '1 Mac 4, 36-37', '1MACC'],
      ['Jt 6,11-24a', 'Jc 6, 11-24', 'JUDG'],
      ['Js 3,7-10a', 'Jos 3, 7-10a', 'JOSH'],
      ['1Cr 15,3-4', '1 Cro 15, 3-4', '1CHR'],
      ['2Cr 24,17-25', '2 Cro 24, 17-25', '2CHR'],
      ['Esd 1,1-6', 'Esd 1, 1-6', 'EZRA'],
      ['Ne 8,1-12', 'Ne 8, 1-12', 'NEH'],
      ['Rt 2,1-3', 'Rt 2, 1-3', 'RUTH'],
      ['Ct 3,1-4', 'Cnt 3, 1-4', 'SONG'],
      ['Jon 3,1-10', 'Jon 3, 1-10', 'JON'],
      ['Sa 3,1-9', 'Sab 3, 1-9', 'WIS'],
      ['Lv 19,1-2', 'Lev 19, 1-2', 'LEV'],
      ['Dn 13,1-9', 'Dan 13, 1-9', 'DAN'],
      ['Na 2,1.3', 'Nah 2, 1. 3', 'NAH'],
      ['Ha 3,2-4', 'Habacuc 3, 2-4', 'HAB'],
      ['Jud 17.20b-25', 'Jds 17.20b-25', 'JUDE'],
      ['He 10,12-14', 'Heb 10, 12-14', 'HEB'],
    ];

    it.each(PAIRS)('%s and %s are both %s', (ca, es, key) => {
      expect(fingerprint(ca).key).toBe(key);
      expect(fingerprint(es).key).toBe(key);
      same(ca, es);
    });

    it('keeps Judges apart from Judith, which share a chapter and nothing else', () => {
      // 21 cells compared equal on this before: both sides were "unknown book, chapter 2".
      different('Jt 2,11-19', 'Jdt 2, 11-19');
      expect(token('Jdt 2, 11-19')).toBe('JDT|2');
    });

    it('leaves a Spanish rubric alone, since "Si…" opens one and is not Sirach', () => {
      expect(fingerprint('Si la fiesta cae en domingo, la Opción 2 se toma como segunda lectura.'))
        .toBeNull();
    });
  });
});

// MIGRA-018: the join chose between two readings of the same chapter on the chapter alone, and
// eight Mass readings went to saints-app with another Mass's text. These are the eight, as the
// Spanish cell and the cpl-app reading that was filed into it: each shares book and chapter
// and none is the same reading.
describe('readingMatch', () => {
  const FILED_WRONG = [
    ['Lc 1, 5-17', 'Lc 1,57-66.80: _S’ha de dir Joan_'],                      // vigil of John the Baptist
    ['Sal 88, 4-5.16-17.27.29', 'Sl 88,2-3.4-5.27 i 29 (R.: 2a)'],             // vigil of Christmas
    ['Sal 36, 3-6.30-31', 'Sl 36,3-4.18 i 23.27 i 29 (R.: 39a)'],             // Leo the Great
    ['Jn 17, 20-26', 'Jo 17,1-11a'],                                            // Philip Neri
    ['Mt 25, 31-40', 'Mt 25,1-13'],                                             // Teresa Jornet
    ['Rm 12, 3-13', 'Rm 12,5-16a'],                                             // Charles Borromeo
    ['Lectura Sálmica  Lc 1, 46-55', 'Lc 1,69-70.71-73.74-75 (R.: 68)'],       // Our Lady of the Rosary
    ['Sal 30, 3cd-4.6.8ab.16bc-17', 'Sl 30,20.21.22.23.24 (R.: 25)'],         // Common of Martyrs
  ];

  it.each(FILED_WRONG)('%s is not the reading %s', (es, ca) => {
    expect(fingerprint(es).token).toBe(fingerprint(ca).token);
    expect(readingMatch(ca, es)).toBeLessThan(2);
  });

  it('turns down verses that do not meet', () => {
    expect(readingMatch('Lc 1,57-66.80', 'Lc 1, 5-17')).toBe(0);
    expect(readingMatch('Mt 25,1-13', 'Mt 25, 31-40')).toBe(0);
  });

  it('still takes the same reading spelled the other edition’s way', () => {
    expect(readingMatch('Mc 1,21b-28', 'Mc 1, 21-28')).toBe(2);
    expect(readingMatch('Sl 87,10bc-11.12-13.14-15 (R.: 3a)', 'Sal 87, 10-15')).toBe(2);
    expect(readingMatch('Sl 36,3-4.18 i 23.27 i 29 (R.: 39a)', 'Sal 36, 3-4.18.23.27.29')).toBe(2);
    expect(readingMatch('Rm 12,5-16a', 'Rm 12, 5-16')).toBe(2);
    expect(readingMatch('Gn 1,1–2,2', 'Gn 1, 1-2, 2')).toBe(2);
    expect(readingMatch('Sa 11,23–12,2', 'Sab 11, 22-12, 2')).toBeGreaterThan(0);
    // Hosea 2 is numbered two verses apart in the two editions.
    expect(readingMatch('Os 2,14.15b-16.19-20', 'Os 2, 16-18.21-22')).toBe(2);
  });

  it('keeps a reading whose verses one side does not spell out', () => {
    expect(readingMatch('Salm 109', 'Salmo 109, 1-5. 7')).toBe(1);
  });

  it('compares a reading that runs on into another chapter on both halves', () => {
    // The Spanish cell has a typo in the first half ("17" for "1-7"); the second half agrees.
    expect(readingMatch('Ez 9,1-7;10,18-22', 'Ez 9, 17; 10, 18-22')).toBe(1);
    expect(readingMatch('Tb 1,1a.2;2,1-9', 'Tob 1, 3; 2, 1b-8')).toBe(1);
  });
});
