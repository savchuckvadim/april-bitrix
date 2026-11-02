/**
 * Шрифты PDF-предложения: PT Sans (OFL, см. fonts/OFL.txt) — статические
 * TTF с полной кириллицей. Встроенные шрифты react-pdf кириллицу не
 * покрывают, без регистрации текст вышел бы пустыми квадратами.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Font } from '@react-pdf/renderer';

export const RENEWAL_PDF_FONT = 'PT Sans';

const FILES = {
    regular: 'PT_Sans-Web-Regular.ttf',
    bold: 'PT_Sans-Web-Bold.ttf',
} as const;

/**
 * Где лежат ttf. В dev и в standalone-сборке Next каталог проекта — это
 * `process.cwd()`; файлы рядом с модулем в бандл не попадают, поэтому
 * ищем по пути от корня приложения, а не от `__dirname`.
 */
export function resolveRenewalFontsDir(cwd: string = process.cwd()): string {
    const relative = join('app', '(site)', 'renewal', '[token]', 'pdf', 'fonts');
    const candidates = [
        join(cwd, relative),
        // standalone-сборка кладёт исходники приложения в подкаталог
        join(cwd, 'apps', 'bitrix', relative),
    ];
    const found = candidates.find((dir) => existsSync(join(dir, FILES.regular)));
    if (!found) {
        throw new Error(
            `Шрифты для PDF-предложения не найдены, искали: ${candidates.join('; ')}`,
        );
    }
    return found;
}

let registered = false;

/** Регистрация один раз на процесс: Font.register — глобальный реестр. */
export function registerRenewalPdfFonts(): void {
    if (registered) {
        return;
    }
    const dir = resolveRenewalFontsDir();
    Font.register({
        family: RENEWAL_PDF_FONT,
        fonts: [
            { src: join(dir, FILES.regular), fontWeight: 'normal' },
            { src: join(dir, FILES.bold), fontWeight: 'bold' },
        ],
    });
    // Переносы react-pdf считают слова английскими и рвут русские слова
    // где попало. Переносим только по пробелам.
    Font.registerHyphenationCallback((word) => [word]);
    registered = true;
}
