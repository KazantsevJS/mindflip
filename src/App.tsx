import { useState } from "react";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle";
import Modal from "./components/Modal/Modal";
import Button from "./components/Button/Button";
import SubjectForm from "./components/SubjectForm/SubjectForm";
import TopicForm from "./components/TopicForm/TopicForm";
import CardForm from "./components/CardForm/CardForm";
import HomeScreen from "./screens/HomeScreen/HomeScreen";
import TopicsScreen from "./screens/TopicsScreen/TopicsScreen";
import StudyScreen from "./screens/StudyScreen/StudyScreen";
import EditScreen from "./screens/EditScreen/EditScreen";
import type {
  Subject,
  Topic,
  Card,
  CreateSubject,
  CreateTopic,
  CreateCard,
} from "./types";
import {
  createSubject,
  updateSubject,
  deleteSubject,
} from "./services/subjectsService";
import {
  createTopic,
  updateTopic,
  deleteTopic,
} from "./services/topicsService";
import { createCard, updateCard, deleteCard } from "./services/cardsService";

type Screen = "home" | "topics" | "study" | "edit";
type ModalType =
  | "addSubject"
  | "editSubject"
  | "addTopic"
  | "editTopic"
  | "addCard"
  | "editCard"
  | "deleteSubject"
  | "deleteTopic"
  | "deleteCard"
  | null;

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Состояние модалок
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);
  const [deletingCard, setDeletingCard] = useState<Card | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Обработчик выбора предмета - переход к TopicsScreen
  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentScreen("topics");
  };

  // Обработчик возврата с TopicsScreen - переход к HomeScreen
  const handleBackFromTopics = () => {
    setSelectedSubject(null);
    setCurrentScreen("home");
  };

  // Обработчик выбора темы - переход к StudyScreen
  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentScreen("study");
  };

  // Обработчик возврата с StudyScreen - переход к TopicsScreen
  const handleBackFromStudy = () => {
    setSelectedTopic(null);
    setCurrentScreen("topics");
  };

  // Обработчик перехода к EditScreen
  const handleEditCards = () => {
    if (!selectedTopic) return;
    setCurrentScreen("edit");
  };

  // Обработчик возврата с EditScreen - переход к StudyScreen
  const handleBackFromEdit = () => {
    setCurrentScreen("study");
  };

  // Обработчики модалок для предметов
  const handleAddSubject = () => {
    setEditingSubject(null);
    setModalType("addSubject");
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setModalType("editSubject");
  };

  const handleDeleteSubject = (subject: Subject) => {
    setDeletingSubject(subject);
    setModalType("deleteSubject");
  };

  const handleSaveSubject = async (data: CreateSubject) => {
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, data);
      } else {
        await createSubject(data);
      }
      setModalType(null);
      setEditingSubject(null);
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      console.error("Ошибка сохранения предмета:", error);
      alert(
        `Ошибка: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
    }
  };

  const handleConfirmDeleteSubject = async () => {
    if (!deletingSubject) return;
    try {
      await deleteSubject(deletingSubject.id);
      setModalType(null);
      setDeletingSubject(null);
      setReloadKey((prev) => prev + 1);
      if (selectedSubject?.id === deletingSubject.id) {
        setSelectedSubject(null);
        setCurrentScreen("home");
      }
    } catch (error) {
      console.error("Ошибка удаления предмета:", error);
      alert(
        `Ошибка: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
    }
  };

  // Обработчики модалок для тем
  const handleAddTopic = () => {
    if (!selectedSubject) return;
    setEditingTopic(null);
    setModalType("addTopic");
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setModalType("editTopic");
  };

  const handleDeleteTopic = (topic: Topic) => {
    setDeletingTopic(topic);
    setModalType("deleteTopic");
  };

  const handleSaveTopic = async (data: CreateTopic) => {
    if (!selectedSubject) return;
    try {
      if (editingTopic) {
        await updateTopic(editingTopic.id, data);
      } else {
        await createTopic(data);
      }
      setModalType(null);
      setEditingTopic(null);
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      console.error("Ошибка сохранения темы:", error);
    }
  };

  const handleConfirmDeleteTopic = async () => {
    if (!deletingTopic) return;
    try {
      await deleteTopic(deletingTopic.id);
      setModalType(null);
      setDeletingTopic(null);
      setReloadKey((prev) => prev + 1);
      if (selectedTopic?.id === deletingTopic.id) {
        setSelectedTopic(null);
        setCurrentScreen("topics");
      }
    } catch (error) {
      console.error("Ошибка удаления темы:", error);
    }
  };

  // Обработчики модалок для карточек
  const handleAddCard = () => {
    if (!selectedTopic) return;
    setEditingCard(null);
    setModalType("addCard");
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setModalType("editCard");
  };

  const handleDeleteCard = (card: Card) => {
    setDeletingCard(card);
    setModalType("deleteCard");
  };

  const handleSaveCard = async (data: CreateCard) => {
    if (!selectedTopic) return;
    try {
      if (editingCard) {
        await updateCard(editingCard.id, data);
      } else {
        await createCard(data);
      }
      setModalType(null);
      setEditingCard(null);
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      console.error("Ошибка сохранения карточки:", error);
    }
  };

  const handleConfirmDeleteCard = async () => {
    if (!deletingCard) return;
    try {
      await deleteCard(deletingCard.id);
      setModalType(null);
      setDeletingCard(null);
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      console.error("Ошибка удаления карточки:", error);
    }
  };

  // Закрытие модалки
  const handleCloseModal = () => {
    setModalType(null);
    setEditingSubject(null);
    setEditingTopic(null);
    setEditingCard(null);
    setDeletingSubject(null);
    setDeletingTopic(null);
    setDeletingCard(null);
  };

  // Определяем заголовок модалки
  const getModalTitle = (): string => {
    switch (modalType) {
      case "addSubject":
        return "Добавить предмет";
      case "editSubject":
        return "Редактировать предмет";
      case "addTopic":
        return "Добавить тему";
      case "editTopic":
        return "Редактировать тему";
      case "addCard":
        return "Добавить карточку";
      case "editCard":
        return "Редактировать карточку";
      case "deleteSubject":
        return "Удалить предмет?";
      case "deleteTopic":
        return "Удалить тему?";
      case "deleteCard":
        return "Удалить карточку?";
      default:
        return "";
    }
  };

  return (
    <div className="App">
      <ThemeToggle />
      {currentScreen === "home" && (
        <HomeScreen
          key={reloadKey}
          onSelectSubject={handleSelectSubject}
          onAddSubject={handleAddSubject}
          onEditSubject={handleEditSubject}
          onDeleteSubject={handleDeleteSubject}
        />
      )}
      {currentScreen === "topics" && selectedSubject && (
        <TopicsScreen
          key={reloadKey}
          subject={selectedSubject}
          onBack={handleBackFromTopics}
          onSelectTopic={handleSelectTopic}
          onAddTopic={handleAddTopic}
          onEditTopic={handleEditTopic}
          onDeleteTopic={handleDeleteTopic}
        />
      )}
      {currentScreen === "study" && selectedTopic && (
        <StudyScreen
          key={reloadKey}
          topic={selectedTopic}
          onBack={handleBackFromStudy}
          onAddCard={handleAddCard}
          onEditCards={handleEditCards}
        />
      )}
      {currentScreen === "edit" && selectedTopic && (
        <EditScreen
          key={reloadKey}
          topic={selectedTopic}
          onBack={handleBackFromEdit}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
        />
      )}

      {/* Модалка для предметов */}
      <Modal
        isOpen={
          modalType === "addSubject" ||
          modalType === "editSubject" ||
          modalType === "deleteSubject"
        }
        onClose={handleCloseModal}
        title={getModalTitle()}
        showCloseButton={false}
      >
        {modalType === "deleteSubject" && deletingSubject ? (
          <div className="delete-confirmation">
            <p>
              Вы уверены, что хотите удалить предмет "{deletingSubject.name}"?
              Все темы и карточки этого предмета также будут удалены.
            </p>
            <div className="form__actions">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Отмена
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmDeleteSubject}
              >
                Удалить
              </Button>
            </div>
          </div>
        ) : (
          <SubjectForm
            subject={editingSubject}
            onSubmit={handleSaveSubject}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>

      {/* Модалка для тем */}
      <Modal
        isOpen={
          modalType === "addTopic" ||
          modalType === "editTopic" ||
          modalType === "deleteTopic"
        }
        onClose={handleCloseModal}
        title={getModalTitle()}
        showCloseButton={false}
      >
        {modalType === "deleteTopic" && deletingTopic ? (
          <div className="delete-confirmation">
            <p>
              Вы уверены, что хотите удалить тему "{deletingTopic.name}"? Все
              карточки этой темы также будут удалены.
            </p>
            <div className="form__actions">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Отмена
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmDeleteTopic}
              >
                Удалить
              </Button>
            </div>
          </div>
        ) : (
          selectedSubject && (
            <TopicForm
              topic={editingTopic}
              subjectId={selectedSubject.id}
              onSubmit={handleSaveTopic}
              onCancel={handleCloseModal}
            />
          )
        )}
      </Modal>

      {/* Модалка для карточек */}
      <Modal
        isOpen={
          modalType === "addCard" ||
          modalType === "editCard" ||
          modalType === "deleteCard"
        }
        onClose={handleCloseModal}
        title={getModalTitle()}
        showCloseButton={false}
      >
        {modalType === "deleteCard" && deletingCard ? (
          <div className="delete-confirmation">
            <p>Вы уверены, что хотите удалить эту карточку?</p>
            <div className="form__actions">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Отмена
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmDeleteCard}
              >
                Удалить
              </Button>
            </div>
          </div>
        ) : (
          selectedTopic && (
            <CardForm
              card={editingCard}
              topicId={selectedTopic.id}
              onSubmit={handleSaveCard}
              onCancel={handleCloseModal}
            />
          )
        )}
      </Modal>
    </div>
  );
};

export default App;
