import * as FileSystem from 'expo-file-system/legacy';
import * as Logger from '../utils/logger';
import { StringManagement } from '../utils/StringManagement';

export class FileSystemService {
  static async copyFile(fromPath: string, toPath: string): Promise<void> {
    Logger.log(
      Logger.LogKeys.FileSystemService,
      'copyFile',
      `Copying file '...${StringManagement.safeSubstring(fromPath, 50)}' to '...${StringManagement.safeSubstring(toPath, 50)}'`,
    );
    if (!fromPath || !toPath) {
      return;
    }
    await FileSystem.copyAsync({ from: fromPath, to: toPath });
  }

  static async deleteFilesInDirectory(directoryPath: string, fileExtension: string): Promise<void> {
    const listOfFileUris = await FileSystemService.getFileUrisInDirectory(directoryPath, fileExtension);
    for (let i = 0; i < listOfFileUris.length; i++) {
      const fileUri = listOfFileUris[i];
      Logger.log(
        Logger.LogKeys.FileSystemService,
        'deleteFilesInDirectory',
        `Deleting file: ${fileUri.split('/').pop()}`,
      );
      await FileSystem.deleteAsync(fileUri);
    }
  }

  static async getFileUrisInDirectory(directoryPath: string, fileExtension: string): Promise<string[]> {
    let listOfFiles = [];
    if (!directoryPath || !fileExtension) {
      return listOfFiles;
    }

    const directoryInfo = await FileSystem.getInfoAsync(directoryPath);
    if (!directoryInfo.exists || !directoryInfo.isDirectory) {
      return listOfFiles;
    }

    const listOfFileUris = await FileSystem.readDirectoryAsync(directoryPath);
    for (let i = 0; i < listOfFileUris.length; i++) {
      const fileUri = listOfFileUris[i];
      if (fileUri.endsWith(`.${fileExtension}`)) {
        listOfFiles.push(`${directoryPath}${fileUri}`);
      }
    }
    return listOfFiles;
  }
}
