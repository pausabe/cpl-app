import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

// The widgets of the home screen (modules/cpl-widgets): where the app leaves what they show, and,
// on Android, the request to put one on the home screen. On iOS the widgets are an extension of
// their own (targets/widgets) that reads the same place; iOS lets no app add a widget by itself.
// In the tests and on the web there is no module: nothing is written and nothing can be added.

export type WidgetKind = 'ara' | 'avui' | 'hores' | 'paraula';

interface WidgetsNativeModule {
  setPayload(json: string): void;
  canPin(): boolean;
  pin(kind: WidgetKind): Promise<boolean>;
}

const native: WidgetsNativeModule | null =
  Platform.OS === 'ios' || Platform.OS === 'android'
    ? requireOptionalNativeModule<WidgetsNativeModule>('CplWidgets')
    : null;

export const hasWidgets = (): boolean => native !== null;

// Saved for the widgets, which are redrawn at once
export function writeWidgetPayload(json: string): void {
  native?.setPayload(json);
}

// Whether the app can offer to put a widget on the home screen with one touch (some Android
// launchers cannot)
export function canPinWidget(): boolean {
  try {
    return native?.canPin() ?? false;
  } catch {
    return false;
  }
}

// The system's question «Add to the home screen?»: true when it was asked
export async function pinWidget(kind: WidgetKind): Promise<boolean> {
  if (!native) return false;
  try {
    return await native.pin(kind);
  } catch {
    return false;
  }
}
