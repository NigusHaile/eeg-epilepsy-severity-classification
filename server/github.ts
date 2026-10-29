import type { Repo } from "../src/lib/api.js";

type GitHubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  topics?: string[];
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};

const MAX_REPOS = 6;

export function toRepo(r: GitHubRepo): Repo {
  return {
    name: r.name,
    description: r.description,
    url: r.html_url,
    homepage: r.homepage || null,
    language: r.language,
    stars: r.stargazers_count,
    topics: r.topics ?? [],
    pushedAt: r.pushed_at,
  };
}

/** Own, active repositories ranked by stars, then by most recent push. */
export function pickRepos(repos: GitHubRepo[]): Repo[] {
  return repos
    .filter((r) => !r.fork && !r.archived)
    .sort(
      (a, b) => b.stargazers_count - a.stargazers_count || b.pushed_at.localeCompare(a.pushed_at),
    )
    .slice(0, MAX_REPOS)
    .map(toRepo);
}

export async function fetchRepos(username: string, token?: string): Promise<Repo[]> {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
    {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "eeg-severity-lab",
        ...(token && { authorization: `Bearer ${token}` }),
      },
    },
  );
  if (!res.ok) throw new Error(`GitHub API responded with ${res.status}.`);
  return pickRepos((await res.json()) as GitHubRepo[]);
}
