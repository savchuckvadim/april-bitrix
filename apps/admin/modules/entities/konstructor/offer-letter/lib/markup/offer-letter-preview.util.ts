import type { OfferLetterRun } from '../../model';
import { normalizeLetterText, parseStyledLetter } from './offer-letter-markup.util';

/**
 * Абзацы письма для превью: так же, как в PDF-КП. Абзац — строка текста,
 * пустые строки абзацев не создают.
 */
export const buildLetterParagraphs = (raw: string): OfferLetterRun[][] => {
    const { plain, styles } = parseStyledLetter(normalizeLetterText(raw));
    const paragraphs: OfferLetterRun[][] = [];
    let current: OfferLetterRun[] = [];
    const flush = (): void => {
        if (current.some(run => run.text.trim().length > 0)) paragraphs.push(current);
        current = [];
    };
    for (let index = 0; index < plain.length; index += 1) {
        const char = plain[index] ?? '';
        if (char === '\n') {
            flush();
            continue;
        }
        const tag = styles[index] ?? null;
        const last = current[current.length - 1];
        if (last && last.tag === tag) last.text += char;
        else current.push({ text: char, tag });
    }
    flush();
    return paragraphs;
};
