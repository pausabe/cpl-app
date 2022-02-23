import * as FileSystem from "expo-file-system";
import * as Logger from "../Utils/Logger";
import {StringManagement} from "../Utils/StringManagement";

export class FileSystemService{
    static async CopyFile(fromPath: string, toPath: string) : Promise<void> {
        Logger.Log(Logger.LogKeys.FileSystemService, 'CopyFile', `Copying file '...${StringManagement.SafeSubstring(fromPath, 50)}' to '...${StringManagement.SafeSubstring(toPath, 50)}'`);
        if(!fromPath || !toPath){
            return;
        }
        await FileSystem.copyAsync({from: fromPath, to: toPath});
    }

    static async DeleteFilesInDirectory(directoryPath: string, fileExtension: string) : Promise<void> {
        const listOfFileUris = await FileSystemService.GetFileUrisInDirectory(directoryPath, fileExtension);
        for (let i = 0; i < listOfFileUris.length; i++) {
            const fileUri = listOfFileUris[i];
            Logger.Log(Logger.LogKeys.FileSystemService, "DeleteFilesInDirectory", `Deleting file: ${fileUri.split('/').pop()}`);
            await FileSystem.deleteAsync(fileUri);
        }
    }

    static async GetFileUrisInDirectory(directoryPath: string, fileExtension: string) : Promise<string[]> {
        let listOfFiles = [];
        if(!directoryPath || !fileExtension){
            return listOfFiles;
        }

        const directoryInfo = await FileSystem.getInfoAsync(directoryPath);
        if (!directoryInfo.exists || !directoryInfo.isDirectory) {
            return listOfFiles;
        }

        const listOfFileUris = await FileSystem.readDirectoryAsync(directoryPath);
        for (let i = 0; i < listOfFileUris.length; i++) {
            const fileUri = listOfFileUris[i];
            if(fileUri.endsWith(`.${fileExtension}`)){
                listOfFiles.push(`${directoryPath}${fileUri}`);
            }
        }
        return listOfFiles;
    }
}