'use client'
import React, { useMemo } from 'react';
import type { RTableAction } from '@workspace/april-ui';
import {
    ReportTotalTable,
    type RTableProps,
    type TableTotalsDecorator,
} from '@/modules/shared';
import type { IndicatorLabeler } from '@/modules/shared/lib/indicator-labels';
import { getMergedTotalColumns } from '../lib/merged-labels.util';

interface MergedReportTotalTableProps {
    /** Строки объединённой таблицы с ИСХОДНЫМИ названиями колонок. */
    data: RTableProps['data'];
    /** Выбор колонок по исходным названиям; пусто — все. */
    selectedActions: string[];
    /** Выводимые названия колонок. */
    labelOf: IndicatorLabeler;
    /** Дополнение итога колонками (итог плана слева от итога факта); нет — как есть. */
    withPlanTotals?: TableTotalsDecorator;
}

export const MergedReportTotalTable: React.FC<MergedReportTotalTableProps> = ({
    data,
    selectedActions,
    labelOf,
    withPlanTotals,
}) => {
    // Общие суммы по каждому показателю (название — выводимое; + итог плана)
    const columns = useMemo(() => {
        const rows = data ?? [];
        const totals: RTableAction[] = getMergedTotalColumns(
            rows,
            selectedActions,
            labelOf,
        );
        if (!withPlanTotals) return totals;
        const userIds = rows.flatMap(row => (row.id === undefined ? [] : [row.id]));
        return withPlanTotals(totals, userIds);
    }, [data, selectedActions, labelOf, withPlanTotals]);

    return <ReportTotalTable columns={columns} />;
};
