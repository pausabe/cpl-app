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

const { fingerprint } = require('./lib/citation-key');

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
});
