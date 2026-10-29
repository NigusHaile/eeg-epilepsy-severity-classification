# Project rules

- Vite + React single-page app with a serverless backend, deployed on Vercel. Each file in
  `api/` is one endpoint and exports Web-standard handlers (`GET`/`POST` taking a `Request`
  and returning a `Response`). Shared backend code lives in `server/`.
- In dev, `server/devApi.ts` (a Vite plugin) serves the `api/` handlers, so `npm run dev` runs
  the full stack.
- Backend imports use explicit `.js` extensions (for example `../server/http.js`) so the
  functions resolve as ES modules on Vercel.
- EEG analysis is pure TypeScript in `src/lib/eeg.ts` (ported from the original notebook),
  shared by the browser and `api/analyze.ts`. Keep math there, not in components or handlers,
  so it stays testable. Tests are in `src/test/eeg.test.ts`.
- The API contract (request and response types plus the client) lives in `src/lib/api.ts`.
  Update it together with the handlers.
- Study results are served from `server/content.ts`. Site identity and author links live in
  `src/data/project.ts`.
- Secrets come from environment variables only (see `.env.example`); never commit `.env`.
  Uploaded EEG data is never stored.
- Sample signal CSVs are served from `public/samples/`.
- Before committing, run `npm run lint`, `npm test` and `npm run build`.
