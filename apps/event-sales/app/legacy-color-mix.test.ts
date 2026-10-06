import { describe, expect, it } from 'vitest';
// Относительный путь: модуль сборки (CommonJS) лежит в пакете UI рядом с
// postcss-конфигом, а тестового раннера у самого пакета нет.
import legacyColorMix from '../../../packages/ui/postcss-legacy-color-mix.cjs';

const { pickColorMixFallback } = legacyColorMix as {
    pickColorMixFallback: (
        prop: string,
        mixValue: string,
        currentFallback: string,
    ) => string | null;
};

const mix = (inner: string) => `color-mix(in oklab, ${inner})`;

/**
 * Старые браузеры (Chrome до 111 — потолок Windows 7) не знают color-mix().
 * Запасное значение Tailwind — первый цвет смеси целиком: «10% зелёного»
 * превращались в сплошной зелёный, карточки дел заливались цветом типа.
 * Здесь закреплено, каким запасное значение должно быть.
 */
describe('запасной цвет для браузеров без color-mix()', () => {
    it('карточка дела: вместо цвета типа — цвет карточки и рамки', () => {
        expect(
            pickColorMixFallback(
                'background-color',
                mix('var(--event-current), var(--card) 95%'),
                'var(--event-current)',
            ),
        ).toBe('var(--card)');
        expect(
            pickColorMixFallback(
                'border-color',
                mix('var(--event-current), var(--border) 72%'),
                'var(--event-current)',
            ),
        ).toBe('var(--border)');
    });

    it('еле заметная заливка (bg-success/10) — прозрачный фон, а не сплошной тон', () => {
        expect(
            pickColorMixFallback(
                'background-color',
                mix('var(--success) 10%, transparent'),
                'var(--success)',
            ),
        ).toBe('transparent');
    });

    it('плотная заливка (hover 90%) остаётся цветом как была', () => {
        expect(
            pickColorMixFallback(
                'background-color',
                mix('var(--primary) 90%, transparent'),
                'var(--primary)',
            ),
        ).toBeNull();
    });

    it('текст мягкого бэйджа — нейтральный читаемый, а не тон по тону', () => {
        expect(
            pickColorMixFallback(
                'color',
                mix('var(--success), var(--foreground) var(--tone-soft-mix)'),
                'var(--success)',
            ),
        ).toBe('var(--foreground)');
    });

    it('полупрозрачный текст, рамка и кольцо не исчезают — остаются цветом', () => {
        const faded = mix('var(--muted-foreground) 40%, transparent');

        expect(
            pickColorMixFallback('color', faded, 'var(--muted-foreground)'),
        ).toBeNull();
        expect(
            pickColorMixFallback(
                'border-color',
                mix('var(--event-current) 40%, transparent'),
                'var(--event-current)',
            ),
        ).toBeNull();
        expect(
            pickColorMixFallback(
                '--tw-ring-color',
                mix('var(--event-current) 40%, transparent'),
                'var(--event-current)',
            ),
        ).toBeNull();
    });

    it('минифицированная запись без пробелов разбирается так же', () => {
        expect(
            pickColorMixFallback(
                'background-color',
                'color-mix(in oklab,var(--event-current),var(--card)95%)',
                'var(--event-current)',
            ),
        ).toBe('var(--card)');
    });

    it('посчитанное сборкой статическое значение не трогается', () => {
        expect(
            pickColorMixFallback(
                'background-color',
                mix('var(--color-black) 50%, transparent'),
                '#00000080',
            ),
        ).toBeNull();
    });

    it('не color-mix и составные значения — без изменений', () => {
        expect(
            pickColorMixFallback('color', 'var(--success)', 'var(--success)'),
        ).toBeNull();
        expect(
            pickColorMixFallback(
                'box-shadow',
                `0 0 0 1px ${mix('var(--ring) 40%, transparent')}`,
                'var(--ring)',
            ),
        ).toBeNull();
    });
});
