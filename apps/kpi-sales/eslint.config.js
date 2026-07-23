import { nextJsConfig } from '@workspace/eslint-config/next-js';
import boundaries from 'eslint-plugin-boundaries';

/**
 * FSD-слои приложения: shared → entities → features → widgets → app.
 * entity не импортирует фичи/виджеты; фича — entities/shared/app-layer;
 * виджет — всё, кроме чужих виджетов не по index. app-layer (store,
 * providers, init) связывает всё.
 */
const fsdBoundaries = {
    files: ['modules/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
        'boundaries/elements': [
            { type: 'app-layer', pattern: 'modules/app/**' },
            { type: 'shared', pattern: 'modules/shared/**' },
            { type: 'entity', pattern: 'modules/entities/*/**', capture: ['slice'] },
            { type: 'feature', pattern: 'modules/feature/*/**', capture: ['slice'] },
            { type: 'widget', pattern: 'modules/widgets/*/**', capture: ['slice'] },
        ],
    },
    rules: {
        'boundaries/element-types': [
            'error',
            {
                default: 'disallow',
                rules: [
                    { from: 'shared', allow: ['shared'] },
                    {
                        from: 'app-layer',
                        allow: ['app-layer', 'shared', 'entity', 'feature', 'widget'],
                    },
                    { from: 'entity', allow: ['entity', 'shared', 'app-layer'] },
                    {
                        from: 'feature',
                        allow: ['feature', 'entity', 'shared', 'app-layer'],
                    },
                    {
                        from: 'widget',
                        allow: ['widget', 'feature', 'entity', 'shared', 'app-layer'],
                    },
                ],
            },
        ],
    },
};

/** @type {import("eslint").Linter.Config[]} */
export default [...(Array.isArray(nextJsConfig) ? nextJsConfig : [nextJsConfig]), fsdBoundaries];
