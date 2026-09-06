/**
 * Разбор markdown отчёта аудита в блоки — без зависимостей.
 *
 * Полноценного markdown-рендера в монорепе нет, а отчёт бэка строится
 * ограниченным набором конструкций (`ai-analytics-audit.markdown.ts`):
 * заголовки `#`…`####`, таблицы `| a | b |` с разделителем `| --- |`,
 * списки `- `, абзацы, курсивная строка `_…_` и инлайн `**жирный**`
 * / `` `код` ``. Ровно их и разбираем; всё незнакомое остаётся текстом.
 *
 * Курсив распознаётся только строкой целиком: в отчёте много
 * идентификаторов с подчёркиванием (`user_id`, `call_started_at`), и
 * инлайн-правило `_…_` склеивало бы их в ложный курсив.
 */

export type MarkdownInlineToken =
    | { kind: 'text'; text: string }
    | { kind: 'bold'; text: string }
    | { kind: 'code'; text: string };

export type MarkdownBlock =
    | { kind: 'heading'; level: number; text: string }
    | { kind: 'paragraph'; lines: string[]; italic: boolean }
    | { kind: 'list'; items: string[] }
    | { kind: 'table'; headers: string[]; rows: string[][] };

const HEADING = /^(#{1,6})\s+(.*)$/;
const LIST_ITEM = /^[-*]\s+(.*)$/;
const TABLE_SEPARATOR = /^\|(\s*:?-{3,}:?\s*\|)+\s*$/;
const FULL_LINE_ITALIC = /^_(.+)_$/;
const INLINE = /(\*\*[^*]+\*\*|`[^`]+`)/g;

const isTableLine = (line: string): boolean => line.trimStart().startsWith('|');

/** `| a | b |` → ['a', 'b']. */
const splitTableRow = (line: string): string[] => {
    const trimmed = line.trim();
    const inner = trimmed.slice(
        trimmed.startsWith('|') ? 1 : 0,
        trimmed.endsWith('|') ? -1 : undefined,
    );
    return inner.split('|').map(cell => cell.trim());
};

/** Инлайн-разметка строки: `**жирный**` и `` `код` ``, остальное — текст. */
export const parseMarkdownInline = (text: string): MarkdownInlineToken[] => {
    const tokens: MarkdownInlineToken[] = [];
    for (const part of text.split(INLINE)) {
        if (!part) continue;
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            tokens.push({ kind: 'bold', text: part.slice(2, -2) });
        } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
            tokens.push({ kind: 'code', text: part.slice(1, -1) });
        } else {
            tokens.push({ kind: 'text', text: part });
        }
    }
    return tokens;
};

/** Markdown-текст → последовательность блоков для рендера. */
export const parseMarkdownLite = (markdown: string): MarkdownBlock[] => {
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
    const blocks: MarkdownBlock[] = [];
    let index = 0;

    while (index < lines.length) {
        const line = lines[index] ?? '';
        const trimmed = line.trim();

        if (trimmed === '') {
            index += 1;
            continue;
        }

        const heading = HEADING.exec(trimmed);
        if (heading) {
            blocks.push({
                kind: 'heading',
                level: (heading[1] ?? '#').length,
                text: heading[2] ?? '',
            });
            index += 1;
            continue;
        }

        if (isTableLine(trimmed)) {
            const tableLines: string[] = [];
            while (index < lines.length && isTableLine(lines[index] ?? '')) {
                tableLines.push(lines[index] ?? '');
                index += 1;
            }
            const [headerLine, ...rest] = tableLines;
            const hasSeparator =
                rest[0] !== undefined && TABLE_SEPARATOR.test(rest[0].trim());
            const rows = (hasSeparator ? rest.slice(1) : rest).map(
                splitTableRow,
            );
            blocks.push({
                kind: 'table',
                headers: splitTableRow(headerLine ?? ''),
                rows,
            });
            continue;
        }

        if (LIST_ITEM.test(trimmed)) {
            const items: string[] = [];
            while (index < lines.length) {
                const item = LIST_ITEM.exec((lines[index] ?? '').trim());
                if (!item) break;
                items.push(item[1] ?? '');
                index += 1;
            }
            blocks.push({ kind: 'list', items });
            continue;
        }

        const italic = FULL_LINE_ITALIC.exec(trimmed);
        if (italic) {
            blocks.push({
                kind: 'paragraph',
                lines: [italic[1] ?? ''],
                italic: true,
            });
            index += 1;
            continue;
        }

        // Абзац: подряд идущие обычные строки до пустой или спец-строки.
        const paragraph: string[] = [];
        while (index < lines.length) {
            const current = (lines[index] ?? '').trim();
            if (
                current === '' ||
                HEADING.test(current) ||
                isTableLine(current) ||
                LIST_ITEM.test(current) ||
                FULL_LINE_ITALIC.test(current)
            ) {
                break;
            }
            paragraph.push(current);
            index += 1;
        }
        blocks.push({ kind: 'paragraph', lines: paragraph, italic: false });
    }

    return blocks;
};
