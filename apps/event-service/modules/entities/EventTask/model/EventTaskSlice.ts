import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { EventTask } from "../types/event-task-type";
import { PresentationStateCount } from "@/modules/entities/EventPresentation/model/PresSlice";
import { BXDeal } from "@workspace/bx";
import { BX_TASK_MARK } from "@workspace/bx/src/type/bitrix-type";


//TYPES
export type EventTaskState = typeof initialState


const initialState = {

    tasks: null as Array<EventTask> | null,
    current: null as EventTask | null,
    isFetched: false as boolean,
    error: '',
}



const eventTaskSlice = createSlice({
    name: 'eventTask',
    initialState,
    reducers: {
        setFetchedTasks: (
            state: EventTaskState,
            action: PayloadAction<
                { tasks: Array<EventTask> | null }
            >
        ) => {

            const payload = action.payload;
            state.tasks = payload.tasks;
            state.isFetched = true;
            // console.log('is task isFetched')
            // console.log(state.isFetched)
        },

        setPresData: (
            state: EventTaskState,
            action: PayloadAction<
                {
                    taskId: number
                    presData: PresentationStateCount | null
                    dealBase: BXDeal | null

                }
            >
        ) => {

            const payload = action.payload;
            state.tasks = state.tasks.map(task => {
                if (Number(task.id) == payload.taskId) {

                    return {
                        ...task,
                        presentation: payload.presData,
                        dealBase: payload.dealBase,
                    }

                }
                return task
            })
            if (state.current) {
                if (state.current.id) {
                    if (Number(state.current.id) == payload.taskId) {
                        state.current.presentation = payload.presData
                        state.current.dealBase = payload.dealBase
                    }
                }
            }
        },

        setCurrentTask: (
            state: EventTaskState,
            action: PayloadAction<
                { task: EventTask | null }
            >
        ) => {
            //TEST

            const payload = action.payload;
            state.current = payload.task;

        },
        updateTaskMark: (
            state: EventTaskState,
            action: PayloadAction<{ id: number, mark: BX_TASK_MARK | null }>
        ) => {



            if (state.current) {
                if (state.current.id) {
                    if (Number(state.current.id) == action.payload.id) {
                        state.current.mark = action.payload.mark
                    }
                }
            }
        },
        setCleanTasks: (
            state: EventTaskState,
            action: PayloadAction
        ) => {
            //TEST
            state.tasks = null as Array<EventTask> | null;
            state.current = null as EventTask | null;
            state.isFetched = false as boolean;


        },

    },


    // extraReducers: (builder) => {
    //     builder
    //         .addMatcher(
    //             taskAPI.endpoints.fetchTasks.matchFulfilled,
    //             (state, { payload }) => {
    //                 if (payload) {
    //                     state.tasks = payload;
    //                     state.isFetched = true;
    //                     state.error = '';
    //                 }
    //             }
    //         )
    //         .addMatcher(
    //             taskAPI.endpoints.fetchTasks.matchRejected,
    //             (state, action) => {
    //                 state.isFetched = true;
    //                 state.error = 'ошибка получения задач';
    //             }
    //         );
    // }

});



export const eventTaskReducer = eventTaskSlice.reducer;

// Экспорт actions
export const eventTaskActions = eventTaskSlice.actions;
