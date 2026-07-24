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

/* Vercel Web Analytics buckets page views by URL path. This app never does a
   real navigation (it's one static export, mode lives in React state), so
   without this every visitor would show up as a single "/" row and the
   dashboard couldn't tell a "fun tour" click from a "recruiter mode" click.
   Pushing a distinct, fake path via the History API — with no page reload —
   is a free, no-Pro-plan way to make those two journeys show up as separate
   rows in the Pages panel. See mode-context.md discussion 2026-07-24. */
const MODE_PATH: Record<Mode, string> = { fun: "/fun-tour", boring: "/recruiter-mode" };

const ModeContext = createContext<ModeState | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "fun" || saved === "boring") {
        setModeState(saved);
        // restoring on reload — replace, don't push, so back button still works
        window.history.replaceState(null, "", MODE_PATH[saved]);
      }
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
    window.history.pushState(null, "", MODE_PATH[m]);
  };

  const goHome = () => {
    setModeState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    window.history.pushState(null, "", "/");
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
