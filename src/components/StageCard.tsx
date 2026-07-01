"use client";

import {
  Power,
  GraduationCap,
  Briefcase,
  Boxes,
  Wrench,
  Flag,
  Play,
  RotateCw,
  ArrowUpRight,
  Check,
  type LucideIcon,
} from "lucide-react";
import type { Stage } from "@/content/stages";
import type { JobStatus, RenderedLine } from "@/lib/usePipelineRun";
import type { Mode } from "@/lib/mode-context";

const typeIcon: Record<Stage["type"], LucideIcon> = {
  init: Power,
  education: GraduationCap,
  job: Briefcase,
  project: Boxes,
  skills: Wrench,
  cleanup: Flag,
};

const lineColor: Record<RenderedLine["kind"], string> = {
  out: "text-text",
  dim: "text-muted",
  success: "text-brand-2",
  pending: "text-running",
};

function StatusPill({ stage, runtime }: { stage: Stage; runtime: JobStatus }) {
  if (runtime === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-2">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-2 border-t-transparent" />
        Running
      </span>
    );
  }
  if (stage.status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-live/40 bg-live/10 px-2.5 py-0.5 text-xs font-medium text-live">
        <span className="h-1.5 w-1.5 rounded-full bg-live" /> Live
      </span>
    );
  }
  if (stage.status === "in-progress") {
    return (
      <span className="rounded-full border border-running/40 bg-running/10 px-2.5 py-0.5 text-xs font-medium text-running">
        In development
      </span>
    );
  }
  return (
    <span className="rounded-full border border-line bg-panel-2 px-2.5 py-0.5 text-xs font-medium text-muted">
      Shipped
    </span>
  );
}

/** GitHub-Actions-style console: short steps stream in while the stage runs. */
function Console({ lines }: { lines: RenderedLine[] }) {
  return (
    <div className="rounded-lg border border-line bg-ink-soft px-3.5 py-3 font-mono text-[12.5px] leading-6">
      {lines.map((l) => {
        const isDone = l.kind === "success" || l.kind === "pending";
        return (
          <div key={l.key} className="flex items-start gap-2">
            <span className="select-none text-brand-3">{isDone ? "" : "›"}</span>
            <span className={lineColor[l.kind]}>{l.text}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function StageCard({
  stage,
  mode,
  runtime,
  logLines,
  collapsed,
  runDisabled,
  onRun,
  audioSlot,
}: {
  stage: Stage;
  mode: Mode;
  runtime: JobStatus;
  logLines: RenderedLine[];
  collapsed: boolean;
  runDisabled: boolean;
  onRun: () => void;
  audioSlot?: React.ReactNode;
}) {
  const Icon = typeIcon[stage.type];
  const blurb = mode === "fun" ? stage.fun.script : stage.summary;
  const running = runtime === "running";
  const done = runtime === "success";
  const meta = [stage.dates, stage.location].filter(Boolean).join(" · ");

  return (
    <div
      className={[
        "card-shadow overflow-hidden rounded-2xl border bg-panel transition-colors",
        running ? "border-brand/50 ring-1 ring-brand/20" : "border-line",
      ].join(" ")}
    >
      {/* header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <span
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            done || running ? "brand-gradient text-white" : "bg-panel-2 text-muted",
          ].join(" ")}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-text">{stage.label}</h3>
            <StatusPill stage={stage} runtime={runtime} />
          </div>
          {stage.sublabel && <p className="truncate text-xs text-muted">{stage.sublabel}</p>}
        </div>

        {(stage.years || stage.stageTag) && (
          <span className="hidden shrink-0 font-mono text-xs text-brand-2 sm:block">
            {stage.years ?? stage.stageTag}
          </span>
        )}

        <button
          type="button"
          onClick={onRun}
          disabled={runDisabled || running}
          aria-label={done ? `Replay ${stage.label}` : `Play ${stage.label}`}
          title={done ? "Replay this stage" : "Play this stage"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition hover:border-brand/50 hover:text-brand-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {done ? <RotateCw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
        </button>
      </div>

      {/* while running: stream the console. otherwise: the real content. */}
      {running ? (
        <div className="border-t border-line px-5 py-4">
          <Console lines={logLines} />
        </div>
      ) : (
        !collapsed && (
          <div className="border-t border-line px-5 py-4">
            <p className="text-[15px] leading-relaxed text-text">{blurb}</p>
            {meta && <p className="mt-2 text-xs text-muted">{meta}</p>}

            {/* recruiter-mode: quantified wins, scannable */}
            {mode === "boring" && stage.highlights?.length ? (
              <ul className="mt-3.5 space-y-1.5">
                {stage.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm leading-snug text-text">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-2" strokeWidth={2.5} aria-hidden />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {audioSlot && <div className="mt-4">{audioSlot}</div>}

            {stage.tech?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {stage.tech.map((t) => (
                  <span
                    key={t.name}
                    title={t.why}
                    className="cursor-default rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-xs text-muted transition hover:border-brand/40 hover:text-brand-2"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            ) : null}

            {stage.skillGroups?.length ? (
              <div className="mt-4 space-y-3">
                {stage.skillGroups.map((g) => (
                  <div key={g.category}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-2">
                      {g.category}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-lg border border-line bg-panel-2 px-2 py-0.5 text-xs text-muted"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {stage.links?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {stage.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target={l.url.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand-2 transition hover:bg-brand/20"
                  >
                    {l.label} <ArrowUpRight className="h-3 w-3" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        )
      )}
    </div>
  );
}
