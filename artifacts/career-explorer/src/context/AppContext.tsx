import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import en from "@/i18n/en";
import ar from "@/i18n/ar";
import type { I18nKeys } from "@/i18n/en";

export type Theme = "red" | "green" | "blue" | "cyan";
export type Lang = "en" | "ar";

interface AppContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: I18nKeys) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

const THEME_KEY = "ce_theme";
const LANG_KEY = "ce_lang";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function applyLang(lang: Lang) {
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", lang);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem(THEME_KEY) as Theme) || "red";
  });
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem(LANG_KEY) as Lang) || "en";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyLang(lang);
  }, [lang]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  };

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  };

  const t = (key: I18nKeys): string => {
    const dict = lang === "ar" ? ar : en;
    return dict[key] ?? en[key];
  };

  return (
    <AppContext.Provider value={{ theme, setTheme, lang, setLang, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
