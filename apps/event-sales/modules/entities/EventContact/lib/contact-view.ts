import type { ContactSource } from '../type/event-contact-type';
import type { PBXContactStateItem } from '../type/pbx-contact-type';

/**
 * Как показать контакт человеку. Данные отдельно от вёрстки: имя и связь
 * читаются одинаково в комбобоксе, карточке и модалке.
 */

type ContactLike = Partial<PBXContactStateItem> | null | undefined;

/** Имя и фамилия одной строкой; безымянный контакт — «Контакт #12». */
export const contactName = (contact: ContactLike): string => {
    if (!contact) return '';
    const name = [contact.NAME, contact.LAST_NAME]
        .filter(Boolean)
        .join(' ')
        .trim();
    return name || `Контакт #${contact.ID}`;
};

/**
 * Первое значение мультиполя Битрикса.
 *
 * PHONE/EMAIL приходят массивом объектов `{ VALUE }` (в типах @workspace/bx
 * они помечены как string — там пометка «wrong»), но у контакта, собранного
 * руками, поле может оказаться и обычной строкой. Читаем оба вида.
 */
const firstMultifield = (raw: unknown): string | null => {
    if (typeof raw === 'string') return raw.trim() || null;
    if (!Array.isArray(raw)) return null;
    for (const item of raw) {
        const value =
            typeof item === 'string'
                ? item
                : ((item as { VALUE?: unknown })?.VALUE ?? '');
        if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return null;
};

export const contactPhone = (contact: ContactLike): string | null =>
    firstMultifield(contact?.PHONE);

export const contactEmail = (contact: ContactLike): string | null =>
    firstMultifield(contact?.EMAIL);

export const CONTACT_SOURCE_LABEL: Record<ContactSource, string> = {
    company: 'из компании',
    deal: 'из сделки',
    lead: 'из лида',
    relatedLead: 'из лида сделки',
    task: 'из привязки дела',
};

/**
 * Чем интереснее источник, тем он выше: контакт компании — норма и в подписи
 * не нуждается, а вот «из лида сделки» объясняет, откуда в списке взялся
 * человек, которого в компании нет.
 */
const SOURCE_PRIORITY: ContactSource[] = [
    'deal',
    'relatedLead',
    'lead',
    'task',
];

/** Подпись источника для карточки; обычный случай (компания) — без подписи. */
export const contactSourceLabel = (
    sources: ContactSource[] | undefined,
): string | null => {
    if (!sources?.length) return null;
    const source = SOURCE_PRIORITY.find(item => sources.includes(item));
    return source ? CONTACT_SOURCE_LABEL[source] : null;
};
