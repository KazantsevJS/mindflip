import initSqlJs from "sql.js";
import type { Database } from "sql.js";

const isElectron =
  typeof process !== "undefined" && !!process.versions?.electron;

let path: any = null;
let fs: any = null;

const getRequire = (): NodeJS.Require => {
  if (typeof window !== "undefined" && (window as any).require) {
    return (window as any).require;
  }
  if (typeof require !== "undefined") {
    return require;
  }
  throw new Error("require не доступен");
};

const getAppPathViaIPC = async (): Promise<string> => {
  try {
    const electron = getRequire()("electron");
    if (electron && electron.ipcRenderer) {
      const appPath = await electron.ipcRenderer.invoke("get-app-path");
      return appPath;
    }
  } catch (error) {
    console.error("Ошибка IPC:", error);
  }
  throw new Error("IPC недоступен");
};

const initNodeModules = () => {
  if (!isElectron) {
    throw new Error("База данных доступна только в Electron окружении");
  }

  try {
    const requireFn = getRequire();

    if (!path) {
      path = requireFn("path");
    }

    if (!fs) {
      fs = requireFn("fs");
    }
  } catch (error) {
    console.error("Ошибка загрузки Node.js модулей:", error);
    throw error;
  }
};

const getDatabasePath = async (): Promise<string> => {
  initNodeModules();

  if (!path || !fs) {
    throw new Error("Node.js модули не загружены");
  }

  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    const dbDir = path.join(process.cwd(), "database");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    return path.join(dbDir, "mindflip.db");
  }

  try {
    const electron = getRequire()("electron");
    if (electron && electron.ipcRenderer) {
      const userDataPath = await electron.ipcRenderer.invoke(
        "get-user-data-path"
      );
      return path.join(userDataPath, "mindflip.db");
    }
  } catch (error) {
    console.error("Ошибка получения userDataPath через IPC:", error);
  }

  const resourcesPath = (process as any).resourcesPath;
  if (resourcesPath) {
    const userDataPath = path.join(
      resourcesPath,
      "..",
      "..",
      "Library",
      "Application Support",
      "MindFlip"
    );
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    return path.join(userDataPath, "mindflip.db");
  }

  throw new Error("Не удалось определить путь к базе данных");
};

let db: Database | null = null;
let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

export const getDatabase = async (): Promise<Database> => {
  if (!isElectron) {
    throw new Error("База данных доступна только в Electron окружении");
  }

  initNodeModules();

  if (!path || !fs) {
    throw new Error("Node.js модули не загружены");
  }

  if (!db) {
    if (!SQL) {
      let wasmPath: string;
      const isDevelopment = process.env.NODE_ENV === "development";

      if (isDevelopment) {
        wasmPath = path.join(
          process.cwd(),
          "node_modules",
          "sql.js",
          "dist",
          "sql-wasm.wasm"
        );
      } else {
        let appPath: string;
        try {
          appPath = await getAppPathViaIPC();
        } catch (error) {
          const resourcesPath = (process as any).resourcesPath;
          if (resourcesPath) {
            appPath = path.join(resourcesPath, "app");
          } else {
            appPath = process.cwd();
          }
        }

        const possiblePaths = [
          path.join(appPath, "dist", "sql-wasm.wasm"),
          path.join(appPath, "node_modules", "sql.js", "dist", "sql-wasm.wasm"),
        ];

        const resourcesPath = (process as any).resourcesPath;
        if (resourcesPath) {
          possiblePaths.unshift(
            path.join(resourcesPath, "app", "dist", "sql-wasm.wasm"),
            path.join(
              resourcesPath,
              "app",
              "node_modules",
              "sql.js",
              "dist",
              "sql-wasm.wasm"
            )
          );
        }

        const foundPath = possiblePaths.find((p) => fs && fs.existsSync(p));
        wasmPath = foundPath || possiblePaths[0];

        if (!foundPath) {
          throw new Error(
            `WASM файл не найден по путям: ${possiblePaths.join(", ")}`
          );
        }
      }

      let wasmBinary: ArrayBuffer | undefined = undefined;

      if (fs.existsSync(wasmPath)) {
        try {
          const wasmBuffer = fs.readFileSync(wasmPath);
          const uint8Array = new Uint8Array(wasmBuffer);
          const newArrayBuffer = new ArrayBuffer(uint8Array.length);
          const newUint8Array = new Uint8Array(newArrayBuffer);
          newUint8Array.set(uint8Array);
          wasmBinary = newArrayBuffer;
        } catch (error) {
          console.error("Не удалось загрузить WASM файл:", error);
          throw new Error(`WASM файл не найден по пути: ${wasmPath}`);
        }
      } else {
        throw new Error(`WASM файл не найден по пути: ${wasmPath}`);
      }

      const sqlModule = await initSqlJs({
        wasmBinary: wasmBinary,
      });
      SQL = sqlModule;
    }

    const dbPath = await getDatabasePath();
    let fileBuffer: Uint8Array | null = null;

    if (fs.existsSync(dbPath)) {
      try {
        fileBuffer = new Uint8Array(fs.readFileSync(dbPath));
      } catch (error) {
        console.warn("Не удалось загрузить БД, создаем новую:", error);
      }
    }

    if (!SQL) {
      throw new Error("SQL модуль не инициализирован");
    }
    db = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();

    db.run("PRAGMA foreign_keys = ON");

    initializeDatabase(db);

    await saveDatabase();
  }

  if (!db) {
    throw new Error("База данных не инициализирована");
  }

  return db;
};

const initializeDatabase = (database: Database): void => {
  database.run(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#e052c4',
      position INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject_id INTEGER NOT NULL,
      color TEXT DEFAULT '#e052c4',
      position INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )  
  `);

  try {
    database.run(`ALTER TABLE topics ADD COLUMN color TEXT DEFAULT '#e052c4'`);
  } catch (error) {}

  database.run(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      topic_id INTEGER NOT NULL,
      position INTEGER DEFAULT 0,
      difficulty_level INTEGER DEFAULT 3,
      times_reviewed INTEGER DEFAULT 0,
      last_reviewed_at TEXT NULL,
      next_review_at TEXT NULL,
      ease_factor REAL DEFAULT 2.5,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    )
  `);

  database.run(`
    CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON topics(subject_id);
    CREATE INDEX IF NOT EXISTS idx_cards_topic_id ON cards(topic_id);
    CREATE INDEX IF NOT EXISTS idx_cards_next_review ON cards(next_review_at);
  `);
};

export const saveDatabase = async (): Promise<void> => {
  if (!db || !isElectron) return;

  initNodeModules();

  if (!path || !fs || !db) return;

  try {
    const dbPath = await getDatabasePath();
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (error) {
    console.error("Ошибка сохранения БД:", error);
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await saveDatabase();
    db.close();
    db = null;
  }
};
