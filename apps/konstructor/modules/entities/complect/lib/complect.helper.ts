import { API_METHOD, backAPI, EBACK_ENDPOINT } from "@workspace/api";
import { ONLINE_KONSTRUCTOR_ENDPOINTS } from "@workspace/api";
import { onlineAPI } from "@workspace/api";
import { IComplect } from "../type/complect.type";
import { IOnlineResponse } from "@workspace/api/src/services/online/online-api";

export const getComplects = async (): Promise<IComplect[] | undefined> => {
  const response = await backAPI.service<IComplect[]>(
    EBACK_ENDPOINT.COMPLECTS,
    API_METHOD.GET,
    {},
  );
  const initResponse = await backAPI.service<any>(
    EBACK_ENDPOINT.KONSTRUCTOR_INIT,
    API_METHOD.GET,
    {},
  );
  const init = initResponse.data;
  console.log("init", init);

  const result = response.data;

  return result;

  // const response = await fetch('/api/proxy/complects', {
  //     method: 'GET',
  //     headers: {
  //         'Content-Type': 'application/json',
  //     },
  //     body: null,
  // });
  // const data = await response.json() as IOnlineResponse<{ complects: IComplect[] }>;

  // return data?.data?.complects || null;
};
