import { API_METHOD, backAPI, EBACK_ENDPOINT } from "@workspace/api";
import {
  IInfoBlock,
  IInfoBlockGroup,
  IServerInfoBlock,
} from "../type/infoblock.type";
import { sortIblocksByGroup } from "./infoGroup.util";

export const getInfoBlocks = async (): Promise<{
  infoblocks: IInfoBlock[];
  groups: IInfoBlockGroup[];
} | null> => {
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
  );
  const groupsResponse = await backAPI.service<IInfoBlockGroup[]>(
    EBACK_ENDPOINT.GROUPS,
    API_METHOD.GET,
    {},
  );

  // const groups = sortIblocksByGroup(response?.data || [])
  const groups = groupsResponse.data;
  const infoblocks = response.data;

  // return groups || null
  return infoblocks && groups ? { infoblocks, groups } : null;
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
};
