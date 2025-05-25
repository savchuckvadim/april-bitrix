import { API_METHOD } from "@workspace/api";
import { ONLINE_KONSTRUCTOR_ENDPOINTS } from "@workspace/api";
import { onlineAPI } from "@workspace/api";
import { IInfoBlockGroup, IServerInfoBlock } from "../type/infoblock.type";
import { sortIblocksByGroup } from "./infoGroup.util";
export const getInfoBlocks = async (): Promise<IInfoBlockGroup[] | null> => {
    debugger
    const response = await onlineAPI.service<{ infoblocks: IServerInfoBlock[] }>(
        ONLINE_KONSTRUCTOR_ENDPOINTS.INFOBLOCKS,
        API_METHOD.GET,
        {},
        {
            'X-API-KEY': process.env.ONLINE_API_KEY
        }
    )
    debugger
    const groups = sortIblocksByGroup(response?.data?.infoblocks || [])
    debugger
    return groups || null
    // const response = await fetch('/api/proxy/complects', {
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: null,
    // });
    // const data = await response.json() as IOnlineResponse<{ complects: IComplect[] }>;
    // debugger
    // return data?.data?.complects || null;
}