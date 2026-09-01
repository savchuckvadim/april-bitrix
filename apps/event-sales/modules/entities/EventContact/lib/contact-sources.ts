import type { ContactSource } from '../type/event-contact-type';

/**
 * Кого считать «контактами этого клиента», когда компании нет.
 *
 * Раньше список строился ровно из одного места — контактов компании. В сделке
 * без компании и в лиде он оставался пустым молча: поле «с кем говорили»
 * показывало «Контактов пока нет», хотя контакт был — в самой сделке или в
 * лиде, из которого она выросла. Здесь чистая часть сбора: что можно достать
 * из уже загруженных объектов, без запросов.
 */

/** Числовой id или null: Битрикс отдаёт «0», '' и undefined как «нет связи». */
const toId = (raw: unknown): number | null => {
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
};

/** Уникальные положительные id в порядке появления. */
export const uniqueIds = (ids: Array<number | null | undefined>): number[] => [
    ...new Set(
        ids.filter((id): id is number => Number.isFinite(id) && Number(id) > 0),
    ),
];

/**
 * Контакты сделки, известные из самого объекта: основной CONTACT_ID и
 * множественный CONTACT_IDS. Полный список всё равно спрашиваем у портала
 * (crm.deal.contact.items.get) — эти два поля лишь то, что уже под рукой.
 */
export const dealContactIds = (
    deal: Record<string, unknown> | null | undefined,
): number[] => {
    if (!deal) return [];
    const many = Array.isArray(deal.CONTACT_IDS) ? deal.CONTACT_IDS : [];
    return uniqueIds([toId(deal.CONTACT_ID), ...many.map(toId)]);
};

/** Контакт лида — у лида он ровно один. */
export const leadContactId = (
    lead: Record<string, unknown> | null | undefined,
): number | null => toId(lead?.CONTACT_ID);

export interface RelatedLeadIdsParams {
    /** Текущая сделка: её LEAD_ID — тот самый лид, из которого она выросла. */
    deal?: Record<string, unknown> | null;
    /** Текущий лид: его контакт берём отдельным источником, здесь не нужен. */
    lead?: Record<string, unknown> | null;
    /** Лиды из CRM-привязок задачи (L_xxx). */
    taskLeadIds?: number[];
}

/**
 * Лиды, у которых имеет смысл спросить контакт: породивший сделку и
 * привязанные к задаче. Текущий лид исключаем — он отдельный источник.
 */
export const relatedLeadIds = ({
    deal,
    lead,
    taskLeadIds = [],
}: RelatedLeadIdsParams): number[] => {
    const currentLeadId = toId(lead?.ID);
    return uniqueIds([toId(deal?.LEAD_ID), ...taskLeadIds]).filter(
        id => id !== currentLeadId,
    );
};

/** Что и откуда собрали: id → источники (один контакт бывает сразу в двух). */
export type ContactSourceMap = Record<number, ContactSource[]>;

/** Сущности, опрос которых стоит сетевого запроса. */
export type ContactRequestEntity = 'company' | 'deal' | 'lead';

/**
 * Ключ источника в реестре «уже опрошенных»: `company:1`, `deal:5`, `lead:7`.
 *
 * Листенеры зовут сбор контактов 2–3 раза за старт — реестр в слайсе даёт
 * повторному прогону опрашивать только НОВЫЕ источники (появилась сделка →
 * только её contactItems). id нормализуем числом: `'5'` и `5` — один источник.
 */
export const sourceRequestKey = (
    entity: ContactRequestEntity,
    id: number | string,
): string => `${entity}:${Number(id)}`;

export const addSource = (
    map: ContactSourceMap,
    source: ContactSource,
    ids: number[],
): ContactSourceMap => {
    for (const id of ids) {
        const known = map[id] ?? [];
        if (!known.includes(source)) map[id] = [...known, source];
    }
    return map;
};
