"use client";

import { useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";
import { useAudio } from "@/lib/audio-context";

/**
 * Plays a stage's HeyGen talking-head clip (voice baked in). Coordinated through
 * AudioProvider so only one clip plays at a time. Click-to-play, never autoplays.
 */
export default function VideoAvatar({ id, label = "Hear me tell it" }: { id: string; label?: string }) {
  const [el, setEl] = useState<HTMLVideoElement | null>(null);
  const { playingId, play, stop } = useAudio();
  const isPlaying = playingId === id;

  useEffect(() => {
    if (!el) return;
    if (playingId !== id && !el.paused) el.pause();
  }, [playingId, id, el]);

  const toggle = () => {
    if (!el) return;
    if (el.paused) {
      play(id, el);
      el.play().catch(() => {});
    } else {
      el.pause();
      stop(id);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-44">
        <video
          ref={setEl}
          src={`/video/${id}.mp4`}
          poster="/avatar.jpg"
          playsInline
          preload="none"
          onClick={toggle}
          onEnded={() => stop(id)}
          className="aspect-square w-44 cursor-pointer rounded-2xl border border-line object-cover card-shadow"
        />
        {!isPlaying && (
          <button
            onClick={toggle}
            aria-label={label}
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/15 transition hover:bg-black/5"
          >
            <span className="brand-gradient flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg">
              <Play className="h-5 w-5 translate-x-0.5 fill-current" aria-hidden />
            </span>
          </button>
        )}
      </div>

      <button
        onClick={toggle}
        aria-pressed={isPlaying}
        className="inline-flex w-fit items-center gap-2 rounded-lg border border-brand/50 bg-brand/10 px-3 py-2 text-sm font-semibold text-brand-2 transition hover:bg-brand/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {isPlaying ? <Pause className="h-4 w-4 fill-current" aria-hidden /> : <Play className="h-4 w-4 fill-current" aria-hidden />}
        {isPlaying ? "Pause" : label}
      </button>
    </div>
  );
}
