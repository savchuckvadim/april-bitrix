import React from 'react';
import { ReportData } from '../../model/types/report/report-type';
import { getReportTableData } from '../../lib/ui-util';
// import { RTable } from '@/modules/shared';
import { RTable, RTableAnnotation } from '@workspace/april-ui';
import { useAppSelector, selectIsPublic } from '@/modules/app';

interface KPIReportTableProps {
    report: ReportData[];
    /** Аннотации ячеек (например, % конверсий) — `${userId}:${innerCode}`. */
    annotations?: Map<string, RTableAnnotation>;
    /** План-аннотации («⌖ план · %») — отдельная подстрока. */
    planAnnotations?: Map<string, RTableAnnotation>;
}

const KPIReportTable: React.FC<KPIReportTableProps> = ({
    report,
    annotations,
    planAnnotations,
}) => {
    // Публичный снимок: имена не ведут ссылками на user-report.
    const isPublic = useAppSelector(selectIsPublic);
    if (!report || !report.length || !report[0]?.kpi) {
        return <div>Нет данных для отображения</div>;
    }
    const tableData = getReportTableData(report);

    return (
        <RTable
            code={tableData.code}
            firstCellName={tableData.firstCellName}
            data={tableData.data}
            withLink={!isPublic}
            annotations={annotations}
            planAnnotations={planAnnotations}
        />
    );
};

export default KPIReportTable;
