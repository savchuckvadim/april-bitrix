import { OrkReportKpiData as ReportData } from '@workspace/nest-api';
import { RTableProps } from '../../../shared';


export const getReportTableData = (report: ReportData[]): RTableProps => {
    const tableData: RTableProps = {
        code: `report`,
        firstCellName: 'Менеджер',
        data: report.map(report => ({
            id: Number(report.user.ID) || undefined,
            name: report.userName || 'Менеджер',
            actions: report.kpi.map(kpi => ({
                name: kpi.action.name || 'Unknown',
                value: kpi.count,
            })),
        })),
    };

    return tableData;
};
