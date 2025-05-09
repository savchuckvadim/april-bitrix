import {API_METHOD} from "../type/type";
import axios from "axios";

const prod = `https://event.april-app.ru/api/v1/event/`;
// const dev = `https://obsessively-busy-moonfish.cloudpub.ru/api/v1/event/`;

const url = prod;

export enum EVS_ENDPOINT {
    INIT_SUPPLY = "rpa/init_supply",
    GET_RQS = "rq/get_rq",
    SET_RQ = "rq/update_rq",
    SEND_EVENT ='calling'
}

interface EVSResponse {
    data: {
        resultCode: 1 | 0;
        result: any;
    };
}

const evsHeaders = {
    "content-type": "application/json",
    "X-EVS-API-KEY": "idwKgtikyJkTxVD74V7RUalZuBy3rs59GpuGLrV9B6DL5Lcl4qqJoMtCuYaqV1AQ"
}

const evs = axios.create({
    baseURL: url,
    withCredentials: true,
    headers: evsHeaders,
});

export const eventServiceAPI = {
    service: async (url: EVS_ENDPOINT, method: API_METHOD, data: any) => {
        let result = null;
        let response = null as null | EVSResponse;
        try {
            console.log("mvlr api");
            const headers = data instanceof FormData
                ? {"Content-Type": "multipart/form-data"}
                : {"Content-Type": "application/json"};

            response = (await evs[method](url, data, {
                ...evsHeaders, headers
            })) as EVSResponse;
            console.log(response);
        } catch (error) {
            return result;
        }

        if (response && response !== undefined) {
            response = response as EVSResponse;
            if (response.data) {
                if (response.data.resultCode === 0) {
                    result = response.data.result;
                }
            }
        }

        return result;
    },
};
