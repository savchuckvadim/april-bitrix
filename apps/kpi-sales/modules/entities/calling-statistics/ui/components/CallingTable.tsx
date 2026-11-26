import React from 'react';
import { RTable } from '@/modules/shared';
import { getCallingStatisticsTableData } from '../../lib/ui-util';
import { ReportCallingData } from '../../type/calling-type';
import type { RTableAnnotation } from '@workspace/april-ui';
import {
    defaultIndicatorLabeler,
    labelTableData,
    type IndicatorLabeler,
} from '@/modules/shared/lib/indicator-labels';
import type { TableRowsDecorator } from '@/modules/shared/lib/table-decorators';

interface CallingTableProps {
    data: ReportCallingData[];
    /** Аннотации ячеек (% конверсий) — `${userId}:${callingId}`. */
    annotations?: Map<string, RTableAnnotation>;
    /** План-аннотации («⌖ план · %») — отдельная подстрока. */
    planAnnotations?: Map<string, RTableAnnotation>;
    /** Выводимые названия показателей; по умолчанию — исходные без лишних пробелов. */
    labelOf?: IndicatorLabeler;
    /** Дополнение строк колонками (колонки планов слева от факта); нет — как есть. */
    withPlanColumns?: TableRowsDecorator;
}
export default function CallingTable({
    data,
    annotations,
    planAnnotations,
    labelOf = defaultIndicatorLabeler,
    withPlanColumns,
}: CallingTableProps) {
    if (!data || !data.length) return null;
    // Свои названия, затем колонки планов (их подписи — свои)
    const tableData = labelTableData(getCallingStatisticsTableData(data), labelOf);
    const rows = withPlanColumns ? withPlanColumns(tableData.data) : tableData.data;

    return (
        <RTable
            {...tableData}
            data={rows}
            annotations={annotations}
            planAnnotations={planAnnotations}
        />
    );
}
