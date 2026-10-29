import { useMemo, useState, type PointerEvent } from "react";

import { cn } from "@/lib/utils";

export type Series = { values: number[]; className: string; width?: number; opacity?: number };

type SignalChartProps = {
  series: Series[];
  band?: { lower: number[]; upper: number[] };
  height?: number;
  yRange?: [number, number];
  /** First sample index shown, used to label the hover readout. */
  offset?: number;
  /** Show a crosshair with the value of the first series under the pointer. */
  interactive?: boolean;
  label: string;
  className?: string;
};

const WIDTH = 1000;
const PADDING = 6;

function extent(arrays: number[][]): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const a of arrays) {
    for (const v of a) {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  }
  return Number.isFinite(lo) ? [lo, hi] : [0, 1];
}

/** Lightweight SVG line chart for long signals, decimated to roughly one point per pixel. */
export function SignalChart({
  series,
  band,
  height = 220,
  yRange,
  offset = 0,
  interactive = false,
  label,
  className,
}: SignalChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const n = Math.max(...series.map((s) => s.values.length), band?.lower.length ?? 0, 1);

  const { paths, bandPath, x, y } = useMemo(() => {
    const [lo, hi] =
      yRange ?? extent([...series.map((s) => s.values), ...(band ? [band.lower, band.upper] : [])]);
    const step = Math.max(1, Math.floor(n / WIDTH));
    const x = (i: number) => (i / Math.max(1, n - 1)) * WIDTH;
    const y = (v: number) =>
      height - PADDING - ((v - lo) / (hi - lo || 1)) * (height - 2 * PADDING);

    const toPath = (values: number[]) => {
      let d = "";
      for (let i = 0; i < values.length; i += step) {
        d += `${d ? "L" : "M"}${x(i).toFixed(1)},${y(values[i]!).toFixed(1)}`;
      }
      return d;
    };

    let bandPath = "";
    if (band) {
      bandPath = toPath(band.upper);
      for (let i = band.lower.length - 1; i >= 0; i -= step) {
        bandPath += `L${x(i).toFixed(1)},${y(band.lower[i]!).toFixed(1)}`;
      }
      bandPath += "Z";
    }

    return { paths: series.map((s) => toPath(s.values)), bandPath, x, y };
  }, [series, band, yRange, height, n]);

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setHover(Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1)))));
  };

  const hoverValue = hover !== null ? series[0]?.values[hover] : undefined;

  return (
    <div className={cn("relative", className)}>
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${WIDTH} ${height}`}
        preserveAspectRatio="none"
        className="paper-grid w-full touch-none rounded-md border bg-card"
        style={{ height }}
        onPointerMove={interactive ? onPointerMove : undefined}
        onPointerLeave={interactive ? () => setHover(null) : undefined}
      >
        {band && <path d={bandPath} className="fill-muted-foreground/15" />}
        {series.map((s, i) => (
          <path
            key={i}
            d={paths[i]}
            fill="none"
            className={s.className}
            strokeWidth={s.width ?? 1}
            opacity={s.opacity ?? 1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {hover !== null && hoverValue !== undefined && (
          <>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={0}
              y2={height}
              className="stroke-foreground/40"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={x(hover)}
              cy={y(hoverValue)}
              r={3}
              className="fill-foreground"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>
      {hover !== null && hoverValue !== undefined && (
        <div className="pointer-events-none absolute top-2 right-2 rounded border bg-card/90 px-2 py-1 font-mono text-xs shadow-sm">
          t={offset + hover} · {hoverValue.toFixed(2)}
        </div>
      )}
    </div>
  );
}
