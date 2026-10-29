import { Moon, Sun } from "lucide-react";

import { SITE } from "@/data/project";
import { useTheme } from "@/hooks/useTheme";

import { Button } from "./ui/Button";
import { buttonClass } from "./ui/buttonClass";
import { GithubIcon } from "./ui/icons";

const NAV = [
  { href: "#lab", label: "Lab" },
  { href: "#pipeline", label: "Pipeline" },
  { href: "#results", label: "Results" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="font-mono text-sm font-medium tracking-tight">
          EEG/SEVERITY·LAB
        </a>
        <nav className="flex items-center gap-1">
          <ul className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={buttonClass("ghost", "h-8 px-3")}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          {SITE.repoUrl && (
            <a
              href={SITE.repoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Source code on GitHub"
              className={buttonClass("ghost", "h-8 w-8 px-0")}
            >
              <GithubIcon className="size-4" />
            </a>
          )}
          <Button
            variant="ghost"
            className="h-8 w-8 px-0"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </nav>
      </div>
    </header>
  );
}
