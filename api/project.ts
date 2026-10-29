import { PROJECT_CONTENT } from "../server/content.js";
import { json } from "../server/http.js";

export function GET(): Response {
  return json(PROJECT_CONTENT, {
    headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=86400" },
  });
}
