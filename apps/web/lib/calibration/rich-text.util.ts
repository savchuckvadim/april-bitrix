import type { CalibrationRichChunk } from './types';

/**
 * Разбирает строку на фрагменты: `**жирный**`, `*курсив*` и обычный текст.
 *
 * Полноценного markdown-рендера в монорепе нет и заводить его ради одной
 * страницы не нужно: тексты хранятся как есть, а разметка ограничена двумя
 * видами выделения, которые встречаются в исходном контенте.
 */
const MARKUP_PATTERN = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;

export const parseCalibrationRichText = (
    text: string,
): CalibrationRichChunk[] => {
    const chunks: CalibrationRichChunk[] = [];
    let lastIndex = 0;

    for (const match of text.matchAll(MARKUP_PATTERN)) {
        const start = match.index ?? 0;

        if (start > lastIndex) {
            chunks.push({ kind: 'text', value: text.slice(lastIndex, start) });
        }

        const strong = match[1];
        const em = match[2];

        if (strong !== undefined) {
            chunks.push({ kind: 'strong', value: strong });
        } else if (em !== undefined) {
            chunks.push({ kind: 'em', value: em });
        }

        lastIndex = start + match[0].length;
    }

    if (lastIndex < text.length) {
        chunks.push({ kind: 'text', value: text.slice(lastIndex) });
    }

    return chunks;
};
