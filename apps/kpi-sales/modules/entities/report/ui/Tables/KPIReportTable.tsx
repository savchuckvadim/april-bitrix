import React from 'react';
import { ReportData } from '../../model/types/report/report-type';
import { getReportTableData } from '../../lib/ui-util';
// import { RTable } from '@/modules/shared';
import { RTable, RTableAnnotation } from '@workspace/april-ui';
import { useAppSelector, selectIsPublic } from '@/modules/app';
import {
    defaultIndicatorLabeler,
    labelTableData,
    type IndicatorLabeler,
} from '@/modules/shared/lib/indicator-labels';
import type { TableRowsDecorator } from '@/modules/shared/lib/table-decorators';

interface KPIReportTableProps {
    report: ReportData[];
    /** Аннотации ячеек (например, % конверсий) — `${userId}:${innerCode}`. */
    annotations?: Map<string, RTableAnnotation>;
    /** План-аннотации («⌖ план · %») — отдельная подстрока. */
    planAnnotations?: Map<string, RTableAnnotation>;
    /** Выводимые названия показателей; по умолчанию — исходные без лишних пробелов. */
    labelOf?: IndicatorLabeler;
    /** Дополнение строк колонками (колонки планов слева от факта); нет — как есть. */
    withPlanColumns?: TableRowsDecorator;
}

const KPIReportTable: React.FC<KPIReportTableProps> = ({
    report,
    annotations,
    planAnnotations,
    labelOf = defaultIndicatorLabeler,
    withPlanColumns,
}) => {
    // Публичный снимок: имена не ведут ссылками на user-report.
    const isPublic = useAppSelector(selectIsPublic);
    if (!report || !report.length || !report[0]?.kpi) {
        return <div>Нет данных для отображения</div>;
    }
    // Свои названия, затем колонки планов (их подписи — свои)
    const tableData = labelTableData(getReportTableData(report), labelOf);
    const rows = withPlanColumns ? withPlanColumns(tableData.data) : tableData.data;

    return (
        <RTable
            code={tableData.code}
            firstCellName={tableData.firstCellName}
            data={rows}
            withLink={!isPublic}
            annotations={annotations}
            planAnnotations={planAnnotations}
        />
    );
};

export default KPIReportTable;
