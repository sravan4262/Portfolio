"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Mode = "fun" | "boring";

type ModeState = {
  /** null until the user has chosen at the splash screen */
  mode: Mode | null;
  setMode: (m: Mode) => void;
  /** clear the choice and return to the splash / home screen */
  goHome: () => void;
  /** true once we've read localStorage, so we don't flash the splash on reload */
  hydrated: boolean;
};

const STORAGE_KEY = "pipeline-mode";

const ModeContext = createContext<ModeState | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "fun" || saved === "boring") setModeState(saved);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* ignore */
    }
  };

  const goHome = () => {
    setModeState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, goHome, hydrated }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used within a ModeProvider");
  return ctx;
}
