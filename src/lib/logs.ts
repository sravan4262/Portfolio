import type { Stage } from "@/content/stages";
import type { Mode } from "@/lib/mode-context";

export type LogKind =
  | "out" // normal line
  | "dim" // de-emphasised detail (timeline, links)
  | "success" // green completion line
  | "pending"; // amber "in progress" completion

export type LogLine = { kind: LogKind; text: string };

/** A log line is one logical line — it wraps naturally in the card, numbered once. */
function firstLine(stage: Stage): string {
  switch (stage.type) {
    case "init":
      return "Initializing runner...";
    case "skills":
      return "Publishing artifacts...";
    case "cleanup":
      return "Finalizing & cleaning up...";
    default:
      return `Building ${stage.label}...`;
  }
}

function metaLine(stage: Stage): string | null {
  if (stage.dates) return `Timeline: ${stage.dates}${stage.location ? ` · ${stage.location}` : ""}`;
  if (stage.location) return `Platform: ${stage.location}`;
  return null;
}

function completion(stage: Stage): LogLine {
  switch (stage.type) {
    case "init":
      return { kind: "success", text: "✓ Environment ready" };
    case "skills":
      return { kind: "success", text: "✓ Artifacts published" };
    case "cleanup":
      return { kind: "success", text: "✓ Pipeline complete — status: green" };
  }
  if (stage.status === "live") return { kind: "success", text: "✓ Live in production" };
  if (stage.status === "in-progress") return { kind: "pending", text: "⚙ Build in progress" };
  return { kind: "success", text: "✓ Deployed to production" };
}

/** Build a stage's terminal-card log: one logical line at a time. */
export function buildLog(stage: Stage, mode: Mode): LogLine[] {
  const L: LogLine[] = [];

  L.push({ kind: "out", text: firstLine(stage) });
  L.push({ kind: "out", text: mode === "fun" ? stage.fun.script : stage.summary });

  if (stage.skillGroups?.length) {
    stage.skillGroups.forEach((g) => L.push({ kind: "out", text: `${g.category}: ${g.items.join(", ")}` }));
  } else if (stage.tech?.length) {
    L.push({ kind: "out", text: `Stack: ${stage.tech.map((t) => t.name).join(", ")}` });
  }

  const meta = metaLine(stage);
  if (meta) L.push({ kind: "dim", text: meta });

  if (stage.links?.length) {
    L.push({ kind: "dim", text: `Links: ${stage.links.map((l) => l.label).join("  ·  ")}` });
  }

  L.push(completion(stage));
  return L;
}

/** A terminal line ends a job (used to mark a card "done"). */
export const isTerminal = (kind: LogKind) => kind === "success" || kind === "pending";
