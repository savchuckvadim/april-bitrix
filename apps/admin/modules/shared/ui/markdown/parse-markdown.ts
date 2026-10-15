/**
 * Разбор markdown в блоки — без зависимостей и без innerHTML.
 *
 * Поддерживается ровно то подмножество, которым написаны тексты бэка
 * (каталог хуков, теория категорий настроек приложений): заголовки
 * `#`…`######`, абзацы, списки `-`/`*`/`+` и `1.`, GFM-таблицы со строкой-
 * разделителем, цитаты `>`, огороженные блоки ```; инлайн — `код`,
 * **жирный**, *курсив*, [ссылка](url). Всё незнакомое остаётся обычным
 * текстом: `<script>` в исходнике так и выводится буквами, а ссылка с
 * небезопасным адресом (`javascript:`) ссылкой не становится.
 *
 * Курсив — только одиночной звёздочкой: в текстах много идентификаторов с
 * подчёркиванием (`op_lead_status`), и правило `_…_` склеивало бы их.
 */

export type MarkdownInline =
    | { type: 'text'; value: string }
    | { type: 'code'; value: string }
    | { type: 'bold'; children: MarkdownInline[] }
    | { type: 'italic'; children: MarkdownInline[] }
    | { type: 'link'; href: string; children: MarkdownInline[] };

export type MarkdownHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type MarkdownBlock =
    | {
          type: 'heading';
          level: MarkdownHeadingLevel;
          children: MarkdownInline[];
      }
    | { type: 'paragraph'; children: MarkdownInline[] }
    | { type: 'list'; ordered: boolean; items: MarkdownInline[][] }
    | {
          type: 'table';
          header: MarkdownInline[][];
          rows: MarkdownInline[][][];
      }
    | { type: 'blockquote'; children: MarkdownBlock[] }
    | { type: 'code'; language: string | null; value: string }
    | { type: 'rule' };

type ListKind = 'ordered' | 'unordered';

/** Символы, которые можно экранировать обратным слэшем. */
const ESCAPABLE = '\\`*_{}[]()#+-.!|>';

const HEADING = /^(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/;
const FENCE_OPEN = /^```\s*([^\s`]*)\s*$/;
const FENCE_CLOSE = /^```\s*$/;
const UNORDERED_ITEM = /^[-*+]\s+(.*)$/;
const ORDERED_ITEM = /^\d{1,9}[.)]\s+(.*)$/;
const BLOCKQUOTE_LINE = /^>\s?(.*)$/;
const TABLE_SEPARATOR = /^\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?$/;
const THEMATIC_BREAK = /^(?:-{3,}|\*{3,}|_{3,})$/;
/** Адреса, которые можно отдать в href: относительные, якоря, http(s), почта. */
const SAFE_HREF = /^(?:https?:\/\/|mailto:|\/|#|\.{1,2}\/)/i;

export const isSafeMarkdownHref = (href: string): boolean => SAFE_HREF.test(href);

const clampLevel = (level: number): MarkdownHeadingLevel =>
    (Math.min(6, Math.max(1, level)) as MarkdownHeadingLevel);

const isTableSeparator = (line: string): boolean =>
    line.includes('|') && TABLE_SEPARATOR.test(line);

const listItemKind = (line: string): ListKind | null =>
    UNORDERED_ITEM.test(line)
        ? 'unordered'
        : ORDERED_ITEM.test(line)
          ? 'ordered'
          : null;

const listItemText = (line: string, kind: ListKind): string =>
    (kind === 'unordered' ? UNORDERED_ITEM : ORDERED_ITEM).exec(line)?.[1] ??
    '';

/** `| a | b |` → ['a', 'b']; `\|` внутри ячейки — обычная черта. */
const splitTableCells = (line: string): string[] => {
    let inner = line.trim();
    if (inner.startsWith('|')) inner = inner.slice(1);
    if (inner.endsWith('|') && !inner.endsWith('\\|')) {
        inner = inner.slice(0, -1);
    }
    const cells: string[] = [];
    let buffer = '';
    for (let i = 0; i < inner.length; i += 1) {
        const ch = inner.charAt(i);
        if (ch === '\\' && inner.charAt(i + 1) === '|') {
            buffer += '|';
            i += 1;
            continue;
        }
        if (ch === '|') {
            cells.push(buffer.trim());
            buffer = '';
            continue;
        }
        buffer += ch;
    }
    cells.push(buffer.trim());
    return cells;
};

/** Строка ряда таблицы подгоняется под число колонок шапки. */
const normalizeRow = (cells: string[], width: number): string[] =>
    Array.from({ length: width }, (_, i) => cells[i] ?? '');

/**
 * Закрывающий маркер (`**`, `*`): содержимое не пустое и не начинается
 * и не заканчивается пробелом, а одиночная `*` не часть двойной.
 */
const findClosing = (text: string, marker: string, from: number): number => {
    let index = text.indexOf(marker, from);
    while (index !== -1) {
        const inner = text.slice(from, index);
        const validInner =
            inner.length > 0 && !/^\s/.test(inner) && !/\s$/.test(inner);
        const partOfLongerRun =
            marker === '*' && text.charAt(index + 1) === '*';
        if (validInner && !partOfLongerRun) return index;
        index = text.indexOf(marker, index + 1);
    }
    return -1;
};

/** Код в обратных кавычках: закрывающая серия той же длины, что открывающая. */
const findCodeSpanEnd = (text: string, start: number, run: number): number => {
    const marker = '`'.repeat(run);
    let from = start + run;
    while (from < text.length) {
        const index = text.indexOf(marker, from);
        if (index === -1) return -1;
        let length = 0;
        while (text.charAt(index + length) === '`') length += 1;
        if (length === run) return index;
        from = index + length;
    }
    return -1;
};

