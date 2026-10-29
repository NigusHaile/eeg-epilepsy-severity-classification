import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Reveal } from "./Reveal";

type SectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  actions,
  className,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn("py-16 sm:py-20", className)}>
      <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
            {description && <p className="mt-2 text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
        <div className="mt-8">{children}</div>
      </Reveal>
    </section>
  );
}
