import { useState, useEffect } from "react";
import BackButton from "@/components/BackButton/BackButton";
import Button from "@/components/Button/Button";
import type { Topic, Card } from "@/types";
import { getCardsByTopicId } from "@/services/cardsService";
import "./EditScreen.css";

interface EditScreenProps {
  topic: Topic;
  onBack: () => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (card: Card) => void;
}

const EditScreen = ({
  topic,
  onBack,
  onEditCard,
  onDeleteCard,
}: EditScreenProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const loadedCards = await getCardsByTopicId(topic.id);
        setCards(loadedCards);
      } catch (error) {
        console.error("Ошибка загрузки карточек:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
  }, [topic.id]);

  if (isLoading) {
    return (
      <div className="edit-screen">
        <div className="edit-screen__header">
          <BackButton onClick={onBack} />
        </div>
        <div className="edit-screen__title-container">
          <h2 className="edit-screen__title">{topic.name}</h2>
        </div>
        <div className="edit-screen__loading">Загрузка...</div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="edit-screen">
        <div className="edit-screen__header">
          <BackButton onClick={onBack} />
        </div>
        <div className="edit-screen__title-container">
          <h2 className="edit-screen__title">{topic.name}</h2>
        </div>
        <div className="edit-screen__empty">
          <p className="edit-screen__empty-text">
            В этой теме пока нет карточек
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-screen">
      <div className="edit-screen__header">
        <BackButton onClick={onBack} />
      </div>
      <div className="edit-screen__title-container">
        <h2 className="edit-screen__title">{topic.name}</h2>
      </div>
      <div className="edit-screen__cards-list">
        {cards.map((card) => (
          <div key={card.id} className="edit-screen__card-item">
            <div className="edit-screen__card-content">
              <div className="edit-screen__card-question">
                <strong>Вопрос:</strong> {card.question}
              </div>
              <div className="edit-screen__card-answer">
                <strong>Ответ:</strong> {card.answer}
              </div>
            </div>
            <div className="edit-screen__card-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => onEditCard(card)}
              >
                Редактировать
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => onDeleteCard(card)}
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditScreen;
