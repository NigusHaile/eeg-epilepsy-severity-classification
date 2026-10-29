import { Cloud, Download, Laptop, Upload } from "lucide-react";
import { useMemo, useState, type DragEvent } from "react";

import { SAMPLES } from "@/data/project";
import { useAnalysis, type Engine } from "@/hooks/useAnalysis";
import { describeSignal, type Signal } from "@/lib/eeg";
import { cn, labelFill, labelStroke } from "@/lib/utils";

import { OutlierTable } from "./OutlierTable";
import { SignalChart } from "./SignalChart";
import { Button } from "./ui/Button";
import { buttonClass } from "./ui/buttonClass";
import { Section } from "./ui/Section";

type SignalLabProps = {
  signals: Signal[];
  source: string;
  error: string;
  loading: boolean;
  loadSample: (file: string, label: string) => void;
  loadFile: (file: File) => void;
};

const WINDOW_SIZES = [0, 2048, 1024, 512, 256]; // 0 = whole signal

function Legend() {
  const items = [
    { label: "Level 3", className: "bg-chart-1" },
    { label: "Level 4", className: "bg-chart-2" },
    { label: "Unlabeled", className: "bg-chart-4" },
    { label: "Outlier", className: "bg-destructive" },
  ];
  return (
    <ul className="flex flex-wrap gap-4 text-xs text-muted-foreground">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className={cn("h-0.5 w-4 rounded", i.className)} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

const ENGINES: { value: Engine; label: string; Icon: typeof Cloud }[] = [
  { value: "browser", label: "Browser", Icon: Laptop },
  { value: "server", label: "Server API", Icon: Cloud },
];

function engineStatus(engine: Engine, pending: boolean, serverMs: number | null): string {
  if (engine === "browser") return "Computed locally";
  if (pending) return "Computing on server…";
  if (serverMs !== null) return `Computed on server in ${serverMs.toFixed(1)} ms`;
  return "";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-3">
      <div className="eyebrow">{label}</div>
      <div className="mt-1 font-mono text-sm">{value}</div>
    </div>
  );
}

export function SignalLab({
  signals,
  source,
  error,
  loading,
  loadSample,
  loadFile,
}: SignalLabProps) {
  const [selectedRaw, setSelected] = useState(0);
  const [threshold, setThreshold] = useState(1.0);
  const [windowSize, setWindowSize] = useState(0);
  const [windowStartRaw, setWindowStart] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [engine, setEngine] = useState<Engine>("browser");

  const {
    analysis,
    stats: allStats,
    serverMs,
    pending,
    serverError,
  } = useAnalysis(signals, threshold, engine);

  // Clamp UI state when a new file with fewer signals or samples is loaded.
  const selected = Math.min(selectedRaw, Math.max(0, signals.length - 1));
  const current = signals[selected];
  const length = current?.values.length ?? 0;
  const span = windowSize && windowSize < length ? windowSize : length;
  const windowStart = Math.min(windowStartRaw, length - span);

  const windowed = useMemo(
    () => current?.values.slice(windowStart, windowStart + span) ?? [],
    [current, windowStart, span],
  );
  const stats = allStats[selected] ?? describeSignal([]);
  const band = useMemo(
    () =>
      analysis && {
        lower: analysis.mean.map((m, j) => m - analysis.std[j]!),
        upper: analysis.mean.map((m, j) => m + analysis.std[j]!),
      },
    [analysis],
  );

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const actions = (
    <div className="flex flex-wrap gap-2">
      {SAMPLES.map((s) => (
        <Button key={s.file} variant="outline" onClick={() => loadSample(s.file, s.label)}>
          {s.label}
        </Button>
      ))}
      <label className={buttonClass("primary")}>
        <Upload className="size-4" /> Upload CSV
        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) loadFile(file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );

  return (
    <Section
      id="lab"
      eyebrow="01 · Signal lab"
      title="Inspect, normalize, screen"
      description="Load a recording and run the same preprocessing used in the study — in your browser, or on the serverless API. Uploaded data is never stored."
      actions={actions}
      className="border-b bg-card/40"
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "-m-3 rounded-xl border border-dashed p-3 transition-colors sm:-m-4 sm:p-4",
          dragging ? "border-primary bg-primary/5" : "border-transparent",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            Source:{" "}
            <span className="font-mono text-foreground">
              {loading ? "loading…" : source || "—"}
            </span>
            {signals.length > 0 && ` · ${signals.length} signals × ${length} samples`}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {engineStatus(engine, pending, serverMs)}
            </span>
            <div
              className="flex rounded-md border bg-card p-0.5"
              role="group"
              aria-label="Compute engine"
            >
              {ENGINES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={engine === value}
                  onClick={() => setEngine(value)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors",
                    engine === value ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <Icon className="size-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Tip: drop a CSV file anywhere here.</p>

        {serverError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          >
            Server analysis failed: {serverError} Showing browser results instead.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {analysis && current && band && (
          <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
            <ul className="flex gap-1 overflow-x-auto lg:block lg:space-y-1">
              {signals.map((s, i) => (
                <li key={i} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    aria-pressed={i === selected}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-left font-mono text-sm transition-colors",
                      i === selected ? "bg-secondary" : "hover:bg-muted",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          analysis.rows[i]?.isOutlier ? "bg-destructive" : labelFill(s.label),
                        )}
                      />
                      {s.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {s.label !== undefined ? `y=${s.label}` : "?"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="min-w-0 space-y-8">
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="eyebrow">
                    Raw amplitude · samples {windowStart}–{windowStart + span - 1}
                  </p>
                  <div className="flex items-center gap-1" role="group" aria-label="Zoom">
                    {WINDOW_SIZES.filter((w) => w < length).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWindowSize(w)}
                        aria-pressed={windowSize === w}
                        className={cn(
                          "cursor-pointer rounded px-2 py-1 font-mono text-xs transition-colors",
                          windowSize === w
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted",
                        )}
                      >
                        {w === 0 ? "all" : w}
                      </button>
                    ))}
                  </div>
                </div>
                <SignalChart
                  label={`Raw EEG amplitude for ${current.id}`}
                  interactive
                  offset={windowStart}
                  series={[
                    { values: windowed, className: labelStroke(current.label), width: 1.25 },
                  ]}
                />
                {span < length && (
                  <input
                    type="range"
                    aria-label="Window position"
                    min={0}
                    max={length - span}
                    value={windowStart}
                    onChange={(e) => setWindowStart(Number(e.target.value))}
                    className="mt-3 w-full"
                  />
                )}
                <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-6">
                  <Stat label="Min" value={stats.min.toFixed(1)} />
                  <Stat label="Max" value={stats.max.toFixed(1)} />
                  <Stat label="Mean" value={stats.mean.toFixed(2)} />
                  <Stat label="Std" value={stats.std.toFixed(2)} />
                  <Stat label="RMS" value={stats.rms.toFixed(2)} />
                  <Stat label="Crossings" value={String(stats.zeroCrossings)} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="eyebrow">All signals normalized to [0, 1] · mean ± 1σ band</p>
                  <Legend />
                </div>
                <SignalChart
                  label="All signals min-max normalized with the pointwise mean and standard deviation band"
                  yRange={[0, 1]}
                  band={band}
                  series={[
                    ...analysis.norm.map((values, i) => ({
                      values,
                      className: analysis.rows[i]?.isOutlier
                        ? "stroke-destructive"
                        : labelStroke(signals[i]?.label),
                      opacity: i === selected ? 1 : 0.3,
                    })),
                    { values: analysis.mean, className: "stroke-foreground", width: 1.5 },
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        {analysis && (
          <div className="mt-10">
            <div className="flex flex-wrap items-center gap-4">
              <label htmlFor="threshold" className="eyebrow">
                Outlier threshold (RMS z-score)
              </label>
              <input
                id="threshold"
                type="range"
                min={0.5}
                max={2.5}
                step={0.1}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-56"
              />
              <span className="font-mono text-sm">{threshold.toFixed(1)}σ</span>
              <span className="text-sm text-muted-foreground">
                {analysis.rows.filter((r) => r.isOutlier).length} of {analysis.rows.length} flagged
              </span>
            </div>
            <div className="mt-4">
              <OutlierTable rows={analysis.rows} selected={selected} onSelect={setSelected} />
            </div>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                CSV format: optional <code>id</code> column, sample columns <code>X1…Xn</code>,
                optional <code>y</code> label column. Statistics are computed across loaded signals.
              </span>
              <a
                href={SAMPLES[0].file}
                download
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <Download className="size-3" /> Download sample CSV
              </a>
            </p>
          </div>
        )}
      </div>
    </Section>
  );
}
