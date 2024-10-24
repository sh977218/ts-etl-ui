import _import from "eslint-plugin-import";
import { fixupPluginRules } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@angular-eslint/recommended",
    "plugin:@angular-eslint/template/process-inline-templates",
    "prettier",
).map(config => ({
    ...config,
    files: ["projects/**/*.ts"],
})), {
    files: ["projects/**/*.ts"],

    plugins: {
        import: fixupPluginRules(_import),
    },

    languageOptions: {
        ecmaVersion: 5,
        sourceType: "module",
    },

    rules: {
        "@angular-eslint/component-selector": ["error", {
            type: "element",
            prefix: "app",
            style: "kebab-case",
        }],

        "import/order": [1, {
            groups: ["external", "builtin", "internal", "sibling", "parent", "index"],
            "newlines-between": "always",

            alphabetize: {
                order: "asc",
                caseInsensitive: false,
            },
        }],
    },
}, ...compat.extends(
    "plugin:@angular-eslint/template/recommended",
    "plugin:@angular-eslint/template/accessibility",
).map(config => ({
    ...config,
    files: ["projects/**/*.html"],
})), {
    files: ["projects/**/*.html"],
    rules: {},
}, ...compat.extends("eslint:recommended").map(config => ({
    ...config,
    files: ["server/*.js"],
})), {
    files: ["server/*.js"],
    rules: {},
}];