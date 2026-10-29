import { ExternalLink, Star } from "lucide-react";

import { useApiQuery } from "@/hooks/useApiQuery";
import { api, type Repo } from "@/lib/api";

import { buttonClass } from "./ui/buttonClass";
import { GithubIcon } from "./ui/icons";
import { Section } from "./ui/Section";

const dateFormat = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" });

function RepoCard({ repo }: { repo: Repo }) {
  return (
    <li className="flex flex-col rounded-lg border bg-card p-5 transition-colors hover:border-primary/50">
      <div className="flex items-start justify-between gap-3">
        <a
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-sm font-medium hover:text-primary"
        >
          {repo.name}
        </a>
        {repo.stars > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5" /> {repo.stars}
          </span>
        )}
      </div>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">
        {repo.description ?? "No description yet."}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {repo.language && <span className="font-mono">{repo.language}</span>}
        <span>Updated {dateFormat.format(new Date(repo.pushedAt))}</span>
        {repo.homepage && (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            Live <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </li>
  );
}

/** Public GitHub repositories, served by GET /api/github. Hidden until a username is set. */
export function Projects() {
  const { data } = useApiQuery(api.repos);
  if (!data?.configured || data.repos.length === 0) return null;

  return (
    <Section
      id="projects"
      eyebrow="05 · More projects"
      title="Recent work on GitHub"
      description="Pulled live from the GitHub API and refreshed hourly."
      actions={
        <a
          href={`https://github.com/${data.username}`}
          target="_blank"
          rel="noreferrer"
          className={buttonClass("outline")}
        >
          <GithubIcon className="size-4" /> @{data.username}
        </a>
      }
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.repos.map((repo) => (
          <RepoCard key={repo.name} repo={repo} />
        ))}
      </ul>
    </Section>
  );
}
