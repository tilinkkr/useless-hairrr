"use client";

import React from "react";
import { getLang, setLang, toggleLang } from "../utils/i18n";

export default function LangClient({ children }: { children: React.ReactNode }) {
  // Default client state to Malayalam to match SSR and avoid hydration mismatch
  const [lang, setLangState] = React.useState<"en" | "ml">("ml");

  React.useEffect(() => {
    const current = getLang();
    setLangState(current);
    if (typeof document !== "undefined") {
      document.documentElement.lang = current;
    }
  }, []);

  const onToggle = React.useCallback(() => {
    const next = lang === "en" ? "ml" : "en";
    setLang(next);
    setLangState(next);
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
  }, [lang]);

  return (
    <div className="relative">
      {/* Language Toggle Button - top right */}
      <button
        id="langToggle"
        onClick={onToggle}
        className="fixed top-4 right-4 z-50 bg-ashram-accent hover:bg-opacity-80 text-ashram-background px-3 py-2 rounded-full text-sm font-semibold shadow"
        aria-label="Language Toggle"
      >
        {lang === "en" ? "🌐 Switch to മലയാളം" : "🌐 Switch to English"}
      </button>
      <div key={lang}>{children}</div>
    </div>
  );
}


