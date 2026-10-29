import type { HealthResponse } from "../src/lib/api.js";
import { env } from "../server/env.js";
import { json } from "../server/http.js";

export function GET(): Response {
  const body: HealthResponse = {
    status: "ok",
    time: new Date().toISOString(),
    services: { contact: env.contactConfigured, github: Boolean(env.githubUsername) },
  };
  return json(body);
}
