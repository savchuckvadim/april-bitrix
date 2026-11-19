import { OFFER_LETTER_TAGS } from '../../consts/offer-letter-markup.consts';
import type { OfferLetterTag } from '../../model';

/** Всё, что выглядит как тег: `<b>`, `</Bold>`, `<br/>` */
const TAG_LIKE = /<\/?[A-Za-z][A-Za-z0-9]*\s*\/?>/g;
/** Ровно то, что понимают рендеры */
const SUPPORTED_TAG = new RegExp(`^<(/?)(${OFFER_LETTER_TAGS.join('|')})>$`);

const supportedTagsLabel = OFFER_LETTER_TAGS.map(tag => `<${tag}>`).join(', ');

/**
 * Проверка разметки до отправки: те же правила, что на бэке
 * (`findOfferLetterMarkupError`): только поддерживаемые теги, у каждого
 * открывающего есть закрывающий, пересечений нет. Бэк остаётся главным.
 */
export const findLetterMarkupError = (text: string): string | null => {
    const open: OfferLetterTag[] = [];
    for (const [token] of text.matchAll(TAG_LIKE)) {
        const match = SUPPORTED_TAG.exec(token);
        if (!match) {
            return `Тег ${token} не поддерживается. Доступны: ${supportedTagsLabel}.`;
        }
        const tag = match[2] as OfferLetterTag;
        if (!match[1]) {
            open.push(tag);
            continue;
        }
        const last = open.pop();
        if (last === undefined) {
            return `Лишний закрывающий тег </${tag}>: перед ним нет <${tag}>.`;
        }
        if (last !== tag) {
            return `Тег </${tag}> закрыт раньше, чем <${last}>: теги не должны пересекаться.`;
        }
    }
    const unclosed = open.pop();
    return unclosed ? `Не закрыт тег <${unclosed}>.` : null;
};
