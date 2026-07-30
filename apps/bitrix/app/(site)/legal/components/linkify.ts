import { LegalChunk } from './types';

/** URL (http/https) и e-mail внутри текста абзаца */
const LINK_PATTERN = /(https?:\/\/[^\s<>"']+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;

/** Символы пунктуации, которые не должны попадать внутрь ссылки */
const TRAILING_PUNCTUATION = /[.,;:!?)»]+$/;

const buildHref = (value: string): string =>
    value.startsWith('http') ? value : `mailto:${value}`;

/**
 * Разбивает текст абзаца на фрагменты, выделяя URL и e-mail адреса,
 * чтобы они рендерились как кликабельные ссылки.
 */
export const linkifyLegalText = (text: string): LegalChunk[] => {
    const chunks: LegalChunk[] = [];
    let lastIndex = 0;

    for (const match of text.matchAll(LINK_PATTERN)) {
        const raw = match[0];
        const start = match.index ?? 0;

        const trailing = TRAILING_PUNCTUATION.exec(raw);
        const link = trailing ? raw.slice(0, trailing.index) : raw;
        const tail = trailing ? raw.slice(trailing.index) : '';

        if (link.length === 0) {
            continue;
        }

        if (start > lastIndex) {
            chunks.push({ kind: 'text', value: text.slice(lastIndex, start) });
        }

        chunks.push({ kind: 'link', value: link, href: buildHref(link) });

        if (tail.length > 0) {
            chunks.push({ kind: 'text', value: tail });
        }

        lastIndex = start + raw.length;
    }

    if (lastIndex < text.length) {
        chunks.push({ kind: 'text', value: text.slice(lastIndex) });
    }

    return chunks;
};