interface LinkMatch {
    label: string;
    href: string;
    end: number;
}

/** `[текст](адрес "заголовок")` с позиции `start` (там стоит `[`). */
const matchLink = (text: string, start: number): LinkMatch | null => {
    const labelEnd = text.indexOf('](', start + 1);
    if (labelEnd === -1) return null;
    const label = text.slice(start + 1, labelEnd);
    if (label.includes('[') || label.includes('\n')) return null;
    const hrefEnd = text.indexOf(')', labelEnd + 2);
    if (hrefEnd === -1) return null;
    const href = text.slice(labelEnd + 2, hrefEnd).trim().split(/\s+/)[0] ?? '';
    if (!href) return null;
    return { label, href, end: hrefEnd + 1 };
};

/** Инлайн-разметка строки: код, жирный, курсив, ссылки; остальное — текст. */
export const parseMarkdownInline = (text: string): MarkdownInline[] => {
    const nodes: MarkdownInline[] = [];
    let buffer = '';
    const flush = () => {
        if (buffer) {
            nodes.push({ type: 'text', value: buffer });
            buffer = '';
        }
    };

    let i = 0;
    while (i < text.length) {
        const ch = text.charAt(i);

        if (ch === '\\' && ESCAPABLE.includes(text.charAt(i + 1)) && i + 1 < text.length) {
            buffer += text.charAt(i + 1);
            i += 2;
            continue;
        }

        if (ch === '`') {
            let run = 0;
            while (text.charAt(i + run) === '`') run += 1;
            const end = findCodeSpanEnd(text, i, run);
            if (end !== -1) {
                flush();
                nodes.push({
                    type: 'code',
                    value: text.slice(i + run, end).trim(),
                });
                i = end + run;
                continue;
            }
            buffer += '`'.repeat(run);
            i += run;
            continue;
        }

        if (ch === '[') {
            const link = matchLink(text, i);
            if (link && isSafeMarkdownHref(link.href)) {
                flush();
                nodes.push({
                    type: 'link',
                    href: link.href,
                    children: parseMarkdownInline(link.label),
                });
                i = link.end;
                continue;
            }
        }

        if (text.startsWith('**', i)) {
            const end = findClosing(text, '**', i + 2);
            if (end !== -1) {
                flush();
                nodes.push({
                    type: 'bold',
                    children: parseMarkdownInline(text.slice(i + 2, end)),
                });
                i = end + 2;
                continue;
            }
        }

        if (ch === '*') {
            const end = findClosing(text, '*', i + 1);
            if (end !== -1) {
                flush();
                nodes.push({
                    type: 'italic',
                    children: parseMarkdownInline(text.slice(i + 1, end)),
                });
                i = end + 1;
                continue;
            }
        }

        buffer += ch;
        i += 1;
    }
    flush();
    return nodes;
};

