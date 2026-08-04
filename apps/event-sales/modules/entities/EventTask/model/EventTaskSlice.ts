import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { BXDeal } from '@workspace/bx';
import { BX_TASK_MARK } from '@workspace/bx/src/type/bitrix-type';
import type { SectionStatus } from '@/modules/shared/SectionState';
import { EventTask, PresentationStateCount } from '../types/event-task-type';

export type EventTaskState = typeof initialState;

const initialState = {
    tasks: null as Array<EventTask> | null,
    current: null as EventTask | null,
    isFetched: false as boolean,
    /**
     * Состояние загрузки списка. Раньше был только `isFetched`, и падение
     * запроса оставляло его `false` навсегда — экран показывал скелетон
     * бесконечно, ни словом не сообщая, что что-то сломалось.
     */
    status: 'loading' as SectionStatus,
    error: '',
};

const eventTaskSlice = createSlice({
    name: 'eventTask',
    initialState,
    reducers: {
        setFetchedTasks: (
            state: EventTaskState,
            action: PayloadAction<{ tasks: Array<EventTask> | null }>,
        ) => {
            state.tasks = action.payload.tasks;
            state.isFetched = true;
            state.status = 'ready';
            state.error = '';
        },

        setPresData: (
            state: EventTaskState,
            action: PayloadAction<{
                taskId: number;
                presData: PresentationStateCount | null;
                dealBase: BXDeal | null;
            }>,
        ) => {
            const payload = action.payload;
            state.tasks = (state.tasks ?? []).map(task => {
                if (Number(task.id) == payload.taskId) {
                    return {
                        ...task,
                        presentation: payload.presData,
                        dealBase: payload.dealBase,
                    };
                }
                return task;
            });
            if (state.current?.id && Number(state.current.id) == payload.taskId) {
                state.current.presentation = payload.presData;
                state.current.dealBase = payload.dealBase;
            }
        },

        setCurrentTask: (
            state: EventTaskState,
            action: PayloadAction<{ task: EventTask | null }>,
        ) => {
            state.current = action.payload.task;
        },

        updateTaskMark: (
            state: EventTaskState,
            action: PayloadAction<{ id: number; mark: BX_TASK_MARK | null }>,
        ) => {
            if (state.current?.id && Number(state.current.id) == action.payload.id) {
                state.current.mark = action.payload.mark as BX_TASK_MARK;
            }
        },

        setTasksError: (
            state: EventTaskState,
            action: PayloadAction<{ message: string }>,
        ) => {
            state.status = 'error';
            state.error = action.payload.message;
            state.isFetched = true;
        },

        setCleanTasks: (state: EventTaskState) => {
            state.tasks = null;
            state.current = null;
            state.isFetched = false;
            state.status = 'loading';
            state.error = '';
        },
    },
});

export const eventTaskReducer = eventTaskSlice.reducer;
export const eventTaskActions = eventTaskSlice.actions;
