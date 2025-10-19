import {
    API_METHOD,
    backAPI,
    EBACK_ENDPOINT,
    IBackResponse,
} from '@workspace/api';
import { ReportCallingData } from '../type/calling-type';
import { ReportRequest } from '../../report/model/report-service';
// import { IHookData } from "@/app/api/proxy/hook/route";

export const fetchCallingStatistics = async (
    reportData: ReportRequest,
): Promise<ReportCallingData[] | null> => {
    let reportResponse: ReportCallingData[] | null = null;
    try {
        // const data = {
        //     url: 'full/report/callings',
        //     method: API_METHOD.POST,
        //     model: 'report',
        //     data: reportData
        // } as IHookData
        // const response = await fetch('/api/proxy/hook', {
        //     method: API_METHOD.POST,
        //     headers: {
        //         'Content-Type': 'application/json', // 💥 обязательно
        //     },
        //     body: JSON.stringify(data),
        // });
        // reportResponse = await response.json() as ReportCallingData[] | null

        const backREsponse = (await backAPI.service(
            EBACK_ENDPOINT.CALLING_STATISTIC_GET,
            API_METHOD.POST,
            reportData,
        )) as IBackResponse<ReportCallingData[] | null>;
        reportResponse = backREsponse.data as ReportCallingData[];
    } catch (error) {
        console.error('❌ Proxy error:', error);
    }
    return reportResponse;
};
