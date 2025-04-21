import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { SIBlock } from '../type/document-infoblock-type';
// import { IPost } from '../models/IPost'
import {  getApiHeaders, onlineURL } from '@workspace/api';

const onlineHeaders = getApiHeaders('__ONLINE_API_KEY__')


export const infoblockAPI = createApi({
    reducerPath: 'infoblockAPI',
    baseQuery: fetchBaseQuery({
        // baseUrl: 'https://garant-app.ru/api',
        baseUrl: `${onlineURL}/konstructor/front`,

        prepareHeaders: (headers, { getState }) => {
            // Добавляем все заголовки из onlineHeaders в headers
            Object.entries(onlineHeaders).forEach(([key, value]) => {
                headers.set(key, value);
            });

            return headers; // Не забудьте вернуть объект headers
        }
    }),

    endpoints: (build) => ({
        fetchIBlocks: build.query<SIBlock[], number>({
            query: (arg: number) => {

                return {
                    url: '/iblocks',
                    // params: {
                    //     _limit: arg
                    // }
                }
            },
            transformResponse: (response: any, meta, arg) => {
                // Проверяем resultCode, и если он не равен 0, выбрасываем ошибку
                if (response.resultCode !== 0) {
                    throw new Error(response.message || 'An unexpected error occurred');
                }
                // Возвращаем данные, если все в порядке
                return response.data;
            },
        }),

     

    }),



})

export const { useFetchIBlocksQuery } = infoblockAPI;