const parseBlocks = (lines: string[]): MarkdownBlock[] => {
    const blocks: MarkdownBlock[] = [];
    const lineAt = (i: number): string => lines[i] ?? '';
    const isTableStart = (i: number): boolean =>
        lineAt(i).includes('|') && isTableSeparator(lineAt(i + 1).trim());
    const startsBlock = (i: number): boolean => {
        const line = lineAt(i).trim();
        return (
            FENCE_OPEN.test(line) ||
            HEADING.test(line) ||
            THEMATIC_BREAK.test(line) ||
            BLOCKQUOTE_LINE.test(line) ||
            isTableStart(i) ||
            listItemKind(line) !== null
        );
    };

    let index = 0;
    while (index < lines.length) {
        const line = lineAt(index).trim();

        if (line === '') {
            index += 1;
            continue;
        }

        const fence = FENCE_OPEN.exec(line);
        if (fence) {
            const code: string[] = [];
            index += 1;
            while (
                index < lines.length &&
                !FENCE_CLOSE.test(lineAt(index).trim())
            ) {
                code.push(lineAt(index));
                index += 1;
            }
            index += 1;
            blocks.push({
                type: 'code',
                language: fence[1] ? fence[1] : null,
                value: code.join('\n'),
            });
            continue;
        }

        const heading = HEADING.exec(line);
        if (heading) {
            blocks.push({
                type: 'heading',
                level: clampLevel((heading[1] ?? '#').length),
                children: parseMarkdownInline(heading[2] ?? ''),
            });
            index += 1;
            continue;
        }

        if (THEMATIC_BREAK.test(line)) {
            blocks.push({ type: 'rule' });
            index += 1;
            continue;
        }

        if (BLOCKQUOTE_LINE.test(line)) {
            const inner: string[] = [];
            while (index < lines.length) {
                const quoted = BLOCKQUOTE_LINE.exec(lineAt(index).trim());
                if (!quoted) break;
                inner.push(quoted[1] ?? '');
                index += 1;
            }
            blocks.push({ type: 'blockquote', children: parseBlocks(inner) });
            continue;
        }

        if (isTableStart(index)) {
            const header = splitTableCells(line);
            index += 2;
            const rows: string[][] = [];
            while (index < lines.length) {
                const current = lineAt(index).trim();
                if (current === '' || !current.includes('|')) break;
                rows.push(normalizeRow(splitTableCells(current), header.length));
                index += 1;
            }
            blocks.push({
                type: 'table',
                header: header.map(parseMarkdownInline),
                rows: rows.map(row => row.map(parseMarkdownInline)),
            });
            continue;
        }

        const listKind = listItemKind(line);
        if (listKind) {
            const items: string[] = [];
            while (index < lines.length) {
                const current = lineAt(index).trim();
                if (current === '') {
                    // Список «с воздухом»: пустая строка не рвёт его, если
                    // дальше идёт пункт того же вида.
                    let peek = index + 1;
                    while (peek < lines.length && lineAt(peek).trim() === '') {
                        peek += 1;
                    }
                    if (
                        peek < lines.length &&
                        listItemKind(lineAt(peek).trim()) === listKind
                    ) {
                        index = peek;
                        continue;
                    }
                    break;
                }
                const kind = listItemKind(current);
                if (kind === listKind) {
                    items.push(listItemText(current, kind));
                    index += 1;
                    continue;
                }
                if (kind !== null || startsBlock(index)) break;
                // Ленивое продолжение пункта со следующей строки.
                const last = items.length - 1;
                items[last] = `${items[last] ?? ''} ${current}`;
                index += 1;
            }
            blocks.push({
                type: 'list',
                ordered: listKind === 'ordered',
                items: items.map(parseMarkdownInline),
            });
            continue;
        }

        const paragraph: string[] = [];
        while (index < lines.length) {
            const current = lineAt(index).trim();
            if (current === '' || (paragraph.length > 0 && startsBlock(index))) {
                break;
            }
            paragraph.push(current);
            index += 1;
        }
        blocks.push({
            type: 'paragraph',
            children: parseMarkdownInline(paragraph.join(' ')),
        });
    }

    return blocks;
};

/** Markdown-текст → блоки для рендера. */
export const parseMarkdown = (text: string): MarkdownBlock[] =>
    parseBlocks(text.replace(/\r\n?/g, '\n').split('\n'));
