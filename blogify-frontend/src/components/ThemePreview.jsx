import React, { useEffect, useState } from "react";
import { STORAGE_KEY } from "../context/ThemeContext";

export default function ThemePreview({ theme }) {
  const [storedTheme, setStoredTheme] = useState(theme);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.primary && parsed.secondary) {
          setStoredTheme(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setStoredTheme(theme);
  }, [theme]);

  const t = storedTheme;

  const cardStyle = {
    backgroundColor: t.quaternary,
    color: t.name === "dark" ? "#e5e7eb" : "#020617",
    fontFamily: t.font
  };

  return (
    <div
      style={cardStyle}
      className="rounded-lg border border-white/10 p-4 grid gap-3 md:grid-cols-3"
    >
      <div className="space-y-2">
        <div
          className="h-10 rounded-md shadow-inner"
          style={{ backgroundColor: t.primary }}
        />
        <p className="text-xs text-white/70">primary: {t.primary}</p>
        <div
          className="h-10 rounded-md shadow-inner"
          style={{ backgroundColor: t.secondary }}
        />
        <p className="text-xs text-white/70">secondary: {t.secondary}</p>
      </div>
      <div className="space-y-2">
        <div
          className="h-10 rounded-md shadow-inner"
          style={{ backgroundColor: t.tertiary }}
        />
        <p className="text-xs text-white/70">tertiary: {t.tertiary}</p>
        <div
          className="h-10 rounded-md shadow-inner"
          style={{ backgroundColor: t.quaternary }}
        />
        <p className="text-xs text-white/70">quaternary: {t.quaternary}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold">Name: {t.name}</p>
        <p className="text-xs break-words">
          Font: <span className="font-mono text-[11px]">{t.font}</span>
        </p>
        <p className="text-xs text-white/70">
          Try editing colors and font in Settings, then return here.
        </p>
      </div>
    </div>
  );
}