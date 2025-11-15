import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/BackButton/BackButton";
import Button from "@/components/Button/Button";
import type { Topic, Card } from "@/types";
import { getCardsByTopicId, markCardReviewed } from "@/services/cardsService";
import "./StudyScreen.css";

interface StudyScreenProps {
  topic: Topic;
  onBack: () => void;
  onAddCard: () => void;
  onEditCards: () => void;
}

const StudyScreen = ({
  topic,
  onBack,
  onAddCard,
  onEditCards,
}: StudyScreenProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
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

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnown = async () => {
    if (cards.length === 0 || currentIndex >= cards.length) return;

    const currentCard = cards[currentIndex];
    try {
      await markCardReviewed(currentCard.id, true);
      moveToNext();
    } catch (error) {
      console.error("Ошибка при отметке карточки:", error);
    }
  };

  const handleReview = async () => {
    if (cards.length === 0 || currentIndex >= cards.length) return;

    const currentCard = cards[currentIndex];
    try {
      await markCardReviewed(currentCard.id, false);
      moveToNext();
    } catch (error) {
      console.error("Ошибка при отметке карточки:", error);
    }
  };

  const moveToNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onBack();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleKnown();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleReview();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFlipped, currentIndex, cards]);

  const currentCard = cards[currentIndex];
  const progress =
    cards.length > 0 ? `${currentIndex + 1}/${cards.length}` : "0/0";

  if (!isLoading && cards.length === 0) {
    return (
      <div className="study-screen">
        <div className="study-screen__header">
          <BackButton onClick={onBack} />
        </div>
        <div className="study-screen__topic-title-container">
          <h2 className="study-screen__topic-title">{topic.name}</h2>
          <div className="study-screen__progress">{progress}</div>
        </div>
        <div className="study-screen__empty">
          <h2 className="study-screen__empty-title">
            Добавьте первую карточку
          </h2>
          <p className="study-screen__empty-text">
            Нажмите на кнопку{" "}
            <button
              className="study-screen__add-button-inline"
              onClick={onAddCard}
            >
              +
            </button>{" "}
            добавить новую карточку
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="study-screen">
        <div className="study-screen__header">
          <BackButton onClick={onBack} />
        </div>
        <div className="study-screen__topic-title-container">
          <h2 className="study-screen__topic-title">{topic.name}</h2>
          <div className="study-screen__progress">{progress}</div>
        </div>
        <div className="study-screen__loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="study-screen">
      <div className="study-screen__header">
        <BackButton onClick={onBack} />
      </div>

      <div className="study-screen__topic-title-container">
        <h2 className="study-screen__topic-title">{topic.name}</h2>
        <div className="study-screen__progress">{progress}</div>
      </div>

      <div className="study-screen__card-container">
        <AnimatePresence mode="wait">
          {currentCard && (
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="study-screen__card-wrapper"
              onClick={handleFlip}
            >
              <motion.div
                className={`study-screen__card ${
                  isFlipped ? "study-screen__card--flipped" : ""
                }`}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="study-screen__card-front">
                  <div className="study-screen__card-label">Вопрос</div>
                  <div className="study-screen__card-content">
                    {currentCard.question}
                  </div>
                </div>
                <div className="study-screen__card-back">
                  <div className="study-screen__card-label">Ответ</div>
                  <div className="study-screen__card-content">
                    {currentCard.answer}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="study-screen__controls">
        <Button
          onClick={onAddCard}
          variant="outline"
          className="study-screen__button-control"
        >
          Добавить
        </Button>
        <Button
          onClick={onEditCards}
          variant="outline"
          className="study-screen__button-control"
        >
          Редактировать
        </Button>
        <Button
          onClick={handleReview}
          variant="outline"
          className="study-screen__button-control"
        >
          Повторить
        </Button>
        <Button
          onClick={handleKnown}
          variant="outline"
          className="study-screen__button-control study-screen__button-known"
        >
          Знаю
        </Button>
      </div>
    </div>
  );
};

export default StudyScreen;
