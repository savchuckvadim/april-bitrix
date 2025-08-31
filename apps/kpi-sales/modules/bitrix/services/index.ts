import {
    API_METHOD,
    onlineGeneralAPI as online,
    OnlineResponse,
} from '@workspace/api';
import { BitrixAppPayload, SETUP_ENDPOINT } from '@workspace/api';

export const setupBitrixApp = async (data: BitrixAppPayload) => {
    // const data: BitrixAppPayload = {
    //     "domain": "myportal.bitrix24.ru",
    //     "code": "app_abc",
    //     "group": "sales",
    //     "type": "widget",
    //     "status": "active",
    //     "token": {
    //         "client_id": "abc123",
    //         "client_secret": "def456",
    //         "access_token": "token123",
    //         "refresh_token": "refresh123",
    //         "expires_at": "2025-04-10T23:59:59",
    //         "application_token": "optional_token"
    //     }
    // }
    const result = (await online.service(
        SETUP_ENDPOINT.CHECK,
        API_METHOD.POST,
        data,
    )) as Promise<OnlineResponse>;
    return result;
};
