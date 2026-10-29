/**
 * Study results and project description, served by GET /api/project.
 * Edit here to update the site without touching the frontend.
 */

import type { ModelResult, ProjectContent } from "../src/lib/api.js";

const metrics = [
  { value: "0.88", label: "Test accuracy" },
  { value: "0.92", label: "ROC-AUC" },
  { value: "96", label: "PCA components" },
  { value: "200", label: "Recordings" },
];

const models: ModelResult[] = [
  {
    name: "Random Forest",
    representation: "Raw standardized features",
    cvMean: 0.74,
    cvStd: 0.08,
    testAccuracy: 0.88,
    rocAuc: 0.92,
  },
  {
    name: "Logistic Regression (L1)",
    representation: "96 PCA components",
    cvMean: 0.71,
    cvStd: 0.07,
    testAccuracy: 0.8,
    rocAuc: 0.83,
  },
  {
    name: "Stacking Ensemble",
    representation: "Top-3 by CV + LR meta-learner",
    cvMean: 0.74,
    cvStd: 0.06,
    testAccuracy: 0.78,
    rocAuc: 0.87,
  },
  {
    name: "SVM (Linear, C=0.001)",
    representation: "96 PCA components",
    cvMean: 0.76,
    cvStd: 0.04,
    testAccuracy: 0.75,
    rocAuc: 0.79,
  },
  {
    name: "SVM (RBF)",
    representation: "96 PCA components",
    cvMean: 0.66,
    cvStd: 0.04,
    testAccuracy: 0.73,
    rocAuc: 0.97,
  },
];

const pipeline = [
  { title: "Split", detail: "Stratified 80/20 — 160 train, 40 test recordings" },
  { title: "Normalize", detail: "Per-signal min–max scaling to [0, 1]" },
  { title: "Screen", detail: "RMS z-score outlier detection at 1.0σ" },
  { title: "Reduce", detail: "Standardize + PCA — 96 components, 95.05% variance" },
  { title: "Learn", detail: "4 classifiers + stacking, tuned with 5-fold CV" },
];

const highlights = [
  {
    title: "Leak-free evaluation",
    detail:
      "Every transform — scaling, PCA, model selection — is fitted on training folds only, so test scores reflect genuinely unseen patients.",
  },
  {
    title: "Model comparison",
    detail:
      "Linear, kernel, tree and ensemble models benchmarked side by side on CV accuracy, held-out accuracy and ROC-AUC.",
  },
  {
    title: "Notebook → product",
    detail:
      "The Python analysis was ported to a typed, unit-tested TypeScript library that runs in the browser and behind a serverless API.",
  },
];

const techStack = [
  "Python",
  "scikit-learn",
  "NumPy / pandas",
  "PCA",
  "TypeScript",
  "React",
  "Tailwind CSS",
  "Node.js",
  "Serverless API",
  "Zod",
  "Vitest",
  "Vercel",
];

export const PROJECT_CONTENT: ProjectContent = { metrics, pipeline, models, highlights, techStack };
