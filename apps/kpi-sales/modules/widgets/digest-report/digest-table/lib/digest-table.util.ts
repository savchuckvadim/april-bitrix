import type {
    DigestCount,
    DigestEmployee,
    DigestMetricCode,
    DigestRow,
} from '@/modules/entities/digest';

export type SortDir = 'asc' | 'desc';
export type DigestSortKey = DigestMetricCode | 'name';

export interface DigestSort {
    key: DigestSortKey;
    dir: SortDir;
}

export const DEFAULT_DIGEST_SORT: DigestSort = { key: 'done', dir: 'desc' };

/** Следующее состояние сортировки по клику на колонку. */
export const nextSort = (current: DigestSort, key: DigestSortKey): DigestSort => {
    if (current.key !== key) return { key, dir: key === 'name' ? 'asc' : 'desc' };
    return { key, dir: current.dir === 'desc' ? 'asc' : 'desc' };
};

export const sortDigestRows = (rows: readonly DigestRow[], sort: DigestSort): DigestRow[] => {
    const sign = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
        if (sort.key === 'name') return sign * a.name.localeCompare(b.name, 'ru');
        const av = a.values[sort.key];
        const bv = b.values[sort.key];
        if (av === null && bv === null) return a.name.localeCompare(b.name, 'ru');
        if (av === null) return 1;
        if (bv === null) return -1;
        return sign * (av - bv) || a.name.localeCompare(b.name, 'ru');
    });
};

/** Метрики-счётчики с разбивкой по типам (для тултипов ячеек). */
const COUNT_FIELDS: Partial<Record<DigestMetricCode, keyof DigestEmployee>> = {
    plannedAtStart: 'plannedAtStart',
    planned: 'planned',
    plannedBeyond: 'plannedBeyond',
    done: 'done',
    notHeld: 'notHeld',
    postponed: 'postponed',
    documents: 'documents',
};

export const countMetricOf = (
    employee: DigestEmployee,
    code: DigestMetricCode,
): DigestCount | null => {
    const field = COUNT_FIELDS[code];
    return field ? (employee[field] as DigestCount) : null;
};
