import { CheckCircle2, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

import { api } from "@/lib/api";

import { Button } from "./ui/Button";

type Status = { state: "idle" | "sending" | "sent" } | { state: "error"; message: string };

const fieldClass =
  "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

/** Posts to /api/contact, which emails the message to the site owner. */
export function ContactForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const field = (name: string) => String(new FormData(form).get(name) ?? "");

    setStatus({ state: "sending" });
    try {
      await api.contact({
        name: field("name"),
        email: field("email"),
        message: field("message"),
        website: field("website"),
      });
      form.reset();
      setStatus({ state: "sent" });
    } catch (err) {
      setStatus({ state: "error", message: (err as Error).message });
    }
  };

  if (status.state === "sent") {
    return (
      <div role="status" className="flex items-center gap-3 rounded-lg border bg-card p-6">
        <CheckCircle2 className="size-5 text-primary" />
        <p className="text-sm">Thanks — your message is on its way. I'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="eyebrow">Name</span>
          <input name="name" required maxLength={100} autoComplete="name" className={fieldClass} />
        </label>
        <label className="space-y-1.5">
          <span className="eyebrow">Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            className={fieldClass}
          />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="eyebrow">Message</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          className={fieldClass}
        />
      </label>
      {/* Honeypot: invisible to people, tempting to bots. */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {status.state === "error" && (
        <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {status.message}
        </p>
      )}
      <Button type="submit" disabled={status.state === "sending"}>
        <Send className="size-4" />
        {status.state === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
