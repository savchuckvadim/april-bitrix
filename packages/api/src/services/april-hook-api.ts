
import { API_METHOD } from "../type/type";
import axios from "axios";
// const ONLINE_API_KEY = getConfig().apiKey || ''

export const onlineHeaders = {
    'content-type': 'application/json',
    'accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // 'X-API-KEY': getConfig().apiKey || '',
    // "Origin": "http://localhost:5000", // Принудительно указываем Origin

};
const isHook = true // __SERVER__ == 'hook'
// console.log('__SERVER__')
// console.log(__SERVER__)
export const url =  isHook ? `https://april-hook.ru/api` : `https://april-app.ru/api`
const online = axios.create({

    baseURL: url,
    withCredentials: true,
    headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
})
// online.defaults.redirect = "follow";


export const hookAPI = {

    service: async (url:string, method: API_METHOD, model:string, data: any) => {
        let result = null
        try {

            const response = await online[method](url, data)

            if (response && response.data) {
                if (response.data.resultCode === 0) {

                    let data = response.data
                    if (data.data) {
                        data = data.data
                    }

                    result = data[model]
                } else {

                }
            }

            return result
        } catch (error) {

            return result
        }
    },
    post: async (url:string, method: API_METHOD, headers: any, model:string, data: any) => {
        let result = null
        try {

            const response = await online[method](url, data, { headers })

            if (response && response.data) {
                if (response.data.resultCode === 0) {

                    let data = response.data
                    if (data.data) {
                        data = data.data
                    }

                    result = data[model]
                } else {

                }
            }

            return result
        } catch (error) {

            return result
        }
    }
}
