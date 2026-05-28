import { useTheme } from "../../context/ThemeContext/ThemeContext";
import "./ThemeToggle.css";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const nextThemeLabel = isDarkMode ? "light" : "dark";

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={`Switch to ${nextThemeLabel} mode`}
      title={`Switch to ${nextThemeLabel} mode`}
    >
      <span className="material-symbols-outlined">
        {isDarkMode ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
