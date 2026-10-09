import { Directory, File, Paths } from 'expo-file-system';

// The pieces of audio the phone already has, so that a psalm, a Glòria or a hymn heard once is not
// downloaded again, and so that an hour that is all here plays with no network. They are kept in the
// app's documents (the system does not empty them by itself), up to a ceiling: past it, the pieces
// not heard for longest go first. An index says how big each one is and when it was last used.
//
// The phone's own space comes first: the pieces never leave it with less than FREE_SPACE_FLOOR free.
// On a full phone the oldest pieces make room for the new ones, and if there is still no room (or the
// system refuses to write) the headphones say there is no room for it (StorageFullError).
export const MAX_STORED_BYTES = 150 * 1024 * 1024;
export const FREE_SPACE_FLOOR = 200 * 1024 * 1024;

export class StorageFullError extends Error {}

// How much the pieces may take: the ceiling, or less if the phone is short of space. What they take
// already counts as room, because the oldest ones can make way for new ones.
export function allowedBytes(stored: number, free: number): number {
  return Math.min(MAX_STORED_BYTES, stored + Math.max(0, free - FREE_SPACE_FLOOR));
}

// What the system says is free; if it cannot say, as if there were plenty (the ceiling still holds)
function freeSpace(): number {
  try {
    const free = Paths.availableDiskSpace;
    return typeof free === 'number' && free >= 0 ? free : Number.MAX_SAFE_INTEGER;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

export interface PieceStore {
  has(key: string): boolean;
  read(key: string): Promise<Uint8Array | null>;
  // Kept, and the oldest ones let go if it goes over the ceiling (never those in `keep`)
  write(key: string, bytes: Uint8Array, keep?: Set<string>): void;
  // Heard now: the last to go
  touch(keys: string[]): void;
  // Remade with another sound (audioChanges): they will be downloaded again when they are needed
  forget(keys: string[]): void;
  bytes(): number;
  clear(): void;
}

type Index = Record<string, [bytes: number, usedAt: number]>;

export function filePieceStore(
  folder: Directory = new Directory(Paths.document, 'audio'),
  free: () => number = freeSpace,
): PieceStore {
  let index: Index | null = null;
  const indexFile = () => new File(folder, 'index.json');
  const pieceFile = (key: string) => new File(folder, `${key}.mp3`);

  const load = (): Index => {
    if (index) return index;
    try {
      if (!folder.exists) folder.create({ intermediates: true });
      const file = indexFile();
      index = file.exists ? (JSON.parse(file.textSync()) as Index) : {};
    } catch {
      index = {};
    }
    return index;
  };
  const save = () => {
    try {
      indexFile().write(JSON.stringify(load()));
    } catch {
      // Without the index the pieces are still there; it is made again as they are used
    }
  };
  const total = () => Object.values(load()).reduce((sum, [bytes]) => sum + bytes, 0);

  return {
    has: (key) => key in load() && pieceFile(key).exists,
    async read(key) {
      const file = pieceFile(key);
      if (!file.exists) {
        delete load()[key];
        return null;
      }
      return file.bytes();
    },
    write(key, bytes, keep = new Set()) {
      const entries = load();
      let size = total();
      const allowed = allowedBytes(size, free());
      // Room first, from the pieces not heard for longest (never those of the hour)
      if (size + bytes.length > allowed) {
        const oldest = Object.entries(entries)
          .filter(([k]) => !keep.has(k) && k !== key)
          .sort((a, b) => a[1][1] - b[1][1]);
        for (const [k, [b]] of oldest) {
          if (size + bytes.length <= allowed * 0.9) break;
          try {
            pieceFile(k).delete();
          } catch {
            // Already gone
          }
          delete entries[k];
          size -= b;
        }
        save();
        if (size + bytes.length > allowed) throw new StorageFullError('no room for the audio');
      }
      try {
        pieceFile(key).write(bytes);
      } catch (error) {
        throw new StorageFullError(String(error));
      }
      entries[key] = [bytes.length, Date.now()];
      save();
    },
    touch(keys) {
      const entries = load();
      const now = Date.now();
      for (const key of keys) if (entries[key]) entries[key][1] = now;
      save();
    },
    forget(keys) {
      const entries = load();
      let changed = false;
      for (const key of keys) {
        if (!(key in entries)) continue;
        try {
          pieceFile(key).delete();
        } catch {
          // Already gone
        }
        delete entries[key];
        changed = true;
      }
      if (changed) save();
    },
    bytes: total,
    clear() {
      try {
        if (folder.exists) folder.delete();
      } catch {
        // Nothing to clear
      }
      index = {};
    },
  };
}
