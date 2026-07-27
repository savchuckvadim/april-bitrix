import React from 'react';
import { RTable } from '@/modules/shared';
import { getCallingStatisticsTableData } from '../../lib/ui-util';
import { ReportCallingData } from '../../type/calling-type';
import type { RTableAnnotation } from '@workspace/april-ui';

interface CallingTableProps {
    data: ReportCallingData[];
    /** Аннотации ячеек (% конверсий) — `${userId}:${callingId}`. */
    annotations?: Map<string, RTableAnnotation>;
    /** План-аннотации («⌖ план · %») — отдельная подстрока. */
    planAnnotations?: Map<string, RTableAnnotation>;
}
export default function CallingTable({
    data,
    annotations,
    planAnnotations,
}: CallingTableProps) {
    if (!data || !data.length) return null;
    const tableData = getCallingStatisticsTableData(data);

    return (
        <RTable
            {...tableData}
            annotations={annotations}
            planAnnotations={planAnnotations}
        />
    );
}
