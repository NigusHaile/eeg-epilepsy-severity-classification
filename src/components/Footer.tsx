import { AUTHOR, SITE } from "@/data/project";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6">
        <span>{AUTHOR.name}</span>
        <span>
          {SITE.title} · {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
