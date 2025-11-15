import { useState, useEffect, useRef } from "react";
import Button from "../Button/Button";
import type { Subject, CreateSubject } from "@/types";
import "../Form/Form.css";
import "./SubjectForm.css";

interface SubjectFormProps {
  subject?: Subject | null;
  onSubmit: (data: CreateSubject) => void;
  onCancel: () => void;
}

const SubjectForm = ({ subject, onSubmit, onCancel }: SubjectFormProps) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#e052c4");
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setColor(subject.color);
    } else {
      setName("");
      setColor("#e052c4");
    }
  }, [subject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      color,
      position: subject?.position || 0,
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
          id="subject-name"
          type="text"
          className="form__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите название предмета"
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
          {subject ? "Сохранить" : "Добавить"}
        </Button>
      </div>
    </form>
  );
};

export default SubjectForm;
