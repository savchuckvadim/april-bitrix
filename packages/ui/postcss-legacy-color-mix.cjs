/**
 * Фоллбэки для color-mix() с CSS-переменными — довесок к legacy-colors.
 *
 * Зачем. Chrome до 111 (на Windows 7 доступен максимум 109) не знает
 * color-mix(). Tailwind для утилит вида `bg-success/10` и арбитрарных
 * `bg-[color:color-mix(...)]` сам пишет запасное значение, но подсчитать
 * смесь переменных на сборке нельзя, поэтому запасным становится ПЕРВЫЙ цвет
 * смеси целиком:
 *
 *   .bg-success\/10 { background-color: var(--success) }
 *   @supports (color: color-mix(in lab, red, red)) {
 *     .bg-success\/10 { background-color: color-mix(in oklab, var(--success) 10%, transparent) }
 *   }
 *
 * На старом браузере «десять процентов зелёного» превращаются в сплошной
 * зелёный: карточки дел заливаются цветом типа события, мягкие бэйджи —
 * цветной плашкой с текстом того же цвета (жалоба владельца, 05.10.2026).
 *
 * Что делает. Переписывает ТОЛЬКО запасное значение — то, что читает старый
 * браузер. Ветка @supports не трогается, поэтому в современных браузерах не
 * меняется ничего. Правила выбора:
 *
 *  1. смесь с transparent меньше половины у ФОНА (заливка, остановки
 *     градиента) → `transparent`: еле заметный оттенок честнее заменить
 *     ничем, чем сплошным цветом;
 *  2. цвет ТЕКСТА, подмешанный к --foreground → `var(--foreground)`:
 *     нейтральный читаемый текст вместо чистого тона (светлые тона на белом
 *     не читаются);
 *  3. смесь двух цветов с известными долями → цвет с большей долей
 *     (`color-mix(in oklab, var(--event-current), var(--card) 95%)` →
 *     `var(--card)`);
 *  4. в остальных случаях значение остаётся как есть.
 *
 * Запасное значение меняется, только если оно равно одному из цветов смеси
 * — так узнаётся автозамена Tailwind; посчитанные им статические значения
 * (`#00000080` у `bg-black/50`) не затрагиваются.
 */

/** Свойства «фона»: для них прозрачная смесь заменяется прозрачностью. */
const BACKGROUND_PROPS = new Set([
    "background-color",
    "background",
    "--tw-gradient-from",
    "--tw-gradient-via",
    "--tw-gradient-to",
]);

const FOREGROUND = "var(--foreground)";

const normalize = (value) => String(value).trim().replace(/\s+/g, " ").toLowerCase();

/** Делит строку по разделителю верхнего уровня — внутрь скобок не заходит. */
const splitTopLevel = (text, isSeparator) => {
    const parts = [];
    let depth = 0;
    let current = "";
    for (const char of text) {
        if (char === "(") depth += 1;
        if (char === ")") depth -= 1;
        if (depth === 0 && isSeparator(char)) {
            parts.push(current);
            current = "";
            continue;
        }
        current += char;
    }
    parts.push(current);
    return parts.map((part) => part.trim()).filter(Boolean);
};

/**
 * Слагаемое смеси: «var(--x) 10%» → цвет и доля.
 * `percent: null` — доля не указана; `isUnknown` — доля задана переменной.
 */
const parseStop = (raw) => {
    const text = raw.trim();
    const numeric = /^(.+?)\s*(\d*\.?\d+)%$/.exec(text);
    if (numeric) {
        return { color: numeric[1].trim(), percent: Number(numeric[2]), isUnknown: false };
    }
    const tokens = splitTopLevel(text, (char) => /\s/.test(char));
    if (tokens.length === 2) {
        return { color: tokens[0], percent: null, isUnknown: true };
    }
    return { color: text, percent: null, isUnknown: false };
};

/** Разбор значения, которое ЦЕЛИКОМ является одним color-mix(...). */
const parseColorMix = (value) => {
    const text = String(value).trim();
    if (!text.startsWith("color-mix(") || !text.endsWith(")")) return null;
    const args = splitTopLevel(text.slice("color-mix(".length, -1), (char) => char === ",");
    if (args.length !== 3) return null;
    return [parseStop(args[1]), parseStop(args[2])];
};

/** Доли слагаемых в процентах; null — посчитать нельзя. */
const resolveWeights = (first, second) => {
    if (first.isUnknown || second.isUnknown) return null;
    if (first.percent !== null && second.percent !== null) {
        return [first.percent, second.percent];
    }
    if (first.percent !== null) return [first.percent, 100 - first.percent];
    if (second.percent !== null) return [100 - second.percent, second.percent];
    return [50, 50];
};

/**
 * Новое запасное значение или null, если менять нечего.
 *
 * @param {string} prop свойство объявления
 * @param {string} mixValue значение из ветки @supports (color-mix)
 * @param {string} currentFallback текущее запасное значение
 * @returns {string | null}
 */
const pickColorMixFallback = (prop, mixValue, currentFallback) => {
    const stops = parseColorMix(mixValue);
    if (!stops) return null;
    const [first, second] = stops;

    const current = normalize(currentFallback);
    const isAutoFallback =
        current === normalize(first.color) || current === normalize(second.color);
    if (!isAutoFallback) return null;

    const weights = resolveWeights(first, second);
    const isTransparent = (stop) => normalize(stop.color) === "transparent";

    let next;
    if (isTransparent(first) || isTransparent(second)) {
        const solid = isTransparent(first) ? second : first;
        const solidWeight = weights ? weights[isTransparent(first) ? 1 : 0] : null;
        const isFaint = solidWeight !== null && solidWeight < 50;
        next = BACKGROUND_PROPS.has(prop) && isFaint ? "transparent" : solid.color;
    } else if (
        prop === "color" &&
        [first, second].some((stop) => normalize(stop.color) === FOREGROUND)
    ) {
        next = FOREGROUND;
    } else if (weights) {
        next = weights[1] > weights[0] ? second.color : first.color;
    } else {
        return null;
    }

    return normalize(next) === current ? null : next;
};

/** Сколько соседей назад искать правило с запасным значением. */
const SIBLING_LOOKBACK = 4;

const findFallbackRule = (supportsRule, selector) => {
    let node = supportsRule.prev();
    for (let hop = 0; node && hop < SIBLING_LOOKBACK; hop += 1) {
        if (node.type === "rule" && node.selector === selector) return node;
        node = node.prev();
    }
    return null;
};

/**
 * Проходит по готовому CSS и переписывает запасные значения.
 *
 * @param {import('postcss').Root} root
 * @returns {number} сколько объявлений переписано
 */
const rewriteColorMixFallbacks = (root) => {
    let rewritten = 0;

    root.walkAtRules("supports", (supportsRule) => {
        if (!supportsRule.params.includes("color-mix(")) return;

        supportsRule.each((upgradeRule) => {
            if (upgradeRule.type !== "rule") return;
            const fallbackRule = findFallbackRule(supportsRule, upgradeRule.selector);
            if (!fallbackRule) return;

            upgradeRule.each((upgrade) => {
                if (upgrade.type !== "decl") return;
                fallbackRule.each((fallback) => {
                    if (fallback.type !== "decl" || fallback.prop !== upgrade.prop) return;
                    const next = pickColorMixFallback(upgrade.prop, upgrade.value, fallback.value);
                    if (!next) return;
                    fallback.value = next;
                    rewritten += 1;
                });
            });
        });
    });

    return rewritten;
};

module.exports = { pickColorMixFallback, rewriteColorMixFallbacks };
