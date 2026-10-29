import { env } from "./env.js";

type Mail = { replyTo: string; subject: string; text: string };

/** Sends a plain-text email through Resend's REST API. */
export async function sendMail({ replyTo, subject, text }: Mail): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.resendApiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.contactFrom,
      to: [env.contactTo],
      reply_to: replyTo,
      subject,
      text,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend responded with ${res.status}: ${await res.text()}`);
  }
}
