"use client";

import { motion } from "framer-motion";
import { Download, Mail } from "lucide-react";
import { useMode } from "@/lib/mode-context";
import { profile } from "@/content/stages";
import Splash from "./Splash";
import Pipeline from "./Pipeline";
import ModeToggle from "./ModeToggle";
import RecruiterSnapshot from "./RecruiterSnapshot";
import ResumeSeo from "./ResumeSeo";

export default function PortfolioApp() {
  const { mode, goHome, hydrated } = useMode();

  // Dark everywhere; mode only changes content (audio + copy), never the theme.
  const renderMode = mode ?? "boring";
  const boringCopy = renderMode === "boring";
  const showSplash = hydrated && mode === null;

  return (
    <main className="min-h-screen bg-ink text-text">
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
            className="group flex items-center gap-2.5 text-left transition hover:opacity-80"
            aria-label="Back to home"
            title="Back to home"
          >
            <span aria-hidden className="brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white">
              SR
            </span>
            <span>
              <span className="block text-base font-bold leading-tight">{profile.name}</span>
              <span className="block text-xs text-muted">{profile.title}</span>
            </span>
          </button>
          <div className="flex items-center gap-3">
            <a
              href={profile.resumeUrl}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-sm font-semibold text-text transition hover:border-brand-2/50 hover:bg-panel-2"
            >
              <Download className="h-3.5 w-3.5" aria-hidden /> Résumé
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
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-brand-2">
            {boringCopy ? "The recruiter's cut" : "Roll the tape"}
          </div>
          <h2 className="mt-3 max-w-3xl text-2xl font-bold leading-snug sm:text-3xl">
            {boringCopy
              ? "Senior engineer who ships — cloud, full-stack, and the AI in between."
              : "Nine years of shipping — here's the build log, minus the boring parts."}
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            {boringCopy ? (
              <>
                My whole career as one pipeline: every role, the measurable impact, and the exact stack.
                Skim the <strong>snapshot</strong> below, then open any stage for the receipts.
              </>
            ) : (
              <>
                It moves through <strong>school → jobs → my own apps → skills → the wrap-up</strong>. Hit{" "}
                <strong>Run</strong> to play it through, or jump straight to whichever stage you care about.
              </>
            )}
          </p>
        </motion.section>

        {boringCopy && <RecruiterSnapshot />}

        {/* Legend */}
        <div className="mb-8 flex flex-wrap items-center gap-2.5 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 py-1 text-muted">
            Shipped
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-live/40 bg-live/10 px-2.5 py-1 text-live">
            <span className="h-1.5 w-1.5 rounded-full bg-live" /> Live in prod
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-running/40 bg-running/10 px-2.5 py-1 text-running">
            In development
          </span>
        </div>

        {/* keyed by mode → Fun and Recruiter keep independent run state */}
        <Pipeline key={renderMode} mode={renderMode} />

        {/* Footer */}
        <footer className="mt-20 border-t border-line pt-8 text-sm text-muted">
          <p className="text-base font-semibold text-text">Like what you saw? Let&apos;s talk.</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-1.5 transition hover:text-text"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden /> {profile.email}
            </a>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="transition hover:text-text">
              GitHub
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="transition hover:text-text">
              LinkedIn
            </a>
            <span>{profile.location}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
