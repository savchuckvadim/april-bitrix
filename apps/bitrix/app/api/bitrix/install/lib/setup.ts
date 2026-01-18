// import {
//     API_METHOD,
//     BitrixAppPayload,
//     OnlineResponse,
//     SETUP_ENDPOINT,
//     onlineGeneralAPI as online,
// } from '@workspace/api';

import {  CreateBitrixAppWithTokenDto, getBitrixSetupAppUiInstall, } from '@workspace/nest-api';

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


export const setupBitrixApp = async (data: CreateBitrixAppWithTokenDto) => {
    const api = getBitrixSetupAppUiInstall();
    const result = await api.bitrixAppInstallSalesManagerInstall(data);
    return result;
};
