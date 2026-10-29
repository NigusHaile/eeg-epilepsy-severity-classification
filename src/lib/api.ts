/**
 * API contract shared by the frontend and the serverless functions in `api/`.
 * The server imports these types too, so request and response shapes stay in sync.
 */

import type { OutlierRow, Signal, SignalStats } from "./eeg";

export type ModelResult = {
  name: string;
  representation: string;
  cvMean: number;
  cvStd: number;
  testAccuracy: number;
  rocAuc: number;
};

export type ProjectContent = {
  metrics: { value: string; label: string }[];
  pipeline: { title: string; detail: string }[];
  models: ModelResult[];
  highlights: { title: string; detail: string }[];
  techStack: string[];
};

export type AnalyzeRequest = { signals: Signal[]; threshold: number };

export type AnalyzeResponse = {
  mean: number[];
  std: number[];
  rows: OutlierRow[];
  stats: SignalStats[];
  elapsedMs: number;
};

export type ContactRequest = {
  name: string;
  email: string;
  message: string;
  /** Honeypot: hidden from people, so only bots fill it in. */
  website?: string;
};

export type Repo = {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  topics: string[];
  pushedAt: string;
};

export type ReposResponse = { configured: boolean; username: string | null; repos: Repo[] };

export type HealthResponse = {
  status: "ok";
  time: string;
  services: { contact: boolean; github: boolean };
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new ApiError(body.error ?? `Request failed (${res.status}).`, res.status);
  return body;
}

export const api = {
  project: (signal?: AbortSignal) => request<ProjectContent>("/api/project", { signal }),
  repos: (signal?: AbortSignal) => request<ReposResponse>("/api/github", { signal }),
  analyze: (body: AnalyzeRequest, signal?: AbortSignal) =>
    request<AnalyzeResponse>("/api/analyze", {
      method: "POST",
      body: JSON.stringify(body),
      signal,
    }),
  contact: (body: ContactRequest) =>
    request<{ ok: true }>("/api/contact", { method: "POST", body: JSON.stringify(body) }),
};
