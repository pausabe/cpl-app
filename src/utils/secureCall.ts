import * as Logger from './logger';

// Runs a query of the liturgy and gives its result, or the default when it finds nothing.
//
// If the query fails, the error is logged and what comes back is undefined, not the default: the
// reload then fails further on, where that part is needed, and the home says it could not load.
// That is how it has always been, and it is better than a prayer with pieces missing in silence.
export default async function secureCall<T>(call: () => Promise<T | undefined>, defaultReturn: T): Promise<T> {
  try {
    return (await call()) ?? defaultReturn;
  } catch (error) {
    Logger.logError(Logger.LogKeys.SecureCall, 'secureCall', error as Error);
    return undefined as T;
  }
}
