import type { View } from 'react-native';
import type { TourRect } from './TourTarget';

// Where a view is on the screen, or null if it is not drawn (no size). Apart, so that the tests,
// which draw nothing, can say where things are.
export function measureInWindow(view: View | null): Promise<TourRect | null> {
  return new Promise((resolve) => {
    if (!view) return resolve(null);
    view.measureInWindow((x, y, width, height) => resolve(width > 0 && height > 0 ? { x, y, width, height } : null));
  });
}
