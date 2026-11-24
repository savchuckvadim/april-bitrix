import {
    PROVIDER_IMAGE_LEGACY_STATUSES,
    PROVIDER_IMAGE_LEGACY_STATUS_LABELS,
    PROVIDER_IMAGE_LEGACY_STATUS_TONE,
    PROVIDER_IMAGE_LEGACY_TOTALS_KEY,
    PROVIDER_IMAGE_ROLES,
    type ProviderImageLegacyImportReport,
    type ProviderImageLegacyImportRow,
    type ProviderImageLegacyImportTotals,
    type ProviderImageLegacyStatus,
    type ProviderImageLegacyTone,
    type ProviderImageRole,
} from '../model';

/** Подпись статуса: «перенесена», «будет перенесена». */
export function legacyStatusLabel(status: ProviderImageLegacyStatus): string {
    return PROVIDER_IMAGE_LEGACY_STATUS_LABELS[status];
}

/** Подпись роли для таблицы; null, если роль не определена. */
export function legacyRoleLabel(role: ProviderImageRole | null): string | null {
    if (role === null) return null;
    return PROVIDER_IMAGE_ROLES.find((meta) => meta.role === role)?.label ?? role;
}

/** Ключ строки отчёта: реквизиты, роль и файл легаси. */
export function legacyImportRowKey(row: ProviderImageLegacyImportRow): string {
    return `${row.rqId}:${row.role ?? '-'}:${row.legacyFileId}`;
}

/** Сравнение с пустыми в конце: строки без значения идут после заполненных. */
function compareNullable(a: string | null, b: string | null): number {
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    return a.localeCompare(b, 'ru');
}

/** Место роли в порядке экрана; без роли — в конец. */
function roleOrder(role: ProviderImageRole | null): number {
    const index = PROVIDER_IMAGE_ROLES.findIndex((meta) => meta.role === role);
    return index < 0 ? PROVIDER_IMAGE_ROLES.length : index;
}

/**
 * Порядок отчёта: портал по алфавиту (без портала в конце), внутри портала
 * реквизиты по названию и id, затем роли в порядке экрана и файл легаси.
 * Исходный массив не меняется.
 */
export function sortLegacyImportRows(
    rows: readonly ProviderImageLegacyImportRow[],
): ProviderImageLegacyImportRow[] {
    return [...rows].sort(
        (a, b) =>
            compareNullable(a.portalDomain, b.portalDomain) ||
            compareNullable(a.rqName, b.rqName) ||
            a.rqId - b.rqId ||
            roleOrder(a.role) - roleOrder(b.role) ||
            a.legacyFileId - b.legacyFileId,
    );
}

/** Строки одного статуса; `null` оставляет все. */
export function filterLegacyImportRows(
    rows: readonly ProviderImageLegacyImportRow[],
    status: ProviderImageLegacyStatus | null,
): ProviderImageLegacyImportRow[] {
    return status === null ? [...rows] : rows.filter((row) => row.status === status);
}

/** Плашка итогов: статус, подпись, число строк и окраска. */
export interface LegacyImportTotalsItem {
    status: ProviderImageLegacyStatus;
    label: string;
    count: number;
    tone: ProviderImageLegacyTone;
}

/** Итоги по статусам в порядке экрана; статусы без строк остаются в списке с нулём. */
export function legacyImportTotalsItems(
    totals: ProviderImageLegacyImportTotals,
): LegacyImportTotalsItem[] {
    return PROVIDER_IMAGE_LEGACY_STATUSES.map((status) => ({
        status,
        label: PROVIDER_IMAGE_LEGACY_STATUS_LABELS[status],
        count: totals[PROVIDER_IMAGE_LEGACY_TOTALS_KEY[status]],
        tone: PROVIDER_IMAGE_LEGACY_STATUS_TONE[status],
    }));
}

/** Проверка показала, что есть что переносить: после неё включается кнопка переноса. */
export function hasLegacyImportWork(
    report: Pick<ProviderImageLegacyImportReport, 'dryRun' | 'totals'> | null,
): boolean {
    return report !== null && report.dryRun && report.totals.wouldImport > 0;
}
