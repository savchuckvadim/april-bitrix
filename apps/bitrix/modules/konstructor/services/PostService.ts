// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// import { IPost } from '../models/IPost'


// export const postAPI = createApi({
//     reducerPath: 'postAPI',
//     baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com' }),
//     endpoints: (build) => ({
//         fetchAllPosts: build.query<IPost[], number>({
//             query: (limit: number) => ({
//                 url: '/posts',
//                 params: {
//                     _limit:limit
//                 }
//             })
//         })
//     })
// })