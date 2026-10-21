import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "srfits-theme";

export function getInitialTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light or dark theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="w-9 h-9 rounded-xl border border-primary/20 bg-secondary/40 flex items-center justify-center text-primary hover:border-primary/50 transition-colors"
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}