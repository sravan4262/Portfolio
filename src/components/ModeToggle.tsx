"use client";

import { Sparkles, FileText } from "lucide-react";
import { useMode } from "@/lib/mode-context";

export default function ModeToggle() {
  const { mode, setMode } = useMode();
  if (!mode) return null;
  const fun = mode === "fun";

  return (
    <div
      className="inline-flex items-center rounded-full border border-line bg-panel p-1 text-xs font-semibold"
      role="group"
      aria-label="Choose how this reads"
    >
      <button
        onClick={() => setMode("fun")}
        aria-pressed={fun}
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition",
          fun ? "brand-gradient text-white" : "text-muted hover:text-text",
        ].join(" ")}
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden /> Fun
      </button>
      <button
        onClick={() => setMode("boring")}
        aria-pressed={!fun}
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition",
          !fun ? "bg-panel-2 text-text" : "text-muted hover:text-text",
        ].join(" ")}
      >
        <FileText className="h-3.5 w-3.5" aria-hidden /> Recruiter
      </button>
    </div>
  );
}
