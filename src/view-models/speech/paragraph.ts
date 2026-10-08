// The prayer as the voice reads it: its paragraphs in reading order, each one a few runs of text with
// the look they have on the screen. A run is a rubric (R, red) or text (T), straight or in italics.
// components/speechParagraphs.ts takes them from what the screen draws.
export interface SpeechRun {
  look: 'R' | 'T';
  italic: boolean;
  text: string;
}

export type SpeechParagraph = SpeechRun[];
