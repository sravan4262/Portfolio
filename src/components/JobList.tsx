"use client";

import { preStages, parallelStages, postStages, type Stage } from "@/content/stages";
import type { JobStatus } from "@/lib/usePipelineRun";
import JobStatusIcon from "./JobStatusIcon";

type Props = {
  statuses: Record<string, JobStatus>;
  viewJob: string | null;
  onView: (stage: Stage) => void;
  onRun: (stage: Stage) => void;
  runDisabled: boolean;
};

function JobRow({
  stage,
  status,
  active,
  runDisabled,
  onView,
  onRun,
}: {
  stage: Stage;
  status: JobStatus;
  active: boolean;
  runDisabled: boolean;
  onView: (s: Stage) => void;
  onRun: (s: Stage) => void;
}) {
  const isRunning = status === "running";
  const playGlyph = status === "success" ? "↻" : "▶";
  const playLabel = status === "success" ? `Re-run ${stage.label}` : `Run ${stage.label}`;

  return (
    <div
      className={[
        "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition",
        active ? "border-accent bg-panel" : "border-line bg-panel/60 hover:border-line/80",
        isRunning ? "border-running/70" : "",
      ].join(" ")}
    >
      <JobStatusIcon status={status} />
      <button
        type="button"
        onClick={() => onView(stage)}
        aria-label={`${stage.label} — view logs`}
        className="min-w-0 flex-1 text-left focus:outline-none"
      >
        <span className="block truncate text-sm font-semibold leading-tight">{stage.label}</span>
        <span className="mt-0.5 block truncate font-mono text-[11px] text-accent-2">
          {stage.years ?? stage.stageTag}
        </span>
      </button>
      <button
        type="button"
        onClick={() => onRun(stage)}
        disabled={runDisabled || isRunning}
        aria-label={playLabel}
        title={playLabel}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-success/50 text-xs text-success transition hover:bg-success/15 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {playGlyph}
      </button>
    </div>
  );
}

export default function JobList({ statuses, viewJob, onView, onRun, runDisabled }: Props) {
  const render = (s: Stage) => (
    <JobRow
      key={s.id}
      stage={s}
      status={statuses[s.id]}
      active={viewJob === s.id}
      runDisabled={runDisabled}
      onView={onView}
      onRun={onRun}
    />
  );

  const Label = ({ children }: { children: React.ReactNode }) => (
    <div className="px-1 pt-1 font-mono text-[10px] uppercase tracking-widest text-muted">{children}</div>
  );

  return (
    <div className="flex flex-col gap-2">
      <Label>main branch</Label>
      {preStages.map(render)}

      <Label>⑂ parallel jobs</Label>
      {parallelStages.map(render)}

      <Label>finalize</Label>
      {postStages.map(render)}
    </div>
  );
}
