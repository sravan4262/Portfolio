import type { Stage } from "@/content/stages";
import type { Mode } from "@/lib/mode-context";

export type LogKind =
  | "out" // normal step
  | "dim" // setup / de-emphasised
  | "success" // completion
  | "pending"; // in-progress completion

export type LogLine = { kind: LogKind; text: string };

const setupLine: Record<Stage["type"], string> = {
  init: "spin up runner",
  education: "compile foundations",
  job: "set up job",
  project: "checkout branch",
  skills: "gather artifacts",
  cleanup: "finalize run",
};

/**
 * Short, GitHub-Actions-style steps — a couple words each. These stream into a
 * stage's console while it runs, then the card settles to its real content.
 */
export function buildLog(stage: Stage, _mode: Mode): LogLine[] {
  const L: LogLine[] = [{ kind: "dim", text: setupLine[stage.type] }];

  switch (stage.type) {
    case "init":
      L.push({ kind: "out", text: "check out source" });
      L.push({ kind: "out", text: "load 9 yrs exp" });
      break;
    case "education":
      L.push({ kind: "out", text: "build M.S. EE" });
      L.push({ kind: "out", text: "link B.S. ECE" });
      break;
    case "skills":
      L.push({ kind: "out", text: "package toolbox" });
      L.push({ kind: "out", text: "publish artifacts" });
      break;
    case "cleanup":
      L.push({ kind: "out", text: "cache results" });
      break;
    default:
      L.push({ kind: "out", text: `build ${stage.label.toLowerCase()}` });
      if (stage.tech?.length) {
        L.push({ kind: "out", text: stage.tech.slice(0, 3).map((t) => t.name).join(", ") });
      }
      L.push({ kind: "out", text: "run checks" });
  }

  if (stage.type === "cleanup") L.push({ kind: "success", text: "✓ all green · zero rollbacks" });
  else if (stage.status === "live") L.push({ kind: "success", text: "✓ live in prod" });
  else if (stage.status === "in-progress") L.push({ kind: "pending", text: "⚙ build in progress" });
  else L.push({ kind: "success", text: "✓ done" });

  return L;
}

export const isTerminal = (kind: LogKind) => kind === "success" || kind === "pending";
