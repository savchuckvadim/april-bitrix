// import { Portal } from '@/modules/app/types/portal/portal-type';
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// import { portalActions } from './PortalSlice';
// import { API_METHOD, getApiHeaders, onlineURL } from '@workspace/api';

// const onlineHeaders = getApiHeaders(process.env.ONLINE_API_KEY)

// export const portalAPI = createApi({
//     reducerPath: 'portalAPI',
//     baseQuery: fetchBaseQuery({
//         baseUrl: `${onlineURL}/front`,
//         prepareHeaders: (headers, { getState }) => {
//             headers.set('X-Requested-With', onlineHeaders['X-Requested-With']);
//             headers.set('accept', onlineHeaders['accept']);
//             headers.set('content-type', onlineHeaders['content-type']);
//             headers.set('X-API-KEY', onlineHeaders['X-API-KEY']);
//             // Если требуется, добавьте здесь другие заголовки, например, для аутентификации
//             return headers;
//         }
//     }),

//     endpoints: (build) => ({
//         fetchPortal: build.mutation<Portal, { domain: string }>({
//             query: (data) => {

//                 return {
//                     url: '/portal',
//                     method: API_METHOD.POST,
//                     body: data

//                 }
//             },
//             transformResponse: (response: any, meta, arg) => {
//                 // Проверяем resultCode, и если он не равен 0, выбрасываем ошибку
//                 if (response.resultCode !== 0) {
//                     throw new Error(response.message || 'An unexpected error occurred');
//                 }

//                 // Возвращаем данные, если все в порядке
//                 return response.data.portal;
//             },

//             onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
//                 try {
//                     const { data } = await queryFulfilled;

//                     dispatch(portalActions.setPortal({ portal: data }));

//                 } catch (error) {
//                     console.error('Error fetching tasks:', error);
//                 }
//             }
//         }),

//     }),



// })

// export const { useFetchPortalMutation } = portalAPI;
