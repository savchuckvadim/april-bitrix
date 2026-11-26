'use client'
import React, { useMemo } from 'react';
import type { RTableAction } from '@workspace/april-ui';
import {
    defaultIndicatorLabeler,
    type IndicatorLabeler,
} from '@/modules/shared/lib/indicator-labels';
import {
    ReportTotalTable,
    type TableTotalsDecorator,
} from '@/modules/shared';
import { ReportData } from '../../model/types/report/report-type';
import { getReportTotalColumns } from '../../lib/report-totals.util';

interface KPIReportTotalTableProps {
    report: ReportData[];
    /** Выводимые названия показателей; по умолчанию — исходные без лишних пробелов. */
    labelOf?: IndicatorLabeler;
    /** Дополнение итога колонками (итог плана слева от итога факта); нет — как есть. */
    withPlanTotals?: TableTotalsDecorator;
}

export const KPIReportTotalTable: React.FC<KPIReportTotalTableProps> = ({
    report,
    labelOf = defaultIndicatorLabeler,
    withPlanTotals,
}) => {
    // Общие суммы по каждому показателю (+ итог плана, если включён)
    const columns = useMemo(() => {
        const totals: RTableAction[] = getReportTotalColumns(
            report ?? [],
            labelOf,
        ).map(({ code, name, value }) => ({ code, name, value }));
        if (!withPlanTotals) return totals;
        const userIds = (report ?? []).map(row =>
            Number(row.user?.ID ?? row.id),
        );
        return withPlanTotals(totals, userIds);
    }, [report, labelOf, withPlanTotals]);

    return <ReportTotalTable columns={columns} />;
};
