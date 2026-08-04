import { PayloadAction, createSlice } from '@reduxjs/toolkit';

/**
 * Состояние отправки отчёта, отдельно от самого отчёта.
 *
 * Зачем отдельный слайс: после нажатия «Отправить» менеджера сразу уводит на
 * финиш, а запрос продолжает лететь. Значит, «идёт ли отправка» — это состояние
 * приложения, а не страницы: его читает и финиш, и список событий.
 *
 * ВАЖНО про источник правды. Сейчас `stage` отражает жизнь HTTP-запроса:
 * бэкенд `/event-sales/flow` выполняет всю работу синхронно и очереди у него
 * нет (QueueModule в event-report.module.ts закомментирован). Когда очередь
 * появится, поменяется ровно одно: вместо `setDone` по ответу — опрос статуса
 * задачи по её id, а `jobId` ляжет сюда же. Потребители (финиш, список) не
 * изменятся.
 */
export enum FLOW_STAGE {
    /** Ничего не отправляли. */
    IDLE = 'idle',
    /** Запрос в полёте. */
    SENDING = 'sending',
    /** Сервер подтвердил обработку. */
    DONE = 'done',
    /** Сервер ответил ошибкой либо связь оборвалась. */
    ERROR = 'error',
}

export type FlowStatusState = typeof initialState;

const initialState = {
    stage: FLOW_STAGE.IDLE as FLOW_STAGE,
    /**
     * Идентификатор операции на бэкенде. Хранится, чтобы повтор после ошибки
     * шёл с тем же id: если отправка на самом деле дошла, бэкенд вернёт её
     * статус, а не выполнит flow второй раз.
     */
    operationId: null as string | null,
    /** Что именно запланировали — показываем на финише. */
    result: '' as string,
    error: '' as string,
    /** Метка старта: прогресс считается от неё (Date.now() в редьюсер не тащим). */
    startedAt: null as number | null,
    /**
     * Список событий не соответствует Битриксу: задача закрыта/создана, но в
     * состоянии этого ещё нет. Снимается перезагрузкой списка.
     */
    isTasksStale: false as boolean,
};

const flowStatusSlice = createSlice({
    name: 'flowStatus',
    initialState,
    reducers: {
        setSending: (
            state: FlowStatusState,
            action: PayloadAction<{
                startedAt: number;
                result: string;
                operationId: string;
            }>,
        ) => {
            state.stage = FLOW_STAGE.SENDING;
            state.startedAt = action.payload.startedAt;
            state.result = action.payload.result;
            state.operationId = action.payload.operationId;
            state.error = '';
        },
        /**
         * `tasksStale` — надо ли перезагружать список. Отчёт закрывает событие,
         * поэтому список устарел; недозвон помечает задачу локально и полной
         * перезагрузки не требует.
         */
        setDone: (
            state: FlowStatusState,
            action: PayloadAction<{ tasksStale: boolean }>,
        ) => {
            state.stage = FLOW_STAGE.DONE;
            state.error = '';
            state.isTasksStale = action.payload.tasksStale;
        },
        setError: (
            state: FlowStatusState,
            action: PayloadAction<{ message: string }>,
        ) => {
            state.stage = FLOW_STAGE.ERROR;
            state.error = action.payload.message;
        },
        /** Список перезагружен — расхождения с Битриксом больше нет. */
        setTasksFresh: (state: FlowStatusState) => {
            state.isTasksStale = false;
        },
        reset: () => initialState,
    },
});

export const flowStatusReducer = flowStatusSlice.reducer;
export const flowStatusActions = flowStatusSlice.actions;
