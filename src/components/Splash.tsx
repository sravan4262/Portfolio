"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowRight, Download, MapPin } from "lucide-react";
import { useMode } from "@/lib/mode-context";
import { profile } from "@/content/stages";

// Escalating playful resistance shown as a tooltip on the "Just the facts" button.
const PROMPTS = [
  "Wait — you sure? The fun one has my actual voice 🎙️",
  "Come on, live a little. 😏",
  "Recruiters deserve fun too, you know.",
  "Okay, last chance to be entertained…",
  "Fine, fine — go ahead. 🫡",
];

export default function Splash() {
  const { setMode } = useMode();
  const [imgOk, setImgOk] = useState(true);

  // resistance: 0 = idle, 1..5 = prompts shown
  const [stage, setStage] = useState(0);
  const unlocked = stage >= PROMPTS.length;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  const startResist = () => {
    if (stage > 0) return;
    setStage(1);
    timer.current = setInterval(() => {
      setStage((s) => {
        if (s >= PROMPTS.length) {
          if (timer.current) clearInterval(timer.current);
          return PROMPTS.length;
        }
        return s + 1;
      });
    }, 1500);
  };

  const onFacts = () => {
    if (unlocked) setMode("boring");
    else startResist();
  };

  return (
    <div className="dot-grid relative flex min-h-screen items-center overflow-hidden px-6 py-16">
      {/* ambient brand glows */}
      <div className="brand-glow pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full opacity-60" />
      <div className="brand-glow pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto grid w-full max-w-5xl items-center gap-10 md:grid-cols-[1.3fr_1fr] md:gap-14"
      >
        {/* ── left: intro ── */}
        <div className="order-2 text-center md:order-1 md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-xs font-medium text-muted card-shadow">
            <span className="h-2 w-2 rounded-full bg-live" />
            Open to work
            <span className="text-line">·</span>
            <MapPin className="h-3 w-3" aria-hidden />
            {profile.location}
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Hi, I&apos;m Sravan.
            <br />
            <span className="brand-text">I build things that ship.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-muted md:mx-0 sm:text-base">
            Nine years of writing software, two live apps of my own, and a
            co-founder badge along the way. So — how do you want the tour?
          </p>

          {/* two doors */}
          <div className="mt-8 flex flex-col items-stretch gap-3.5 sm:flex-row md:max-w-xl">
            <button
              onClick={() => setMode("fun")}
              className="brand-gradient group relative flex w-full flex-col items-start gap-1 overflow-hidden rounded-2xl px-5 py-4 text-left text-white shadow-[0_8px_30px_-8px_rgba(37,99,235,0.6)] transition hover:shadow-[0_10px_40px_-6px_rgba(56,189,248,0.7)]"
            >
              <span className="flex items-center gap-2 text-base font-semibold">
                <Play className="h-4 w-4 fill-current" aria-hidden />
                Take the fun tour
              </span>
              <span className="text-sm text-white/80">
                Narrated and animated — in my actual voice.
              </span>
            </button>

            {/* "just the facts" door with playful tooltip resistance */}
            <div className="relative w-full">
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
                    <div className="rounded-xl border border-brand/40 bg-panel px-3.5 py-2 text-sm font-medium text-text card-shadow">
                      {PROMPTS[stage - 1]}
                      <div className="mt-1.5 flex justify-center gap-1">
                        {PROMPTS.map((_, i) => (
                          <span
                            key={i}
                            className={`h-1 w-4 rounded-full ${i < stage ? "brand-gradient" : "bg-line"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mx-auto h-2 w-2 -translate-y-1 rotate-45 border-b border-r border-brand/40 bg-panel" />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={onFacts}
                className={[
                  "flex w-full flex-col items-start gap-1 rounded-2xl border px-5 py-4 text-left transition",
                  unlocked
                    ? "border-brand/50 bg-brand/10 hover:bg-brand/15"
                    : "border-line bg-panel/60 hover:border-brand-2/50 hover:bg-panel",
                ].join(" ")}
              >
                <span className="flex items-center gap-2 text-base font-semibold text-text">
                  {unlocked ? "Fine, the facts" : "Just the facts"}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
                <span className="text-sm text-muted">
                  {unlocked ? "Enter recruiter mode →" : "Recruiter mode — skip the show."}
                </span>
              </button>
            </div>
          </div>

          <a
            href={profile.resumeUrl}
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted underline-offset-4 transition hover:text-text hover:underline"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Prefer paper? Grab the résumé.
          </a>
        </div>

        {/* ── right: portrait (no longer a circle) ── */}
        <div className="order-1 mx-auto md:order-2 md:mx-0">
          <div className="relative w-44 sm:w-56 md:w-full md:max-w-[280px]">
            <div className="brand-glow absolute -inset-3 rounded-[2rem] opacity-70" />
            {imgOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.headshot}
                alt={profile.name}
                onError={() => setImgOk(false)}
                className="relative aspect-[4/5] w-full rounded-3xl border border-line object-cover shadow-xl"
              />
            ) : (
              <div className="brand-gradient relative flex aspect-[4/5] w-full items-center justify-center rounded-3xl border border-line text-5xl font-bold text-white shadow-xl">
                SR
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
