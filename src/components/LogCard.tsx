"use client";

import type { Stage } from "@/content/stages";
import type { RenderedLine } from "@/lib/usePipelineRun";
import { isTerminal } from "@/lib/logs";

const kindClass: Record<RenderedLine["kind"], string> = {
  out: "text-slate-200",
  dim: "text-slate-500",
  success: "text-emerald-400",
  pending: "text-amber-400",
};

/** A single stage rendered as a terminal card: header + numbered log lines. */
export default function LogCard({
  stage,
  lines,
  active,
  headerSlot,
}: {
  stage: Stage;
  lines: RenderedLine[];
  active: boolean;
  headerSlot?: React.ReactNode;
}) {
  const done = lines.some((l) => isTerminal(l.kind));
  const isPending = lines.some((l) => l.kind === "pending");

  return (
    <div
      className={[
        "overflow-hidden rounded-xl border bg-[#0a0f1c] transition",
        active ? "border-accent/70" : "border-line",
      ].join(" ")}
    >
      {/* header */}
      <div className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-3 font-mono">
        <div className="flex min-w-0 items-center gap-2.5">
          {done ? (
            <span
              className={[
                "flex h-4 w-4 items-center justify-center rounded-full text-[11px] font-bold text-ink",
                isPending ? "bg-amber-400" : "bg-success",
              ].join(" ")}
            >
              {isPending ? "•" : "✓"}
            </span>
          ) : (
            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-running border-t-transparent" />
          )}
          <span className="truncate text-[15px] font-semibold lowercase text-text">{stage.id}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2 font-mono text-sm text-muted">
          {headerSlot}
          <span className="text-running">★</span>
          <span>{stage.years ?? stage.stageTag}</span>
        </div>
      </div>

      {/* lines */}
      <div className="px-4 py-3.5 font-mono text-[13.5px]">
        {lines.map((line, i) => (
          <div key={line.key} className="flex gap-3.5 py-[3px]">
            <span className="w-6 shrink-0 select-none text-right text-slate-600">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={`min-w-0 flex-1 whitespace-pre-wrap break-words leading-6 ${kindClass[line.kind]}`}>
              {line.text}
            </span>
          </div>
        ))}
        {!done && (
          <div className="flex gap-3.5 py-[3px]">
            <span className="w-6 shrink-0 text-right text-slate-600">
              {String(lines.length + 1).padStart(2, "0")}
            </span>
            <span className="inline-block h-4 w-2 animate-pulse bg-slate-300" aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}
