import React from 'react';

import { getReportTableData } from '../../lib/ui-util';
import { RTable } from '@/modules/shared';
import { OrkReportKpiData } from '@workspace/nest-api';

interface KPIReportTableProps {
    report: OrkReportKpiData[];
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
