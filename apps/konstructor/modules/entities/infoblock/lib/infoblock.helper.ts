import { API_METHOD, backAPI, EBACK_ENDPOINT } from "@workspace/api";
import { IInfoBlock, IServerInfoBlock } from "../type/infoblock.type";
import { sortIblocksByGroup } from "./infoGroup.util";
export const getInfoBlocks = async (): Promise<IInfoBlock[] | null> => {
    
    // const response = await onlineAPI.service<{ infoblocks: IServerInfoBlock[] }>(
    //     ONLINE_KONSTRUCTOR_ENDPOINTS.INFOBLOCKS,
    //     API_METHOD.GET,
    //     {},
    //     {
    //         'X-API-KEY': process.env.ONLINE_API_KEY
    //     }
    // )
    const response = await backAPI.service<IInfoBlock[]>(
        EBACK_ENDPOINT.INFOBLOCKS,
        API_METHOD.GET,
        {},
    )
    
    const groups = sortIblocksByGroup(response?.data || [])
    
    // return groups || null
    return response?.data || null
    // const response = await fetch('/api/proxy/complects', {
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: null,
    // });
    // const data = await response.json() as IOnlineResponse<{ complects: IComplect[] }>;
    // 
    // return data?.data?.complects || null;
}