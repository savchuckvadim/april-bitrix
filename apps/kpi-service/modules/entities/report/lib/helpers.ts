

import { getOrkReport, GetOrkReportKpiResponseDto, OrkReportKpiData } from '@workspace/nest-api';
import { ReportRequest } from '../model/report-service';


export const getReportDataAPI = async (
    reportData: ReportRequest,
): Promise<OrkReportKpiData[] | null> => {
    let reportResponse: GetOrkReportKpiResponseDto | null = null;


    try {
        const api = getOrkReport()
        reportResponse = await api.kpiGet({
            domain: reportData.domain,
            filters: reportData.filters,
        })

        return reportResponse.report || [];
    } catch (error) {

        console.error('❌ Proxy error:', error);
    }
    return null;
};
