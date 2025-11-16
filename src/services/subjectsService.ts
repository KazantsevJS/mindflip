import { getDatabase, saveDatabase } from "./database";
import type { Subject, CreateSubject } from "@/types";
import type { SqlValue } from "sql.js";

const rowToObject = (row: any[], columns: string[]): any => {
  const obj: any = {};
  columns.forEach((col, index) => {
    obj[col] = row[index];
  });
  return obj;
};

export const getAllSubjects = async (): Promise<Subject[]> => {
  const db = await getDatabase();
  const result = db.exec(`
    SELECT * FROM subjects
    ORDER BY position ASC, created_at ASC
  `);

  if (result.length === 0) return [];

  const rows = result[0].values;
  const columns = result[0].columns;

  return rows.map((row) => rowToObject(row, columns) as Subject);
};

export const getSubjectById = async (id: number): Promise<Subject | null> => {
  const db = await getDatabase();
  const result = db.exec(`SELECT * FROM subjects WHERE id = ${id}`);

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const row = result[0].values[0];
  const columns = result[0].columns;
  return rowToObject(row, columns) as Subject;
};

export const createSubject = async (data: CreateSubject): Promise<Subject> => {
  const db = await getDatabase();

  const maxResult = db.exec(`SELECT MAX(position) as max FROM subjects`);
  const maxPosition =
    maxResult.length > 0 && maxResult[0].values.length > 0
      ? maxResult[0].values[0][0] ?? -1
      : -1;
  const newPosition = (maxPosition as number) + 1;

  db.run(`INSERT INTO subjects (name, color, position) VALUES (?, ?, ?)`, [
    data.name,
    data.color || "#e052c4",
    newPosition,
  ] as SqlValue[]);

  const lastIdResult = db.exec("SELECT last_insert_rowid() as id");
  const lastId = lastIdResult[0].values[0][0] as number;

  await saveDatabase();

  const createdSubject = await getSubjectById(lastId);
  if (!createdSubject) {
    throw new Error("Не удалось создать предмет");
  }

  return createdSubject;
};

export const updateSubject = async (
  id: number,
  data: Partial<CreateSubject>
): Promise<Subject> => {
  const db = await getDatabase();

  const updates: string[] = [];
  const values: SqlValue[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }

  if (data.color !== undefined) {
    updates.push("color = ?");
    values.push(data.color);
  }

  if (data.position !== undefined) {
    updates.push("position = ?");
    values.push(data.position);
  }

  updates.push('updated_at = datetime("now")');
  values.push(id);

  db.run(`UPDATE subjects SET ${updates.join(", ")} WHERE id = ?`, values);

  await saveDatabase();

  const updatedSubject = await getSubjectById(id);
  if (!updatedSubject) {
    throw new Error("Предмет не найден");
  }

  return updatedSubject;
};

export const deleteSubject = async (id: number): Promise<void> => {
  const db = await getDatabase();

  const subject = await getSubjectById(id);
  if (!subject) {
    throw new Error("Предмет не найден");
  }

  db.run(`DELETE FROM subjects WHERE id = ?`, [id] as SqlValue[]);
  await saveDatabase();
};
