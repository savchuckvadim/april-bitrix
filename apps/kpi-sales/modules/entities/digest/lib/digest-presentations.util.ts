/**
 * Презентации дня: подписи статусов, фильтры, сводки по сотрудникам,
 * комплектам и часам. Чистые функции — покрыты vitest.
 */
import type { DigestPresDayStatus, DigestPresentation } from '../model';
import { HOURS_IN_DAY, type HourBucket } from './digest-timeline.util';

export const PRES_STATUS_LABELS: Record<DigestPresDayStatus, string> = {
    held: 'Проведена',
    notHeld: 'Не состоялась',
    refused: 'Отказ после презентации',
    postponed: 'Перенесена',
    pending: 'Ждёт (на день)',
    plannedNext: 'Новый план',
    other: 'Прочее',
};

/** Порядок статусов в графиках и фильтрах. */
export const PRES_STATUS_ORDER: readonly DigestPresDayStatus[] = [
    'held',
    'notHeld',
    'refused',
    'postponed',
    'pending',
    'plannedNext',
];

/** Токены цветов статусов (april-tokens.css, блок --digest-*). */
export const PRES_STATUS_TOKENS: Record<DigestPresDayStatus, string> = {
    held: '--digest-done',
    notHeld: '--digest-not-held',
    refused: '--digest-refusals',
    postponed: '--digest-postponed',
    pending: '--digest-planned-at-start',
    plannedNext: '--digest-planned',
    other: '--digest-expired',
};

export type PresCompanyFilter = 'all' | 'with' | 'without';
export type PresInitiativeFilter = 'all' | 'planned' | 'spontaneous';

export interface PresFilter {
    /** null — все сотрудники выборки. */
    userId: number | null;
    /** Пусто — все статусы. */
    statuses: ReadonlySet<DigestPresDayStatus>;
    company: PresCompanyFilter;
    initiative: PresInitiativeFilter;
}

export const EMPTY_PRES_FILTER: PresFilter = {
    userId: null,
    statuses: new Set(),
    company: 'all',
    initiative: 'all',
};

export const filterPresentations = (
    items: readonly DigestPresentation[],
    filter: PresFilter,
): DigestPresentation[] =>
    items.filter(
        item =>
            (filter.userId === null || item.assignedId === filter.userId) &&
            (!filter.statuses.size || filter.statuses.has(item.dayStatus)) &&
            (filter.company === 'all' ||
                (filter.company === 'with' ? !!item.company : !item.company)) &&
            (filter.initiative === 'all' ||
                (filter.initiative === 'spontaneous' ? item.spontaneous : !item.spontaneous)),
    );

export interface PresSummary {
    total: number;
    plannedAtStart: number;
    held: number;
    notHeld: number;
    refused: number;
    postponed: number;
    pending: number;
    plannedNext: number;
    spontaneous: number;
    withCompany: number;
    /** Σ сумм проведённых с комплектом. */
    heldSum: number;
    /** Проведено / стояло на день (конверсия плана CRM); null — нет базы. */
    planConversion: number | null;
}

export const summarizePresentations = (items: readonly DigestPresentation[]): PresSummary => {
    const summary: PresSummary = {
        total: items.length,
        plannedAtStart: 0,
        held: 0,
        notHeld: 0,
        refused: 0,
        postponed: 0,
        pending: 0,
        plannedNext: 0,
        spontaneous: 0,
        withCompany: 0,
        heldSum: 0,
        planConversion: null,
    };
    for (const item of items) {
        if (item.plannedAtStart) summary.plannedAtStart += 1;
        if (item.spontaneous) summary.spontaneous += 1;
        if (item.company) summary.withCompany += 1;
        if (item.dayStatus !== 'other') summary[item.dayStatus] += 1;
        if (item.dayStatus === 'held') summary.heldSum += item.sum;
    }
    const heldFromPlan = items.filter(item => item.plannedAtStart && item.dayStatus === 'held').length;
    summary.planConversion = summary.plannedAtStart > 0 ? heldFromPlan / summary.plannedAtStart : null;
    return summary;
};

export interface ComplectStat {
    name: string;
    count: number;
    sum: number;
}

/** Комплекты проведённых презентаций: количество и сумма, по убыванию количества. */
export const complectStats = (items: readonly DigestPresentation[]): ComplectStat[] => {
    const map = new Map<string, ComplectStat>();
    for (const item of items) {
        if (item.dayStatus !== 'held' || !item.complectName) continue;
        const stat = map.get(item.complectName) ?? { name: item.complectName, count: 0, sum: 0 };
        stat.count += 1;
        stat.sum += item.sum;
        map.set(item.complectName, stat);
    }
    return [...map.values()].sort((a, b) => b.count - a.count || b.sum - a.sum);
};

/** Почасовые корзины по статусам + презентации каждого часа (для тултипа). */
export const bucketPresentationsByHour = (
    items: readonly DigestPresentation[],
): { buckets: HourBucket[]; itemsByHour: DigestPresentation[][] } => {
    const buckets: HourBucket[] = Array.from({ length: HOURS_IN_DAY }, (_, hour) => ({ hour, values: {} }));
    const itemsByHour: DigestPresentation[][] = Array.from({ length: HOURS_IN_DAY }, () => []);
    for (const item of items) {
        if (item.hour === null || item.hour < 0 || item.hour >= HOURS_IN_DAY) continue;
        const bucket = buckets[item.hour]!;
        bucket.values[item.dayStatus] = (bucket.values[item.dayStatus] ?? 0) + 1;
        itemsByHour[item.hour]!.push(item);
    }
    return { buckets, itemsByHour };
};

/** Кто: компания, иначе лид, иначе контакт. */
export const presentationClientTitle = (item: Pick<DigestPresentation, 'company' | 'lead' | 'contact'>): string =>
    item.company?.title || (item.lead ? `Лид: ${item.lead.title}` : '') || item.contact?.title || 'Без клиента';
