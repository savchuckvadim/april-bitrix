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

/**
 * Судьба конверта outbox поверх стадии HTTP: та же отправка глазами
 * хранилища. Финиш-стадии плана А3: «отправлено» (DONE), «сохранено,
 * отправим автоматически» (QUEUED), «ошибка + Повторить» (ERROR).
 */
export enum FLOW_OUTBOX_STATE {
    /** Конверт в обычном полёте либо уже погашен — outbox не вмешивается. */
    NONE = 'none',
    /**
     * Сеть исчерпала сессионный бэкофф: конверт лежит в хранилище, дренаж
     * дошлёт его сам — менеджеру ждать не нужно.
     */
    QUEUED = 'queued',
    /**
     * А4: ядро исполнено напрямую в Битриксе, хвост (KPI и пр.) доедет
     * досылкой (эндпоинт А5). Ставится setOutboxPartial ПОСЛЕ setDone —
     * финиш и баннер читают связку DONE+PARTIAL.
     */
    PARTIAL = 'partial',
    /**
     * А4: отчёт проводился напрямую, пишущий батч ушёл, но часть
     * обязательных изменений не применилась — и доисполнить их нечем
     * (повтор заблокирован маркером, бэку исходный payload слать нельзя).
     * Ставится setOutboxIncomplete ПОСЛЕ setDone: финиш и баннер читают
     * связку DONE+INCOMPLETE и не утверждают, что карточки обновлены.
     */
    INCOMPLETE = 'incomplete',
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
    /** Судьба конверта outbox текущей отправки (см. FLOW_OUTBOX_STATE). */
    outboxState: FLOW_OUTBOX_STATE.NONE as FLOW_OUTBOX_STATE,
    /**
     * Кто принял доставку (id из реестра delivery-targets). Сегодня всегда
     * primary-backend; А4 начнёт писать сюда direct-bitrix — по нему финиш
     * различит «отправлено» и «выполнено напрямую».
     */
    deliveryTarget: null as string | null,
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
            // Новая отправка (или повтор) — прошлая судьба конверта неактуальна.
            state.outboxState = FLOW_OUTBOX_STATE.NONE;
            state.deliveryTarget = null;
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
            // Исход известен — история с «отправим автоматически» закрыта.
            state.outboxState = FLOW_OUTBOX_STATE.NONE;
        },
        setError: (
            state: FlowStatusState,
            action: PayloadAction<{ message: string }>,
        ) => {
            state.stage = FLOW_STAGE.ERROR;
            state.error = action.payload.message;
        },
        /**
         * Сеть исчерпала сессионный бэкофф: конверт сохранён, дошлёт дренаж.
         * Для менеджера это НЕ ошибка — финиш и баннер показывают честную
         * стадию «сохранено, отправим автоматически».
         */
        setOutboxQueued: (state: FlowStatusState) => {
            state.outboxState = FLOW_OUTBOX_STATE.QUEUED;
        },
        /**
         * А4: ядро отчёта исполнено напрямую в Битриксе, хвост (KPI,
         * движения сделок, смарты) ждёт досылки на бэк (А5). Ставится ПОСЛЕ
         * setDone — тот сбрасывает outboxState в NONE, а финиш различает
         * «отправлено» и «выполнено напрямую, часть доедет позже» именно по
         * DONE+PARTIAL.
         */
        setOutboxPartial: (state: FlowStatusState) => {
            state.outboxState = FLOW_OUTBOX_STATE.PARTIAL;
        },
        /**
         * А4: прямое исполнение прошло НЕ ЦЕЛИКОМ — часть обязательных
         * изменений не применилась, и доисполнить их нечем. Ставится ПОСЛЕ
         * setDone (тот сбрасывает outboxState в NONE); финиш и баннер по
         * связке DONE+INCOMPLETE говорят правду вместо «отчёт проведён».
         */
        setOutboxIncomplete: (state: FlowStatusState) => {
            state.outboxState = FLOW_OUTBOX_STATE.INCOMPLETE;
        },
        /** Какая цель приняла доставку (для финиш-стадий А4). */
        setDeliveryTarget: (
            state: FlowStatusState,
            action: PayloadAction<{ target: string }>,
        ) => {
            state.deliveryTarget = action.payload.target;
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
