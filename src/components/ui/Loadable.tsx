import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LoadableProps<T> = {
  data: T | undefined;
  error: string;
  /** Height of the placeholder shown while loading. */
  skeletonClassName?: string;
  children: (data: T) => ReactNode;
};

/** Renders API data once it arrives, with a skeleton while loading and a message on failure. */
export function Loadable<T>({ data, error, skeletonClassName, children }: LoadableProps<T>) {
  if (data !== undefined) return children(data);
  if (error) {
    return (
      <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
        Could not load this section: {error}
      </p>
    );
  }
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className={cn("animate-pulse rounded-lg bg-muted", skeletonClassName ?? "h-40")}
    />
  );
}
