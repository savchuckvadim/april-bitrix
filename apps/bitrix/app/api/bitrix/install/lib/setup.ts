// import {
//     API_METHOD,
//     BitrixAppPayload,
//     OnlineResponse,
//     SETUP_ENDPOINT,
//     onlineGeneralAPI as online,
// } from '@workspace/api';

import { CreateBitrixAppDto, getBitrixSetupApp} from '@workspace/nest-api';

// export const setupBitrixApp = async (
//     data: BitrixAppPayload,
// ): Promise<OnlineResponse> => {
//     const result = (await online.service(
//         SETUP_ENDPOINT.APP,
//         API_METHOD.POST,
//         'result',
//         data,
//     )) as Promise<OnlineResponse>;
//     console.log('online result');
//     console.log(result);
//     return result;
// };


export const setupBitrixApp = async (data: CreateBitrixAppDto) => {
    const api = getBitrixSetupApp();
    const result = await api.bitrixAppStoreOrUpdate(data);
    return result;
};
