"use client";

import { useCallback, useRef, useState } from "react";
import { stages, type Stage } from "@/content/stages";
import { buildLog, type LogLine } from "@/lib/logs";
import type { Mode } from "@/lib/mode-context";

export type JobStatus = "queued" | "running" | "success";
export type RenderedLine = LogLine & { jobId: string; key: number };

const idleStatuses = (): Record<string, JobStatus> =>
  Object.fromEntries(stages.map((s) => [s.id, "queued"]));

// Per-line cadence (ms) — deliberately slow so each line is readable.
// Long lines linger longer; the closing line gets a beat before the next stage.
const delayFor = (line: LogLine) => {
  if (line.kind === "success" || line.kind === "pending") return 1300;
  if (line.text.length > 120) return 1500;
  if (line.text.length > 70) return 1200;
  return 950;
};

const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

/**
 * Simulated GitHub Actions run.
 *  - runAll(): every stage, in order, one line after another (pause / resume / stop).
 *  - runJob(): run a single stage on demand.
 * Nothing runs until the user asks.
 */
export function usePipelineRun(mode: Mode) {
  const [statuses, setStatuses] = useState<Record<string, JobStatus>>(idleStatuses);
  const [lines, setLines] = useState<RenderedLine[]>([]);
  const [viewJob, setViewJob] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  const cancel = useRef(false);
  const pausedRef = useRef(false);
  const waiters = useRef<Array<() => void>>([]);
  const keyRef = useRef(0);
  const runtimeRef = useRef<Record<string, JobStatus>>({});

  const flushWaiters = () => {
    waiters.current.forEach((r) => r());
    waiters.current = [];
  };

  // Block here while paused (releases on resume or stop).
  const gate = useCallback(async () => {
    while (pausedRef.current && !cancel.current) {
      await new Promise<void>((res) => waiters.current.push(res));
    }
  }, []);

  const setStatus = (id: string, s: JobStatus) => {
    runtimeRef.current[id] = s;
    setStatuses((prev) => ({ ...prev, [id]: s }));
  };

  const emit = (jobId: string, line: LogLine) =>
    setLines((prev) => [...prev, { ...line, jobId, key: keyRef.current++ }]);

  const streamJob = useCallback(
    async (stage: Stage) => {
      setStatus(stage.id, "running");
      for (const line of buildLog(stage, mode)) {
        await gate();
        if (cancel.current) return;
        emit(stage.id, line);
        await wait(delayFor(line));
      }
      setStatus(stage.id, "success");
    },
    [mode, gate],
  );

  const halt = () => {
    cancel.current = true;
    pausedRef.current = false;
    flushWaiters();
  };

  const stop = useCallback(() => {
    halt();
    setRunningAll(false);
    setRunningJob(null);
    setPaused(false);
  }, []);

  const reset = useCallback(() => {
    halt();
    runtimeRef.current = {};
    setLines([]);
    setStatuses(idleStatuses());
    setViewJob(null);
    setRunningAll(false);
    setRunningJob(null);
    setPaused(false);
  }, []);

  const runAll = useCallback(async () => {
    halt();
    await wait(0);
    cancel.current = false;
    pausedRef.current = false;
    runtimeRef.current = {};
    keyRef.current = 0;
    setLines([]);
    setStatuses(idleStatuses());
    setViewJob(null);
    setPaused(false);
    setRunningJob(null);
    setRunningAll(true);

    for (const stage of stages) {
      if (cancel.current) break;
      await streamJob(stage);
    }

    setRunningAll(false);
    setPaused(false);
  }, [streamJob]);

  // Per-stage play button. Ignored (just focuses logs) while a full run is active.
  const runJob = useCallback(
    async (stage: Stage) => {
      if (runningAll) {
        setViewJob(stage.id);
        return;
      }
      halt();
      await wait(0);
      cancel.current = false;
      pausedRef.current = false;
      setPaused(false);
      setViewJob(stage.id);
      setLines((prev) => prev.filter((l) => l.jobId !== stage.id)); // re-run replaces its logs
      setRunningJob(stage.id);
      await streamJob(stage);
      setRunningJob(null);
    },
    [runningAll, streamJob],
  );

  const pause = useCallback(() => {
    pausedRef.current = true;
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setPaused(false);
    flushWaiters();
  }, []);

  return {
    statuses,
    lines,
    viewJob,
    setViewJob,
    runningAll,
    runningJob,
    running: runningAll || runningJob !== null,
    paused,
    runAll,
    runJob,
    pause,
    resume,
    stop,
    reset,
  };
}
