"use client";

import { Download, Briefcase } from "lucide-react";
import { profile } from "@/content/stages";

/**
 * Recruiter-first snapshot — the 30-second read: headline metrics, core stack,
 * what he's open to, and the fast links. Shown above the pipeline in recruiter mode.
 */
export default function RecruiterSnapshot() {
  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-line bg-panel card-shadow">
      <div className="border-b border-line px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-2">
          Snapshot — the 30-second read
        </span>
      </div>

      {/* metrics */}
      <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
        {profile.metrics.map((m) => (
          <div key={m.value} className="bg-panel px-5 py-4">
            <div className="text-lg font-bold text-text sm:text-xl">{m.value}</div>
            <div className="mt-0.5 text-xs leading-snug text-muted">{m.label}</div>
          </div>
        ))}
      </div>

      {/* core stack + open to */}
      <div className="space-y-4 border-t border-line px-5 py-4">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Core stack</div>
          <div className="flex flex-wrap gap-2">
            {profile.coreStack.map((t) => (
              <span
                key={t}
                className="rounded-lg border border-brand/30 bg-brand/5 px-2.5 py-1 text-xs font-medium text-brand-2"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-ink-soft px-3.5 py-3 text-sm">
          <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-brand-2" aria-hidden />
          <span className="text-text">
            <span className="font-semibold">Open to:</span> {profile.openTo}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={profile.resumeUrl}
            className="inline-flex items-center gap-1.5 rounded-lg brand-gradient px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Download className="h-3.5 w-3.5" aria-hidden /> Résumé (PDF)
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-sm font-medium text-text transition hover:border-brand-2/50"
          >
            LinkedIn
          </a>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-sm font-medium text-text transition hover:border-brand-2/50"
          >
            GitHub
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-sm font-medium text-text transition hover:border-brand-2/50"
          >
            {profile.email}
          </a>
        </div>
      </div>
    </div>
  );
}
