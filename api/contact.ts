import { z } from "zod";

import { env } from "../server/env.js";
import { clientIp, error, json, parseJson } from "../server/http.js";
import { sendMail } from "../server/mailer.js";
import { createRateLimiter } from "../server/rateLimit.js";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z.email("Please enter a valid email address.").max(200),
  message: z.string().trim().min(10, "Message should be at least 10 characters.").max(5000),
  website: z.string().optional(),
});

const limiter = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

export async function POST(request: Request): Promise<Response> {
  if (!env.contactConfigured) {
    return error(503, "The contact form is not available right now. Please try again later.");
  }

  const { ok, retryAfterS } = limiter(clientIp(request));
  if (!ok) {
    return error(429, "Too many messages. Please try again later.", {
      "retry-after": String(retryAfterS),
    });
  }

  const parsed = await parseJson(request, schema, 20_000);
  if ("response" in parsed) return parsed.response;
  const { name, email, message, website } = parsed.data;

  // Bots fill the hidden field; pretend success so they don't retry.
  if (website) return json({ ok: true });

  try {
    await sendMail({
      replyTo: email,
      subject: `Portfolio message from ${name.replace(/[\r\n]+/g, " ")}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return error(502, "Your message could not be sent. Please try again later.");
  }
}
