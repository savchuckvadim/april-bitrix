import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { portalActions } from './PortalSlice';
import { getFromLocalStorage, getStorageKey, saveToLocalStorage } from '@workspace/api/';
import { API_METHOD, onlineHeaders } from '@workspace/api';
import { onlineURL } from '@workspace/api';
import { removeOldPortalCache } from '../lib/portal-util';
import { Portal } from '../type/portal-type';



export const portalAPI = createApi({
    reducerPath: 'portalAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${onlineURL}/front`,
        prepareHeaders: (headers, { getState }) => {
            headers.set('X-Requested-With', onlineHeaders['X-Requested-With']);
            headers.set('accept', onlineHeaders['accept']);
            headers.set('content-type', onlineHeaders['content-type']);
            // headers.set('X-API-KEY', onlineHeaders['X-API-KEY']);
            return headers;
        }
    }),

    endpoints: (build) => ({
        fetchPortal: build.mutation<Portal, { domain: string }>({
            async queryFn(data, { signal }, extraOptions, fetchWithBQ) {
                const localPrifix = 'portal_cache';
                const storageKey = getStorageKey(localPrifix);
                const secretKey = data.domain || 'nmbrsdntl'; // Ваш ключ для шифрования

                removeOldPortalCache(localPrifix)
                // Попробуем получить данные из кеша
                const cachedData = await getFromLocalStorage(storageKey, secretKey);
                // console.log('pdomain')
                // console.log(secretKey)
                // console.log('pdata')
                // console.log(cachedData)


                if (cachedData) {

                    return { data: cachedData }; // Если данные в кеше, возвращаем их
                }

                // Если данных нет в кеше, отправляем запрос
                const response = await fetchWithBQ({
                    url: '/portal',
                    method: API_METHOD.POST,
                    body: data
                });

                if (response.error) {
                    return { error: response.error };
                }

                const result: any = response.data;

                // Проверяем resultCode
                if (result.resultCode !== 0) {
                    return { error: { status: 400, data: { message: result.message || 'An unexpected error occurred' } } };
                }
                // console.log('result.data.portal')
                // console.log(result.data.portal)
                // Сохраняем данные в localStorage
                await saveToLocalStorage(storageKey, result.data.portal, secretKey);

                // Возвращаем данные
                return { data: result.data.portal };
            },

            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(portalActions.setPortal({ portal: data }));
                } catch (error) {
                    console.error('Error fetching portal:', error);
                }
            }
        }),

    }),
});

export const { useFetchPortalMutation } = portalAPI;
