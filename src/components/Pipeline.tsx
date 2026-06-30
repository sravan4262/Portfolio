"use client";

import { stages } from "@/content/stages";
import type { Mode } from "@/lib/mode-context";
import { usePipelineRun } from "@/lib/usePipelineRun";
import JobList from "./JobList";
import LogPanel from "./LogPanel";
import AudioPlayer from "./AudioPlayer";

/**
 * Two columns: the vertical stage list (all visible, left) and the streamed
 * terminal-card logs (right). Rendered per-mode and keyed by mode in the parent,
 * so Fun and Recruiter keep independent run state. Nothing runs until asked.
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

  const btn =
    "inline-flex items-center gap-2 rounded-md border border-success/60 bg-success/15 px-4 py-2 text-sm font-semibold text-text transition hover:bg-success/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-success";
  const subtle = "rounded-md border border-line px-3 py-2 text-sm text-muted transition hover:bg-panel";

  return (
    <div className="space-y-5">
      {/* workflow toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-panel/50 px-4 py-3">
        <span className="font-mono text-xs text-muted">
          <span className={running ? (paused ? "text-muted" : "text-running") : "text-success"}>●</span>{" "}
          workflow: deploy-career
          {runningAll ? (paused ? " — paused" : " — running") : everRun ? " — done" : " — idle"}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {viewJob && (
            <button
              onClick={() => setViewJob(null)}
              className="rounded-md border border-line px-2.5 py-1 font-mono text-[11px] text-muted transition hover:bg-panel"
            >
              ← all jobs
            </button>
          )}

          {runningAll ? (
            <>
              {paused ? (
                <button onClick={resume} className={btn}>
                  <span aria-hidden>▶</span> Resume
                </button>
              ) : (
                <button onClick={pause} className={btn}>
                  <span aria-hidden>⏸</span> Pause
                </button>
              )}
              <button onClick={stop} className={subtle}>
                <span aria-hidden>■</span> Stop
              </button>
            </>
          ) : (
            <>
              <button onClick={runAll} className={btn}>
                <span aria-hidden>▶</span> {everRun ? "Re-run pipeline" : "Run pipeline"}
              </button>
              {everRun && (
                <button onClick={reset} className={subtle}>
                  ↺ Reset
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* stages (left) + logs (right) */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-20">
          <JobList
            statuses={statuses}
            viewJob={viewJob}
            onView={(s) => setViewJob(s.id)}
            onRun={(s) => runJob(s)}
            runDisabled={runningAll}
          />
        </div>

        <LogPanel
          lines={lines}
          viewJob={viewJob}
          running={running}
          emptyHint={
            viewJob
              ? "This job hasn't run yet — press ▶ on it (or Run pipeline) to stream its logs."
              : "Press ▶ Run pipeline, or click ▶ on any single job, to stream its logs here."
          }
          headerSlotFor={
            showAudio
              ? (s) =>
                  s.id === viewJob ? (
                    <AudioPlayer id={s.id} src={s.fun.audioUrl} label="▶ audio" />
                  ) : null
              : undefined
          }
        />
      </div>
    </div>
  );
}
