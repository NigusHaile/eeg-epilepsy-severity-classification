import { ArrowDownWideNarrow } from "lucide-react";
import { useState } from "react";

import { useProject } from "@/hooks/useProject";
import type { ModelResult } from "@/lib/api";
import { cn } from "@/lib/utils";

import { Loadable } from "./ui/Loadable";
import { Section } from "./ui/Section";

const METRICS = [
  { key: "testAccuracy", label: "Test accuracy" },
  { key: "rocAuc", label: "ROC-AUC" },
  { key: "cvMean", label: "CV accuracy" },
] as const satisfies { key: keyof ModelResult; label: string }[];

type MetricKey = (typeof METRICS)[number]["key"];

/** Chance level for a balanced binary task. */
const BASELINE = 0.5;

export function Results() {
  const { data, error } = useProject();

  return (
    <Section
      id="results"
      eyebrow="03 · Results"
      title="Random Forest wins on unseen recordings"
      description="Held-out test set of 40 recordings (20 per class). Switch the metric to re-rank the models."
    >
      <Loadable data={data?.models} error={error} skeletonClassName="h-96">
        {(models) => <ModelRanking models={models} />}
      </Loadable>
    </Section>
  );
}

function ModelRanking({ models }: { models: ModelResult[] }) {
  const [metric, setMetric] = useState<MetricKey>("testAccuracy");
  const ranked = [...models].sort((a, b) => b[metric] - a[metric]);
  const best = ranked[0];

  return (
    <>
      <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1" role="tablist">
        {METRICS.map((m) => (
          <button
            key={m.key}
            type="button"
            role="tab"
            aria-selected={metric === m.key}
            onClick={() => setMetric(m.key)}
            className={cn(
              "cursor-pointer rounded-md px-3 py-1.5 text-sm transition-colors",
              metric === m.key ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-3">
        {ranked.map((model) => {
          const value = model[metric];
          const isBest = model === best;
          return (
            <li key={model.name} className="rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className={cn("font-medium", isBest && "text-primary")}>{model.name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">{model.representation}</span>
                </div>
                <span className="font-mono text-lg">
                  {value.toFixed(2)}
                  {metric === "cvMean" && (
                    <span className="text-sm text-muted-foreground">
                      {" "}
                      ± {model.cvStd.toFixed(2)}
                    </span>
                  )}
                </span>
              </div>
              <div className="relative mt-3 h-2 rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-700 ease-out",
                    isBest ? "bg-primary" : "bg-chart-4",
                  )}
                  style={{ width: `${value * 100}%` }}
                />
                <div
                  className="absolute -top-1 h-4 w-px bg-foreground/50"
                  style={{ left: `${BASELINE * 100}%` }}
                  title="Chance level (0.50)"
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <ArrowDownWideNarrow className="size-3.5" />
        Sorted by {METRICS.find((m) => m.key === metric)!.label.toLowerCase()}. The vertical tick
        marks the 0.50 chance baseline. The RBF SVM has the highest AUC but the weakest accuracy —
        good ranking, poorly calibrated threshold.
      </p>
    </>
  );
}
