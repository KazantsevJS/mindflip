import { getDatabase, saveDatabase } from "./database";
import type { Card, CreateCard } from "@/types";
import type { SqlValue } from "sql.js";

const rowToObject = (row: any[], columns: string[]): any => {
  const obj: any = {};
  columns.forEach((col, index) => {
    obj[col] = row[index];
  });
  return obj;
};

export const getCardsByTopicId = async (topicId: number): Promise<Card[]> => {
  const db = await getDatabase();
  const result = db.exec(`
    SELECT * FROM cards
    WHERE topic_id = ${topicId}
    ORDER BY position ASC, created_at ASC
  `);

  if (result.length === 0) return [];

  const rows = result[0].values;
  const columns = result[0].columns;

  return rows.map((row) => rowToObject(row, columns) as Card);
};

export const getCardById = async (id: number): Promise<Card | null> => {
  const db = await getDatabase();
  const result = db.exec(`SELECT * FROM cards WHERE id = ${id}`);

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const row = result[0].values[0];
  const columns = result[0].columns;
  return rowToObject(row, columns) as Card;
};

export const createCard = async (data: CreateCard): Promise<Card> => {
  const db = await getDatabase();

  const maxResult = db.exec(
    `SELECT MAX(position) as max FROM cards WHERE topic_id = ${data.topic_id}`
  );
  const maxPosition =
    maxResult.length > 0 && maxResult[0].values.length > 0
      ? maxResult[0].values[0][0] ?? -1
      : -1;
  const newPosition = (maxPosition as number) + 1;

  db.run(
    `INSERT INTO cards (
      question, answer, topic_id, position, difficulty_level, 
      times_reviewed, last_reviewed_at, next_review_at, ease_factor
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.question,
      data.answer,
      data.topic_id,
      newPosition,
      data.difficulty_level || 3,
      data.times_reviewed || 0,
      data.last_reviewed_at || null,
      data.next_review_at || null,
      data.ease_factor || 2.5,
    ] as SqlValue[]
  );

  const lastIdResult = db.exec("SELECT last_insert_rowid() as id");
  const lastId = lastIdResult[0].values[0][0] as number;

  await saveDatabase();

  const createdCard = await getCardById(lastId);
  if (!createdCard) {
    throw new Error("Не удалось создать карточку");
  }

  return createdCard;
};

export const updateCard = async (
  id: number,
  data: Partial<CreateCard>
): Promise<Card> => {
  const db = await getDatabase();

  const updates: string[] = [];
  const values: SqlValue[] = [];

  if (data.question !== undefined) {
    updates.push("question = ?");
    values.push(data.question);
  }

  if (data.answer !== undefined) {
    updates.push("answer = ?");
    values.push(data.answer);
  }

  if (data.topic_id !== undefined) {
    updates.push("topic_id = ?");
    values.push(data.topic_id);
  }

  if (data.position !== undefined) {
    updates.push("position = ?");
    values.push(data.position);
  }

  if (data.difficulty_level !== undefined) {
    updates.push("difficulty_level = ?");
    values.push(data.difficulty_level);
  }

  if (data.times_reviewed !== undefined) {
    updates.push("times_reviewed = ?");
    values.push(data.times_reviewed);
  }

  if (data.last_reviewed_at !== undefined) {
    updates.push("last_reviewed_at = ?");
    values.push(data.last_reviewed_at);
  }

  if (data.next_review_at !== undefined) {
    updates.push("next_review_at = ?");
    values.push(data.next_review_at);
  }

  if (data.ease_factor !== undefined) {
    updates.push("ease_factor = ?");
    values.push(data.ease_factor);
  }

  updates.push('updated_at = datetime("now")');
  values.push(id);

  db.run(`UPDATE cards SET ${updates.join(", ")} WHERE id = ?`, values);

  await saveDatabase();

  const updatedCard = await getCardById(id);
  if (!updatedCard) {
    throw new Error("Карточка не найдена");
  }

  return updatedCard;
};

export const deleteCard = async (id: number): Promise<void> => {
  const db = await getDatabase();

  const card = await getCardById(id);
  if (!card) {
    throw new Error("Карточка не найдена");
  }

  db.run(`DELETE FROM cards WHERE id = ?`, [id] as SqlValue[]);
  await saveDatabase();
};

export const markCardReviewed = async (
  id: number,
  known: boolean
): Promise<Card> => {
  const card = await getCardById(id);

  if (!card) {
    throw new Error("Карточка не найдена");
  }

  const now = new Date().toISOString();
  let newEaseFactor = card.ease_factor;
  let nextReviewDate: string | null = null;

  if (known) {
    newEaseFactor = Math.min(card.ease_factor + 0.15, 2.5);
    const daysUntilNext = Math.ceil(card.ease_factor * 2);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysUntilNext);
    nextReviewDate = nextDate.toISOString();
  } else {
    newEaseFactor = Math.max(card.ease_factor - 0.2, 1.3);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    nextReviewDate = nextDate.toISOString();
  }

  return updateCard(id, {
    times_reviewed: card.times_reviewed + 1,
    last_reviewed_at: now,
    next_review_at: nextReviewDate,
    ease_factor: newEaseFactor,
  });
};
