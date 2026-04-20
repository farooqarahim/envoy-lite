import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    files: ["src/**/*.ts", "test/**/*.ts", "bench/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.json"
      }
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["error", { allow: ["error"] }],
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: "Do not read process.env directly. Use the source resolver."
        }
      ]
    }
  },
  {
    files: ["test/**/*.ts", "bench/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-restricted-syntax": "off"
    }
  },
  {
    ignores: ["dist", "node_modules", "examples", "coverage", "test/compatibility/deno.test.ts"]
  }
];
