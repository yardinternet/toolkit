import globals from "globals";
import babelParser from "@babel/eslint-parser";
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

export default [
    ...compat.extends("plugin:@wordpress/eslint-plugin/recommended", "prettier"),
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                CLI: "readonly",
                wp: "readonly",
            },

            parser: babelParser,
            ecmaVersion: 5,
            sourceType: "commonjs",

            parserOptions: {
                requireConfigFile: false,

                babelOptions: {
                    presets: ["@babel/preset-react"],
                },

                ecmaFeatures: {
                    jsx: true,
                },
            },
        },

        rules: {
            "prettier/prettier": 0,
            "jsdoc/require-param": 0,

            "no-unused-expressions": ["error", {
                allowTernary: true,
            }],
        },
    },
];