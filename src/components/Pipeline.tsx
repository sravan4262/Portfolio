"use client";

import { preStages, parallelStages, postStages, stages, type Stage } from "@/content/stages";
import { Play, Pause, Square, RotateCcw, ChevronLeft } from "lucide-react";
import type { Mode } from "@/lib/mode-context";
import { usePipelineRun } from "@/lib/usePipelineRun";
import ProgressSpine from "./ProgressSpine";
import StageCard from "./StageCard";
import VoiceAvatar from "./VoiceAvatar";

/**
 * A titled group of stage cards. Defined at module scope (NOT inside Pipeline) so
 * its component identity is stable across renders — otherwise every pipeline
 * re-render would remount its children, tearing down any playing stage video.
 */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{title}</p>
    {children}
  </div>
);

/**
 * The career, as a build you can run. A progress spine up top, then real stage
 * cards (no fake terminal). Rendered per-mode and keyed by mode in the parent,
 * so Fun and Recruiter keep independent run state.
 */
export default function Pipeline({ mode }: { mode: Mode }) {
  const showAudio = mode === "fun";
  const {
    statuses,
    lines,
    viewJob,
    setViewJob,
    runningAll,
    running,
    paused,
    runAll,
    runJob,
    pause,
    resume,
    stop,
    reset,
  } = usePipelineRun(mode);

  const everRun = lines.length > 0;

  const runState = runningAll
    ? paused
      ? "Paused"
      : "Running…"
    : everRun
      ? "Done"
      : "Ready when you are";

  const primaryBtn =
    "inline-flex items-center gap-2 rounded-lg brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_20px_-8px_rgba(37,99,235,0.7)] transition hover:shadow-[0_8px_28px_-6px_rgba(56,189,248,0.8)]";
  const subtleBtn =
    "inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-muted transition hover:border-brand-2/50 hover:text-text";

  const renderCard = (stage: Stage) => (
    <StageCard
      key={stage.id}
      stage={stage}
      mode={mode}
      runtime={statuses[stage.id]}
      logLines={lines.filter((l) => l.jobId === stage.id)}
      collapsed={mode === "fun" && statuses[stage.id] === "queued" && viewJob !== stage.id}
      runDisabled={runningAll}
      onRun={() => runJob(stage)}
      audioSlot={
        showAudio ? (
          <VoiceAvatar id={stage.id} audioSrc={stage.fun.audioUrl} label="Hear me tell it" />
        ) : undefined
      }
    />
  );

  const focused = viewJob ? stages.find((s) => s.id === viewJob) : null;

  return (
    <div className="space-y-6">
      {/* run toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-panel/50 px-4 py-3">
        <span className="flex items-center gap-2 text-sm">
          <span
            className={[
              "h-2 w-2 rounded-full",
              running && !paused ? "bg-brand-2 live-pulse" : everRun ? "bg-live" : "bg-muted/50",
            ].join(" ")}
          />
          <span className="text-muted">Pipeline:</span>
          <span className="font-medium text-text">{runState}</span>
        </span>

        <div className="ml-auto flex items-center gap-2">
          {viewJob && (
            <button onClick={() => setViewJob(null)} className={subtleBtn}>
              <ChevronLeft className="h-3.5 w-3.5" /> All stages
            </button>
          )}

          {runningAll ? (
            <>
              {paused ? (
                <button onClick={resume} className={primaryBtn}>
                  <Play className="h-4 w-4 fill-current" /> Resume
                </button>
              ) : (
                <button onClick={pause} className={primaryBtn}>
                  <Pause className="h-4 w-4 fill-current" /> Pause
                </button>
              )}
              <button onClick={stop} className={subtleBtn}>
                <Square className="h-3.5 w-3.5" /> Stop
              </button>
            </>
          ) : (
            <>
              <button onClick={runAll} className={primaryBtn}>
                <Play className="h-4 w-4 fill-current" /> {everRun ? "Run it again" : "Run the whole thing"}
              </button>
              {everRun && (
                <button onClick={reset} className={subtleBtn}>
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <ProgressSpine statuses={statuses} activeId={viewJob} onSelect={setViewJob} />

      {/* stage cards */}
      {focused ? (
        <div className="space-y-3">{renderCard(focused)}</div>
      ) : (
        <div className="space-y-8">
          <Section title="Main track">
            <div className="space-y-3">{preStages.map(renderCard)}</div>
          </Section>

          <Section title="Personal projects — built on the side">
            <div className="grid gap-3 lg:grid-cols-2">{parallelStages.map(renderCard)}</div>
          </Section>

          <Section title="Wrap-up">
            <div className="space-y-3">{postStages.map(renderCard)}</div>
          </Section>
        </div>
      )}
    </div>
  );
}
