/**
 * Переводит яркость в oklch() из числовой формы в процентную:
 *   oklch(0.19 0.02 260)  ->  oklch(19% 0.02 260)
 *
 * Зачем: lightningcss (наш даунлевелер цветов для старых браузеров,
 * см. packages/ui/postcss-legacy-colors.cjs) умеет считать oklch() только
 * с ПРОЦЕНТНОЙ яркостью. Числовую форму он молча пропускает насквозь, и
 * фоллбэк для Chrome < 111 не появляется — тема остаётся сломанной.
 *
 * Значение цвета не меняется: 0.19 и 19% — одно и то же по спецификации.
 * Трогается ТОЛЬКО первый аргумент oklch(); chroma, hue и альфа остаются
 * байт в байт.
 *
 * Запуск:
 *   node scripts/oklch-to-percent.mjs <файл.css> [ещё файлы...]
 *
 * Идемпотентен: уже процентные значения пропускаются.
 */
import fs from 'fs';

/** Первый аргумент oklch(), если он записан числом (а не процентом). */
const OKLCH_NUMERIC_LIGHTNESS = /oklch\(\s*(\d*\.?\d+)(?=[\s)])/g;

/** Число 0..1 -> строка процентов. Вне диапазона — не наш случай. */
const toPercent = (numStr) => {
    const v = Number(numStr);
    if (!Number.isFinite(v) || v < 0 || v > 1) return null;
    // toFixed + Number, чтобы не получить 6.110000000000001
    return Number((v * 100).toFixed(4)).toString() + '%';
};

const files = process.argv.slice(2);
if (files.length === 0) {
    console.error('Укажите хотя бы один CSS-файл.');
    process.exit(1);
}

let totalFiles = 0;
let totalReplacements = 0;

for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    let replacements = 0;

    const out = src.replace(OKLCH_NUMERIC_LIGHTNESS, (match, num) => {
        const pct = toPercent(num);
        if (pct === null) return match;
        replacements++;
        return match.replace(num, pct);
    });

    if (replacements > 0) {
        fs.writeFileSync(file, out);
        totalFiles++;
        totalReplacements += replacements;
    }
    console.log(String(replacements).padStart(4), 'замен →', file);
}

console.log(`\nитого: ${totalReplacements} замен в ${totalFiles} файлах`);
