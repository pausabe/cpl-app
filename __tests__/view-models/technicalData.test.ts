// The technical data of Configuració: what is read on the screen and what the «Copia-ho tot»
// button puts on the clipboard, which have to be the same thing.
import { technicalReport, versionLines } from '../../src/view-models/technicalData';

const DATA = {
  appVersion: '9.0.0 (90)',
  databaseVersion: '312',
  technical: ['Esquema de color: dark', 'Compatibilitat: s3-a1b2c3', 'Identificador: encara cap'],
  logs: '[App - start] obert\n[DataService - load] dia carregat',
};

test('the two versions, as the screen says them', () => {
  expect(versionLines(DATA)).toBe("Versió de l'aplicació: 9.0.0 (90)\nRevisió dels textos: 312");
});

test('copying it all gives the versions, every line and the logs, in the order they are read', () => {
  expect(technicalReport(DATA)).toBe(
    "Versió de l'aplicació: 9.0.0 (90)\n" +
      'Revisió dels textos: 312\n' +
      'Esquema de color: dark\n' +
      'Compatibilitat: s3-a1b2c3\n' +
      'Identificador: encara cap\n' +
      'Logs: \n' +
      '[App - start] obert\n[DataService - load] dia carregat',
  );
});

test('with no logs and nothing technical yet, it is still the two versions', () => {
  expect(technicalReport({ ...DATA, technical: [], logs: '' })).toBe(
    "Versió de l'aplicació: 9.0.0 (90)\nRevisió dels textos: 312\nLogs: \n",
  );
});
