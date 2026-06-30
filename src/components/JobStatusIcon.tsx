"use client";

import type { JobStatus } from "@/lib/usePipelineRun";

export default function JobStatusIcon({
  status,
  size = 16,
}: {
  status: JobStatus;
  size?: number;
}) {
  const px = { width: size, height: size };

  if (status === "running") {
    return (
      <span
        aria-label="running"
        style={px}
        className="inline-block animate-spin rounded-full border-2 border-running border-t-transparent"
      />
    );
  }
  if (status === "success") {
    return (
      <span
        aria-label="success"
        style={px}
        className="inline-flex items-center justify-center rounded-full bg-success text-[11px] font-bold text-ink"
      >
        ✓
      </span>
    );
  }
  // queued
  return (
    <span
      aria-label="queued"
      style={px}
      className="inline-block rounded-full border-2 border-dashed border-muted/60"
    />
  );
}
