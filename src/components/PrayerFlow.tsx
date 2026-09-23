import React, { ReactElement, ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import CopyButton from './CopyButton';
import Gap, { GapSize } from './Gap';
import PrayerText from './PrayerText';
import Rubric, { RubricProps, rubricSpans } from './Rubric';
import SectionTitle from './SectionTitle';
import { PrayerTextStyles, prayerTextStyles, useTheme } from '../theme';

// Prayer that is selected in one go, from wherever to wherever.
//
// A selection never leaves the view it started in, neither on iOS nor on Android: as long as
// each paragraph is a text of its own, the reading cannot be taken along with the responsory
// that follows it. So the paragraphs that follow one another are sewn here into a single text,
// with the space between them written inside it, and the selection runs through all of them.
//
// It cannot sew everything: a line that goes across (HR), a button, a chooser or a row with a
// layout of its own breaks the text, and each of those starts a new one. For what no selection
// can reach, the flow ends with a «Copia-ho tot» that takes the whole screen.
interface PrayerFlowProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

// A piece of the flow, once it is known what can be done with it
type Piece =
  | { kind: 'text'; spans: ReactElement; align: string; element: ReactNode; gapAfter?: number }
  | { kind: 'gap'; height: number; element: ReactNode }
  | { kind: 'other'; element: ReactNode };

// This much space, written as an empty line inside the text, is what a Gap was between two
// paragraphs of its own.
const gapLine = (height: number): TextStyle => ({ fontSize: 1, lineHeight: height });

// The empty lines that hold the paragraphs apart are not read text: the golden of the screens
// (__tests__/helpers/renderedText.js) knows them by this and walks past them, so that what is
// compared is still word for word what it was when each paragraph was a text of its own.
export const PRAYER_GAP_TEST_ID = 'prayer-gap';

function flatten(style: unknown): TextStyle {
  if (!style) return {};
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flatten));
  return style as TextStyle;
}

const alignOf = (style: unknown): string => flatten(style).textAlign ?? 'left';

const UPPERCASE: TextStyle = { textTransform: 'uppercase' };

// A View that only holds things together (the one a conditional block is wrapped in) is not a
// box of its own: what is inside it goes on with the flow. One with a style of its own, which
// puts its children in a row or gives them room, stays as it is.
const isTransparent = (props: Record<string, unknown>) =>
  Object.keys(props).every((name) => name === 'children') && props.children !== undefined;

function heightOf(size: GapSize | undefined, gap: number): number {
  if (typeof size === 'number') return size;
  return size === 'small' ? Math.round(gap / 2) : gap;
}

// Everything the flow is made of, in reading order, with the Views that only hold things
// together opened up
function piecesOf(children: ReactNode, styles: PrayerTextStyles, gap: number): Piece[] {
  const pieces: Piece[] = [];
  for (const child of React.Children.toArray(children)) {
    if (!React.isValidElement(child)) {
      pieces.push({ kind: 'other', element: child });
      continue;
    }
    const props = child.props as Record<string, any>;
    if (child.type === React.Fragment) {
      pieces.push(...piecesOf(props.children, styles, gap));
    } else if (child.type === View && isTransparent(props)) {
      pieces.push(...piecesOf(props.children, styles, gap));
    } else if (child.type === Gap) {
      pieces.push({ kind: 'gap', height: heightOf(props.size, gap), element: child });
    } else if (child.type === SectionTitle) {
      const title = [styles.sectionTitle, props.uppercase === false ? null : UPPERCASE, props.style];
      pieces.push({
        kind: 'text',
        spans: <Text style={title}>{props.children}</Text>,
        align: alignOf(title),
        element: child,
        // What the title had as a margin below becomes space inside the text
        gapAfter: styles.sectionTitle.marginBottom as number,
      });
    } else if (child.type === Rubric) {
      pieces.push({
        kind: 'text',
        spans: rubricSpans(props as RubricProps, styles),
        align: alignOf(props.labelStyle ?? styles.red),
        element: child,
      });
    } else if (child.type === PrayerText && props.selectable === true && props.accessibilityRole === undefined) {
      pieces.push({
        kind: 'text',
        spans: <Text style={props.style}>{props.children}</Text>,
        align: alignOf(props.style),
        element: child,
      });
    } else {
      pieces.push({ kind: 'other', element: child });
    }
  }
  return pieces;
}

// iOS gives each paragraph of a text its own alignment, so a centred psalm title can be sewn
// to the verses around it. Android aligns the whole text at once, so there a change of
// alignment has to start another one, or the titles would stop being centred.
const sewsAcrossAlignment = () => Platform.OS === 'ios';

