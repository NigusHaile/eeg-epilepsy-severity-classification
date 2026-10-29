import { useProject } from "@/hooks/useProject";

import { Loadable } from "./ui/Loadable";
import { Section } from "./ui/Section";

export function Pipeline() {
  const { data, error } = useProject();

  return (
    <Section
      id="pipeline"
      eyebrow="02 · Pipeline"
      title="Five stages, fitted only on training data"
      description="Each transform is learned on the training folds and then applied unchanged to held-out patients, so no information leaks into evaluation."
    >
      <Loadable data={data?.pipeline} error={error} skeletonClassName="h-32">
        {(pipeline) => (
          <ol className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-5">
            {pipeline.map((stage, i) => (
              <li key={stage.title} className="group bg-card p-5 transition-colors hover:bg-muted">
                <div className="font-mono text-xs text-primary">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-1 font-medium">{stage.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stage.detail}</div>
              </li>
            ))}
          </ol>
        )}
      </Loadable>
    </Section>
  );
}
