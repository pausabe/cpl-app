import { sha256 } from './sha256';
import type { SpeechParagraph } from './paragraph';

// Who says each piece of an hour, what is said and how long the silence after it is. Two choirs
// that alternate the strophes, as the Liturgy of the Hours is prayed in common (OGLH 122), a
// presider, and a reader who also says the titles. Pau chose it by ear on 8 October 2026.
//
//  - Whoever says the antiphon starts the psalm, and says it again at the end (OGLH 123, 260).
//  - The invitatory, responsorially: the cantor says the antiphon, the people repeat it and say it
//    after every strophe (OGLH 34).
//  - The presider: the opening verse, the intercessions, the prayer and the blessing (OGLH 256).
//  - The people (the second choir): the responses, the second part of each intercession and the
//    Lord's Prayer (OGLH 193, 196).
//  - The Gospel of the day that Lauds can take (Configuració), as at Mass: announced by the reader
//    and read by the presider (the Passion, in its three voices), so that it is the audio already
//    made for the Mass.
//  - Not read: «Ant.», «V.» and «R.», the biblical references, the rubrics and the sentence under
//    each psalm title. «Glòria.» and «Pare nostre.» are said whole.
//
// The silences belong here and not to the audio: they can be changed without making a single piece
// again. Each piece is named by its voice and its words (key), never by where it goes.

export type SpeechRole = 'cor1' | 'cor2' | 'lector' | 'president';

export const VOICES: Record<SpeechRole, string> = {
  cor1: 'ca-ES-EnricNeural',
  cor2: 'ca-ES-JoanaNeural',
  lector: 'ca-ES-AlbaNeural',
  president: 'ca-ES-EnricNeural',
};

export interface SpeechPiece {
  role: SpeechRole;
  voice: string;
  text: string;
  // Seconds of silence after it
  pause: number;
  kind: string;
  // The part of the hour it belongs to («SALMÒDIA», «Evangeli»…), for jumping from part to part
  section: string | null;
  // The name of its audio: the same words in the same voice are the same audio anywhere
  key: string;
  // Where it is on the screen, for following it while it plays: the paragraph it comes from (in the
  // order the screen hands them) and the strophe of that paragraph (0 if it is not one of several)
  paragraph: number;
  strophe: number;
}

// Seconds of silence after each kind of piece
export const PAUSES = {
  // Between two pieces of one long paragraph
  sentence: 0.3,
  // A little less than at first: Pau found the strophes too far apart (8 October 2026)
  strophe: 0.5,
  versicle: 0.45,
  antiphon: 0.9,
  title: 0.6,
  section: 0.5,
  reading: 2.5,
  half: 0.35,
  end: 1.3,
};

const SECTION_NAMES: Record<string, string> = {
  INVITATORI: 'Invitatori',
  HIMNE: 'Himne',
  SALMÒDIA: 'Salmòdia',
  'LECTURA BREU': 'Lectura breu',
  'RESPONSORI BREU': 'Responsori breu',
  EVANGELI: 'Evangeli',
  'CÀNTIC DE ZACARIES': 'Càntic de Zacaries',
  'CÀNTIC DE MARIA': 'Càntic de Maria',
  'CÀNTIC DE SIMEÓ': 'Càntic de Simeó',
  PREGÀRIES: 'Pregàries',
  ORACIÓ: 'Oració',
};
const ALTERNATED = ['INVITATORI', 'HIMNE', 'SALMÒDIA', 'CÀNTIC DE ZACARIES', 'CÀNTIC DE MARIA', 'CÀNTIC DE SIMEÓ'];
const RUBRIC_STARTS = ['És lloable', 'Aquí es poden', 'O bé', 'Es pot', 'Es diu', 'On sigui costum', 'Si '];
const ORDINAL: Record<string, string> = {
  I: 'primera part',
  II: 'segona part',
  III: 'tercera part',
  IV: 'quarta part',
};
const MASS_TITLES = ['Evangeli', 'Salm responsorial', 'Lectura primera', 'Lectura segona', 'Responsori'];

const GLORIA_1 = "Glòria al Pare i al Fill i a l'Esperit Sant.";
const GLORIA_2 = 'Com era al principi, ara i sempre i pels segles dels segles. Amén.';

// A piece is at most this long: a long paragraph of a reading goes in several, cut where a sentence
// ends. Azure makes up to 10 minutes of audio at a time, and a short piece is quicker to download,
// to jump to and to keep.
export const MAX_PIECE_CHARS = 1200;

