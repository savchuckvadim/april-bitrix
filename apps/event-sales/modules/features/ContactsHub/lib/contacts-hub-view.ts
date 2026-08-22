import type { RelatedCrmDetails } from '@/modules/entities/RelatedCrm';
import type {
    ContactSource,
    PBXContactStateItem,
} from '@/modules/entities/EventContact';
import type { ContactSourceMap } from '@/modules/entities/EventContact';
import { contactName } from '@/modules/entities/EventContact';

/**
 * Сборка строк виджета «Все контакты» — чистые функции без стора.
 *
 * Виджет отвечает на вопрос «как дозвониться до клиента вообще»: телефоны и
 * почты всех контактов из всех связей, точки связи самого лида и контакты
 * связанных сущностей с бэка. Один контакт бывает в нескольких источниках —
 * строка одна, бэйджей несколько.
 */

/** Откуда строка: источники контакта + два не-контактных происхождения. */
export type HubSource = ContactSource | 'related' | 'leadEntity';

export const HUB_SOURCE_LABEL: Record<HubSource, string> = {
    company: 'Компания',
    deal: 'Сделка',
    lead: 'Лид',
    relatedLead: 'Лид сделки',
    task: 'Дело',
    related: 'Связи',
    leadEntity: 'Лид (сущность)',
};

/** Текущая сущность контекста — её строки выделяются в списке. */
export const CURRENT_ENTITY_SOURCES: ReadonlySet<HubSource> = new Set([
    'company',
    'deal',
    'lead',
    'leadEntity',
]);

export interface HubRow {
    key: string;
    /** Контакт CRM — для ссылки на карточку; null у строки-сущности. */
    contactId: number | null;
    name: string;
    post: string | null;
    phones: string[];
    emails: string[];
    sources: HubSource[];
    /** Выбран текущим в плане/отчёте. */
    current: 'plan' | 'report' | 'both' | null;
}

/** Мультиполе Битрикса (PHONE/EMAIL) → плоский список значений. */
export const multiValues = (raw: unknown): string[] => {
    if (!Array.isArray(raw)) return [];
    return raw
        .map(item =>
            typeof item === 'string'
                ? item
                : String((item as { VALUE?: unknown })?.VALUE ?? ''),
        )
        .map(value => value.trim())
        .filter(Boolean);
};

const currentMark = (
    id: number,
    planId: number | null,
    reportId: number | null,
): HubRow['current'] => {
    const isPlan = planId === id;
    const isReport = reportId === id;
    if (isPlan && isReport) return 'both';
    if (isPlan) return 'plan';
    if (isReport) return 'report';
    return null;
};

export interface BuildHubRowsParams {
    contacts: PBXContactStateItem[];
    sourceById: ContactSourceMap;
    planContactId: number | null;
    reportContactId: number | null;
    /** Лид контекста — его PHONE/EMAIL отдельной строкой-сущностью. */
    lead: Record<string, unknown> | null;
    /** Связи клиента с бэка: контакты владельца с телефонами. */
    details: RelatedCrmDetails | null;
}

export const buildHubRows = ({
    contacts,
    sourceById,
    planContactId,
    reportContactId,
    lead,
    details,
}: BuildHubRowsParams): HubRow[] => {
    const rows: HubRow[] = [];
    const seenContactIds = new Set<number>();

    for (const contact of contacts) {
        const id = Number(contact.ID);
        if (!Number.isFinite(id) || id <= 0) continue;
        seenContactIds.add(id);
        rows.push({
            key: `contact-${id}`,
            contactId: id,
            name: contactName(contact),
            post: contact.POST?.trim() || null,
            phones: multiValues(contact.PHONE),
            emails: multiValues(contact.EMAIL),
            sources: sourceById[id] ?? [],
            current: currentMark(id, planContactId, reportContactId),
        });
    }

    // Контакты связей с бэка — только те, кого ещё нет в списке фронта:
    // у бэка есть телефоны контактов владельца, которых мы не грузили.
    for (const related of details?.contacts ?? []) {
        const id = Number(related.id);
        if (!Number.isFinite(id) || id <= 0 || seenContactIds.has(id)) {
            continue;
        }
        const name = [related.name, related.lastName]
            .filter(Boolean)
            .join(' ')
            .trim();
        rows.push({
            key: `related-${id}`,
            contactId: id,
            name: name || `Контакт ${id}`,
            post: related.post?.trim() || null,
            phones: (related.phones ?? []).filter(Boolean),
            emails: [],
            sources: ['related'],
            current: currentMark(id, planContactId, reportContactId),
        });
    }

    // Точки связи самого лида: у лида телефон живёт на сущности, контакт
    // может отсутствовать вовсе — а дозваниваться надо.
    const leadPhones = multiValues(lead?.PHONE);
    const leadEmails = multiValues(lead?.EMAIL);
    if (leadPhones.length || leadEmails.length) {
        const title = String(lead?.TITLE ?? '').trim();
        rows.push({
            key: 'lead-entity',
            contactId: null,
            name: title || 'Лид',
            post: null,
            phones: leadPhones,
            emails: leadEmails,
            sources: ['leadEntity'],
            current: null,
        });
    }

    return rows;
};

/** Источники, реально встречающиеся в строках — для набора фильтров. */
export const collectHubSources = (rows: HubRow[]): HubSource[] => {
    const seen = new Set<HubSource>();
    for (const row of rows) row.sources.forEach(source => seen.add(source));
    return (Object.keys(HUB_SOURCE_LABEL) as HubSource[]).filter(source =>
        seen.has(source),
    );
};

export interface HubFilters {
    /** Пустой набор = показывать все источники. */
    sources: ReadonlySet<HubSource>;
    onlyWithPhone: boolean;
}

export const filterHubRows = (rows: HubRow[], filters: HubFilters): HubRow[] =>
    rows.filter(row => {
        if (filters.onlyWithPhone && !row.phones.length) return false;
        if (!filters.sources.size) return true;
        return row.sources.some(source => filters.sources.has(source));
    });
