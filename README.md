# EEG Severity Lab — Epilepsy Severity Classification

Classifying **epilepsy severity level 3 vs level 4** from raw EEG recordings, and an interactive
web app for exploring the signals in the browser.

**Live demo:** _add your Vercel URL here_

| Test accuracy | ROC-AUC  | Recordings | Samples / recording |
| :-----------: | :------: | :--------: | :-----------------: |
|   **0.88**    | **0.92** |    200     |        4,094        |

## Overview

Telling two _adjacent_ severity grades apart is much harder than separating seizure from
non-seizure activity. This project builds a leak-free classical machine-learning pipeline on raw EEG
amplitude and compares linear, kernel, tree-based and ensemble models on unseen patients.

The analysis started in a Python / scikit-learn notebook. Its preprocessing steps were then ported
to a typed, unit-tested TypeScript library that powers the web app.

### Pipeline

1. **Split:** stratified 80/20 (160 train, 40 test recordings)
2. **Normalize:** per-signal min–max scaling to [0, 1]
3. **Screen:** RMS z-score outlier detection against a pointwise mean ± 1σ band
4. **Reduce:** standardization + PCA (96 components, 95.05% variance)
5. **Learn:** four classifiers plus a stacking ensemble, tuned with 5-fold CV

Every transform is fitted on training folds only.

### Results (held-out test set, 40 recordings)

| Model                    | Representation        | CV accuracy | Test accuracy | ROC-AUC  |
| ------------------------ | --------------------- | ----------- | ------------- | -------- |
| **Random Forest**        | Standardized features | 0.74 ± 0.08 | **0.88**      | 0.92     |
| Logistic Regression (L1) | 96 PCA components     | 0.71 ± 0.07 | 0.80          | 0.83     |
| Stacking Ensemble        | Top-3 + LR meta       | 0.74 ± 0.06 | 0.78          | 0.87     |
| SVM (Linear, C=0.001)    | 96 PCA components     | 0.76 ± 0.04 | 0.75          | 0.79     |
| SVM (RBF)                | 96 PCA components     | 0.66 ± 0.04 | 0.73          | **0.97** |

## Features

- **Signal lab:** load the bundled samples or drag and drop your own CSV.
  - Raw-signal viewer with a hover readout, zoom windows and summary statistics.
  - All signals normalized with the mean ± 1σ band, with outliers highlighted live.
  - Adjustable outlier threshold and a ranked outlier table.
  - **Browser or server compute:** run the analysis locally, or switch to the serverless API.
    Both run the same `eeg.ts` code. Uploaded data is never stored.
- **Results from the API:** model results, pipeline and metrics are served by `/api/project`,
  so they can be updated without touching the frontend.
- **Live GitHub projects:** your latest public repositories, fetched from the GitHub API and
  cached on the CDN.
- **Contact form:** validated and rate-limited, with a spam honeypot. Messages are emailed to you
  through [Resend](https://resend.com).
- Light and dark themes, responsive layout, and support for reduced-motion settings.

## Architecture

```
Browser (React SPA)  ──fetch──▶  Vercel Functions (api/*.ts)  ──▶  GitHub API / Resend
        │                                  │
        └──────── src/lib/eeg.ts ◀─────────┘   shared analysis code + typed API contract
```

The frontend is a static Vite build. Each file in `api/` becomes a serverless function on
Vercel. In development, a small Vite plugin (`server/devApi.ts`) serves the same handlers, so
`npm run dev` runs the full stack with no extra tools.

### API

| Method | Endpoint       | Description                                                         |
| ------ | -------------- | ------------------------------------------------------------------- |
| GET    | `/api/health`  | Status and which optional services are configured                   |
| GET    | `/api/project` | Study results, pipeline, highlights and tech stack (CDN-cached)     |
| POST   | `/api/analyze` | Normalization, outlier screening and stats for a set of EEG signals |
| GET    | `/api/github`  | Public repositories of the configured GitHub user (cached 1 h)      |
| POST   | `/api/contact` | Sends a contact message by email (rate-limited)                     |

`/api/analyze` accepts JSON (`{ "signals": [{ "id", "values", "label?" }], "threshold": 1 }`)
or a raw CSV upload:

```sh
curl -X POST -H "content-type: text/csv" \
  --data-binary @public/samples/sample_signals.csv \
  "https://<your-site>.vercel.app/api/analyze?threshold=1"
```

Request bodies are validated with Zod. Errors are returned as `{ "error": "..." }` with a
suitable HTTP status code.

### CSV format

```
id,X1,X2,...,Xn,y
patient_1,29.0,27.0,...,3
```

The `id` column and the `y` label column (3 or 4) are optional.

## Tech stack

- **Research:** Python, scikit-learn, NumPy, pandas
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4
- **Backend:** Vercel Functions (Node.js, Web `Request`/`Response`), Zod, Resend, GitHub REST API
- **Quality:** Vitest, Testing Library, ESLint, Prettier, GitHub Actions

## Getting started

Requires Node.js 20 or newer.

```sh
npm install
cp .env.example .env   # optional: enables the contact form and GitHub section
npm run dev            # frontend + API on http://localhost:5173
npm test               # unit, component and API tests
npm run build          # type-check and production build
```

The site works without any environment variables. The contact form reports that it is
unavailable, and the GitHub section stays hidden.

### Environment variables

| Variable             | Required for   | Notes                                            |
| -------------------- | -------------- | ------------------------------------------------ |
| `RESEND_API_KEY`     | Contact form   | Free key from resend.com                         |
| `CONTACT_TO_EMAIL`   | Contact form   | Inbox that receives messages                     |
| `CONTACT_FROM_EMAIL` | Optional       | Sender on a Resend-verified domain               |
| `GITHUB_USERNAME`    | GitHub section | Or set `githubUsername` in `src/data/project.ts` |
| `GITHUB_TOKEN`       | Optional       | Raises GitHub's API rate limit; no scopes needed |

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository. The framework (**Vite**)
   and the `api/` functions are detected automatically.
3. Under **Settings → Environment Variables**, add the variables above.
4. Click **Deploy**. Redeploy after changing environment variables.

## Project structure

```
api/                  Serverless endpoints (one file per route)
server/               Backend helpers: HTTP utils, rate limiter, GitHub client, mailer,
                      study content, dev-server plugin, API tests
src/
  lib/eeg.ts          Signal analysis shared by browser and server
  lib/api.ts          Typed API contract and client
  data/project.ts     Site identity and author links (edit here)
  hooks/              Data fetching, analysis engine and theme state
  components/         Page sections, signal chart and contact form
  test/               Unit and component tests
public/samples/       Example EEG CSV files
```

## Author

**Nigus Bezabh Haile**

Built for the course _Signal & Imaging Acquisition and Modelling in Healthcare_.
