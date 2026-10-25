import { nextJsConfig } from '@workspace/eslint-config/next-js';
import boundaries from 'eslint-plugin-boundaries';

/**
 * FSD-слои приложения (снизу вверх):
 * shared → entities → features → widgets → pages → processes → app-layer.
 *
 * Слой импортирует только слои ниже себя и свой (через index соседа).
 * app-layer (store, providers, init, hooks redux) связывает всё; entities и
 * features могут брать из него хуки стора и экшены app (как в kpi-sales).
 *
 * `legacy` — замороженный HTML-КП стек (`/offer/**`, решение владельца
 * 24.10.2026: оставить, не использовать). Внутри себя он нарушает слои и
 * ходит в монолит; наружу из него импортировать нельзя никому, кроме
 * app-layer (store собирает его редьюсеры).
 */
const LEGACY_SLICES = [
    'modules/entities/offer/**',
    'modules/entities/offer-template/**',
    'modules/entities/offer-template-block/**',
    'modules/entities/offer-template-konstructor/**',
    'modules/entities/complect/**',
    'modules/entities/infoblock/**',
    'modules/features/position/**',
    'modules/pages/offer-preview/**',
    'modules/pages/offer-template-konstructor/**',
    'modules/widgets/offer/**',
];

const fsdBoundaries = {
    files: ['modules/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
        'boundaries/elements': [
            ...LEGACY_SLICES.map(pattern => ({ type: 'legacy', pattern })),
            { type: 'app-layer', pattern: 'modules/app/**' },
            { type: 'shared', pattern: 'modules/shared/**' },
            { type: 'entity', pattern: 'modules/entities/*/**', capture: ['slice'] },
            { type: 'feature', pattern: 'modules/features/*/**', capture: ['slice'] },
            { type: 'widget', pattern: 'modules/widgets/*/**', capture: ['slice'] },
            { type: 'page', pattern: 'modules/pages/*/**', capture: ['slice'] },
            { type: 'process', pattern: 'modules/processes/*/**', capture: ['slice'] },
        ],
    },
    rules: {
        'boundaries/element-types': [
            'error',
            {
                default: 'disallow',
                rules: [
                    { from: 'shared', allow: ['shared'] },
                    { from: 'entity', allow: ['entity', 'shared', 'app-layer'] },
                    {
                        from: 'feature',
                        allow: ['feature', 'entity', 'shared', 'app-layer'],
                    },
                    {
                        from: 'widget',
                        allow: ['widget', 'feature', 'entity', 'shared', 'app-layer'],
                    },
                    {
                        from: 'page',
                        allow: ['page', 'widget', 'feature', 'entity', 'shared', 'app-layer'],
                    },
                    {
                        from: 'process',
                        allow: [
                            'process',
                            'page',
                            'widget',
                            'feature',
                            'entity',
                            'shared',
                            'app-layer',
                        ],
                    },
                    {
                        from: 'app-layer',
                        allow: [
                            'app-layer',
                            'shared',
                            'entity',
                            'feature',
                            'widget',
                            'page',
                            'process',
                            'legacy',
                        ],
                    },
                    { from: 'legacy', allow: ['legacy', 'shared', 'entity', 'app-layer'] },
                ],
            },
        ],
    },
};

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...(Array.isArray(nextJsConfig) ? nextJsConfig : [nextJsConfig]),
    fsdBoundaries,
];
