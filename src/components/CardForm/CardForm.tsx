import { useState, useEffect } from "react";
import Button from "../Button/Button";
import type { Card, CreateCard } from "@/types";
import "../Form/Form.css";

interface CardFormProps {
  card?: Card | null;
  topicId: number;
  onSubmit: (data: CreateCard) => void;
  onCancel: () => void;
}

const CardForm = ({ card, topicId, onSubmit, onCancel }: CardFormProps) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (card) {
      setQuestion(card.question);
      setAnswer(card.answer);
    } else {
      setQuestion("");
      setAnswer("");
    }
  }, [card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    onSubmit({
      question: question.trim(),
      answer: answer.trim(),
      topic_id: topicId,
      position: card?.position || 0,
      difficulty_level: card?.difficulty_level || 3,
      times_reviewed: card?.times_reviewed || 0,
      last_reviewed_at: card?.last_reviewed_at || null,
      next_review_at: card?.next_review_at || null,
      ease_factor: card?.ease_factor || 2.5,
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form__group">
        <label className="form__label" htmlFor="card-question">
          Вопрос
        </label>
        <textarea
          id="card-question"
          className="form__textarea"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          placeholder="Введите вопрос..."
          required
          autoFocus
        />
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="card-answer">
          Ответ
        </label>
        <textarea
          id="card-answer"
          className="form__textarea"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          placeholder="Введите ответ..."
          required
        />
      </div>

      <div className="form__actions">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary">
          {card ? "Сохранить" : "Добавить"}
        </Button>
      </div>
    </form>
  );
};

export default CardForm;
