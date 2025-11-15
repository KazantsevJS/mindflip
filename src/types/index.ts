// типы для предмета
export interface Subject {
  id: number;
  name: string;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
}

// типы для темы
export interface Topic {
  id: number;
  name: string;
  subject_id: number;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
}

// типы для карточки
export interface Card {
  id: number;
  question: string;
  answer: string;
  topic_id: number;
  position: number;
  difficulty_level: number;
  times_reviewed: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  ease_factor: number;
  created_at: string;
  updated_at: string;
}

// типы для создания новых записей (без id и дат)
export type CreateSubject = Omit<Subject, "id" | "created_at" | "updated_at">;
export type CreateTopic = Omit<Topic, "id" | "created_at" | "updated_at">;
export type CreateCard = Omit<Card, "id" | "created_at" | "updated_at">;
