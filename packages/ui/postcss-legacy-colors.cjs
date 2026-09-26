/**
 * Фоллбэки цветов для старых браузеров (Chrome 99–110, последний доступный
 * на Windows 7 — 109).
 *
 * Зачем: oklch(), color-mix() и lab() появились только в Chrome 111. Браузер
 * старее не понимает такую запись и выбрасывает объявление целиком — фон
 * становится прозрачным, текст падает на браузерный чёрный.
 *
 * Что делает: прогоняет готовый CSS через lightningcss с целью «chrome 99».
 * Тот дописывает КАЖДОМУ современному цвету старый эквивалент ПЕРЕД ним,
 * а современное значение уводит в @supports (color: lab(...)):
 *
 *   :root{--background:#0f141d}
 *   @supports (color:lab(0% 0 0)){:root{--background:lab(6.11% -.36 -6.93)}}
 *
 * Chrome 111+ и Safari 16.4+ читают @supports-ветку и получают ровно то же,
 * что и без плагина. Старые берут хекс. Ни одно правило не удаляется.
 *
 * ВАЖНО: lightningcss переводит oklch() только с ПРОЦЕНТНОЙ яркостью —
 * oklch(19% ...) переводится, oklch(0.19 ...) молча проходит насквозь.
 * Поэтому токены тем записаны в процентах (см. scripts/oklch-to-percent.mjs).
 *
 * ПОЧЕМУ .cjs, а не .mjs: Next.js грузит postcss-плагины через синхронный
 * require() (build/webpack/config/blocks/css/plugins.js). Для ESM-файла
 * require() вернёт объект-обёртку вместо функции, и сборка падает с
 * "TypeError: Cannot convert object to primitive value".
 *
 * ОСТОРОЖНО С TARGETS: перечислять нужно ВСЕ поддерживаемые браузеры, а не
 * только старый Chrome. Если указать лишь chrome, lightningcss сочтёт
 * -webkit-префиксы ненужными и ВЫБРОСИТ их — в Safari отвалится
 * backdrop-filter (стекло перестанет размываться).
 *
 * Рубильник: включается переменной LEGACY_CSS=1 в postcss.config.mjs.
 * Без неё плагин не подключается вовсе и CSS собирается как раньше.
 */
const { transform } = require("lightningcss");

/**
 * Нижняя граница поддержки. Chrome 99 — потолок Windows 7 (там максимум 109).
 * Остальные браузеры перечислены, чтобы lightningcss сохранил их префиксы:
 * Safari 15.4 всё ещё требует -webkit-backdrop-filter.
 */
const TARGETS = {
    chrome: 99 << 16,
    safari: (15 << 16) | (4 << 8),
    firefox: 97 << 16,
};

/** @returns {import('postcss').Plugin} */
module.exports = function legacyColors({ targets = TARGETS } = {}) {

    return {
        postcssPlugin: "legacy-colors",

        Once(root, { postcss }) {
            const original = root.toString();

            const { code } = transform({
                filename: "input.css",
                code: Buffer.from(original),
                targets,
                // Только даунлевелинг: минификацию оставляем Next.js.
                minify: false,
            });

            const downleveled = code.toString();
            if (downleveled === original) return;

            const rebuilt = postcss.parse(downleveled);
            root.removeAll();
            root.append(rebuilt.nodes);
        },
    };
};

module.exports.postcss = true;
