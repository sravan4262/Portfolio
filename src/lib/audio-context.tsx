"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";

type AudioState = {
  /** id of the clip currently playing, or null */
  playingId: string | null;
  /** register a play; stops whatever else was playing */
  play: (id: string, el: HTMLAudioElement) => void;
  /** clear the active clip (on pause/end) */
  stop: (id: string) => void;
};

const AudioCtx = createContext<AudioState | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const currentEl = useRef<HTMLAudioElement | null>(null);

  const play = (id: string, el: HTMLAudioElement) => {
    if (currentEl.current && currentEl.current !== el) {
      currentEl.current.pause();
    }
    currentEl.current = el;
    setPlayingId(id);
  };

  const stop = (id: string) => {
    setPlayingId((prev) => (prev === id ? null : prev));
  };

  return <AudioCtx.Provider value={{ playingId, play, stop }}>{children}</AudioCtx.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within an AudioProvider");
  return ctx;
}
