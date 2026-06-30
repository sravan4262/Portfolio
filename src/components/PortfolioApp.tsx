"use client";

import { motion } from "framer-motion";
import { useMode } from "@/lib/mode-context";
import { profile } from "@/content/stages";
import Splash from "./Splash";
import Pipeline from "./Pipeline";
import ModeToggle from "./ModeToggle";
import ResumeSeo from "./ResumeSeo";

export default function PortfolioApp() {
  const { mode, goHome, hydrated } = useMode();

  // Dark everywhere; mode only changes content (audio + copy), never the theme.
  const renderMode = mode ?? "boring";
  const boringCopy = renderMode === "boring";
  const showSplash = hydrated && mode === null;

  return (
    <main className="pipeline-grid min-h-screen bg-ink text-text">
      {/* full static résumé text for crawlers / no-JS — visually hidden */}
      <ResumeSeo />

      {showSplash && (
        <div className="fixed inset-0 z-50 bg-ink">
          <Splash />
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3.5">
          {/* clicking the name returns home (the splash) */}
          <button
            onClick={goHome}
            className="group text-left transition hover:opacity-80"
            aria-label="Back to home"
            title="Back to home"
          >
            <div className="flex items-center gap-2 text-base font-bold leading-tight">
              <span aria-hidden className="text-accent-2">
                ⌂
              </span>
              {profile.name}
            </div>
            <div className="text-xs text-muted">{profile.title}</div>
          </button>
          <div className="flex items-center gap-3">
            <a
              href={profile.resumeUrl}
              className="rounded-md border border-accent/60 bg-accent/15 px-3 py-1.5 text-sm font-semibold text-text transition hover:bg-accent/25"
            >
              ↓ Résumé
            </a>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-accent-2">
            {boringCopy ? "career — overview" : "$ ./deploy career"}
          </div>
          <h2 className="mt-3 max-w-3xl text-2xl font-bold leading-snug sm:text-3xl">
            {boringCopy ? "My career, as a delivery pipeline." : "Watch my career deploy, stage by stage."}
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            It runs <strong>init → roles → parallel projects → skills → cleanup</strong>. Each job
            streams its own logs — click any job to read just that one, or hit ▶ to run the whole
            pipeline.
          </p>
        </motion.section>

        {/* Legend */}
        <div className="mb-8 flex flex-wrap items-center gap-5 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-success" /> shipped
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-live" /> live in prod
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-running" /> in development
          </span>
        </div>

        {/* keyed by mode → Fun and Recruiter keep independent run state */}
        <Pipeline key={renderMode} mode={renderMode} />

        {/* Footer */}
        <footer className="mt-20 border-t border-line pt-6 text-sm text-muted">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href={`mailto:${profile.email}`} className="hover:underline">
              {profile.email}
            </a>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
              GitHub
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
              LinkedIn
            </a>
            <span>{profile.location}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
