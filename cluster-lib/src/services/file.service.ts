import * as _fsx from 'fs-extra';
import * as _path from 'path';

export interface IFileService {
  readJson: <T>(file: string) => Promise<T>;
  writeJson: (file: string, contents: any) => Promise<void>;
  pathExists: (path: string) => Promise<boolean>;
  readFile: (file: string) => Promise<string>;
  writeFile: (file: string, contents: string) => Promise<void>;
  deleteFile: (file: string) => Promise<void>;
  renameFile: (file: string, newFile: string) => Promise<void>;
  createFolder: (parentFolderPath: string, folderName: string) => Promise<void>;
  createFolderRecursive: (folderPath: string) => Promise<void>;
  ensureFolderExists: (parentFolderPath: string, folderName: string) => Promise<void>;
  copyFolder: (source: string, destination: string) => Promise<void>;
  copyFile: (source: string, destination: string) => Promise<void>;
  getFileExtension: (filePath: string) => string;
}

export class FileService implements IFileService {

  readJson = <T>(file: string): Promise<T> => {
    return _fsx.readJSON(file);
  }

  writeJson = (file: string, contents: any): Promise<void> => {
    return _fsx.writeFile(file, JSON.stringify(contents, null, '\t'));
  }

  pathExists = (path: string): Promise<boolean> => {
    return _fsx.pathExists(path);
  }

  readFile = (file: string): Promise<string> => {
    return _fsx.readFile(file).then(buffer => buffer.toString());
  }

  writeFile = (file: string, contents: string): Promise<void> => {
    return _fsx.writeFile(file, contents);
  }

  deleteFile = (file: string): Promise<void> => {
    return _fsx.remove(file);
  }

  renameFile = (file: string, newFile: string): Promise<void> => {
    return _fsx.move(file, newFile);
  }

  createFolder = (parentFolderPath: string, folderName: string): Promise<void> => {
    const folderPath = _path.join(parentFolderPath, folderName);
    return this.pathExists(folderPath).then(exists => {
      if (!!exists) throw new Error(`Folder '${folderName}' already exists in parent directory.`);
      return _fsx.mkdir(folderPath)
    })
  }
  
  createFolderRecursive = async (folderPath: string): Promise<void> => {
    await this.pathExists(folderPath).then(exists => {
      if (!!exists) return;
      return _fsx.mkdir(folderPath, { recursive: true });
    })
  }

  ensureFolderExists = (parentFolderPath: string, folderName: string): Promise<void> => {
    const folderPath = _path.join(parentFolderPath, folderName);
    return _fsx.ensureDir(folderPath);
  }

  copyFolder = (source: string, destination: string): Promise<void> => {
    return _fsx.copy(source, destination);
  }

  copyFile = (source: string, destination: string): Promise<void> => {
    return _fsx.copy(source, destination);
  }

  getFileExtension(filePath: string): string {
    let index = filePath.lastIndexOf('.');
    if (index < 0) return '';
    return filePath.substring(index + 1);
  }
}