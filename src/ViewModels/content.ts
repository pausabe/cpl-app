import { StringManagement } from '../Utils/StringManagement';

// A text from the database says nothing when it is empty or "-". The same test the screens
// have always used, kept on purpose: the decisions that moved to the home must not change.
export const hasContent = (value: string | undefined | null): boolean =>
  StringManagement.HasLiturgyContent(value as string);

// Stricter, for what is only shown and decides nothing: also null and blanks say nothing.
export const hasVisibleText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '' && value.trim() !== '-';
