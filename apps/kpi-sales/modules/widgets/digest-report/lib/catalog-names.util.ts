/**
 * Имена типов/действий/причин с портала (код → название) и строки
 * разбивок для тултипов. Общее для под-виджетов (таблица, лента,
 * презентации) — поэтому в lib родителя.
 */
import {
    DIGEST_ACTION_LABELS,
    type DigestCatalog,
    type DigestCount,
} from '@/modules/entities/digest';

export type NameMap = Record<string, string>;

export interface CatalogNames {
    types: NameMap;
    actions: NameMap;
    reasons: NameMap;
}

export const catalogNames = (catalog: DigestCatalog): CatalogNames => ({
    types: Object.fromEntries(catalog.types.map(item => [item.code, item.name])),
    actions: {
        ...DIGEST_ACTION_LABELS,
        ...Object.fromEntries(catalog.actions.map(item => [item.code, item.name])),
    },
    reasons: Object.fromEntries(
        catalog.noresultReasons.map(item => [item.code, item.name]),
    ),
});

/** «Холодный звонок: 4» по убыванию — строки тултипа разбивки. */
export const breakdownLines = (count: DigestCount, names: NameMap): string[] =>
    Object.entries(count.byType)
        .filter(([, value]) => value > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([code, value]) => `${names[code] ?? code}: ${value}`);

/** Причины нерезультата сотрудника строками. */
export const reasonLines = (reasons: Record<string, number>, names: NameMap): string[] =>
    Object.entries(reasons)
        .filter(([, value]) => value > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([code, value]) => `${names[code] ?? code}: ${value}`);
