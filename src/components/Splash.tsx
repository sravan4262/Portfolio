"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMode } from "@/lib/mode-context";
import { profile } from "@/content/stages";

// Escalating playful resistance shown as a tooltip on the "boring" button.
const PROMPTS = [
  "Wait — are you sure? 🤔",
  "Come on, live a little. 😏",
  "The fun one literally has my voice…",
  "Recruiters deserve fun too, you know.",
  "Okay okay — go ahead. 🫡",
];

export default function Splash() {
  const { setMode } = useMode();
  const [imgOk, setImgOk] = useState(true);

  // boring-button resistance: 0 = idle, 1..5 = seconds elapsed
  const [stage, setStage] = useState(0);
  const unlocked = stage >= 5;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  const startResist = () => {
    if (stage > 0) return;
    setStage(1);
    timer.current = setInterval(() => {
      setStage((s) => {
        if (s >= 5) {
          if (timer.current) clearInterval(timer.current);
          return 5;
        }
        return s + 1;
      });
    }, 1800);
  };

  const onBoring = () => {
    if (unlocked) setMode("boring");
    else startResist();
  };

  return (
    <div className="pipeline-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12 text-center">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex max-w-xl flex-col items-center"
      >
        {/* headshot */}
        <div className="relative mb-6">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-accent to-accent-2 opacity-70 blur-[6px]" />
          {imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.headshot}
              alt={profile.name}
              onError={() => setImgOk(false)}
              className="relative h-32 w-32 rounded-full object-cover ring-2 ring-white/10 sm:h-36 sm:w-36"
            />
          ) : (
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-panel text-4xl font-bold text-accent-2 ring-2 ring-white/10 sm:h-36 sm:w-36">
              SR
            </div>
          )}
          <span
            className="live-dot absolute bottom-2 right-2 h-4 w-4 rounded-full bg-live ring-2 ring-ink"
            title="open to work"
            aria-label="open to work"
          />
        </div>

        {/* intro */}
        <div className="mb-1 font-mono text-xs uppercase tracking-[0.3em] text-accent-2">
          $ ./deploy career.pipeline
        </div>
        <h1 className="text-4xl font-bold sm:text-5xl">
          Hi, I&apos;m {profile.name} <span className="inline-block">👋</span>
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted sm:text-base">
          {profile.greeting}
        </p>

        {/* two doors */}
        <div className="mt-9 flex w-full flex-col items-stretch justify-center gap-4 sm:flex-row">
          <button
            onClick={() => setMode("fun")}
            className="group relative w-full overflow-hidden rounded-xl border border-accent/60 bg-accent/15 px-6 py-5 text-left transition hover:bg-accent/25 hover:shadow-[0_0_28px_-6px_rgba(94,59,255,0.7)] sm:w-64"
          >
            <div className="text-lg font-semibold">▶ Show me the fun version</div>
            <div className="mt-1 text-sm text-muted">Animated deploy pipeline + my voice</div>
          </button>

          {/* boring door with tooltip resistance */}
          <div className="relative w-full sm:w-64">
            <AnimatePresence>
              {stage > 0 && (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="absolute bottom-full left-1/2 z-20 mb-3 w-max max-w-[16rem] -translate-x-1/2"
                >
                  <div className="rounded-lg border border-accent/50 bg-ink-soft px-3.5 py-2 text-sm font-medium text-text shadow-xl">
                    {PROMPTS[stage - 1]}
                    <div className="mt-1.5 flex justify-center gap-1">
                      {PROMPTS.map((_, i) => (
                        <span
                          key={i}
                          className={`h-1 w-4 rounded-full ${i < stage ? "bg-accent" : "bg-line"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mx-auto h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-accent/50 bg-ink-soft" />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={onBoring}
              className={[
                "w-full rounded-xl border px-6 py-5 text-left transition",
                unlocked
                  ? "border-accent-2/70 bg-accent-2/10 hover:bg-accent-2/20"
                  : "border-line bg-panel hover:border-slate-500",
              ].join(" ")}
            >
              <div className="text-lg font-semibold">
                {unlocked ? "Fine, keep it simple →" : "Keep it simple"}
              </div>
              <div className="mt-1 text-sm text-muted">
                {unlocked ? "Enter recruiter view" : "I'm a recruiter — just the facts"}
              </div>
            </button>
          </div>
        </div>

        <a
          href={profile.resumeUrl}
          className="mt-9 inline-block text-sm text-muted underline-offset-4 hover:text-text hover:underline"
        >
          or just download the résumé (PDF) ↓
        </a>
      </motion.div>
    </div>
  );
}
