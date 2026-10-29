import { useEffect, useMemo, useState } from "react";

import { api, type AnalyzeResponse } from "@/lib/api";
import { describeSignal, screenOutliers, type Signal } from "@/lib/eeg";

export type Engine = "browser" | "server";

const SERVER_DEBOUNCE_MS = 250;

/** A server answer, tagged with the exact inputs it was computed for. */
type ServerResult = {
  signals: Signal[];
  threshold: number;
  response?: AnalyzeResponse;
  error?: string;
};

/**
 * Outlier screening for the loaded signals, computed in the browser or by POST /api/analyze.
 * Both paths run the same `eeg.ts` code; only where it runs differs.
 */
export function useAnalysis(signals: Signal[], threshold: number, engine: Engine) {
  const local = useMemo(
    () => (signals.length ? screenOutliers(signals, threshold) : null),
    [signals, threshold],
  );
  const localStats = useMemo(() => signals.map((s) => describeSignal(s.values)), [signals]);
  const [server, setServer] = useState<ServerResult | null>(null);

  useEffect(() => {
    if (engine !== "server" || signals.length === 0) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      api
        .analyze({ signals, threshold }, controller.signal)
        .then((response) => setServer({ signals, threshold, response }))
        .catch((e: Error) => {
          if (!controller.signal.aborted) setServer({ signals, threshold, error: e.message });
        });
    }, SERVER_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [engine, signals, threshold]);

  const current =
    engine === "server" && server?.signals === signals && server.threshold === threshold
      ? server
      : null;
  const remote = current?.response;

  return {
    // Normalized curves are only used for drawing, so they always come from the local pass.
    analysis: local && (remote ? { ...remote, norm: local.norm } : local),
    stats: remote?.stats ?? localStats,
    serverMs: remote?.elapsedMs ?? null,
    pending: engine === "server" && signals.length > 0 && !current,
    serverError: current?.error ?? "",
  };
}
