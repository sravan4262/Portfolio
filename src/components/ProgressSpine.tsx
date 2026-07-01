"use client";

import { preStages, parallelStages, postStages, type Stage } from "@/content/stages";
import type { JobStatus } from "@/lib/usePipelineRun";

type Props = {
  statuses: Record<string, JobStatus>;
  activeId: string | null;
  onSelect: (id: string) => void;
};

function Node({
  stage,
  status,
  active,
  onSelect,
}: {
  stage: Stage;
  status: JobStatus;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const done = status === "success";
  const running = status === "running";

  return (
    <button
      type="button"
      onClick={() => onSelect(stage.id)}
      className="group flex shrink-0 flex-col items-center gap-1.5"
      title={stage.label}
    >
      <span
        className={[
          "flex h-3.5 w-3.5 items-center justify-center rounded-full transition",
          done ? "brand-gradient" : running ? "brand-gradient live-pulse" : "border-2 border-line bg-panel",
          active ? "ring-2 ring-brand-2/60 ring-offset-2 ring-offset-ink" : "",
        ].join(" ")}
      />
      <span
        className={[
          "whitespace-nowrap text-[11px] transition",
          active ? "font-semibold text-text" : done || running ? "text-brand-2" : "text-muted group-hover:text-text",
        ].join(" ")}
      >
        {stage.label}
      </span>
    </button>
  );
}

const Connector = ({ filled }: { filled: boolean }) => (
  <span className={["mt-[6px] h-px w-6 shrink-0 sm:w-10", filled ? "brand-gradient" : "bg-line"].join(" ")} />
);

export default function ProgressSpine({ statuses, activeId, onSelect }: Props) {
  const isDone = (s: Stage) => statuses[s.id] === "success";
  const node = (s: Stage) => (
    <Node key={s.id} stage={s} status={statuses[s.id]} active={activeId === s.id} onSelect={onSelect} />
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-panel/40 px-5 py-4">
      <div className="flex min-w-max items-start">
        {preStages.map((s, i) => (
          <div key={s.id} className="flex items-start">
            {i > 0 && <Connector filled={isDone(preStages[i - 1])} />}
            {node(s)}
          </div>
        ))}

        <Connector filled={isDone(preStages[preStages.length - 1])} />

        {/* parallel branch */}
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line/80 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">personal projects</span>
          <div className="flex items-start gap-3">{parallelStages.map(node)}</div>
        </div>

        <Connector filled={parallelStages.every(isDone)} />

        {postStages.map((s, i) => (
          <div key={s.id} className="flex items-start">
            {i > 0 && <Connector filled={isDone(postStages[i - 1])} />}
            {node(s)}
          </div>
        ))}
      </div>
    </div>
  );
}
