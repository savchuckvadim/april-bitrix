import {
    API_METHOD, BitrixAppPayload,
    OnlineResponse,
    SETUP_ENDPOINT,
    onlineGeneralAPI as online
} from '@workspace/api';




export const setupBitrixApp = async (data: BitrixAppPayload): Promise<OnlineResponse> => {

    const result = await online
        .service(SETUP_ENDPOINT.CHECK, API_METHOD.POST, 'result', data) as Promise<OnlineResponse>;
    console.log('online result')
    console.log(result)
    return result;

};
