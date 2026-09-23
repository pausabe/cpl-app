// The technical data of Configuració, the ones hidden behind ten touches on the approval text:
// the versions, the lines of data and the logs of the session. The screen shows them and the
// «Copia-ho tot» button copies them whole, and both come from here so that what is copied is
// exactly what is read.
export interface TechnicalData {
  appVersion: string;
  databaseVersion: string;
  technical: string[];
  logs: string;
}

// The two versions, which are in plain sight without touching anything. The second one is not a
// publication: it is the last correction written into the database, and calling it a version of
// the database made it impossible to tell from the publication hidden below.
export function versionLines(data: TechnicalData): string {
  return `Versió de l'aplicació: ${data.appVersion}\nRevisió dels textos: ${data.databaseVersion}`;
}

// Everything, in the order it is on the screen, ready to be sent to whoever is looking at a
// problem
export function technicalReport(data: TechnicalData): string {
  return [versionLines(data), ...data.technical, 'Logs: ', data.logs].join('\n');
}
