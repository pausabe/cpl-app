import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import TourOverlay from '../components/TourOverlay';
import WidgetPreview from '../components/WidgetPreview';
import { pinWidget } from '../services/widgetService';
import { HOUR_NAMES, bandAt, shortDate, widgetBands } from '../view-models/widgets';
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

  // Android's back, with the tour over the screen, leaves the tour, as it closes a dialog. It went
  // back under it instead, and the tour waited unseen for a screen that was no longer there.
  const shown = !!step && ready;
  useEffect(() => {
    if (!shown) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      finishTour();
      return true;
    });
    return () => sub.remove();
  }, [shown]);

  const buttons = tour && step ? tourButtons(tour.index, tour.steps.length) : null;
  const illustration = step?.illustration === 'widget' ? <WidgetOfNow /> : null;
  // The system asks whether to add it; whatever the answer, the tour goes on
  const action =
    step?.action?.does === 'pin-widget'
      ? { label: step.action.label, onPress: () => pinWidget('ara').finally(nextStep) }
      : null;
  return (
    <TourContext.Provider value={registry}>
      <View style={styles.app}>
        {children}
        {shown && step && buttons ? (
          <TourOverlay
            rect={step.target ? rect : null}
            holeTouchable={!!step.endsWhen}
            isNew={step.isNew}
            title={step.title}
            text={step.text}
            detail={step.detail}
            footnote={step.footnote}
            items={step.items}
            progress={buttons.progress}
            primary={buttons.primary}
            onPrimary={nextStep}
            secondary={buttons.secondary}
            onSecondary={finishTour}
            illustration={illustration}
            action={action}
          />
        ) : null}
      </View>
    </TourContext.Provider>
  );
}

// The widget as it is at this moment, with the hour it would show now
function WidgetOfNow() {
  const now = new Date();
  const band = bandAt(widgetBands(), now.getHours());
  const day = band.yesterday ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1) : now;
  return <WidgetPreview hour={band.hour} name={HOUR_NAMES[band.hour]} date={shortDate(day)} now={band.now} />;
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
});
