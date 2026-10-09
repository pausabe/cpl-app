import React, { createContext, useContext, useEffect, useRef } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { FollowScrollContext } from './SpeechFollow';
import { measureInWindow } from './measureInWindow';

// Something of a screen that the tour of what is new can point at (controllers/tourController):
// a button, a row of Configuració, a tile. The tour asks where it is on the screen, and asks its
// scroll to bring it into sight first.

export interface TourRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TourTargetHandle {
  measure: () => Promise<TourRect | null>;
  bringIntoSight: () => void;
}

export interface TourRegistry {
  register: (id: string, target: TourTargetHandle) => () => void;
}

export const TourContext = createContext<TourRegistry | null>(null);

export default function TourTarget({
  id,
  children,
  style,
}: {
  id: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const registry = useContext(TourContext);
  const scroll = useContext(FollowScrollContext);
  const ref = useRef<View>(null);
  useEffect(() => {
    if (!registry) return;
    return registry.register(id, {
      measure: () => measureInWindow(ref.current),
      bringIntoSight: () => scroll?.bringIntoSight(ref.current),
    });
  }, [registry, id, scroll]);
  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}
