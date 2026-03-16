import { createContext, useContext, useState, useEffect } from "react";

// ─────────────────────────────────────────────
// DARK MODE (サイバー夜の都市)
// ─────────────────────────────────────────────
export const C_DARK = {
  navy:    "#0a0f1e",
  navyD:   "#060b15",
  navyL:   "#111827",
  green:   "#00ff88",
  greenL:  "#33ffaa",
  greenD:  "#00cc6a",
  red:     "#ff4455",
  bg:      "#0a0f1e",
  card:    "#111827",
  border:  "rgba(255,255,255,0.06)",
  borderD: "rgba(255,255,255,0.12)",
  tx:      "#f9fafb",
  txM:     "#9ca3af",
  txL:     "#4b5563",
  glass:   {},
  isLight: false,
};

// ─────────────────────────────────────────────
// LIGHT MODE (リキッドグラス昼の市政)
// ─────────────────────────────────────────────
export const C_LIGHT = {
  navy:    "#f0f4ff",
  navyD:   "#e8efff",
  navyL:   "#ffffff",
  green:   "#00cc6a",
  greenL:  "#00ff88",
  greenD:  "#009944",
  red:     "#dc2626",
  bg:      "#ffffff",
  card:    "rgba(255,255,255,0.6)",
  border:  "rgba(0,0,0,0.08)",
  borderD: "rgba(0,0,0,0.15)",
  tx:      "#000000",
  txM:     "#374151",
  txL:     "#6b7280",
  glass: {
    backdropFilter:       "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  },
  isLight: true,
};

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────
const ThemeCtx = createContext({ C: C_DARK, toggle: () => {}, isLight: false });

export function ThemeProvider({ children }) {
  const [isLight, setIsLight] = useState(() => {
    try { return localStorage.getItem("ik_theme") === "light"; } catch { return false; }
  });

  const toggle = () => setIsLight(v => {
    const next = !v;
    try { localStorage.setItem("ik_theme", next ? "light" : "dark"); } catch {}
    return next;
  });

  const C = isLight ? C_LIGHT : C_DARK;

  // body背景を同期
  useEffect(() => {
    document.body.style.background = C.bg;
    document.body.style.color = C.tx;
  }, [isLight]);

  return (
    <ThemeCtx.Provider value={{ C, toggle, isLight }}>
      {children}
    </ThemeCtx.Provider>
  );
}

// ─────────────────────────────────────────────
// HOOK
// useTheme() → C オブジェクトを返す
// useThemeCtx() → { C, toggle, isLight } を返す
// ─────────────────────────────────────────────
export function useTheme() {
  return useContext(ThemeCtx).C;
}

export function useThemeCtx() {
  return useContext(ThemeCtx);
}
