// import { ONLINE_API_KEY } from "@/app/secret/online-secret";
// import { getConfig } from "@/lib/config";
import { API_METHOD } from "../../type/type";
import axios from "axios";
import { ONLINE_KONSTRUCTOR_ENDPOINTS, SETUP_ENDPOINT } from "./type/setup-type";

export const url =  `https://garant-app.ru/api`


const online = axios.create({
    baseURL: url,

    withCredentials: true,
    headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        // 'X-API-KEY': getConfig().apiKey || ''

    },
})

export interface IOnlineResponse<T> {
    resultCode: EResultCode; // 0 - успех, 1 - ошибка
    data?: T;           // данные ответа (при успехе)
    message?: string;   // сообщение ошибки (при ошибке)
}
export enum EResultCode {
    SUCCESS = 0,
    ERROR = 1,
}


export const onlineAPI = {

    service: async<T>(
        url: ONLINE_KONSTRUCTOR_ENDPOINTS | SETUP_ENDPOINT,
        method: API_METHOD,
        data?: any,
        headers?: any
    ): Promise<IOnlineResponse<T>> => {
        let result = null
        try {

            const response = await online[method](url, data, { headers })
            console.log('online response')

            console.log(response)


            return response.data
        } catch (error: unknown) {

            console.log('online error')

            console.log(error)

            return { resultCode: EResultCode.ERROR, message: 'Request failed' }
        }
    },


}

