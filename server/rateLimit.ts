/**
 * Fixed-window, in-memory rate limiter.
 *
 * Serverless instances are short-lived and not shared, so this is a speed bump against
 * casual abuse rather than a hard guarantee. Swap in Redis/KV if that ever matters.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function check(key: string, now = Date.now()): { ok: boolean; retryAfterS: number } {
    if (hits.size > 10_000) {
      for (const [k, e] of hits) if (e.resetAt <= now) hits.delete(k);
    }

    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, retryAfterS: 0 };
    }
    entry.count++;
    return { ok: entry.count <= limit, retryAfterS: Math.ceil((entry.resetAt - now) / 1000) };
  };
}
