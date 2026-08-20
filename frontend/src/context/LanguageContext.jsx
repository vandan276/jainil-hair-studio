import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { TRANSLATIONS } from "@/i18n/translations";

const LangCtx = createContext(null);

export const LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "हिं", name: "हिन्दी" },
  { code: "gu", label: "ગુ", name: "ગુજરાતી" },
];

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("jainil_lang") || "en");

  useEffect(() => {
    localStorage.setItem("jainil_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] ?? TRANSLATIONS.en[key] ?? key;
  }, [lang]);

  const contextValue = useMemo(() => ({
    lang, setLang, t, languages: LANGUAGES
  }), [lang, t]);

  return (
    <LangCtx.Provider value={contextValue}>
      {children}
    </LangCtx.Provider>
  );
}

export const useLang = () => useContext(LangCtx);
