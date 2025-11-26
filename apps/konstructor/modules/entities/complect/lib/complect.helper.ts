import { API_METHOD, backAPI, EBACK_ENDPOINT } from '@workspace/api';
import { ONLINE_KONSTRUCTOR_ENDPOINTS } from '@workspace/api';
import { onlineAPI } from '@workspace/api';
import { IComplect } from '../type/complect.type';
import { IOnlineResponse } from '@workspace/api/src/services/online/online-api';
import { getKonstructor, getKonstructorOfferTemplate } from '@workspace/nest-api';

export const getComplects = async (domain: string): Promise<IComplect[] | undefined> => {
    const response = await backAPI.service<IComplect[]>(
        EBACK_ENDPOINT.COMPLECTS,
        API_METHOD.GET,
        {},
    );
    const api = getKonstructor()
    const initResponse = await api.konstructorInitInit({ domain });
    // const initResponse = await backAPI.service<any>(
    //     EBACK_ENDPOINT.KONSTRUCTOR_INIT,
    //     API_METHOD.GET,
    //     {},
    // );
    const init = initResponse?.complects;
    console.log('init', init);

    const result = response.data;

    return result;


};
