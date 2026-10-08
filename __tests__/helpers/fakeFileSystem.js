// The new API of expo-file-system (File, Directory, Paths) in memory, for the tests of the prayer
// read aloud: the pieces kept on the phone and the files of the hours.
const files = new Map();

const join = (parts) =>
  parts
    .map((p) => (typeof p === 'string' ? p : p.uri))
    .join('/')
    .replace(/\/+/g, '/');

class File {
  constructor(...parts) {
    this.uri = join(parts);
  }
  get exists() {
    return files.has(this.uri);
  }
  get size() {
    return files.get(this.uri)?.length ?? 0;
  }
  write(content) {
    files.set(this.uri, typeof content === 'string' ? new TextEncoder().encode(content) : Uint8Array.from(content));
  }
  async bytes() {
    return Uint8Array.from(files.get(this.uri));
  }
  textSync() {
    return new TextDecoder().decode(files.get(this.uri));
  }
  delete() {
    files.delete(this.uri);
  }
}

class Directory {
  constructor(...parts) {
    this.uri = join(parts);
  }
  get exists() {
    return true;
  }
  create() {}
  delete() {
    for (const key of [...files.keys()]) if (key.startsWith(`${this.uri}/`)) files.delete(key);
  }
}

module.exports = {
  File,
  Directory,
  Paths: { cache: new Directory('mem:/cache'), document: new Directory('mem:/document') },
  __files: files,
};
