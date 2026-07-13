import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {  getEvTasksFromBxTasks } from '../lib/task-util';
import { EventTask, TasksFetchData } from '../types/event-task-type';
import { eventTaskActions } from './EventTaskSlice';
import { getResultMenu } from '@/modules/widgets/EventItem';
import { EventItemResultType } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { API_METHOD,getApiHeaders, hookURL as  url } from '@workspace/api';


const onlineHeaders = getApiHeaders(process.env.ONLINE_API_KEY)

export const taskAPI = createApi({
    reducerPath: 'taskAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: url+'/full/',
        prepareHeaders: (headers, { getState }) => {
            headers.set('X-Requested-With', onlineHeaders['X-Requested-With']);
            headers.set('accept', onlineHeaders['accept']);
            headers.set('content-type', onlineHeaders['content-type']);
            headers.set('X-API-KEY', onlineHeaders['X-API-KEY']);
            // Если требуется, добавьте здесь другие заголовки, например, для аутентификации
            return headers;
        }
    }),

    endpoints: (build) => ({
        fetchTasks: build.mutation<Array<EventTask> | null, TasksFetchData>({
            query: (data) => {

                return {
                    url: 'tasks',
                    method: API_METHOD.POST,
                    body: data

                }
            },
            transformResponse: (response: any, meta, arg) => {
                // Проверяем resultCode, и если он не равен 0, выбрасываем ошибку
                if (response.resultCode !== 0) {
                    throw new Error(response.message || 'An unexpected error occurred');
                } else if (response.tasks) {
                    return getEvTasksFromBxTasks(response.tasks);
                } else if (response.data && response.data.tasks) {
                    return getEvTasksFromBxTasks(response.data.tasks);
                }
                return null;


            },

            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(eventTaskActions.setFetchedTasks({ tasks: data }));
                    if (!data || !data.length) {
                        
                        dispatch(
                            getResultMenu(
                                EventItemResultType.NEW,
                                null
                            )
                        )

                    }
                } catch (error) {
                    console.error('Error fetching tasks:', error);
                }
            }
        }),

    }),



})

export const { useFetchTasksMutation } = taskAPI;
