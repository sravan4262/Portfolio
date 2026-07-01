"use client";

import { useEffect, useState } from "react";
import { Play, Pause, Mic } from "lucide-react";
import { useAudio } from "@/lib/audio-context";
import { profile } from "@/content/stages";
import TalkingAvatar from "./TalkingAvatar";

type Props = {
  id: string;
  src: string;
  label?: string;
};

/**
 * Click-to-play audio with a voice-reactive avatar. Never autoplays. Only one
 * clip plays at a time (coordinated through AudioProvider). Gracefully degrades
 * when the clip isn't present yet — shows a "coming soon" state.
 */
export default function AudioPlayer({ id, src, label = "Hear me tell it" }: Props) {
  const [el, setEl] = useState<HTMLAudioElement | null>(null);
  const { playingId, play, stop } = useAudio();
  const [available, setAvailable] = useState(true);
  const isPlaying = playingId === id;

  // If the audio context switched to another clip, pause this one.
  useEffect(() => {
    if (!el) return;
    if (playingId !== id && !el.paused) el.pause();
  }, [playingId, id, el]);

  const toggle = () => {
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
      <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-ink-soft px-3 py-2 text-xs text-muted">
        <Mic className="h-3.5 w-3.5" aria-hidden /> Voice clip&apos;s on its way — read the transcript below.
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-line bg-ink-soft px-3 py-2">
      {isPlaying && <TalkingAvatar src={profile.headshot} audioEl={el} playing={isPlaying} />}

      <button
        type="button"
        onClick={toggle}
        aria-pressed={isPlaying}
        className="group inline-flex items-center gap-2 rounded-lg border border-brand/50 bg-brand/10 px-3 py-2 text-sm font-semibold text-brand-2 transition hover:bg-brand/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 fill-current" aria-hidden />
        ) : (
          <Play className="h-4 w-4 fill-current" aria-hidden />
        )}
        {isPlaying ? "Pause" : label}
      </button>

      <audio
        ref={setEl}
        src={src}
        preload="none"
        onEnded={() => stop(id)}
        onError={() => setAvailable(false)}
      />
    </div>
  );
}
