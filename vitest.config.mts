import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const src = path.resolve(import.meta.dirname, "./src");

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Playwright-tests draaien apart via `pnpm test:e2e`. De verdeling over de
    // twee projecten hieronder bepaalt welk bestand waar draait; een gedeelde
    // `include` zou beide projecten alles laten oppakken.
    projects: [
      {
        // Componenten hebben een browserachtige omgeving nodig.
        extends: true,
        test: {
          name: "componenten",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
        },
      },
      {
        // Servercode draait in Node, zoals in productie.
        extends: true,
        test: {
          name: "server",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@": src,
      // `server-only` gooit buiten een React-servercontext. In tests roepen we
      // die modules rechtstreeks aan, dus vervangen we hem door een lege stub.
      "server-only": path.resolve(src, "../vitest.server-only-stub.ts"),
    },
  },
});
