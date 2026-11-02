/**
 * Шрифты PDF-предложения: PT Sans (OFL, см. public/fonts/pt-sans/OFL.txt) —
 * статические TTF с полной кириллицей. Встроенные шрифты react-pdf
 * кириллицу не покрывают, без регистрации текст вышел бы пустыми
 * квадратами.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Font } from '@react-pdf/renderer';

export const RENEWAL_PDF_FONT = 'PT Sans';

const FILES = {
    regular: 'PT_Sans-Web-Regular.ttf',
    bold: 'PT_Sans-Web-Bold.ttf',
} as const;

/** Путь к шрифтам внутри каталога статики. */
const INSIDE_PUBLIC = join('fonts', 'pt-sans');

/**
 * Где лежат ttf.
 *
 * Шрифты живут в `public/`, а не рядом с модулем, потому что это
 * единственный каталог с файлами, который доезжает до прод-образа:
 * `Dockerfile.prod` копирует только `.next`, `packages`, `public`,
 * `package.json` и `next.config` — каталога `app/` в контейнере нет
 * вообще. Файлы рядом с роутом работали бы в dev и давали 500 на проде.
 *
 * Ищем от `process.cwd()`: `__dirname` внутри бандла Next указывает на
 * служебный путь сборки, а не на корень приложения.
 */
export function resolveRenewalFontsDir(cwd: string = process.cwd()): string {
    const candidates = [
        // корень приложения: прод-образ (WORKDIR /app) и next dev/start
        join(cwd, 'public', INSIDE_PUBLIC),
        // запуск из корня монорепы
        join(cwd, 'apps', 'bitrix', 'public', INSIDE_PUBLIC),
    ];
    const found = candidates.find(dir => existsSync(join(dir, FILES.regular)));
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
    Font.registerHyphenationCallback(word => [word]);
    registered = true;
}
