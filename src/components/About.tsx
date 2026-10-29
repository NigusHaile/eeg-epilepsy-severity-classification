import { CheckCircle2 } from "lucide-react";

import { SITE } from "@/data/project";
import { useProject } from "@/hooks/useProject";

import { Loadable } from "./ui/Loadable";
import { Section } from "./ui/Section";

export function About() {
  const { data, error } = useProject();

  return (
    <Section
      id="about"
      eyebrow="04 · About the project"
      title="From a research notebook to an interactive tool"
      description={
        <>
          Built for the course <em>{SITE.course}</em>. The goal: distinguish two adjacent epilepsy
          severity levels — a harder problem than seizure vs. non-seizure — using only raw EEG
          amplitude.
        </>
      }
      className="border-t bg-card/40"
    >
      <Loadable data={data} error={error} skeletonClassName="h-48">
        {({ highlights, techStack }) => (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map((h) => (
                <article key={h.title} className="rounded-lg border bg-card p-5">
                  <CheckCircle2 className="size-5 text-primary" />
                  <h3 className="mt-3 font-medium">{h.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{h.detail}</p>
                </article>
              ))}
            </div>

            <div className="mt-8">
              <p className="eyebrow">Tech stack</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {techStack.map((t) => (
                  <li key={t} className="rounded-full border bg-card px-3 py-1 font-mono text-xs">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </Loadable>
    </Section>
  );
}
