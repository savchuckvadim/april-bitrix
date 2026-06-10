import { API_METHOD, backAPI, EBACK_ENDPOINT } from '@workspace/api';
import { ONLINE_KONSTRUCTOR_ENDPOINTS } from '@workspace/api';
import { onlineAPI } from '@workspace/api';
import { AbsType, ComplectFullTitlesEnum, ComplectShortitlesEnum, ComplectsTypes, ComplectTitlesEnum, IComplect } from '../type/complect.type';
import { IOnlineResponse } from '@workspace/api/src/services/online/online-api';
import { ComplectDto, ComplectsDto, getKonstructor, getKonstructorOfferTemplate, KonstructorInitDataDto } from '@workspace/nest-api';

export interface IComplectsResponse {
    prof: IComplect[];
    universal: IComplect[];
}
export const convertComplects = (complect: ComplectDto): IComplect => {
    return {
        ...complect,
        type: ComplectsTypes.PROF,
        number: 1,
        name: `complect.name` as ComplectTitlesEnum,
        fullName: `complect.fullName` as ComplectFullTitlesEnum,
        shortName: `complect.shortName` as ComplectShortitlesEnum,
        abs: 133 as AbsType,
        weight: 0,
        isChanging: false,
        withConsalting: false,
    }
}
export const convertComplectsResponse = (complects: ComplectsDto): IComplectsResponse => {
    return {
        prof: complects.prof.map(complect => convertComplects(complect)),
        universal: complects.universal.map(complect => convertComplects(complect)),
    }
}
export const getComplects = async (domain: string): Promise<IComplectsResponse | undefined> => {
    // const response = await backAPI.service<IComplectsResponse>(
    //     EBACK_ENDPOINT.COMPLECTS,
    //     API_METHOD.GET,
    //     {},
    // );
    const api = getKonstructor()
    const initResponse = await api.konstructorInitInit({ domain });
    // const initResponse = await backAPI.service<any>(
    //     EBACK_ENDPOINT.KONSTRUCTOR_INIT,
    //     API_METHOD.GET,
    //     {},
    // );
    const init = initResponse?.complects;
    console.log('init', init);

    // const result = response.data;

    return convertComplectsResponse(init);


};
