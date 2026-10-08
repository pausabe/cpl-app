import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';
import PrayerText from './PrayerText';
import Rubric from './Rubric';
import SectionTitle from './SectionTitle';
import type { SpeechParagraph, SpeechRun } from '../view-models/speech/paragraph';

// The prayer as the voice will read it (view-models/speech/paragraph.ts), taken from the elements
// PrayerFlow is handed, the same ones the screen draws: the hour
// blocks are functions that give elements on purpose (hourBlocks.tsx), so every text is in sight
// here. What is not text (a line, a button, a chooser, the Gospel video) is not read. The phone and
// the audio generator both get the paragraphs from here: what the phone asks for is, word for word,
// what was generated.
type Style = { color?: unknown; fontStyle?: unknown };

function flatten(style: unknown): Style {
  if (!style) return {};
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flatten));
  return style as Style;
}

export function speechParagraphs(children: ReactNode, rubricColor: string): SpeechParagraph[] {
  return speechParagraphElements(children, rubricColor).paragraphs;
}

// The same, with the element of the screen each paragraph comes from, in the same order: what the
// screen marks while that paragraph is read (ListeningFlow)
export function speechParagraphElements(
  children: ReactNode,
  rubricColor: string,
): { paragraphs: SpeechParagraph[]; elements: React.ReactElement[] } {
  const paragraphs: SpeechParagraph[] = [];
  const elements: React.ReactElement[] = [];

  // The runs of one text and of the texts inside it, with the look each one inherits
  const runsOf = (node: ReactNode, style: Style, into: SpeechRun[]) => {
    React.Children.forEach(node, (child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        const run: SpeechRun = {
          look: style.color === rubricColor ? 'R' : 'T',
          italic: style.fontStyle === 'italic',
          text: String(child),
        };
        const last = into[into.length - 1];
        if (last && last.look === run.look && last.italic === run.italic) last.text += run.text;
        else into.push(run);
        return;
      }
      if (!React.isValidElement(child)) return;
      const props = child.props as Record<string, any>;
      if (child.type === React.Fragment) runsOf(props.children, style, into);
      else if (child.type === Text || child.type === PrayerText)
        runsOf(props.children, { ...style, ...flatten(props.style) }, into);
    });
  };

  const add = (runs: SpeechRun[], element: React.ReactElement) => {
    if (runs.some((run) => run.text.trim() !== '')) {
      paragraphs.push(runs);
      elements.push(element);
    }
  };

  const visit = (node: ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return;
      const props = child.props as Record<string, any>;
      if (child.type === React.Fragment || child.type === View) {
        visit(props.children);
      } else if (child.type === SectionTitle) {
        const runs: SpeechRun[] = [];
        runsOf(props.children, { color: rubricColor }, runs);
        add(runs, child);
      } else if (child.type === Rubric) {
        const runs: SpeechRun[] = [];
        runsOf(props.label, { color: rubricColor, ...flatten(props.labelStyle) }, runs);
        runsOf(props.children, flatten(props.textStyle), runs);
        add(runs, child);
      } else if (child.type === Text || child.type === PrayerText) {
        const runs: SpeechRun[] = [];
        runsOf(props.children, flatten(props.style), runs);
        add(runs, child);
      }
      // Anything else (a line, a button, a chooser, a video) has nothing to be read
    });
  };

  visit(children);
  return { paragraphs, elements };
}
