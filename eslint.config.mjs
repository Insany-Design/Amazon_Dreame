import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "next-env.d.ts",
    // Generated runtime and template source are validated by the prototype tests.
    "dc-runtime.js",
    "interactions.js",
    // Public files are generated from the root source before every build.
    "public/**",
  ]),
]);

export default eslintConfig;
