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
// LIGHT MODE 「光の中の行政庁舎」
// ─────────────────────────────────────────────
export const C_LIGHT = {
  navy:    "rgba(255,255,255,0.25)",
  navyD:   "rgba(240,240,240,0.3)",
  navyL:   "#ffffff",
  green:   "#000000",
  greenL:  "#333333",
  greenD:  "#000000",
  red:     "#c0392b",
  bg:      "#ffffff",
  card:    "rgba(255,255,255,0.25)",
  border:  "rgba(255,255,255,0.9)",
  borderD: "rgba(0,0,0,0.08)",
  tx:      "#000000",
  txM:     "#222222",
  txL:     "#888888",
  glass: {
    background:           "rgba(255,255,255,0.25)",
    backdropFilter:       "blur(40px) saturate(180%) brightness(1.1)",
    WebkitBackdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
    border:               "1px solid rgba(255,255,255,0.9)",
    boxShadow:            "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.04)",
    borderRadius:         20,
  },
  // ボタン専用スタイル（primaryのみ上書き）
  btnPrimary: {
    bg:          "#000000",
    color:       "#ffffff",
    border:      "none",
    shadow:      "0 4px 16px rgba(0,0,0,0.15)",
    shadowPress: "0 2px 8px rgba(0,0,0,0.25)",
    borderRadius: 14,
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
