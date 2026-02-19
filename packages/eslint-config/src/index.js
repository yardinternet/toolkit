const { defineConfig } = require("eslint/config");
const wordpressPlugin = require('@wordpress/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');
const importPlugin = require('eslint-plugin-import');
const globals = require('globals');
const babelParser = require('@babel/eslint-parser');

module.exports = defineConfig([
    {
        files: [ '**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx' ],
        plugins: {
			'@wordpress': wordpressPlugin,
			prettier: prettierPlugin,
            import: importPlugin,
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                CLI: 'readonly',
                wp: 'readonly',
            },
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    presets: [ '@babel/preset-react' ],
                },
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: 2022,
                sourceType: 'module',
            },
        },
        rules: {
  			...wordpressPlugin.configs.recommended.rules,
            'prettier/prettier': 'error',
            'jsdoc/require-param': 0,
            'no-unused-expressions': [
                'error',
                {
                    allowTernary: true,
                },
            ],
            'import/no-unresolved': [
                'error',
                { ignore: ['^@wordpress/'] },
            ],
        },
        settings: {
            react: {
                version: '19.0',
            },
            'import/resolver': {
                alias: [
                    [
                        '@sage/scripts',
                        './web/app/themes/sage/resources/scripts',
                    ],
                ],
            },
        },
    },
]);
