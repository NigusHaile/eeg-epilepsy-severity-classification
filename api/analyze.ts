import { z } from "zod";

import type { AnalyzeResponse } from "../src/lib/api.js";
import { describeSignal, parseSignalsCsv, screenOutliers, type Signal } from "../src/lib/eeg.js";
import { error, json, parseJson } from "../server/http.js";

const MAX_BODY_BYTES = 4_000_000; // Vercel caps request bodies at 4.5 MB.
const MAX_SIGNALS = 500;
const MAX_SAMPLES = 10_000;

const signalSchema = z.object({
  id: z.string().max(100),
  values: z.array(z.number().finite()).min(2).max(MAX_SAMPLES),
  label: z.number().finite().optional(),
});

const requestSchema = z.object({
  signals: z
    .array(signalSchema)
    .min(1)
    .max(MAX_SIGNALS)
    .refine((s) => s.every((x) => x.values.length === s[0]!.values.length), {
      message: "All signals must have the same number of samples.",
    }),
  threshold: z.number().min(0.1).max(10).default(1),
});

function analyze(signals: Signal[], threshold: number): AnalyzeResponse {
  const started = performance.now();
  const { mean, std, rows } = screenOutliers(signals, threshold);
  const stats = signals.map((s) => describeSignal(s.values));
  return { mean, std, rows, stats, elapsedMs: performance.now() - started };
}

/**
 * Runs normalization, outlier screening and summary statistics on the server.
 *
 * Accepts either JSON (`{ signals, threshold }`) or a raw CSV body with
 * `content-type: text/csv` and an optional `?threshold=` query parameter.
 */
export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("text/csv")) {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return error(413, "CSV is larger than 4 MB.");
    const threshold = Number(new URL(request.url).searchParams.get("threshold") ?? 1);
    if (!Number.isFinite(threshold) || threshold <= 0) {
      return error(400, "threshold must be a positive number.");
    }
    try {
      const signals = parseSignalsCsv(text);
      const parsed = requestSchema.safeParse({ signals, threshold });
      if (!parsed.success) return error(400, parsed.error.issues[0]?.message ?? "Invalid CSV.");
      return json(analyze(parsed.data.signals, parsed.data.threshold));
    } catch (e) {
      return error(400, (e as Error).message);
    }
  }

  const parsed = await parseJson(request, requestSchema, MAX_BODY_BYTES);
  if ("response" in parsed) return parsed.response;
  return json(analyze(parsed.data.signals, parsed.data.threshold));
}
