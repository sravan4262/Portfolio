"use client";

import { useEffect, useRef, useState } from "react";
import { useAudio } from "@/lib/audio-context";

type Props = {
  id: string;
  src: string;
  label?: string;
};

/**
 * Click-to-play audio. Never autoplays. Only one clip plays at a time
 * (coordinated through AudioProvider). Gracefully degrades when the
 * .mp3 isn't present yet — shows a "coming soon" state instead of breaking.
 */
export default function AudioPlayer({ id, src, label = "Hear me explain this" }: Props) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const { playingId, play, stop } = useAudio();
  const [available, setAvailable] = useState(true);
  const isPlaying = playingId === id;

  // If the audio context switched to another clip, pause this one.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (playingId !== id && !el.paused) el.pause();
  }, [playingId, id]);

  const toggle = () => {
    const el = ref.current;
    if (!el || !available) return;
    if (el.paused) {
      play(id, el);
      el.play().catch(() => setAvailable(false));
    } else {
      el.pause();
      stop(id);
    }
  };

  if (!available) {
    return (
      <div className="inline-flex items-center gap-2 rounded-md border border-line bg-ink-soft px-3 py-2 text-xs text-muted">
        <span aria-hidden>🎙️</span> Voice clip coming soon — transcript below.
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={isPlaying}
        className="group inline-flex items-center gap-2 rounded-md border border-accent/50 bg-accent/15 px-3 py-2 text-sm font-semibold text-text transition hover:bg-accent/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span aria-hidden className="text-base leading-none">
          {isPlaying ? "❚❚" : "▶"}
        </span>
        {isPlaying ? "Pause" : label}
      </button>
      <audio
        ref={ref}
        src={src}
        preload="none"
        onEnded={() => stop(id)}
        onError={() => setAvailable(false)}
      />
    </div>
  );
}
