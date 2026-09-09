import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next. Turbopack's dev server has a
    // known issue (Next 16.3.4) where it sometimes duplicates this app's
    // own directory under itself (apps/web/apps/web/.next) when writing
    // dev output — harmless and gitignored, but needs a depth-agnostic
    // glob here too so a leftover copy can't break lint for everyone.
    "**/.next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
