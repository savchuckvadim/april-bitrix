import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_METHOD, getApiHeaders, hookURL as url } from "@workspace/api";
import { BXTask } from "@workspace/bx";
import { initialEventServiceTasks } from "./EventServiceTaskThunk";
import { TasksFetchData } from "@/modules/entities/EventTask/types/event-task-type";

const onlineHeaders = getApiHeaders(process.env.ONLINE_API_KEY);

export const serviceTaskAPI = createApi({
  reducerPath: "serviceTaskAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: url + "/full/",
    prepareHeaders: (headers, { getState }) => {
      headers.set("X-Requested-With", onlineHeaders["X-Requested-With"]);
      headers.set("accept", onlineHeaders["accept"]);
      headers.set("content-type", onlineHeaders["content-type"]);
      headers.set("X-API-KEY", onlineHeaders["X-API-KEY"]);
      // Если требуется, добавьте здесь другие заголовки, например, для аутентификации
      return headers;
    },
  }),

  endpoints: (build) => ({
    fetchTasks: build.mutation<Array<BXTask> | null, TasksFetchData>({
      query: (data) => {
        return {
          url: "tasks",
          method: API_METHOD.POST,
          body: data,
        };
      },
      transformResponse: (response: any, meta, arg) => {
        // Проверяем resultCode, и если он не равен 0, выбрасываем ошибку
        if (response.resultCode !== 0) {
          throw new Error(response.message || "An unexpected error occurred");
        } else if (response.tasks) {
          return response.tasks; // getEvServiceTasksFromBxTasks(response.tasks);
        } else if (response.data && response.data.tasks) {
          return response.data.tasks; // getEvServiceTasksFromBxTasks(response.data.tasks);
        }
        return null;
      },

      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(initialEventServiceTasks(data, null, null, null));
          // if (!data || !data.length) {
          //   dispatch(getResultMenu(EventItemResultType.NEW, null));
          // }
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      },
    }),
  }),
});

export const { useFetchTasksMutation } = serviceTaskAPI;
