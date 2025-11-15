import { useState, useEffect } from "react";
import Carousel from "@/components/Carousel/Carousel";
import BackButton from "@/components/BackButton/BackButton";
import Button from "@/components/Button/Button";
import type { Subject, Topic } from "@/types";
import { getTopicsBySubjectId } from "@/services/topicsService";
import "./TopicsScreen.css";

interface TopicsScreenProps {
  subject: Subject;
  onBack: () => void;
  onSelectTopic: (topic: Topic) => void;
  onAddTopic: () => void;
  onEditTopic: (topic: Topic) => void;
  onDeleteTopic: (topic: Topic) => void;
}

const TopicsScreen = ({
  subject,
  onBack,
  onSelectTopic,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
}: TopicsScreenProps) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const loadedTopics = await getTopicsBySubjectId(subject.id);
        setTopics(loadedTopics);
        if (loadedTopics.length > 0) {
          setSelectedTopic(loadedTopics[0]);
        }
      } catch (error) {
        console.error("Ошибка загрузки тем:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopics();
  }, [subject.id]);

  const handleSingleClick = (topic: Topic) => {
    setSelectedTopic(topic);
  };

  const handleDoubleClick = (topic: Topic) => {
    onSelectTopic(topic);
  };

  const handleEdit = (topic: Topic) => {
    onEditTopic(topic);
  };

  const handleDelete = (topic: Topic) => {
    onDeleteTopic(topic);
  };

  const handleEditClick = () => {
    if (selectedTopic) {
      handleEdit(selectedTopic);
    }
  };

  const handleDeleteClick = () => {
    if (selectedTopic) {
      handleDelete(selectedTopic);
    }
  };

  if (!isLoading && topics.length === 0) {
    return (
      <div className="topics-screen">
        <div className="topics-screen__header">
          <BackButton onClick={onBack} />
        </div>
        <div className="topics-screen__subject-title-container">
          <h2 className="topics-screen__subject-title">{subject.name}</h2>
        </div>
        <div className="topics-screen__empty">
          <h2 className="topics-screen__empty-title">Добавьте первую тему</h2>
          <p className="topics-screen__empty-text">
            Нажмите на кнопку{" "}
            <button
              className="topics-screen__add-button-inline"
              onClick={onAddTopic}
            >
              +
            </button>{" "}
            добавить новую тему
          </p>
        </div>
        <Carousel items={[]} onSelect={handleSingleClick} onEdit={handleEdit} />
      </div>
    );
  }

  return (
    <div className="topics-screen">
      <div className="topics-screen__header">
        <BackButton onClick={onBack} />
      </div>
      <div className="topics-screen__subject-title-container">
        <h2 className="topics-screen__subject-title">{subject.name}</h2>
      </div>
      <div className="container">
        {isLoading ? (
          <div className="topics-screen__loading">Загрузка...</div>
        ) : (
          <>
            <Carousel
              items={topics}
              onSingleClick={handleSingleClick}
              onSelect={handleDoubleClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <div className="topics-screen__controls">
              <Button
                onClick={handleDeleteClick}
                variant="outline"
                className="topics-screen__button-control"
                disabled={!selectedTopic}
              >
                Удалить
              </Button>
              <Button
                onClick={onAddTopic}
                variant="outline"
                className="topics-screen__button-control"
              >
                Добавить
              </Button>
              <Button
                onClick={handleEditClick}
                variant="outline"
                className="topics-screen__button-control"
                disabled={!selectedTopic}
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

export default TopicsScreen;
