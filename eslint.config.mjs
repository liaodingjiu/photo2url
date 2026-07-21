import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",    // Cloudflare bindings use any
      "@next/next/no-img-element": "off",              // R2 CDN images don't use next/image
      "@next/next/no-html-link-for-pages": "off",      // Some links are external or dynamic
    },
  },
];

export default eslintConfig;
