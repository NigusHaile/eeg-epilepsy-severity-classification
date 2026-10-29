/**
 * EEG signal analysis, ported from the original Python notebook.
 *
 * - CSV parsing (optional `id` column, sample columns, optional `y` label)
 * - per-signal min–max normalization
 * - pointwise mean / sample-std band across signals
 * - RMS z-score outlier screening
 * - descriptive statistics for a single signal
 */

export type Signal = {
  id: string;
  values: number[];
  label?: number;
};

export type OutlierRow = {
  id: string;
  label?: number;
  /** Fraction of samples that fall outside the mean ± 1σ band. */
  fracOutside: number;
  /** Root-mean-square z-score against the pointwise band. */
  distanceStd: number;
  isOutlier: boolean;
};

export type SignalStats = {
  min: number;
  max: number;
  mean: number;
  std: number;
  rms: number;
  /** Sign changes around the mean, a rough proxy for dominant frequency. */
  zeroCrossings: number;
};

const LABEL_COLUMN = "y";
const ID_COLUMNS = new Set(["id", ""]);

function isIdColumn(name: string): boolean {
  return ID_COLUMNS.has(name) || name.startsWith("Unnamed");
}

export function parseSignalsCsv(text: string): Signal[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    throw new Error("CSV needs a header row and at least one signal.");
  }

  const header = lines[0]!.split(",").map((h) => h.trim());
  const labelIdx = header.indexOf(LABEL_COLUMN);
  const idIdx = header.findIndex(isIdColumn);
  const sampleIdx = header.map((_, i) => i).filter((i) => i !== labelIdx && i !== idIdx);

  if (sampleIdx.length === 0) {
    throw new Error("CSV has no sample columns.");
  }

  return lines.slice(1).map((line, row) => {
    const cells = line.split(",");
    const values = sampleIdx.map((i) => Number(cells[i]));
    if (values.some((v) => !Number.isFinite(v))) {
      throw new Error(`Row ${row + 1} has non-numeric samples.`);
    }

    const id = (idIdx >= 0 ? cells[idIdx]?.trim() : undefined) || `signal_${row + 1}`;
    const signal: Signal = { id, values };
    if (labelIdx >= 0) signal.label = Number(cells[labelIdx]);
    return signal;
  });
}

export function minmaxNormalize(x: number[]): number[] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of x) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  const range = hi - lo || 1;
  return x.map((v) => (v - lo) / range);
}

/** Pointwise mean and sample standard deviation (ddof = 1) across equal-length rows. */
export function pointwiseStats(rows: number[][]): { mean: number[]; std: number[] } {
  const n = rows.length;
  const m = rows[0]?.length ?? 0;
  const mean = new Array<number>(m).fill(0);
  const std = new Array<number>(m).fill(0);

  for (const r of rows) {
    for (let j = 0; j < m; j++) mean[j]! += r[j]! / n;
  }
  if (n > 1) {
    for (const r of rows) {
      for (let j = 0; j < m; j++) std[j]! += (r[j]! - mean[j]!) ** 2;
    }
    for (let j = 0; j < m; j++) std[j] = Math.sqrt(std[j]! / (n - 1));
  }
  return { mean, std };
}

export function screenOutliers(signals: Signal[], threshold = 1.0) {
  const norm = signals.map((s) => minmaxNormalize(s.values));
  const { mean, std } = pointwiseStats(norm);

  const rows: OutlierRow[] = norm.map((x, i) => {
    let outside = 0;
    let sumZ2 = 0;
    for (let j = 0; j < x.length; j++) {
      const v = x[j]!;
      const mu = mean[j]!;
      const sigma = std[j]!;
      if (v < mu - sigma || v > mu + sigma) outside++;
      sumZ2 += ((v - mu) / (sigma || 1e-12)) ** 2;
    }
    const distanceStd = Math.sqrt(sumZ2 / x.length);
    const signal = signals[i]!;
    return {
      id: signal.id,
      ...(signal.label !== undefined && { label: signal.label }),
      fracOutside: outside / x.length,
      distanceStd,
      isOutlier: distanceStd > threshold,
    };
  });

  return { norm, mean, std, rows };
}

export function describeSignal(x: number[]): SignalStats {
  const n = x.length;
  if (n === 0) return { min: 0, max: 0, mean: 0, std: 0, rms: 0, zeroCrossings: 0 };

  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let sumSq = 0;
  for (const v of x) {
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
    sumSq += v * v;
  }
  const mean = sum / n;

  let variance = 0;
  let zeroCrossings = 0;
  for (let i = 0; i < n; i++) {
    variance += (x[i]! - mean) ** 2;
    if (i > 0 && x[i - 1]! - mean < 0 !== x[i]! - mean < 0) zeroCrossings++;
  }

  return {
    min,
    max,
    mean,
    std: n > 1 ? Math.sqrt(variance / (n - 1)) : 0,
    rms: Math.sqrt(sumSq / n),
    zeroCrossings,
  };
}
