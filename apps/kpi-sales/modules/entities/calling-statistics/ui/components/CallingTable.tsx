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

interface CallingTableProps {
    data: ReportCallingData[];
    /** Аннотации ячеек (% конверсий) — `${userId}:${callingId}`. */
    annotations?: Map<string, RTableAnnotation>;
    /** План-аннотации («⌖ план · %») — отдельная подстрока. */
    planAnnotations?: Map<string, RTableAnnotation>;
    /** Выводимые названия показателей; по умолчанию — исходные без лишних пробелов. */
    labelOf?: IndicatorLabeler;
}
export default function CallingTable({
    data,
    annotations,
    planAnnotations,
    labelOf = defaultIndicatorLabeler,
}: CallingTableProps) {
    if (!data || !data.length) return null;
    const tableData = labelTableData(getCallingStatisticsTableData(data), labelOf);

    return (
        <RTable
            {...tableData}
            annotations={annotations}
            planAnnotations={planAnnotations}
        />
    );
}
