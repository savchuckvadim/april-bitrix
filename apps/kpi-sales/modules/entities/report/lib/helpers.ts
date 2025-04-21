import { API_METHOD } from "@workspace/api";
import { ReportData } from "../model/types/report/report-type";
import { ReportRequest } from "../model/report-service";

export const getReportDataAPI = async (reportData: ReportRequest): Promise<ReportData[] | null> => {
    let reportResponse: ReportData[] | null = null;
    try {
        const response = await fetch('/api/proxy/hook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // 💥 обязательно
            },
            body: JSON.stringify({
                url: 'full/report/get',
                method: API_METHOD.POST,
                model: 'report',
                data: reportData
            }),
        });
        reportResponse = await response.json() as ReportData[] | null
    } catch (error) {
        console.error('❌ Proxy error:', error);
    }
    return reportResponse;
}
