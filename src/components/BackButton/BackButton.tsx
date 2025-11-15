import "./BackButton.css";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

const BackButton = ({ onClick, label = "Назад" }: BackButtonProps) => {
  return (
    <button className="back-button" onClick={onClick}>
      <img
        src="./icons/arrow-back.svg"
        alt="Назад"
        className="back-button__icon"
      />
      <span className="back-button__label">{label}</span>
    </button>
  );
};

export default BackButton;
