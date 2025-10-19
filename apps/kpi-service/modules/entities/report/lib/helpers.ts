

import { ReportRequest } from '../model/report-service';
import { getKpiReportService, GetReportResponseDto, ReportData } from '@workspace/nest-api';

export const getReportDataAPI = async (
    reportData: ReportRequest,
): Promise<ReportData[] | null> => {
    let reportResponse: GetReportResponseDto | null = null;


    try {
        const api = getKpiReportService()
        reportResponse = await api.kpiReportOrkEventGet({
            domain: reportData.domain,
            filters: reportData.filters,
        })

        return reportResponse.report || [];
    } catch (error) {

        console.error('❌ Proxy error:', error);
    }
    return null;
};
