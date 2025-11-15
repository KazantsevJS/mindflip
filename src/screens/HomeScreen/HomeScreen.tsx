import { useState, useEffect } from "react";
import Carousel from "@/components/Carousel/Carousel";
import Button from "@/components/Button/Button";
import type { Subject } from "@/types";
import { getAllSubjects } from "@/services/subjectsService";
import "./HomeScreen.css";

interface HomeScreenProps {
  onSelectSubject: (subject: Subject) => void;
  onAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subject: Subject) => void;
}

const HomeScreen = ({
  onSelectSubject,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
}: HomeScreenProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const loadedSubjects = await getAllSubjects();
        setSubjects(loadedSubjects);
        if (loadedSubjects.length > 0) {
          setSelectedSubject(loadedSubjects[0]);
        }
      } catch (error) {
        console.error("Ошибка загрузки предметов:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubjects();
  }, []);

  const handleSingleClick = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleDoubleClick = (subject: Subject) => {
    onSelectSubject(subject);
  };

  const handleEdit = (subject: Subject) => {
    onEditSubject(subject);
  };

  const handleDelete = (subject: Subject) => {
    onDeleteSubject(subject);
  };

  const handleEditClick = () => {
    if (selectedSubject) {
      handleEdit(selectedSubject);
    }
  };

  const handleDeleteClick = () => {
    if (selectedSubject) {
      handleDelete(selectedSubject);
    }
  };

  if (!isLoading && subjects.length === 0) {
    return (
      <div className="home-screen">
        <div className="container">
          <h1 className="title-1">MindFlip</h1>
          <div className="home-screen__empty">
            <h2 className="home-screen__empty-title">
              Добавьте первый предмет
            </h2>
            <p className="home-screen__empty-text">
              Нажмите кнопку{" "}
              <button
                className="home-screen__add-button"
                onClick={onAddSubject}
                aria-label="Добавить предмет"
              >
                +
              </button>{" "}
              чтобы начать
            </p>
          </div>
        </div>
        <Carousel items={[]} onSelect={handleSingleClick} onEdit={handleEdit} />
      </div>
    );
  }

  return (
    <div className="home-screen">
      <div className="container">
        <h1 className="title-1 home-screen__title">MindFlip</h1>
        {isLoading ? (
          <div className="home-screen__loading">Загрузка...</div>
        ) : (
          <>
            <Carousel
              items={subjects}
              onSingleClick={handleSingleClick}
              onSelect={handleDoubleClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <div className="home-screen__controls">
              <Button
                onClick={handleDeleteClick}
                variant="outline"
                className="home-screen__button-control"
                disabled={!selectedSubject}
              >
                Удалить
              </Button>
              <Button
                onClick={onAddSubject}
                variant="outline"
                className="home-screen__button-control"
              >
                Добавить
              </Button>
              <Button
                onClick={handleEditClick}
                variant="outline"
                className="home-screen__button-control"
                disabled={!selectedSubject}
              >
                Редактировать
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
