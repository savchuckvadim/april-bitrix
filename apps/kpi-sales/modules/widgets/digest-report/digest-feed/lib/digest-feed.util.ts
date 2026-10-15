/**
 * Лента дня: группы по сотрудникам с саммари, общая хронология, фильтры
 * по исходу и типу, порционный показ. Чистые функции.
 */
import type { Tone } from '@workspace/april-ui';
import {
    stackOfRecord,
    type DigestRecord,
    type DigestRow,
    type DigestStackKey,
} from '@/modules/entities/digest';
import type { NameMap } from '../../lib/catalog-names.util';

export interface FeedSummary {
    total: number;
    done: number;
    notHeld: number;
    postponed: number;
    planned: number;
    documents: number;
    sales: number;
    refusals: number;
}

export interface FeedItem {
    record: DigestRecord;
    userId: number;
    userName: string;
    stack: DigestStackKey | null;
}

export interface FeedGroup {
    userId: number;
    name: string;
    items: FeedItem[];
    summary: FeedSummary;
}

const byEventDate = (a: FeedItem, b: FeedItem): number =>
    (a.record.eventDate ?? '').localeCompare(b.record.eventDate ?? '') ||
    Number(a.record.id) - Number(b.record.id);

export const emptyFeedSummary = (): FeedSummary => ({
    total: 0,
    done: 0,
    notHeld: 0,
    postponed: 0,
    planned: 0,
    documents: 0,
    sales: 0,
    refusals: 0,
});

export const summarizeItems = (items: readonly FeedItem[]): FeedSummary => {
    const summary = emptyFeedSummary();
    for (const item of items) {
        summary.total += 1;
        if (item.stack) summary[item.stack] += 1;
    }
    return summary;
};

/** Группы ленты: сотрудник → события дня в хронологическом порядке + саммари. */
export const buildFeedGroups = (rows: readonly DigestRow[]): FeedGroup[] =>
    rows
        .map(row => {
            const items = row.employee.records
                .map(record => ({
                    record,
                    userId: row.userId,
                    userName: row.name,
                    stack: stackOfRecord(record),
                }))
                .sort(byEventDate);
            return { userId: row.userId, name: row.name, items, summary: summarizeItems(items) };
        })
        .filter(group => group.items.length > 0);

/** Общая хронология нескольких сотрудников. */
export const mergeFeedItems = (groups: readonly FeedGroup[]): FeedItem[] =>
    groups.flatMap(group => group.items).sort(byEventDate);

export type FeedStackFilter = 'all' | DigestStackKey | 'outcomes';

export const FEED_STACK_OPTIONS: readonly { value: FeedStackFilter; label: string }[] = [
    { value: 'all', label: 'Все исходы' },
    { value: 'done', label: 'Состоялось' },
    { value: 'notHeld', label: 'Не состоялось' },
    { value: 'postponed', label: 'Перенесено' },
    { value: 'planned', label: 'Новые планы' },
    { value: 'documents', label: 'Документы' },
    { value: 'outcomes', label: 'Продажи и отказы' },
];

export const FEED_TYPE_ALL = 'all';

const stackMatches = (item: FeedItem, filter: FeedStackFilter): boolean => {
    if (filter === 'all') return true;
    if (filter === 'outcomes') return item.stack === 'sales' || item.stack === 'refusals';
    return item.stack === filter;
};

export const filterFeedItems = (
    items: readonly FeedItem[],
    stack: FeedStackFilter,
    typeCode: string,
): FeedItem[] =>
    items.filter(
        item =>
            stackMatches(item, stack) &&
            (typeCode === FEED_TYPE_ALL || item.record.typeCode === typeCode),
    );

/** Типы событий в выборке (по убыванию числа записей) + «Все типы». */
export const typeOptionsOf = (
    items: readonly FeedItem[],
    names: NameMap,
): { value: string; label: string }[] => {
    const counts = new Map<string, number>();
    for (const item of items) {
        const code = item.record.typeCode;
        if (code) counts.set(code, (counts.get(code) ?? 0) + 1);
    }
    return [
        { value: FEED_TYPE_ALL, label: 'Все типы' },
        ...[...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([code, count]) => ({
                value: code,
                label: `${names[code] ?? code} (${count})`,
            })),
    ];
};

/** Порция ленты: первая и каждая следующая по кнопке «Показать ещё». */
export const FEED_PAGE_SIZE = 80;

/** Тон бэйджа действия. */
export const actionTone = (actionCode: string | null): Tone => {
    switch (actionCode) {
        case 'done':
            return 'success';
        case 'act_noresult_fail':
            return 'destructive';
        case 'pound':
            return 'warning';
        case 'plan':
            return 'info';
        case 'act_send':
            return 'primary';
        default:
            return 'muted';
    }
};

/** У плана/переноса есть следующий шаг — показываем дедлайн. */
export const isPlanRecord = (record: DigestRecord): boolean =>
    record.actionCode === 'plan' || record.actionCode === 'pound';

export const feedRecordsCount = (groups: readonly FeedGroup[]): number =>
    groups.reduce((sum, group) => sum + group.items.length, 0);
