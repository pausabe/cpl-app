import { createContext } from 'react';
import type { View } from 'react-native';

// The piece of the prayer being read aloud, for the screen to mark it and keep it in sight: the
// paragraph (in the order the screen hands them to the voice) and its strophe. Null when the prayer
// on the screen is not the one being read.
export interface FollowedPiece {
  paragraph: number;
  strophe: number;
}

export const SpeechFollow = createContext<FollowedPiece | null>(null);

// What the scroll of the prayer does with it: bring a piece into sight (EdgeToEdgeScrollView)
export interface FollowScroll {
  bringIntoSight: (target: View | null) => void;
}

export const FollowScrollContext = createContext<FollowScroll | null>(null);
