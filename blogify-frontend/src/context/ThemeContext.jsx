import React, { createContext, useContext, useEffect, useState } from "react";
import { hexToHsl } from "../lib/utils";

const STORAGE_KEY = "app:theme_v3";
const OPACITY_KEY = "app:opacity";

/**
 * @typedef {Object} Theme
 * @property {string} name - Theme name identifier.
 * @property {string} primary - Primary brand color (hex).
 * @property {string} secondary - Secondary accent color (hex).
 * @property {string} background - Background color (hex).
 * @property {string} foreground - Main text color (hex).
 * @property {string} font - Font family stack.
 */

const THEMES = {
  dark: {
    name: "dark",
    primary: "#6366f1",
    secondary: "#818cf8",
    background: "#020617",
    foreground: "#f8fafc",
    font: "Inter"
  },
  cyber: {
    name: "cyber",
    primary: "#00f5ff",
    secondary: "#d946ef",
    background: "#0a0a0a",
    foreground: "#e2e8f0",
    font: "Orbitron"
  },
  light: {
    name: "light",
    primary: "#2563eb",
    secondary: "#4f46e5",
    background: "#ffffff",
    foreground: "#0f172a",
    font: "Nunito Sans"
  },
  glass: {
    name: "glass",
    primary: "#ffffff",
    secondary: "#94a3b8",
    background: "#0f172a",
    foreground: "#ffffff",
    font: "Poppins"
  },
  jasmine: {
    name: "jasmine",
    primary: "#10b981",
    secondary: "#f59e0b",
    background: "#fffbeb", // warm yellowish white
    foreground: "#78350f",
    font: "Playfair Display"
  },
  midnight: {
    name: "midnight",
    primary: "#38bdf8",
    secondary: "#818cf8",
    background: "#1e1b4b",
    foreground: "#e0e7ff",
    font: "IBM Plex Sans"
  },
  sunset: {
    name: "sunset",
    primary: "#f43f5e",
    secondary: "#f59e0b",
    background: "#2a0a12",
    foreground: "#fff1f2",
    font: "Lora"
  },
  forest: {
    name: "forest",
    primary: "#22c55e",
    secondary: "#84cc16",
    background: "#052e16",
    foreground: "#f0fdf4",
    font: "Roboto Slab"
  },
  ocean: {
    name: "ocean",
    primary: "#06b6d4",
    secondary: "#3b82f6",
    background: "#083344",
    foreground: "#ecfeff",
    font: "Source Sans Pro"
  },
  rose: {
    name: "rose",
    primary: "#e11d48",
    secondary: "#db2777",
    background: "#fff1f2",
    foreground: "#881337",
    font: "DM Serif Display"
  },
  coffee: {
    name: "coffee",
    primary: "#d97706",
    secondary: "#92400e",
    background: "#292524",
    foreground: "#f5f5f4",
    font: "Merriweather"
  },
  corporate: {
    name: "corporate",
    primary: "#0f766e",
    secondary: "#0e7490",
    background: "#f1f5f9",
    foreground: "#334155",
    font: "Work Sans"
  },
  dracula: {
    name: "dracula",
    primary: "#bd93f9",
    secondary: "#ff79c6",
    background: "#282a36",
    foreground: "#f8f8f2",
    font: "Fira Code"
  }
};

const DEFAULT_THEME = THEMES.dark;

const ThemeContext = createContext({
  currentTheme: DEFAULT_THEME,
  cardOpacity: 0.2,
  setTheme: (theme) => {},
  setCardOpacity: (opacity) => {},
});

// Helper: Adjust lightness of HSL string
const shiftHsl = (hslStr, amount) => {
  const [h, s, l] = hslStr.split(' ').map(v => parseFloat(v));
  let newL = l + amount;
  newL = Math.max(0, Math.min(100, newL));
  return `${h} ${s}% ${newL}%`;
};

export function ThemeProvider({ children }) {
  // Initialize state lazily to avoid flash if possible, though localStorage is sync.
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : DEFAULT_THEME;
      return { ...DEFAULT_THEME, ...parsed }; 
    } catch {
      return DEFAULT_THEME;
    }
  });

  const [cardOpacity, setCardOpacity] = useState(() => {
    try {
      const stored = window.localStorage.getItem(OPACITY_KEY);
      return stored ? parseFloat(stored) : 0.2;
    } catch {
      return 0.2;
    }
  });

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // EFFECT 1: Heavy Lifting - Theme Colors
  useEffect(() => {
    const root = document.documentElement;
    const t = currentTheme;
    
    const bgHsl = hexToHsl(t.background);
    const fgHsl = hexToHsl(t.foreground || (t.background === "#ffffff" ? "#000000" : "#ffffff"));
    
    // Calculate lightness to decide if we darken or lighten for contrast
    const l = parseFloat(bgHsl.split(' ')[2]);
    const isDark = l < 50;
    
    // Calculate tertiary/card/border colors derived from background
    // If Dark mode: Lighten background for cards/borders
    // If Light mode: Darken background for cards/borders
    // Using "2-3 shades" roughly 10-15% lightness shift
    const shiftAmount = isDark ? 8 : -8; // 8% shift
    const tertiaryHsl = shiftHsl(bgHsl, shiftAmount);
    const borderHsl = shiftHsl(bgHsl, shiftAmount * 1.5); // slightly more contrast for borders

    // CSS Variables Injection
    const vars = {
      "--background": bgHsl,
      "--foreground": fgHsl,
      "--primary": hexToHsl(t.primary),
      "--primary-foreground": isDark ? "210 40% 98%" : "210 40% 2%",
      "--secondary": hexToHsl(t.secondary),
      "--secondary-foreground": isDark ? "210 40% 98%" : "210 40% 2%",
      "--border": borderHsl,
      "--input": borderHsl,
      "--ring": hexToHsl(t.primary),
      "--card": tertiaryHsl,
      "--card-foreground": fgHsl,
      "--muted": tertiaryHsl,
      "--muted-foreground": shiftHsl(fgHsl, isDark ? -30 : 30), // Dim the foreground
      "--popover": tertiaryHsl,
      "--popover-foreground": fgHsl,
    };

    Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val));
  }, [currentTheme]);

  // EFFECT 2: Lightweight - Opacity
  useEffect(() => {
    document.documentElement.style.setProperty("--card-opacity-default", cardOpacity);
  }, [cardOpacity]);

  // EFFECT 3: Persistence
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTheme));
      window.localStorage.setItem(OPACITY_KEY, cardOpacity.toString());
    } catch {
      // ignore storage errors
    }
  }, [currentTheme, cardOpacity, hydrated]);

  // EFFECT 4: Font Loading
  useEffect(() => {
    if (!currentTheme.font) return;
    const family = currentTheme.font.split(',')[0].trim().replace(/['"]/g, '');
    if (['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'].includes(family.toLowerCase())) return;
    import('../services/fontService').then(({ loadFont }) => loadFont(family)).catch(() => {});
  }, [currentTheme.font]);

  /**
   * Sets the active theme either by name or object.
   * @param {string | Theme} themeOrName 
   */
  function setTheme(themeOrName) {
    if (typeof themeOrName === "string") {
      if (THEMES[themeOrName]) setCurrentTheme(THEMES[themeOrName]);
      return;
    }
    if (themeOrName && typeof themeOrName === "object") {
      setCurrentTheme(themeOrName);
    }
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, cardOpacity, setTheme, setCardOpacity, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { THEMES, STORAGE_KEY };