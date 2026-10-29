/**
 * Frontend configuration: site identity, author and bundled samples.
 * Study results are served by the API — see server/content.ts.
 */

export const SITE = {
  title: "EEG Severity Lab",
  tagline: "Epilepsy severity · level 3 vs level 4",
  course: "Signal & Imaging Acquisition and Modelling in Healthcare",
  /** Public GitHub repository. Leave empty to hide the "Source code" buttons. */
  repoUrl: "",
};

export type Author = {
  name: string;
  role: string;
  /** Short pitch shown in the contact section. */
  bio: string;
  /** Enables the GitHub link and the live "More projects" section (GET /api/github). */
  githubUsername?: string;
  linkedin?: string;
};

/** Fill in the links below; each one only appears once it is set. */
export const AUTHOR: Author = {
  name: "Nigus Bezabh Haile",
  role: "Biomedical signal processing · Machine learning · Web development",
  bio: "I designed the ML pipeline, ran the model comparison and turned the analysis into this interactive web app.",
};

export const SAMPLES = [
  { file: "/samples/sample_signals.csv", label: "Labeled sample" },
  { file: "/samples/sample_signals_unlabeled.csv", label: "Unlabeled sample" },
] as const;
