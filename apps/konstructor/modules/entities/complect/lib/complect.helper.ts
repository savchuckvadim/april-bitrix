import { API_METHOD } from "@workspace/api";
import { ONLINE_KONSTRUCTOR_ENDPOINTS } from "@workspace/api";
import { onlineAPI } from "@workspace/api";
import { IComplect } from "../type/complect.type";
import { IOnlineResponse } from "@workspace/api/src/services/online/online-api";

export const getComplects = async (): Promise<IComplect[] | null> => {
    debugger
    // const response = await onlineAPI.service<{ complects: IComplect[] }>(
    //     ONLINE_KONSTRUCTOR_ENDPOINTS.COMPLECTS,
    //     API_METHOD.GET,
    //     {},
    //     {
    //         'X-API-KEY': process.env.ONLINE_API_KEY
    //     }
    // )
    debugger
    const response = await fetch('/api/proxy/complects', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        body: null,
    });
    const data = await response.json() as IOnlineResponse<{ complects: IComplect[] }>;
    debugger
    return data?.data?.complects || null;
}