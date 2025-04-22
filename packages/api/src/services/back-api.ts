import { API_METHOD } from "../type/type";
import axios, { AxiosResponse } from "axios";


//  const prod = 'https://back.april-app.ru/api/';
const prod = `http://localhost:3000/api/`;
const url = prod;

export enum EBACK_ENDPOINT {
  DEPARTMENT = "bitrix/department/sales",
  DOWNLOAD_REPORT = "kpi-report/download"

}


export interface IBackResponse<T> {
  resultCode: EResultCode; // 0 - успех, 1 - ошибка
  data?: T;           // данные ответа (при успехе)
  message?: string;   // сообщение ошибки (при ошибке)
}
export enum EResultCode {
  SUCCESS = 0,
  ERROR = 1,
}

const evsHeaders = {
  "content-type": "application/json",
  "X-BACK-API-KEY": ""
}

const evs = axios.create({
  baseURL: url,
  withCredentials: true,
  headers: evsHeaders,
});
export const backAPI = {
  service: async <T>(
    url: EBACK_ENDPOINT,
    method: API_METHOD,
    data: any
  ): Promise<IBackResponse<T>> => {
    let response = null as null | IBackResponse<T>;

    try {
      const headers = data instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };

      const axiosResponse = await evs[method](url, data, {
        ...evsHeaders, headers
      });

      response = axiosResponse.data as IBackResponse<T>;
    } catch (error) {
      console.error("API error", error);
      return { resultCode: EResultCode.ERROR, message: "Request failed" } as IBackResponse<T>;
    }

    return response;
  },

  download: async <Blob>(
    url: EBACK_ENDPOINT,
    method: API_METHOD,
    data: any
  ): Promise<Blob> => {


    try {


      const result = await evs[method](url, data,
        {
          headers: evsHeaders,
          responseType: 'blob'
        }) as AxiosResponse<Blob>;

      return result.data
    } catch (error) {
      console.error("API error", error);
      return null as Blob;
    }
  },
};

