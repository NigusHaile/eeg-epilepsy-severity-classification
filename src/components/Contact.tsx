import { AUTHOR } from "@/data/project";

import { ContactForm } from "./ContactForm";
import { buttonClass } from "./ui/buttonClass";
import { GithubIcon, LinkedinIcon } from "./ui/icons";
import { Section } from "./ui/Section";

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export function Contact() {
  const links = [
    AUTHOR.githubUsername && {
      href: `https://github.com/${AUTHOR.githubUsername}`,
      label: "GitHub",
      Icon: GithubIcon,
    },
    AUTHOR.linkedin && { href: AUTHOR.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof GithubIcon }[];

  return (
    <Section
      id="contact"
      eyebrow="06 · Contact"
      title="Let's talk"
      description="Open to conversations about biomedical signal processing, applied ML and data-driven healthcare."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/15 font-mono font-medium text-primary">
              {initials(AUTHOR.name)}
            </div>
            <div>
              <div className="text-lg font-medium">{AUTHOR.name}</div>
              <div className="text-sm text-muted-foreground">{AUTHOR.role}</div>
            </div>
          </div>
          <p className="mt-4 text-sm">{AUTHOR.bio}</p>
          {links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {links.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass("outline")}
                >
                  <Icon className="size-4" /> {label}
                </a>
              ))}
            </div>
          )}
        </div>
        <ContactForm />
      </div>
    </Section>
  );
}
