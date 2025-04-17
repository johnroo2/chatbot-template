import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{ ignores: ['dist'] },
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parser: tseslint.parser,
			parserOptions: {
				project: ['./tsconfig.json'],
				tsconfigRootDir: '.',
				ecmaFeatures: {
					jsx: true
				}
			}
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			'import': importPlugin,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
			'semi': ['warn', 'always'],
			'quotes': ['warn', 'single'],
			'no-restricted-imports': [
				'warn',
				{
					'patterns': [
						'./*/*',
						'../*',
					]
				}
			],
			'indent': ['warn', 'tab', { 'SwitchCase': 1 }],
			'no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],
			'import/order': [
				'warn',
				{
					'alphabetize': { 'order': 'asc', 'caseInsensitive': true }, // Enforce alphabetical order
					'groups': [
						['builtin', 'external'],
						['internal'],
						['parent', 'sibling', 'index']
					],
					'newlines-between': 'always'
				}
			],
			'no-unused-vars': ['warn', { 
				'varsIgnorePattern': 'enum$',
				'ignoreRestSiblings': true
			}],
		},
	},
);