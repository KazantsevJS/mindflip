import { useState, useRef, useEffect } from "react";
import "./Carousel.css";

interface CarouselItem {
  id: number;
  name: string;
  color?: string;
}

interface CarouselProps<T extends CarouselItem> {
  items: T[];
  onSelect: (item: T) => void;
  onSingleClick?: (item: T) => void;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode;
}

const Carousel = <T extends CarouselItem>({
  items,
  onSelect,
  onSingleClick,
  onEdit,
  onDelete,
  renderItem,
}: CarouselProps<T>) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (itemRefs.current[selectedIndex] && carouselRef.current) {
      const itemElement = itemRefs.current[selectedIndex];
      const carouselElement = carouselRef.current;

      const itemLeft = itemElement.offsetLeft;
      const itemWidth = itemElement.offsetWidth;
      const carouselWidth = carouselElement.offsetWidth;

      const scrollPosition = itemLeft - carouselWidth / 2 + itemWidth / 2;

      carouselElement.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  const handleItemClick = (item: T, index: number) => {
    setSelectedIndex(index);

    if (onSingleClick) {
      onSingleClick(item);
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      onSelect(item);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
      }, 300);
    }
  };

  const handleLongPress = (item: T, event: React.MouseEvent) => {
    let timer: NodeJS.Timeout;

    const handleMouseDown = () => {
      timer = setTimeout(() => {
        if (event.shiftKey && onDelete) {
          onDelete(item);
        } else if (onEdit) {
          onEdit(item);
        }
      }, 500);
    };

    const handleMouseUp = () => {
      clearTimeout(timer);
    };

    handleMouseDown();
    event.currentTarget.addEventListener("mouseup", handleMouseUp);
    event.currentTarget.addEventListener("mouseleave", handleMouseUp);
  };

  const defaultRenderItem = (item: T, isSelected: boolean) => (
    <div
      className={`carousel__item ${
        isSelected ? "carousel__item--selected" : ""
      }`}
      style={{ backgroundColor: item.color || "var(--accent)" }}
    >
      <span className="carousel__item-name">{item.name}</span>
    </div>
  );

  return (
    <div className="carousel">
      <div className="carousel__wrapper" ref={carouselRef}>
        <div className="carousel__track">
          {items.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="carousel__item-wrapper"
              onClick={() => handleItemClick(item, index)}
              onMouseDown={(e) => handleLongPress(item, e)}
            >
              {renderItem
                ? renderItem(item, index === selectedIndex)
                : defaultRenderItem(item, index === selectedIndex)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