// The words of a paragraph in pieces no longer than MAX_PIECE_CHARS, cut after a full stop (or a
// question, a colon, a semicolon), and after a comma only if a sentence is still too long
export function splitWords(words: string): string[] {
  if (words.length <= MAX_PIECE_CHARS) return [words];
  const group = (parts: string[]) => {
    const out: string[] = [];
    let current = '';
    for (const part of parts) {
      if (current && (current + part).length > MAX_PIECE_CHARS) {
        out.push(current.trim());
        current = '';
      }
      current += part;
    }
    if (current.trim()) out.push(current.trim());
    return out;
  };
  const sentences = words.match(/[^.!?;:]+(?:[.!?;:]+[»”"’)]*\s*|$)/g) ?? [words];
  return group(sentences).flatMap((piece) =>
    piece.length <= MAX_PIECE_CHARS ? [piece] : group(piece.match(/[^,]+(?:,\s*|$)/g) ?? [piece]),
  );
}

export function pieceKey(voice: string, text: string): string {
  return sha256(`${voice}\n${text}`).slice(0, 24);
}

// The words as they are said: one line, no pause marks of the psalms, no stray spaces, and of a
// response inside a canticle, «(R. Al·leluia.)», only the response
export function spoken(text: string): string {
  return text
    .replace(/\t/g, ' ')
    .replace(/[*†]/g, '')
    .replace(/\(R\.\s*/g, '(')
    .replace(/^\s*—\s*/, '')
    .trim()
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// The strophes of a paragraph: what goes between blank lines. The screen splits them the same way to
// mark the one being read.
export function strophes(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s !== '');
}

// The Passion, as the liturgy reads it, in three voices: the chronicler («C.»), Christ («+») and the
// others who speak («S.»). The marks say who reads each part and are not read. Null for a text
// without them.
const PASSION_ROLES: Record<string, SpeechRole> = { 'C.': 'lector', '+': 'president', 'S.': 'cor2' };

export function passionParts(text: string): { role: SpeechRole; text: string }[] | null {
  if (!/(?:^|\s)C\.\s/.test(text) || !/(?:^|\s)(?:\+|S\.)\s/.test(text)) return null;
  const parts: { role: SpeechRole; text: string }[] = [];
  let role: SpeechRole = 'president';
  let at = 0;
  for (const mark of text.matchAll(/(?:^|\s)(C\.|S\.|\+)\s+/g)) {
    const before = text.slice(at, mark.index).trim();
    if (before) parts.push({ role, text: before });
    role = PASSION_ROLES[mark[1]];
    at = (mark.index ?? 0) + mark[0].length;
  }
  const rest = text.slice(at).trim();
  if (rest) parts.push({ role, text: rest });
  return parts;
}

function isReference(line: string): boolean {
  const l = line.trim();
  if (l.startsWith('Salm ') || l.startsWith('Càntic')) return false;
  // «Cf. Mt 7, 24; 1Pe 2, 22»: where the words come from, however long
  if (/^cf\.\s/i.test(l)) return true;
  return /\d/.test(l) && l.length < 40 && !/[a-zà-ú]{5,}\s+[a-zà-ú]{4,}/.test(l);
}

// What is said of a psalm, canticle or reading title: no verse numbers and no references
function titleWords(text: string): string {
  const out: string[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const psalm = /^(Salm\s+\d+)(.*?)(?:\s+-\s+([IV]+))?\s*$/.exec(line);
    if (psalm) out.push(psalm[1] + (psalm[3] ? `, ${ORDINAL[psalm[3]] ?? ''}` : ''));
    else if (!isReference(line)) out.push(line.replace(/\s*\(R\.:[^)]*\)/g, ''));
  }
  const kept = out.filter((o) => o !== '').map((o) => o.replace(/\.+$/, ''));
  return kept.length ? `${kept.join('. ')}.` : '';
}

const lookOf = (run: { look: string; italic: boolean }) => run.look + (run.italic ? 'i' : '');

class Builder {
  out: SpeechPiece[] = [];
  section: string | null = null;
  afterTitle = false;
  choir: SpeechRole = 'cor1';
  // Which paragraph and which of its strophes is being turned into pieces
  paragraphIndex = 0;
  stropheIndex = 0;

  constructor(
    private hour: string,
    private ourFather: string,
  ) {}

  say(role: SpeechRole, text: string, pause: number, kind: string) {
    const words = spoken(text);
    if (!words) return;
    const voice = VOICES[role];
    const pieces = splitWords(words);
    pieces.forEach((piece, i) => {
      const after = i === pieces.length - 1 ? pause : PAUSES.sentence;
      this.out.push({
        role,
        voice,
        text: piece,
        pause: after,
        kind,
        section: this.section,
        key: pieceKey(voice, piece),
        paragraph: this.paragraphIndex,
        strophe: this.stropheIndex,
      });
    });
  }

  // A text with responses inside, «… mai errades. R. Al·leluia.» or a whole «R. Perdura eternament el
  // seu amor.»: the text by whoever says it, and each response by the people, without the «R.»
  sayWithResponses(role: SpeechRole, text: string, pause: number, kind: string) {
    const parts = text.split(/(?:^|\s)R\.\s+/);
    if (parts.length === 1) return this.say(role, text, pause, kind);
    parts.forEach((part, i) => {
      const last = i === parts.length - 1;
      if (i === 0) {
        if (part.trim()) this.say(role, part, PAUSES.half, kind);
      } else this.say('cor2', part, last ? pause : PAUSES.half, 'resposta');
    });
  }

  pause(seconds: number) {
    const last = this.out[this.out.length - 1];
    if (last) last.pause = Math.max(last.pause, seconds);
  }

  gloria(alleluia = false) {
    this.say('cor1', GLORIA_1, PAUSES.half, 'glòria');
    this.say('cor2', GLORIA_2 + (alleluia ? ' Al·leluia.' : ''), PAUSES.strophe, 'glòria');
  }

  alternate(text: string, kind: string) {
    for (const [i, s] of strophes(text).entries()) {
      this.stropheIndex = i;
      if (spoken(s).startsWith('Glòria al Pare')) {
        this.gloria(s.includes('Al·leluia'));
        continue;
      }
      this.sayWithResponses(this.choir, s, PAUSES.strophe, kind);
      this.choir = this.choir === 'cor1' ? 'cor2' : 'cor1';
    }
  }

  paragraph(runs: SpeechParagraph) {
    const first = runs[0];
    const firstLook = lookOf(first);
    const whole = runs.map((r) => r.text).join('');
    const label = first.look === 'R' && runs.length > 1 ? first.text.trim() : null;
    const body =
      label !== null
        ? runs
            .slice(1)
            .map((r) => r.text)
            .join('')
        : '';

    // A section title, in capitals
    const bare = whole.trim().replace(/\s*\(.*\)$/, '');
    if (runs.length === 1 && firstLook === 'R' && bare.toUpperCase() === bare && /[A-ZÀ-Ú]{4}/.test(bare)) {
      this.section = bare;
      this.afterTitle = false;
      this.choir = 'cor1';
      this.pause(PAUSES.end);
      if (SECTION_NAMES[bare]) this.say('lector', `${SECTION_NAMES[bare]}.`, PAUSES.section, 'secció');
      return;
    }

    // V. / R. / Ant.
    if (label !== null) {
      if (label.startsWith('V.')) {
        const presider = this.section === null || this.section === 'CONCLUSIÓ';
        this.say(presider ? 'president' : 'cor1', body, PAUSES.versicle, 'versicle');
      } else if (label.startsWith('R.')) {
        this.say('cor2', body, this.section === 'ORACIÓ' ? PAUSES.end : PAUSES.strophe, 'resposta');
      } else if (label.startsWith('Ant')) {
        if (this.section === 'INVITATORI') {
          const said = this.out.some((p) => p.kind === 'antífona' && p.section === 'INVITATORI');
          if (!said) this.say('cor1', body, PAUSES.versicle, 'antífona');
          this.say('cor2', body, PAUSES.antiphon, 'antífona');
        } else {
          this.say('cor1', body, PAUSES.antiphon, 'antífona');
        }
        this.choir = 'cor1';
      } else {
        this.say('lector', whole, PAUSES.title, 'títol');
      }
      return;
    }

    // In italics: the Glòria, the Lord's Prayer, the response of the intercessions. The sentence
    // under a psalm title is not read.
    if (firstLook === 'Ti' && runs.length === 1) {
      const t = whole.trim();
      if (t === 'Glòria.') this.gloria();
      else if (t === 'Pare nostre.') this.say('cor2', this.ourFather, PAUSES.end, 'pare nostre');
      else if (this.section === 'PREGÀRIES') this.say('cor2', t, PAUSES.strophe, 'resposta');
      return;
    }
    if (firstLook === 'Ri') return;

    // Other red text: titles, references and rubrics
    if (first.look === 'R') {
      const t = whole.trim();
      if (t.startsWith('Al·leluia')) {
        this.pause(PAUSES.end);
        this.say('cor2', 'Al·leluia.', PAUSES.title, 'aclamació');
        this.section = 'AL·LELUIA';
        return;
      }
      const lines = t.split('\n').filter((l) => l.trim() !== '');
      if (RUBRIC_STARTS.some((s) => t.startsWith(s)) || lines.every(isReference)) return;
      if (this.hour === 'Missa' && (t === 'Lectura primera' || t === 'Lectura segona')) {
        this.section = t;
        this.pause(PAUSES.end);
        return;
      }
      if (t.startsWith('Antífona final')) {
        this.pause(PAUSES.end);
        this.section = 'MARE DE DÉU';
      }
      const words = titleWords(t);
      if (words) {
        if (MASS_TITLES.includes(t)) {
          this.section = t;
          this.pause(PAUSES.end);
        }
        this.say('lector', words, PAUSES.title, 'títol');
      }
      this.afterTitle = true;
      this.choir = 'cor1';
      return;
    }

    // Text
    const t = whole;
    const section = this.section ?? '';
    this.afterTitle = false;
    if (t.trim().startsWith('Glòria al Pare')) {
      this.gloria(t.includes('Al·leluia'));
    } else if (ALTERNATED.includes(section)) {
      this.alternate(t, 'estrofa');
    } else if (section === 'MARE DE DÉU') {
      this.say('cor2', t, PAUSES.end, 'antífona');
    } else if (section === 'PREGÀRIES') {
      for (const [i, s] of strophes(t).entries()) {
        this.stropheIndex = i;
        // The presider says the first part and the people the second, after the dash (OGLH 193)
        const dash = /\n\s*—/.exec(s);
        const firstPart = dash ? s.slice(0, dash.index) : s;
        const second = dash ? s.slice(dash.index + dash[0].length) : null;
        this.say('president', firstPart, second !== null ? PAUSES.half : PAUSES.strophe, 'intenció');
        if (second !== null) this.say('cor2', second, PAUSES.strophe, 'intenció');
      }
    } else if (section === 'ORACIÓ' || section === 'CONCLUSIÓ') {
      this.say('president', t, t.trim() === 'Preguem.' ? PAUSES.half : PAUSES.strophe, 'oració');
    } else if (section === 'Salm responsorial') {
      let response: string | null = null;
      for (let [i, s] of strophes(t).entries()) {
        this.stropheIndex = i;
        const r = /^R\.\s*([\s\S]+)$/.exec(s.trim());
        if (r) {
          response = r[1];
          this.say('cor2', response, PAUSES.strophe, 'resposta');
          continue;
        }
        const endsWithResponse = /\sR\.\s*$/.test(s);
        s = s.replace(/\sR\.\s*$/, '');
        this.say('lector', s, endsWithResponse ? PAUSES.half : PAUSES.strophe, 'estrofa');
        if (endsWithResponse && response) this.say('cor2', response, PAUSES.strophe, 'resposta');
      }
    } else if (section === 'AL·LELUIA') {
      this.say('cor1', t, PAUSES.half, 'aclamació');
      this.say('cor2', 'Al·leluia.', PAUSES.end, 'aclamació');
      this.section = 'Evangeli';
    } else if (section === 'Evangeli' || section === 'EVANGELI') {
      const passion = passionParts(t);
      if (passion) for (const part of passion) this.say(part.role, part.text, PAUSES.half, 'evangeli');
      else this.say('president', t, PAUSES.strophe, 'evangeli');
      if (t.trim().startsWith('En aquell temps') || t.length > 400) this.pause(PAUSES.reading);
    } else if (
      ['LECTURA BREU', 'Lectura primera', 'Lectura segona'].includes(section) ||
      this.hour === 'Missa' ||
      this.hour === 'Ofici'
    ) {
      for (const [i, s] of strophes(t).entries()) {
        this.stropheIndex = i;
        this.sayWithResponses('lector', s, PAUSES.strophe, 'lectura');
      }
      if (t.length > 200) this.pause(PAUSES.reading);
    } else if (section === '' && this.hour === 'Completes' && t.startsWith('Jo confesso')) {
      this.say('cor2', t, PAUSES.end, 'confessió');
    } else {
      this.sayWithResponses('lector', t, PAUSES.strophe, 'text');
    }
  }
}

// The script of one hour («Laudes», «Missa»…) from its paragraphs
export function speechScript(hour: string, paragraphs: SpeechParagraph[], ourFather: string): SpeechPiece[] {
  const builder = new Builder(hour, ourFather);
  paragraphs.forEach((runs, i) => {
    builder.paragraphIndex = i;
    builder.stropheIndex = 0;
    if (runs.length) builder.paragraph(runs);
  });
  return builder.out;
}
