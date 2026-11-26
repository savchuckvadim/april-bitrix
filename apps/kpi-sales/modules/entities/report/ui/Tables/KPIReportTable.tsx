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

interface KPIReportTableProps {
    report: ReportData[];
    /** Аннотации ячеек (например, % конверсий) — `${userId}:${innerCode}`. */
    annotations?: Map<string, RTableAnnotation>;
    /** План-аннотации («⌖ план · %») — отдельная подстрока. */
    planAnnotations?: Map<string, RTableAnnotation>;
    /** Выводимые названия показателей; по умолчанию — исходные без лишних пробелов. */
    labelOf?: IndicatorLabeler;
}

const KPIReportTable: React.FC<KPIReportTableProps> = ({
    report,
    annotations,
    planAnnotations,
    labelOf = defaultIndicatorLabeler,
}) => {
    // Публичный снимок: имена не ведут ссылками на user-report.
    const isPublic = useAppSelector(selectIsPublic);
    if (!report || !report.length || !report[0]?.kpi) {
        return <div>Нет данных для отображения</div>;
    }
    const tableData = labelTableData(getReportTableData(report), labelOf);

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
