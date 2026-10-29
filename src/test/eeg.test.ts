import { describe, expect, it } from "vitest";

import {
  describeSignal,
  minmaxNormalize,
  parseSignalsCsv,
  pointwiseStats,
  screenOutliers,
} from "@/lib/eeg";

describe("parseSignalsCsv", () => {
  it("parses id, samples and y label", () => {
    const [signal] = parseSignalsCsv("id,X1,X2,y\np1,1,2,3\n");
    expect(signal).toEqual({ id: "p1", values: [1, 2], label: 3 });
  });

  it("generates ids and omits the label when the columns are missing", () => {
    const [signal] = parseSignalsCsv("X1,X2\n1,2\n");
    expect(signal).toEqual({ id: "signal_1", values: [1, 2] });
  });

  it("rejects non-numeric samples", () => {
    expect(() => parseSignalsCsv("id,X1\np1,abc\n")).toThrow(/non-numeric/);
  });

  it("rejects a file without data rows", () => {
    expect(() => parseSignalsCsv("id,X1\n")).toThrow(/header row/);
  });
});

describe("minmaxNormalize", () => {
  it("scales each signal to [0, 1]", () => {
    expect(minmaxNormalize([2, 4, 6])).toEqual([0, 0.5, 1]);
  });

  it("guards flat signals against division by zero", () => {
    expect(minmaxNormalize([5, 5])).toEqual([0, 0]);
  });
});

describe("pointwiseStats", () => {
  it("uses sample std (ddof=1)", () => {
    expect(pointwiseStats([[0], [2]]).std[0]).toBeCloseTo(Math.SQRT2);
  });
});

describe("screenOutliers", () => {
  it("flags signals beyond the RMS z-score threshold", () => {
    const sig = (id: string, values: number[]) => ({ id, values });
    const { rows } = screenOutliers(
      [sig("a", [0, 1, 2, 3]), sig("b", [0, 1, 2, 3]), sig("c", [3, 2, 1, 0])],
      1.0,
    );
    expect(rows.map((r) => r.isOutlier)).toEqual([false, false, true]);
  });
});

describe("describeSignal", () => {
  it("computes summary statistics", () => {
    const stats = describeSignal([1, -1, 1, -1]);
    expect(stats).toMatchObject({ min: -1, max: 1, mean: 0, rms: 1, zeroCrossings: 3 });
    expect(stats.std).toBeCloseTo(Math.sqrt(4 / 3));
  });

  it("handles empty input", () => {
    expect(describeSignal([]).rms).toBe(0);
  });
});
