const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");

console.log("[PRELOAD] Preload скрипт загружается...");

try {
  contextBridge.exposeInMainWorld("electronAPI", {
    readFile: (filePath) => {
      try {
        return fs.readFileSync(filePath);
      } catch (error) {
        throw new Error(`Ошибка чтения файла: ${error.message}`);
      }
    },

    writeFile: (filePath, data) => {
      try {
        fs.writeFileSync(filePath, data);
      } catch (error) {
        throw new Error(`Ошибка записи файла: ${error.message}`);
      }
    },

    existsSync: (filePath) => {
      return fs.existsSync(filePath);
    },

    mkdirSync: (dirPath, options) => {
      try {
        fs.mkdirSync(dirPath, options);
      } catch (error) {
        throw new Error(`Ошибка создания директории: ${error.message}`);
      }
    },

    join: (...paths) => {
      return path.join(...paths);
    },

    getPath: (name) => {
      return ipcRenderer.invoke("get-path", name);
    },

    cwd: () => {
      return process.cwd();
    },
  });

  console.log("[PRELOAD] electronAPI успешно экспортирован в window");
} catch (error) {
  console.error("[PRELOAD] Ошибка при экспорте electronAPI:", error);
}
