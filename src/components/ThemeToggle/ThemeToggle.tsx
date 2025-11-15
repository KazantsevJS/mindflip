import { useRef } from "react";
import useTheme from "@/hooks/useTheme";
import "./ThemeToggle.css";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const buttonClass = `theme-toggle ${
    theme === "dark" ? "theme-toggle--active" : ""
  }`.trim();

  return (
    <button
      ref={buttonRef}
      className={buttonClass}
      onClick={toggleTheme}
      aria-label={
        theme === "light"
          ? "Переключить на темную тему"
          : "Переключить на светлую тему"
      }
    >
      <img
        src="./icons/sun.svg"
        alt="Light mode"
        className="theme-toggle__icon"
      />
      <img
        src="./icons/moon.svg"
        alt="Dark mode"
        className="theme-toggle__icon"
      />
    </button>
  );
};

export default ThemeToggle;
