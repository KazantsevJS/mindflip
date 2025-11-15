import { getDatabase, saveDatabase } from "./database";
import type { Topic, CreateTopic } from "@/types";
import type { SqlValue } from "sql.js";

const rowToObject = (row: any[], columns: string[]): any => {
  const obj: any = {};
  columns.forEach((col, index) => {
    obj[col] = row[index];
  });
  return obj;
};

export const getTopicsBySubjectId = async (
  subjectId: number
): Promise<Topic[]> => {
  const db = await getDatabase();
  const result = db.exec(`
    SELECT * FROM topics
    WHERE subject_id = ${subjectId}
    ORDER BY position ASC, created_at ASC
  `);

  if (result.length === 0) return [];

  const rows = result[0].values;
  const columns = result[0].columns;

  return rows.map((row) => rowToObject(row, columns) as Topic);
};

export const getTopicById = async (id: number): Promise<Topic | null> => {
  const db = await getDatabase();
  const result = db.exec(`SELECT * FROM topics WHERE id = ${id}`);

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const row = result[0].values[0];
  const columns = result[0].columns;
  return rowToObject(row, columns) as Topic;
};

export const createTopic = async (data: CreateTopic): Promise<Topic> => {
  const db = await getDatabase();

  const maxResult = db.exec(
    `SELECT MAX(position) as max FROM topics WHERE subject_id = ${data.subject_id}`
  );
  const maxPosition =
    maxResult.length > 0 && maxResult[0].values.length > 0
      ? maxResult[0].values[0][0] ?? -1
      : -1;
  const newPosition = (maxPosition as number) + 1;

  db.run(
    `INSERT INTO topics (name, subject_id, color, position) VALUES (?, ?, ?, ?)`,
    [
      data.name,
      data.subject_id,
      data.color || "#e052c4",
      newPosition,
    ] as SqlValue[]
  );

  const lastIdResult = db.exec("SELECT last_insert_rowid() as id");
  const lastId = lastIdResult[0].values[0][0] as number;

  saveDatabase();

  const createdTopic = await getTopicById(lastId);
  if (!createdTopic) {
    throw new Error("Не удалось создать тему");
  }

  return createdTopic;
};

export const updateTopic = async (
  id: number,
  data: Partial<CreateTopic>
): Promise<Topic> => {
  const db = await getDatabase();

  const updates: string[] = [];
  const values: SqlValue[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }

  if (data.subject_id !== undefined) {
    updates.push("subject_id = ?");
    values.push(data.subject_id);
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

  db.run(`UPDATE topics SET ${updates.join(", ")} WHERE id = ?`, values);

  saveDatabase();

  const updatedTopic = await getTopicById(id);
  if (!updatedTopic) {
    throw new Error("Тема не найдена");
  }

  return updatedTopic;
};

export const deleteTopic = async (id: number): Promise<void> => {
  const db = await getDatabase();

  const topic = await getTopicById(id);
  if (!topic) {
    throw new Error("Тема не найдена");
  }

  db.run(`DELETE FROM topics WHERE id = ?`, [id] as SqlValue[]);
  saveDatabase();
};
