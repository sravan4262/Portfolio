"use client";

import { useMode } from "@/lib/mode-context";

export default function ModeToggle() {
  const { mode, setMode } = useMode();
  if (!mode) return null;
  const fun = mode === "fun";

  return (
    <div
      className="inline-flex items-center rounded-full border border-line bg-panel p-1 text-xs font-semibold"
      role="group"
      aria-label="Content style"
    >
      <button
        onClick={() => setMode("fun")}
        aria-pressed={fun}
        className={[
          "rounded-full px-3 py-1 transition",
          fun ? "bg-accent text-white" : "text-muted hover:text-text",
        ].join(" ")}
      >
        ▶ Fun
      </button>
      <button
        onClick={() => setMode("boring")}
        aria-pressed={!fun}
        className={[
          "rounded-full px-3 py-1 transition",
          !fun ? "bg-accent-2/20 text-accent-2" : "text-muted hover:text-text",
        ].join(" ")}
      >
        Recruiter
      </button>
    </div>
  );
}
