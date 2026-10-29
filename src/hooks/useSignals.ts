import { useCallback, useEffect, useState } from "react";

import { SAMPLES } from "@/data/project";
import { parseSignalsCsv, type Signal } from "@/lib/eeg";

type State = {
  signals: Signal[];
  source: string;
  error: string;
  loading: boolean;
};

/** Loads EEG signals from the bundled samples or a user-provided CSV file. */
export function useSignals() {
  const [state, setState] = useState<State>({
    signals: [],
    source: "",
    error: "",
    loading: true,
  });

  const loadText = useCallback(async (read: () => Promise<string>, source: string) => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const signals = parseSignalsCsv(await read());
      setState({ signals, source, error: "", loading: false });
    } catch (e) {
      setState((s) => ({ ...s, error: (e as Error).message, loading: false }));
    }
  }, []);

  const loadSample = useCallback(
    (file: string, label: string) =>
      loadText(async () => {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Could not load ${file} (${res.status}).`);
        return res.text();
      }, label),
    [loadText],
  );

  const loadFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setState((s) => ({ ...s, error: "Please choose a .csv file." }));
        return;
      }
      return loadText(() => file.text(), file.name);
    },
    [loadText],
  );

  useEffect(() => {
    const [first] = SAMPLES;
    void loadSample(first.file, first.label);
  }, [loadSample]);

  return { ...state, loadSample, loadFile };
}
