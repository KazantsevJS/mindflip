import initSqlJs from "sql.js";
import type { Database } from "sql.js";
import type * as Path from "path";
import type * as Fs from "fs";
import type { app as ElectronApp } from "electron";

const isElectron =
  typeof process !== "undefined" && !!process.versions?.electron;

let path: typeof Path | null = null;
let fs: typeof Fs | null = null;
let electronApp: typeof ElectronApp | null = null;

const getRequire = (): NodeRequire => {
  if (typeof window !== "undefined" && (window as any).require) {
    return (window as any).require;
  }
  if (typeof require !== "undefined") {
    return require;
  }
  throw new Error("require не доступен");
};

const initNodeModules = () => {
  if (!isElectron) {
    throw new Error("База данных доступна только в Electron окружении");
  }

  try {
    const requireFn = getRequire();

    const pathModuleName = "path";
    const fsModuleName = "fs";
    const electronModuleName = "electron";

    if (!path) {
      path = requireFn(pathModuleName);
    }

    if (!fs) {
      fs = requireFn(fsModuleName);
    }

    if (!electronApp) {
      try {
        const electron = requireFn(electronModuleName);
        electronApp = electron.app;
      } catch (error) {
        console.warn("Electron app не доступен:", error);
      }
    }
  } catch (error) {
    console.error("Ошибка загрузки Node.js модулей:", error);
    throw error;
  }
};

const getDatabasePath = (): string => {
  initNodeModules();

  if (!path || !fs) {
    throw new Error("Node.js модули не загружены");
  }

  if (process.env.NODE_ENV === "development") {
    const dbDir = path.join(process.cwd(), "database");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    return path.join(dbDir, "mindflip.db");
  }

  if (!electronApp) {
    throw new Error("База данных доступна только в Electron окружении");
  }

  const userDataPath = electronApp.getPath("userData");
  return path.join(userDataPath, "mindflip.db");
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
      const wasmPath = path.join(
        process.cwd(),
        "node_modules",
        "sql.js",
        "dist",
        "sql-wasm.wasm"
      );

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
          throw new Error("WASM файл не найден");
        }
      } else {
        throw new Error(`WASM файл не найден по пути: ${wasmPath}`);
      }

      const sqlModule = await initSqlJs({
        wasmBinary: wasmBinary,
      });
      SQL = sqlModule;
    }

    const dbPath = getDatabasePath();
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

    saveDatabase();
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

export const saveDatabase = (): void => {
  if (!db || !isElectron) return;

  initNodeModules();

  if (!path || !fs || !db) return;

  try {
    const dbPath = getDatabasePath();
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (error) {
    console.error("Ошибка сохранения БД:", error);
  }
};

export const closeDatabase = (): void => {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
};
