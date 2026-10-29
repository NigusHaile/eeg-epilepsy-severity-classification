import { ArrowDown } from "lucide-react";
import { useMemo } from "react";

import { SITE } from "@/data/project";
import { useProject } from "@/hooks/useProject";
import { minmaxNormalize } from "@/lib/eeg";

import { buttonClass } from "./ui/buttonClass";
import { GithubIcon } from "./ui/icons";

const TRACE_HEIGHT = 120;

// Shown until GET /api/project answers, so the layout does not jump.
const PLACEHOLDER_METRICS = ["Test accuracy", "ROC-AUC", "PCA components", "Recordings"].map(
  (label) => ({ label, value: "—" }),
);

/** A real recording drawn twice side by side, scrolled by CSS for a "live monitor" effect. */
function LiveTrace({ values }: { values: number[] }) {
  const d = useMemo(() => {
    const norm = minmaxNormalize(values);
    const step = Math.max(1, Math.floor(norm.length / 800));
    let path = "";
    for (let i = 0; i < norm.length; i += step) {
      const x = (i / norm.length) * 1000;
      const y = TRACE_HEIGHT - 10 - norm[i]! * (TRACE_HEIGHT - 20);
      path += `${path ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    }
    return path;
  }, [values]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden opacity-60">
      <svg
        viewBox={`0 0 2000 ${TRACE_HEIGHT}`}
        preserveAspectRatio="none"
        className="animate-trace h-28 w-[200%]"
        aria-hidden="true"
      >
        {[0, 1000].map((dx) => (
          <path
            key={dx}
            d={d}
            transform={`translate(${dx} 0)`}
            fill="none"
            className="stroke-primary"
            strokeWidth={1.25}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
    </div>
  );
}

export function Hero({ trace }: { trace?: number[] | undefined }) {
  const { data } = useProject();

  return (
    <section id="top" className="relative overflow-hidden border-b">
      <div className="paper-grid absolute inset-0 opacity-40" aria-hidden="true" />
      {trace && trace.length > 1 && <LiveTrace values={trace} />}

      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-36 sm:px-6 sm:pt-24">
        <p className="eyebrow">{SITE.tagline}</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight font-semibold sm:text-6xl">
          Reading adjacent severity grades from raw EEG.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          200 recordings, 4,094 amplitude samples each. A leak-free classical ML pipeline reaches{" "}
          <strong className="font-medium text-foreground">0.88 accuracy</strong> and{" "}
          <strong className="font-medium text-foreground">0.92 ROC-AUC</strong> on unseen patients —
          and you can explore the signals right here in your browser.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#lab" className={buttonClass("primary", "h-10 px-5")}>
            Try the signal lab <ArrowDown className="size-4" />
          </a>
          <a href="#results" className={buttonClass("outline", "h-10 px-5")}>
            See results
          </a>
          {SITE.repoUrl && (
            <a
              href={SITE.repoUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonClass("outline", "h-10 px-5")}
            >
              <GithubIcon className="size-4" /> Source code
            </a>
          )}
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
          {(data?.metrics ?? PLACEHOLDER_METRICS).map((m) => (
            <div key={m.label} className="bg-card/90 p-5 backdrop-blur">
              <dt className="eyebrow">{m.label}</dt>
              <dd className="mt-1 font-mono text-3xl text-primary">{m.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
