import { AUTHOR } from "../src/data/project.js";

/** Server-side configuration. Secrets come from environment variables (see .env.example). */
export const env = {
  get resendApiKey() {
    return process.env["RESEND_API_KEY"];
  },
  get contactTo() {
    return process.env["CONTACT_TO_EMAIL"];
  },
  get contactFrom() {
    return process.env["CONTACT_FROM_EMAIL"] || "EEG Severity Lab <onboarding@resend.dev>";
  },
  get githubUsername() {
    return process.env["GITHUB_USERNAME"] || AUTHOR.githubUsername;
  },
  get githubToken() {
    return process.env["GITHUB_TOKEN"];
  },
  get contactConfigured() {
    return Boolean(this.resendApiKey && this.contactTo);
  },
};
