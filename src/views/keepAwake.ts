import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

// While a prayer or the readings are open the screen does not go off. A phone that will not keep
// it on is no reason for the prayer to fail, so whatever keep-awake says is let go.
export function useKeepAwake(tag: string) {
  useEffect(() => {
    activateKeepAwakeAsync(tag).catch(() => {});
    return () => {
      Promise.resolve(deactivateKeepAwake(tag)).catch(() => {});
    };
  }, [tag]);
}
