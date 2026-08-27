import React, { createContext, useContext, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { lightColors, darkColors, ThemeColors } from "./colors";
import { getSetting, setSetting } from "../db/settings";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    // Loaded once on startup, after initDb() has already run in the root
    // layout — the settings table is guaranteed to exist by this point.
    const saved = getSetting("theme");
    if (saved === "dark" || saved === "light") {
      setMode(saved);
    }
  }, []);

  function toggleTheme() {
    setMode((prev) => {
      const next: ThemeMode = prev === "light" ? "dark" : "light";
      setSetting("theme", next);
      return next;
    });
  }

  const colors = mode === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
