import { OFFER_LETTER_TAG, type OfferLetterTag } from '../../model';

/**
 * Разметка письма: `<color>`, `<bold>`, `<red>`. Редактор держит фрагменты
 * плоскими, без вложенности: рендер Word сбрасывает стиль на любом закрывающем
 * теге. Для вида в КП вложенность лишняя: `<color>` и `<red>` и так жирные.
 */
const TAG_PATTERN = /<(\/?)(color|bold|red)>/g;

/** Текст без тегов и стиль каждого символа (`styles.length === plain.length`) */
export interface StyledLetter {
    plain: string;
    styles: (OfferLetterTag | null)[];
}

/** Результат правки выделения: новый текст и где теперь выделение */
export interface OfferLetterEdit {
    text: string;
    selectionStart: number;
    selectionEnd: number;
}

type OpenTags = Record<OfferLetterTag, boolean>;

/** Какой стиль виден, если открыто несколько тегов: красный, затем акцент, затем жирный */
const visibleTag = (open: OpenTags): OfferLetterTag | null => {
    if (open[OFFER_LETTER_TAG.RED]) return OFFER_LETTER_TAG.RED;
    if (open[OFFER_LETTER_TAG.COLOR]) return OFFER_LETTER_TAG.COLOR;
    if (open[OFFER_LETTER_TAG.BOLD]) return OFFER_LETTER_TAG.BOLD;
    return null;
};

/**
 * Переводы строк: записанный литералом «\n» (как хранили в легаси) и CRLF
 * становятся обычным переводом строки. Рендер PDF делает то же.
 */
export const normalizeLetterText = (raw: string): string =>
    raw.replace(/\\n/g, '\n').replace(/\r\n?/g, '\n');

/** Текст с тегами → текст без тегов со стилем на каждый символ */
export const parseStyledLetter = (raw: string): StyledLetter => {
    const open: OpenTags = { color: false, bold: false, red: false };
    const styles: (OfferLetterTag | null)[] = [];
    let plain = '';
    let cursor = 0;
    const push = (chunk: string): void => {
        plain += chunk;
        const tag = visibleTag(open);
        for (let index = 0; index < chunk.length; index += 1) styles.push(tag);
    };
    for (const match of raw.matchAll(TAG_PATTERN)) {
        push(raw.slice(cursor, match.index));
        open[match[2] as OfferLetterTag] = !match[1];
        cursor = match.index + match[0].length;
    }
    push(raw.slice(cursor));
    return { plain, styles };
};

/** Плоская запись: каждый непрерывный фрагмент одного стиля в свой тег */
export const serializeStyledLetter = ({
    plain,
    styles,
}: StyledLetter): { text: string; charStart: number[] } => {
    let text = '';
    const charStart: number[] = [];
    let from = 0;
    while (from < plain.length) {
        const tag = styles[from];
        let to = from;
        while (to < plain.length && styles[to] === tag) to += 1;
        if (tag) text += `<${tag}>`;
        for (let index = from; index < to; index += 1) {
            charStart.push(text.length);
            text += plain[index];
        }
        if (tag) text += `</${tag}>`;
        from = to;
    }
    charStart.push(text.length);
    return { text, charStart };
};

/** Позиция в тексте с тегами → позиция в тексте без тегов; внутри тега — его начало */
export const plainIndexOfRaw = (raw: string, rawIndex: number): number => {
    let removed = 0;
    for (const match of raw.matchAll(TAG_PATTERN)) {
        const start = match.index;
        if (rawIndex <= start) break;
        removed += Math.min(rawIndex, start + match[0].length) - start;
    }
    return rawIndex - removed;
};

/** Границы выделения в тексте без тегов; пробелы и переводы строк по краям не берутся */
const selectedRange = (
    raw: string,
    plain: string,
    selectionStart: number,
    selectionEnd: number,
): [number, number] => {
    let from = plainIndexOfRaw(raw, Math.min(selectionStart, selectionEnd));
    let to = plainIndexOfRaw(raw, Math.max(selectionStart, selectionEnd));
    while (from < to && /\s/.test(plain[from] ?? '')) from += 1;
    while (to > from && /\s/.test(plain[to - 1] ?? '')) to -= 1;
    return [from, to];
};

/**
 * Применить тег к выделению. Фрагмент целиком уже в этом теге — тег снимается;
 * `tag: null` снимает любой стиль. Остальной текст и его стили не меняются.
 */
export const applyLetterTag = (
    raw: string,
    selectionStart: number,
    selectionEnd: number,
    tag: OfferLetterTag | null,
): OfferLetterEdit => {
    const letter = parseStyledLetter(raw);
    const [from, to] = selectedRange(raw, letter.plain, selectionStart, selectionEnd);
    if (from >= to) return { text: raw, selectionStart, selectionEnd };

    const alreadyTagged =
        tag !== null && letter.styles.slice(from, to).every(style => style === tag);
    const next = alreadyTagged ? null : tag;
    const styles = letter.styles.map((style, index) =>
        index >= from && index < to ? next : style,
    );
    const { text, charStart } = serializeStyledLetter({ plain: letter.plain, styles });
    return {
        text,
        selectionStart: charStart[from] ?? text.length,
        selectionEnd: (charStart[to - 1] ?? text.length - 1) + 1,
    };
};

/** Стиль выделенного фрагмента, если он у всех символов один; иначе null */
export const selectionLetterTag = (
    raw: string,
    selectionStart: number,
    selectionEnd: number,
): OfferLetterTag | null => {
    const { plain, styles } = parseStyledLetter(raw);
    const [from, to] = selectedRange(raw, plain, selectionStart, selectionEnd);
    if (from >= to) return null;
    const first = styles[from] ?? null;
    return styles.slice(from, to).every(style => style === first) ? first : null;
};
