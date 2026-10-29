import type { ReposResponse } from "../src/lib/api.js";
import { env } from "../server/env.js";
import { fetchRepos } from "../server/github.js";
import { error, json } from "../server/http.js";

// Cached on Vercel's CDN for an hour so visitors never hit GitHub's rate limit.
const CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";

export async function GET(): Promise<Response> {
  const username = env.githubUsername;
  if (!username) {
    const body: ReposResponse = { configured: false, username: null, repos: [] };
    return json(body, { headers: { "cache-control": CACHE } });
  }

  try {
    const repos = await fetchRepos(username, env.githubToken);
    const body: ReposResponse = { configured: true, username, repos };
    return json(body, { headers: { "cache-control": CACHE } });
  } catch (e) {
    console.error(e);
    return error(502, "Could not load projects from GitHub.");
  }
}