// The pieces that can be sewn together, from the one at `start`: the texts that follow it and
// the gaps between them. It stops at anything else, and a gap at the end is not part of it.
function runFrom(pieces: Piece[], start: number): number {
  const first = pieces[start] as { align: string };
  let end = start;
  for (let i = start; i < pieces.length; i++) {
    const piece = pieces[i];
    if (piece.kind === 'gap') continue;
    if (piece.kind !== 'text') break;
    if (!sewsAcrossAlignment() && piece.align !== first.align) break;
    end = i;
  }
  return end;
}

// What the screen says, in reading order, for the «Copia-ho tot»: the prayer and the titles of
// its parts, and nothing of what is only there to be pressed.
function plainText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (Array.isArray(node)) return node.map(plainText).join('');
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (React.isValidElement(node)) {
    const props = node.props as { children?: ReactNode; style?: unknown };
    const said = plainText(props.children);
    return flatten(props.style).textTransform === 'uppercase' ? said.toUpperCase() : said;
  }
  return '';
}

function wholeText(pieces: Piece[]): string {
  let text = '';
  let afterGap = false;
  for (const piece of pieces) {
    if (piece.kind === 'gap') {
      afterGap = true;
      continue;
    }
    const said = piece.kind === 'text' ? plainText(piece.spans) : '';
    if (!said) continue;
    if (text) text += afterGap ? '\n\n' : '\n';
    text += said;
    afterGap = false;
  }
  return text;
}

// Opening up the Views that only hold things together mixes children that were numbered apart:
// each piece is given a key of its own so that React does not take one for another.
function keyed(element: ReactNode, key: string): ReactNode {
  return React.isValidElement(element) ? React.cloneElement(element, { key }) : element;
}

export default function PrayerFlow({ children, style }: PrayerFlowProps) {
  const theme = useTheme();
  const styles = prayerTextStyles(theme);
  const pieces = piecesOf(children, styles, theme.prayer.gap);

  const drawn: ReactNode[] = [];
  let i = 0;
  while (i < pieces.length) {
    const piece = pieces[i];
    if (piece.kind !== 'text') {
      drawn.push(keyed(piece.element, `flow-${i}`));
      i += 1;
      continue;
    }
    const end = runFrom(pieces, i);
    const run = pieces.slice(i, end + 1);
    const texts = run.filter((p) => p.kind === 'text');
    if (texts.length < 2) {
      // Nothing to sew: it is drawn exactly as it was written
      drawn.push(keyed(piece.element, `flow-${i}`));
    } else {
      drawn.push(sewn(run, (piece as { align: string }).align, `flow-${i}`));
    }
    i = end + 1;
  }

  // What no selection can reach, because a button or a line across breaks it: everything the
  // screen says, in one go
  const whole = wholeText(pieces);
  return (
    <View style={style}>
      {drawn}
      {whole ? (
        <>
          <Gap />
          <CopyButton text={() => wholeText(pieces)} testID="copy-prayer" />
        </>
      ) : null}
    </View>
  );
}

// One text with every paragraph of the run inside it, the spaces included
function sewn(run: Piece[], align: string, key: string): ReactElement {
  const spans: ReactNode[] = [];
  let pendingGap: number | null = null;
  let written = 0;
  for (const piece of run) {
    if (piece.kind === 'gap') {
      pendingGap = (pendingGap ?? 0) + piece.height;
      continue;
    }
    if (piece.kind !== 'text') continue;
    if (written > 0) {
      spans.push(
        <Text key={`${key}-break-${written}`} testID={PRAYER_GAP_TEST_ID}>
          {'\n'}
        </Text>,
      );
      if (pendingGap !== null) {
        spans.push(
          <Text key={`${key}-gap-${written}`} testID={PRAYER_GAP_TEST_ID} style={gapLine(pendingGap)}>
            {'\n'}
          </Text>,
        );
      }
    }
    spans.push(React.cloneElement(piece.spans, { key: `${key}-text-${written}` }));
    pendingGap = piece.gapAfter ?? null;
    written += 1;
  }
  const alignment = sewsAcrossAlignment() || align === 'left' ? undefined : sewnStyles[align];
  return (
    <PrayerText key={key} selectable={true} style={alignment}>
      {spans}
    </PrayerText>
  );
}

// The alignment belongs to the whole sewn text: inside it, every paragraph has the same one
const sewnStyles = StyleSheet.create({
  center: { textAlign: 'center' },
  right: { textAlign: 'right' },
  justify: { textAlign: 'justify' },
  auto: { textAlign: 'auto' },
}) as Record<string, TextStyle>;
