import { useState, useEffect, useRef } from "react";
import Button from "../Button/Button";
import type { Topic, CreateTopic } from "@/types";
import "../Form/Form.css";
import "./TopicForm.css";

interface TopicFormProps {
  topic?: Topic | null;
  subjectId: number;
  onSubmit: (data: CreateTopic) => void;
  onCancel: () => void;
}

const TopicForm = ({
  topic,
  subjectId,
  onSubmit,
  onCancel,
}: TopicFormProps) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#e052c4");
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setColor(topic.color || "#e052c4");
    } else {
      setName("");
      setColor("#e052c4");
    }
  }, [topic]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      subject_id: subjectId,
      color: color,
      position: topic?.position || 0,
    });
  };

  const handleColorClick = () => {
    colorInputRef.current?.click();
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form__group">
        <input
          id="topic-name"
          type="text"
          className="form__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите название темы"
          required
          autoFocus
        />
      </div>

      <div className="form__actions">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleColorClick}
          className="form__color-button"
          style={{ backgroundColor: color }}
        >
          Цвет
        </Button>
        <input
          ref={colorInputRef}
          type="color"
          value={color}
          onChange={handleColorChange}
          className="form__color-input-hidden"
        />
        <Button type="submit" variant="primary">
          {topic ? "Сохранить" : "Добавить"}
        </Button>
      </div>
    </form>
  );
};

export default TopicForm;
