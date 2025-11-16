import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = app.isPackaged ? "production" : "development";
}

const createWindow = () => {
  const preloadPath = path.join(__dirname, "preload.cjs");

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: preloadPath,
    },
    titleBarStyle: "default",
    backgroundColor: "#ffffff",
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    let indexPath;

    if (app.isPackaged) {
      const possiblePaths = [
        path.join(process.resourcesPath, "app", "dist", "index.html"),
        path.join(__dirname, "..", "dist", "index.html"),
        path.join(app.getAppPath(), "dist", "index.html"),
      ];

      indexPath =
        possiblePaths.find((p) => {
          try {
            const fs = require("fs");
            return fs.existsSync(p);
          } catch {
            return false;
          }
        }) || possiblePaths[0];
    } else {
      indexPath = path.join(__dirname, "../dist/index.html");
    }

    mainWindow.loadFile(indexPath).catch((error) => {
      console.error("Ошибка загрузки index.html:", error);
      const fallbackPaths = [
        path.join(__dirname, "../dist/index.html"),
        path.join(process.cwd(), "dist", "index.html"),
      ];

      for (const fallbackPath of fallbackPaths) {
        try {
          mainWindow.loadFile(fallbackPath);
          return;
        } catch (err) {
          console.error("Fallback путь не сработал:", fallbackPath, err);
        }
      }
    });
  }

  mainWindow.on("closed", () => {
    app.quit();
  });
};

ipcMain.handle("get-app-path", () => {
  try {
    if (app.isPackaged) {
      return app.getAppPath();
    } else {
      return process.cwd();
    }
  } catch (error) {
    console.error("Ошибка получения appPath:", error);
    return process.cwd();
  }
});

ipcMain.handle("get-user-data-path", () => {
  try {
    return app.getPath("userData");
  } catch (error) {
    console.error("Ошибка получения userDataPath:", error);
    return null;
  }
});

ipcMain.handle("get-resources-path", () => {
  try {
    return process.resourcesPath || null;
  } catch (error) {
    console.error("Ошибка получения resourcesPath:", error);
    return null;
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("web-contents-created", (_event, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  if (process.env.NODE_ENV !== "development") {
    contents.on("will-navigate", (event, navigationUrl) => {
      try {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.protocol !== "file:") {
          event.preventDefault();
        }
      } catch (error) {
        event.preventDefault();
      }
    });
  }
});
