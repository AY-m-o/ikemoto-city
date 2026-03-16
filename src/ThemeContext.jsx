import { createContext, useContext } from "react";

// ─────────────────────────────────────────────
// DARK MODE FIXED（サイバー夜の都市）
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
// CONTEXT（固定ダークモード）
// ─────────────────────────────────────────────
const ThemeCtx = createContext({ C: C_DARK });

export function ThemeProvider({ children }) {
  const C = C_DARK;

  return (
    <ThemeCtx.Provider value={{ C, isLight: false }}>
      {children}
    </ThemeCtx.Provider>
  );
}

// ─────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────
export function useTheme() {
  return useContext(ThemeCtx).C;
}

export function useThemeCtx() {
  return useContext(ThemeCtx);
}
