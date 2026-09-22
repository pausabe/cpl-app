// Whether the app had been opened before this version: a database in SQLite/, copied there the
// first time any version opens (the 8 too).
jest.mock('../../src/services/FileSystemService', () => ({
  FileSystemService: { GetFileUrisInDirectory: jest.fn() },
}));
jest.mock('expo-file-system/legacy', () => ({ documentDirectory: 'file:///documents/' }));

import { FileSystemService } from '../../src/services/FileSystemService';
import { wasOpenedBefore } from '../../src/controllers/firstRun';

test('amb una base de dades d’abans, l’app ja s’havia obert', async () => {
  FileSystemService.GetFileUrisInDirectory.mockResolvedValueOnce(['file:///documents/SQLite/cpl-app-12530.db']);
  expect(await wasOpenedBefore()).toBe(true);
  expect(FileSystemService.GetFileUrisInDirectory).toHaveBeenLastCalledWith('file:///documents/SQLite/', 'db');
});

test('sense cap base de dades, és una instal·lació nova', async () => {
  FileSystemService.GetFileUrisInDirectory.mockResolvedValueOnce([]);
  expect(await wasOpenedBefore()).toBe(false);
});

test('si no es pot mirar, compta que ja s’havia obert: millor un avís de més que un de menys', async () => {
  FileSystemService.GetFileUrisInDirectory.mockRejectedValueOnce(new Error('no'));
  expect(await wasOpenedBefore()).toBe(true);
});
