import { API_METHOD } from "../type/type";
import axios from "axios"

const url = 'https://helper.april-app.ru/api/v1/helper/ai'
export enum AI_ENDPOINT {
    RESUME = "resume",
    RECOMENDATION = "recomendation"

}

interface AIResponse {
    data: {
        resultCode: 1 | 0;
        result: any;
    };
}

const headers = {
    // "content-type": "application/json",
    "Content-Type": "application/json",
    // "X-EVS-API-KEY": "idwKgtikyJkTxVD74V7RUalZuBy3rs59GpuGLrV9B6DL5Lcl4qqJoMtCuYaqV1AQ"
}

const ai = axios.create({
    baseURL: url,
    withCredentials: true,
    headers,
});

export const AIServiceAPI = {
    service: async (url: AI_ENDPOINT, method: API_METHOD, data: any) => {
        let result = null;
        let response = null as null | AIResponse;
        try {
            console.log("ai api");

            response = (await ai[method](url, data)) as AIResponse;

            console.log(response);
        } catch (error) {
            return result;
        }

        if (response && response !== undefined) {
            response = response as AIResponse;
            if (response.data) {
                if (response.data.resultCode === 0) {
                    result = response.data.result;
                }
            }
        }

        return result;
    },
};
