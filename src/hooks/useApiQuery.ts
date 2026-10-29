import { useEffect, useState } from "react";

type QueryState<T> = { data: T | undefined; error: string; loading: boolean };

/** Runs a GET-style API call once on mount and tracks its state. */
export function useApiQuery<T>(fetcher: (signal: AbortSignal) => Promise<T>): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({
    data: undefined,
    error: "",
    loading: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    fetcher(controller.signal)
      .then((data) => setState({ data, error: "", loading: false }))
      .catch((e: Error) => {
        if (controller.signal.aborted) return;
        setState({ data: undefined, error: e.message, loading: false });
      });
    return () => controller.abort();
  }, [fetcher]);

  return state;
}
