import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveRenewalFontsDir } from './renewal-pdf.fonts';

/** Корень приложения apps/bitrix: от этого файла четыре уровня вверх. */
const APP_ROOT = resolve(__dirname, '..', '..', '..', '..', '..');

describe('где лежат шрифты PDF', () => {
    it('файлы шрифтов действительно есть в public', () => {
        // Шрифты обязаны лежать в public: только этот каталог Dockerfile.prod
        // копирует в прод-образ. Рядом с роутом они работали бы в dev и
        // давали 500 на проде — так и случилось 02.11.2026.
        const dir = join(APP_ROOT, 'public', 'fonts', 'pt-sans');
        expect(existsSync(join(dir, 'PT_Sans-Web-Regular.ttf'))).toBe(true);
        expect(existsSync(join(dir, 'PT_Sans-Web-Bold.ttf'))).toBe(true);
    });

    it('находит шрифты от корня приложения (прод-образ: WORKDIR /app)', () => {
        expect(resolveRenewalFontsDir(APP_ROOT)).toBe(
            join(APP_ROOT, 'public', 'fonts', 'pt-sans'),
        );
    });

    it('находит шрифты от корня монорепы', () => {
        const monorepo = resolve(APP_ROOT, '..', '..');
        expect(resolveRenewalFontsDir(monorepo)).toBe(
            join(monorepo, 'apps', 'bitrix', 'public', 'fonts', 'pt-sans'),
        );
    });

    it('если шрифтов нет — внятная ошибка с путями, а не пустой сбой', () => {
        expect(() => resolveRenewalFontsDir('/нет/такого/пути')).toThrow(
            /Шрифты для PDF-предложения не найдены/,
        );
    });
});
