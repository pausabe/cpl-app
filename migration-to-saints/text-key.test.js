// The join groups observations by textKey (lib/text-key.js). Getting its reach wrong is
// expensive in both directions: too narrow and cpl-app's cosmetic whitespace copies split
// one text into fake "variants" — that is what withheld psalm 50 from salmos_textos/73 and
// made the day panel claim Divendres Sant would break on a text it agrees with. Too wide
// and two genuinely different texts collapse into one, and the join writes the wrong one
// into a cell without ever reporting a conflict. Both cases are pinned here.

const { textKey } = require('./lib/text-key');

const same = (a, b) => expect(textKey(a)).toBe(textKey(b));
const different = (a, b) => expect(textKey(a)).not.toBe(textKey(b));

describe('textKey', () => {
  describe('ignores the whitespace cpl-app varies between copies of one text', () => {
    // All four are real shapes taken from salmos_textos/73's "variants".
    it('runs of spaces before a pointing marker', () => {
      same('esborreu les meves faltes;   *', 'esborreu les meves faltes;    *');
      same('tocaré i cantaré, †', 'tocaré i cantaré,    †');
    });

    it('trailing blanks at the end of a line', () => {
      same('purifiqueu-me dels pecats.  \n\nAra reconec', 'purifiqueu-me dels pecats.\n\nAra reconec');
    });

    it('tabs, leading indentation and surrounding blank lines', () => {
      same('x\ty', 'x y');
      same(' Salm 50\n', 'Salm 50');
      same('a\n\n\n\nb', 'a\n\nb');
      same('\r\nSalm 50\r\n', 'Salm 50');
    });
  });

  describe('keeps apart everything that is not blanks', () => {
    it('a line break is not the same as no line break', () => {
      different('Compadiu-vos de mi,\nDéu meu', 'Compadiu-vos de mi, Déu meu');
    });

    it('one blank line still separates verses that a single break does not', () => {
      different('purifiqueu-me dels pecats.\nAra reconec', 'purifiqueu-me dels pecats.\n\nAra reconec');
    });

    it('near-identical psalm citations', () => {
      different('Salm 62, 2-9', 'Salm 62, 2-8');
      different('Salm 50', 'Salm 56');
    });

    it('the pointing markers themselves', () => {
      different('tocaré i cantaré, *', 'tocaré i cantaré, †');
    });
  });

  it('passes non-strings through untouched, so an id or a null still groups by itself', () => {
    expect(textKey(null)).toBe(null);
    expect(textKey(undefined)).toBe(undefined);
    expect(textKey(7)).toBe(7);
  });
});
