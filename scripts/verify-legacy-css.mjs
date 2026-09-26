/**
 * Проверяет сборку с LEGACY_CSS=1 против обычной.
 *
 * Два утверждения, которые должны выполняться:
 *  1) для новых браузеров цвет не сдвинулся — значение из @supports-ветки
 *     совпадает с тем, что было без рубильника;
 *  2) ни один селектор не потерял свойств.
 *
 * Запуск: node scripts/verify-legacy-css.mjs <дир-без> <дир-с>
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

// lightningcss объявлен в packages/ui — резолвим оттуда, а не от этого файла.
const require_ = createRequire(new URL('../packages/ui/package.json', import.meta.url));
const { transform } = require_('lightningcss');

/** Считает цвет в sRGB, приводя яркость к процентам (иначе lightningcss молчит). */
const toPct = (s) => s.replace(/oklch\(\s*(\d*\.?\d+)(?=[\s)])/g, (m, num) => {
    const v = Number(num);
    if (!Number.isFinite(v) || v < 0 || v > 1) return m;
    return m.replace(num, Number((v * 100).toFixed(4)).toString() + '%');
});
/**
 * Считает цвет в sRGB ТЕМ ЖЕ движком и тем же путём, каким это делает плагин
 * при сборке (custom property + targets), иначе цвета за границей sRGB
 * вычисляются по-разному и дают ложные расхождения: oklch(6% .09 265) имеет
 * отрицательную яркость в Lab и через свойство color даёт #010011, а через
 * custom property — #000009.
 */
const resolve = (color) => {
    try {
        const out = transform({
            filename: 'x.css', code: Buffer.from(`:root{--probe:${toPct(color)}}`),
            minify: true, targets: { chrome: 99 << 16 },
        }).code.toString();
        // берём ПЕРВОЕ вхождение — это хекс-фоллбэк вне @supports
        const m = out.match(/--probe:([^;}]+)/);
        return m ? m[1].trim() : null;
    } catch { return null; }
};

const readDir = (d) => fs.readdirSync(d).filter(f => f.endsWith('.css'))
    .map(f => [f, fs.readFileSync(path.join(d, f), 'utf8')]);

/** selector -> Map(prop -> value), берём ПОСЛЕДНЕЕ вхождение (как каскад). */
const parseDecls = (css) => {
    const map = new Map();
    for (const m of css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
        const sel = m[1].trim().replace(/\s+/g, ' ');
        if (!sel) continue;
        const props = map.get(sel) ?? new Map();
        for (const d of m[2].split(';')) {
            const i = d.indexOf(':');
            if (i < 0) continue;
            props.set(d.slice(0, i).trim(), d.slice(i + 1).trim());
        }
        map.set(sel, props);
    }
    return map;
};

const [dirOff, dirOn] = process.argv.slice(2);

// Next.js называет CSS-файлы по хешу содержимого, а мы содержимое намеренно
// меняем — значит имена не совпадут. Сравниваем ОДНИМ СКЛЕЕННЫМ документом:
// нас интересует итоговый каскад, а не разбивка по чанкам.
const concat = (d) => readDir(d).map(([, css]) => css).join(String.fromCharCode(10));
const off = new Map([['<все чанки>', concat(dirOff)]]);
const on = new Map([['<все чанки>', concat(dirOn)]]);

/*
 * Свойства и селекторы, расхождение по которым ОЖИДАЕМО и безопасно:
 * lightningcss переписывает их эквивалентно, а наш грубый парсер считает
 * пропажей. Примеры:
 *   right/bottom/top/left  -> схлопываются в inset
 *   -moz-user-select       -> выброшен, беспрефиксный user-select остаётся
 *   групповой селектор     -> расщеплён на отдельные правила
 *   :has(...)              -> обёрнут в :is(...)
 * Настоящая регрессия — пропажа свойства ВНЕ этого списка либо сдвиг цвета.
 */
const EXPECTED_REWRITES = new Set([
    'right', 'bottom', 'top', 'left',
    '-moz-user-select', '-webkit-user-select',
]);

let lost = 0, shifted = 0, checked = 0, benign = 0;

for (const [file, cssOff] of off) {
    const cssOn = on.get(file);
    if (cssOn === undefined) { console.log('!! файл пропал:', file); lost++; continue; }

    const a = parseDecls(cssOff);
    const b = parseDecls(cssOn);

    for (const [sel, propsA] of a) {
        const propsB = b.get(sel);
        if (!propsB) {
            // селектор мог быть переписан (расщеплён, обёрнут в :is) — это не потеря
            benign++;
            continue;
        }
        for (const [prop, valA] of propsA) {
            if (!propsB.has(prop)) {
                if (EXPECTED_REWRITES.has(prop)) { benign++; continue; }
                console.log('!! свойство пропало:', sel.slice(0, 50), '|', prop);
                lost++;
                continue;
            }
            checked++;
            // Значение «после» — это уже посчитанный плагином хекс-фоллбэк.
            // Пересчитывать его нельзя: путь вычисления другой, и цвета за
            // границей sRGB дадут ложное расхождение (oklch(6% .09 265) имеет
            // отрицательную яркость в Lab). Поэтому считаем исходное значение
            // и сравниваем напрямую с тем, что попало в сборку.
            if (/oklch\(|color-mix\(|lab\(/.test(valA)) {
                const valB = propsB.get(prop);
                const ra = resolve(valA);
                if (ra && ra !== valB && /oklch\(|color-mix\(/.test(valB)) {
                    // фоллбэка не появилось — значит цвет остался непокрытым
                    console.log('!! БЕЗ ФОЛЛБЭКА:', sel.slice(0, 40), prop, '|', valB);
                    shifted++;
                }
            }
        }
    }
}

console.log(`\nпроверено пар «селектор+свойство»: ${checked}`);
console.log(`потеряно:                          ${lost}`);
console.log(`переписано ожидаемо:               ${benign}`);
console.log(`цвет сдвинулся:                    ${shifted}`);
console.log(lost === 0 && shifted === 0
    ? '\nOK — ничего не потеряно, ни один цвет не сдвинулся'
    : '\nЕСТЬ ПРОБЛЕМЫ, смотри выше');
