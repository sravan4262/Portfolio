"use client";

import { useEffect, useRef } from "react";
import { stages, type Stage } from "@/content/stages";
import type { RenderedLine } from "@/lib/usePipelineRun";
import LogCard from "./LogCard";

type Props = {
  lines: RenderedLine[];
  viewJob: string | null;
  running: boolean;
  emptyHint: string;
  /** render an optional slot (e.g. audio) in a stage's card header */
  headerSlotFor?: (stage: Stage) => React.ReactNode;
};

export default function LogPanel({ lines, viewJob, running, emptyHint, headerSlotFor }: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // group lines by stage, in pipeline order
  const groups = stages
    .map((stage) => ({ stage, lines: lines.filter((l) => l.jobId === stage.id) }))
    .filter((g) => g.lines.length > 0);

  const visible = viewJob ? groups.filter((g) => g.stage.id === viewJob) : groups;

  useEffect(() => {
    if (running) bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [lines.length, running]);

  if (visible.length === 0) {
    return (
      <div className="flex min-h-[16rem] items-center justify-center rounded-xl border border-dashed border-line bg-panel/30 px-6 text-center text-sm text-muted">
        {emptyHint}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visible.map(({ stage, lines: stageLines }) => (
        <LogCard
          key={stage.id}
          stage={stage}
          lines={stageLines}
          active={viewJob === stage.id}
          headerSlot={headerSlotFor?.(stage)}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
