import js from '@eslint/js';
import pluginNext from '@next/eslint-plugin-next';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { config as baseConfig } from './base.js';

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const nextJsConfig = [
    ...baseConfig,
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    {
        ...pluginReact.configs.flat.recommended,
        languageOptions: {
            ...pluginReact.configs.flat.recommended.languageOptions,
            globals: {
                ...globals.serviceworker,
            },
        },
    },
    {
        plugins: {
            '@next/next': pluginNext,
        },
        rules: {
            ...pluginNext.configs.recommended.rules,
            ...pluginNext.configs['core-web-vitals'].rules,
        },
    },
    {
        plugins: {
            'react-hooks': pluginReactHooks,
        },
        settings: { react: { version: 'detect' } },
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
            // React scope no longer necessary with new JSX transform.
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
    },
    {
        // Запрет сырых Bitrix-вызовов в приложениях: все обращения к REST —
        // только через типизированные доменные сервисы @workspace/bitrix
        // (bitrix.listItem.get, bitrix.deal.get, ...). Недостающий метод
        // добавляется в пакет по образцу back/libs/bitrix, а не сырым вызовом.
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector:
                        "CallExpression[callee.property.name='call'][callee.object.property.name='api']",
                    message:
                        'Сырой api.call запрещён: используй типизированный домен @workspace/bitrix (bitrix.<domain>.<method>) или добавь недостающий метод в пакет по образцу back/libs/bitrix.',
                },
            ],
        },
    },
];
