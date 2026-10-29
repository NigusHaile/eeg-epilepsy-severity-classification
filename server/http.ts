import type { z } from "zod";

/** JSON response with sensible defaults; API responses are not cached unless asked. */
export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  if (!headers.has("cache-control")) headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function error(status: number, message: string, headers?: HeadersInit): Response {
  return json({ error: message }, { status, ...(headers && { headers }) });
}

/** Reads and validates a JSON body, enforcing a size limit. */
export async function parseJson<T>(
  request: Request,
  schema: z.ZodType<T>,
  maxBytes: number,
): Promise<{ data: T } | { response: Response }> {
  const text = await request.text();
  if (text.length > maxBytes) {
    return { response: error(413, `Request body is larger than ${maxBytes / 1_000_000} MB.`) };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { response: error(400, "Request body must be valid JSON.") };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(".")}: ` : "";
    return { response: error(400, `${where}${issue?.message ?? "Invalid request."}`) };
  }
  return { data: result.data };
}

/** Best-effort client IP behind Vercel's proxy. */
export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
