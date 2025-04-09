import { API_METHOD } from "../type/type";
import axios from "axios"

const url = 'https://april-hook.ru/api'
export enum AI_ENDPOINT {
    TRANSCRIPTION = "transcription",

}

// interface TranscribeResponse {
//     data: {
//         resultCode: 1 | 0;
//         result: any;
//     };
// }

const headers = {
    'content-type': 'application/json',
    'accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // 'X-API-KEY': __ONLINE_API_KEY__,
}

const transcribe = axios.create({
    baseURL: url,
    withCredentials: true,
    headers,
});

export const TranscribeServiceAPI = {
    service: async (url: string, method: API_METHOD, model: string, data: any) => {
        let result = null
        try {

            const response = await transcribe[method](url, data)

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
};
