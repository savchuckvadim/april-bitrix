// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// import { BXDepartment, BXUser } from "@workspace/bx";
// import { API_METHOD, backAPI, getApiHeaders, } from '@workspace/api';
// import { EBACK_ENDPOINT } from '@workspace/api/src/services/back-api';

// const onlineHeaders = getApiHeaders('__ONLINE_API_KEY__')

// export interface DepartmentResponse {
//     allUsers: BXUser[] | null
//     childrenDepartments: BXDepartment[]
//     generalDepartment: BXDepartment[]
// }

// export const departmentAPI = createApi({
//     reducerPath: 'departmentAPI',
//     baseQuery: fetchBaseQuery({
//         baseUrl: `${backAPI}`,
//         prepareHeaders: (headers) => {
//             Object.entries(onlineHeaders).forEach(([key, value]) => {
//                 headers.set(key, value);
//             });
//             return headers;
//         }
//     }),
//     endpoints: (build) => ({
//         getDepartment: build.query<DepartmentResponse, { domain: string }>({
//             query: (arg) => ({
//                 url: EBACK_ENDPOINT.DEPARTMENT,
//                 method: API_METHOD.POST,
//                 body: arg
//             }),
//             transformResponse: (response: any) => {

//                 if (response.resultCode !== 0) {
//                     throw new Error(response.message || 'An unexpected error occurred');
//                 }
//                 return response.data;
//             },
//         }),
//     }),
// })

// export const { useGetDepartmentQuery } = departmentAPI
// // import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// // import { BXDepartment, BXUser } from "@workspace/bx";
// // import { getApiHeaders, hookURL, onlineURL } from '@workspace/api';

// // const onlineHeaders = getApiHeaders('__ONLINE_API_KEY__')

// // export interface DepartmentResponse {
// //     allUsers: BXUser[] | null
// //     childrenDepartments: BXDepartment[]
// //     generalDepartment: BXDepartment[]
// // }

// // export const departmentAPI = createApi({
// //     reducerPath: 'departmentAPI',
// //     baseQuery: fetchBaseQuery({
// //         baseUrl: `${hookURL}`,
// //         prepareHeaders: (headers) => {
// //             Object.entries(onlineHeaders).forEach(([key, value]) => {
// //                 headers.set(key, value);
// //             });
// //             return headers;
// //         }
// //     }),
// //     endpoints: (build) => ({
// //         getDepartment: build.query<DepartmentResponse, { domain: string }>({
// //             query: (arg) => ({
// //                 url: '/full/department',
// //                 method: 'POST',
// //                 body: arg
// //             }),
// //             transformResponse: (response: any) => {
// //                 if (response.resultCode !== 0) {
// //                     throw new Error(response.message || 'An unexpected error occurred');
// //                 }
// //                 return response.data;
// //             },
// //         }),
// //     }),
// // })

// // export const { useGetDepartmentQuery } = departmentAPI
