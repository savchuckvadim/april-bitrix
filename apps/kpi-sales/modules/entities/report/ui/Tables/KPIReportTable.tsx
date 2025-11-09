import React from 'react';
import { ReportData } from '../../model/types/report/report-type';
import { getReportTableData } from '../../lib/ui-util';
// import { RTable } from '@/modules/shared';
import { RTable } from '@workspace/april-ui';

interface KPIReportTableProps {
    report: ReportData[];
}

const KPIReportTable: React.FC<KPIReportTableProps> = ({ report }) => {
    if (!report || !report.length || !report[0]?.kpi) {
        return <div>Нет данных для отображения</div>;
    }
    const tableData = getReportTableData(report);

    return (
        <RTable
            code={tableData.code}
            firstCellName={tableData.firstCellName}
            data={tableData.data}
            withLink={true}

        />
    );
};

export default KPIReportTable;
