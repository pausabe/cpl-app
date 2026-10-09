import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import TourOverlay from '../components/TourOverlay';
import { TourContext, type TourRect, type TourRegistry, type TourTargetHandle } from '../components/TourTarget';
import { tourButtons } from '../view-models/tour';
import { currentRoute, finishTour, nextStep, useTour, wireTour } from './tourController';

// The tour of what is new over the whole app (NavigationController puts it above the screens): it
// knows where each thing it can point at is (TourTarget), finds the one of the step on its screen,
// brings it into sight and draws the overlay around it.

// How often it looks again where the thing is (a screen that moves, a player that appears), and how
// long it waits for one that does not come before going on without it
const LOOK_MS = 400;
const GIVE_UP_MS = 5000;

const same = (a: TourRect | null, b: TourRect | null) =>
  a === b ||
  (!!a &&
    !!b &&
    Math.abs(a.x - b.x) < 1 &&
    Math.abs(a.y - b.y) < 1 &&
    Math.abs(a.width - b.width) < 1 &&
    Math.abs(a.height - b.height) < 1);

export default function TourLayer({ children }: { children: React.ReactNode }) {
  const targets = useRef(new Map<string, TourTargetHandle>());
  const registry = useMemo<TourRegistry>(
    () => ({
      register(id, target) {
        targets.current.set(id, target);
        return () => {
          if (targets.current.get(id) === target) targets.current.delete(id);
        };
      },
    }),
    [],
  );
  const tour = useTour();
  const step = tour ? tour.steps[tour.index] : null;
  const [rect, setRect] = useState<TourRect | null>(null);
  // A step on a screen that is not there yet waits for it, with nothing over the app
  const [ready, setReady] = useState(false);

  useEffect(() => wireTour(), []);

  useEffect(() => {
    setRect(null);
    setReady(false);
    if (!step) return;
    let alive = true;
    let brought = false;
    const started = Date.now();
    const look = async () => {
      const here = !step.route || currentRoute() === step.route;
      if (!here) return;
      if (!step.target) {
        if (alive) setReady(true);
        return;
      }
      const target = targets.current.get(step.target);
      if (!target) {
        if (Date.now() - started > GIVE_UP_MS) nextStep();
        return;
      }
      if (!brought) {
        brought = true;
        target.bringIntoSight();
        return;
      }
      const found = await target.measure();
      if (!alive || !found) return;
      setRect((current) => (same(current, found) ? current : found));
      setReady(true);
    };
    look();
    const timer = setInterval(look, LOOK_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [step]);

  const buttons = tour && step ? tourButtons(step, tour.index, tour.steps.length) : null;
  return (
    <TourContext.Provider value={registry}>
      <View style={styles.app}>
        {children}
        {step && buttons && ready ? (
          <TourOverlay
            rect={step.target ? rect : null}
            title={step.title}
            text={step.text}
            progress={buttons.progress}
            primary={buttons.primary}
            onPrimary={nextStep}
            secondary={buttons.secondary}
            onSecondary={finishTour}
          />
        ) : null}
      </View>
    </TourContext.Provider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
});
