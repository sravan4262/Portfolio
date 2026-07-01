"use client";

import { useEffect, useRef, useState } from "react";
import { getAnalyser } from "@/lib/audio-analyser";

const BAR_BINS = [2, 4, 7, 11, 16];

/**
 * The photo, reacting to the voice. While `playing`, a Web Audio analyser reads
 * the clip's live amplitude and drives a subtle "talking" bob, a reactive glow,
 * and a little equalizer — so it reads as Sravan speaking in his own voice.
 */
export default function TalkingAvatar({
  src,
  audioEl,
  playing,
  size = 52,
}: {
  src: string;
  audioEl: HTMLAudioElement | null;
  playing: boolean;
  size?: number;
}) {
  const [imgOk, setImgOk] = useState(true);
  const avatarRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const bars = useRef<Array<HTMLSpanElement | null>>([]);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const reset = () => {
      if (avatarRef.current) avatarRef.current.style.transform = "scale(1)";
      if (glowRef.current) glowRef.current.style.opacity = "0";
      bars.current.forEach((b) => b && (b.style.transform = "scaleY(0.18)"));
    };

    if (!playing || !audioEl) {
      reset();
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // honor reduced motion — keep a gentle static "active" state, no rAF
      if (glowRef.current) glowRef.current.style.opacity = "0.5";
      return;
    }

    const analyser = getAnalyser(audioEl);
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const level = Math.min(1, sum / data.length / 135);

      if (avatarRef.current) avatarRef.current.style.transform = `scale(${1 + level * 0.08})`;
      if (glowRef.current) {
        glowRef.current.style.opacity = String(0.2 + level * 0.7);
        glowRef.current.style.transform = `scale(${1 + level * 0.45})`;
      }
      bars.current.forEach((b, i) => {
        if (b) b.style.transform = `scaleY(${0.18 + (data[BAR_BINS[i]] / 255) * 0.95})`;
      });

      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      reset();
    };
  }, [playing, audioEl]);

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <div
          ref={glowRef}
          aria-hidden
          className="brand-gradient pointer-events-none absolute -inset-1 rounded-2xl blur-md"
          style={{ opacity: 0, transition: "opacity .12s linear" }}
        />
        <div
          ref={avatarRef}
          className="relative h-full w-full overflow-hidden rounded-2xl border border-line bg-panel-2"
          style={{ transition: "transform .06s ease-out", willChange: "transform" }}
        >
          {imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" onError={() => setImgOk(false)} className="h-full w-full object-cover" />
          ) : (
            <div className="brand-gradient flex h-full w-full items-center justify-center text-sm font-bold text-white">
              SR
            </div>
          )}
        </div>
      </div>

      <div className="flex h-6 items-end gap-[3px]" aria-hidden>
        {BAR_BINS.map((_, i) => (
          <span
            key={i}
            ref={(el) => {
              bars.current[i] = el;
            }}
            className="brand-gradient w-1 origin-bottom rounded-full"
            style={{ height: "100%", transform: "scaleY(0.18)", transition: "transform .06s ease-out" }}
          />
        ))}
      </div>
    </div>
  );
}
