import { API_METHOD, backAPI, EBACK_ENDPOINT, IBackResponse } from "@workspace/api";
import { ReportData } from "../model/types/report/report-type";
import { ReportRequest } from "../model/report-service";

export const getReportDataAPI = async (reportData: ReportRequest): Promise<ReportData[] | null> => {
    let reportResponse: ReportData[] | null = null;
    const backREsponse = await backAPI
        .service(EBACK_ENDPOINT.REPORT_GET, API_METHOD.POST, reportData) as IBackResponse<ReportData[] | null>

    try {
        // const response = await fetch('/api/proxy/hook', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json', // 💥 обязательно
        //     },
        //     body: JSON.stringify({
        //         url: 'full/report/get',
        //         method: API_METHOD.POST,
        //         model: 'report',
        //         data: reportData
        //     }),
        // });
        // reportResponse = await response.json() as ReportData[] | null
        return backREsponse.data as ReportData[]
    } catch (error) {
        console.error('❌ Proxy error:', error);
    }
    return reportResponse;
}
