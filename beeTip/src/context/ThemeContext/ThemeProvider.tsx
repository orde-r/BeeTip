import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { ThemeMode } from "../../types/themeContext";
import { ThemeContext } from "./ThemeContext";

const THEME_KEY = "beetip_theme";

const isThemeMode = (value: string | null): value is ThemeMode => {
  return value === "light" || value === "dark";
};

const getPreferredTheme = (): ThemeMode => {
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (isThemeMode(storedTheme)) return storedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getPreferredTheme);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    localStorage.setItem(THEME_KEY, nextTheme);
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, nextTheme);
      return nextTheme;
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode: theme === "dark",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
