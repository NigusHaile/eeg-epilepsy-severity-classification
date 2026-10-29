// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { POST as analyze } from "../api/analyze";
import { POST as contact } from "../api/contact";
import { GET as health } from "../api/health";
import { GET as project } from "../api/project";
import { pickRepos } from "./github";
import { createRateLimiter } from "./rateLimit";

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/x", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GET /api/health", () => {
  it("reports status and configured services", async () => {
    const body = await health().json();
    expect(body).toMatchObject({ status: "ok", services: { contact: false } });
  });
});

describe("GET /api/project", () => {
  it("serves the study results with CDN caching", async () => {
    const res = project();
    expect(res.headers.get("cache-control")).toContain("s-maxage");
    const body = await res.json();
    expect(body.models[0].name).toBe("Random Forest");
  });
});

describe("POST /api/analyze", () => {
  const signals = [
    { id: "a", values: [0, 1, 2, 3] },
    { id: "b", values: [0, 1, 2, 3] },
    { id: "c", values: [3, 2, 1, 0] },
  ];

  it("screens outliers from JSON input", async () => {
    const res = await analyze(post({ signals, threshold: 1 }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.rows.map((r: { isOutlier: boolean }) => r.isOutlier)).toEqual([false, false, true]);
    expect(body.stats).toHaveLength(3);
  });

  it("accepts a raw CSV body", async () => {
    const req = new Request("http://localhost/api/analyze?threshold=1", {
      method: "POST",
      headers: { "content-type": "text/csv" },
      body: "id,X1,X2,y\np1,1,2,3\np2,2,1,4\n",
    });
    const body = await (await analyze(req)).json();
    expect(body.rows.map((r: { id: string }) => r.id)).toEqual(["p1", "p2"]);
  });

  it("rejects signals of different lengths", async () => {
    const res = await analyze(post({ signals: [signals[0], { id: "d", values: [1, 2] }] }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/same number of samples/);
  });

  it("rejects malformed JSON", async () => {
    expect((await analyze(post("{oops"))).status).toBe(400);
  });
});

describe("POST /api/contact", () => {
  const message = { name: "Ada", email: "ada@example.com", message: "Hello, nice project!" };

  it("returns 503 when email is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect((await contact(post(message))).status).toBe(503);
  });

  it("validates input and sends mail through Resend", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("CONTACT_TO_EMAIL", "me@example.com");
    const fetchMock = vi.fn(async () => Response.json({ id: "1" }));
    vi.stubGlobal("fetch", fetchMock);

    const bad = await contact(
      post({ ...message, email: "nope" }, { "x-forwarded-for": "1.1.1.1" }),
    );
    expect(bad.status).toBe(400);

    const ok = await contact(post(message, { "x-forwarded-for": "1.1.1.2" }));
    expect(ok.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("silently drops honeypot submissions", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("CONTACT_TO_EMAIL", "me@example.com");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await contact(
      post({ ...message, website: "spam" }, { "x-forwarded-for": "1.1.1.3" }),
    );
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("rate limiter", () => {
  it("blocks requests over the limit until the window resets", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect([check("ip", 0).ok, check("ip", 1).ok, check("ip", 2).ok]).toEqual([true, true, false]);
    expect(check("ip", 1001).ok).toBe(true);
  });
});

describe("pickRepos", () => {
  const repo = (name: string, stars: number, extra = {}) => ({
    name,
    description: null,
    html_url: `https://github.com/u/${name}`,
    homepage: "",
    language: "Python",
    stargazers_count: stars,
    pushed_at: "2026-01-01T00:00:00Z",
    fork: false,
    archived: false,
    ...extra,
  });

  it("skips forks and archived repos and ranks by stars", () => {
    const picked = pickRepos([
      repo("low", 1),
      repo("fork", 99, { fork: true }),
      repo("old", 50, { archived: true }),
      repo("top", 10),
    ]);
    expect(picked.map((r) => r.name)).toEqual(["top", "low"]);
    expect(picked[0]?.homepage).toBeNull();
  });
});
