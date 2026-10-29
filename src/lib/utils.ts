import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Class names are spelled out in full so Tailwind can detect them.

/** Tailwind stroke class for a severity label (3, 4 or unknown). */
export function labelStroke(label?: number): string {
  if (label === 3) return "stroke-chart-1";
  if (label === 4) return "stroke-chart-2";
  return "stroke-chart-4";
}

/** Tailwind background class for a severity label (3, 4 or unknown). */
export function labelFill(label?: number): string {
  if (label === 3) return "bg-chart-1";
  if (label === 4) return "bg-chart-2";
  return "bg-chart-4";
}
