'use client';

import { useMemo, useState } from 'react';
import {
    filterLegacyImportRows,
    legacyImportTotalsItems,
    sortLegacyImportRows,
    type ProviderImageLegacyImportReport,
    type ProviderImageLegacyStatus,
} from '@/modules/entities/portal-provider/provider-image';

/**
 * Данные таблицы отчёта: плашки итогов, строки в порядке портал → реквизиты →
 * роль и фильтр по статусу (повторное нажатие на ту же плашку снимает фильтр).
 */
export function useLegacyImportReport(report: ProviderImageLegacyImportReport) {
    const [activeStatus, setActiveStatus] = useState<ProviderImageLegacyStatus | null>(null);

    const sortedRows = useMemo(() => sortLegacyImportRows(report.rows), [report.rows]);
    const rows = useMemo(
        () => filterLegacyImportRows(sortedRows, activeStatus),
        [sortedRows, activeStatus],
    );
    const items = useMemo(() => legacyImportTotalsItems(report.totals), [report.totals]);

    return {
        items,
        rows,
        totalRows: sortedRows.length,
        activeStatus,
        toggleStatus: (status: ProviderImageLegacyStatus): void =>
            setActiveStatus((current) => (current === status ? null : status)),
        clearStatus: (): void => setActiveStatus(null),
    };
}
