/// <reference types="vitest/config" />
import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

import { devApi } from "./server/devApi";

export default defineConfig(({ mode }) => {
  // Expose .env values to the API handlers in dev, matching Vercel's runtime.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    plugins: [react(), tailwindcss(), devApi()],
    resolve: {
      alias: { "@": path.resolve(import.meta.dirname, "./src") },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.test.{ts,tsx}", "server/**/*.test.ts"],
    },
  };
});
