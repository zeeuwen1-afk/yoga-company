import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Features mogen elkaars interne server-/componentmappen niet importeren;
    // uitwisseling loopt uitsluitend via de publieke index.ts (BOUWPROMPT §4).
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/server/*", "@/features/*/components/*"],
              message:
                "Importeer een andere feature alleen via zijn publieke index.ts (BOUWPROMPT §4).",
            },
          ],
        },
      ],
    },
  },
  {
    // UI-componenten kennen geen database (BOUWPROMPT §4).
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/server/*", "@/lib/supabase/*"],
              message:
                "UI-componenten mogen geen datatoegang bevatten (BOUWPROMPT §4).",
            },
          ],
        },
      ],
    },
  },
  prettier,
];

export default eslintConfig;
