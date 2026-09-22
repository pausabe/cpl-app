import * as FileSystem from 'expo-file-system/legacy';
import { FileSystemService } from '../Services/FileSystemService';

// Whether the app had already been opened on this phone, by this version or an older one: the
// first time any version opens, it copies the database to SQLite/ (the 8 did it too). It has to
// be asked before the liturgy is loaded for the first time, which copies it.
//
// It decides the notice of what is new: whoever comes from the old app gets it; whoever installs
// the app afresh has nothing to compare with.
export async function wasOpenedBefore(): Promise<boolean> {
  try {
    const databases = await FileSystemService.GetFileUrisInDirectory(`${FileSystem.documentDirectory}SQLite/`, 'db');
    return databases.length > 0;
  } catch {
    // Better a notice too many than none to someone who is used to the old home
    return true;
  }
}
