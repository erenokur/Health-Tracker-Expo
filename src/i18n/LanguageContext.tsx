import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, Language } from "./translations";
import { getSetting, setSetting } from "../db/settings";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("tr");

  useEffect(() => {
    const saved = getSetting("language");
    if (saved === "tr" || saved === "en") {
      setLanguageState(saved);
    }
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    setSetting("language", lang);
  }

  function t(key: string): string {
    return translations[language][key] ?? translations.tr[key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
