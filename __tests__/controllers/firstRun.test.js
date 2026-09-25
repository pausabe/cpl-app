// Whether the app had been opened before this version: a database in SQLite/, copied there the
// first time any version opens (the 8 too).
jest.mock('../../src/services/FileSystemService', () => ({
  FileSystemService: { getFileUrisInDirectory: jest.fn() },
}));
jest.mock('expo-file-system/legacy', () => ({ documentDirectory: 'file:///documents/' }));

import { FileSystemService } from '../../src/services/FileSystemService';
import { wasOpenedBefore } from '../../src/controllers/firstRun';

test('with a database from before, the app had already been opened', async () => {
  FileSystemService.getFileUrisInDirectory.mockResolvedValueOnce(['file:///documents/SQLite/cpl-app-12530.db']);
  expect(await wasOpenedBefore()).toBe(true);
  expect(FileSystemService.getFileUrisInDirectory).toHaveBeenLastCalledWith('file:///documents/SQLite/', 'db');
});

test('with no database at all, it is a fresh install', async () => {
  FileSystemService.getFileUrisInDirectory.mockResolvedValueOnce([]);
  expect(await wasOpenedBefore()).toBe(false);
});

test('if it cannot look, it counts as already opened: better one notice too many than one too few', async () => {
  FileSystemService.getFileUrisInDirectory.mockRejectedValueOnce(new Error('no'));
  expect(await wasOpenedBefore()).toBe(true);
});
