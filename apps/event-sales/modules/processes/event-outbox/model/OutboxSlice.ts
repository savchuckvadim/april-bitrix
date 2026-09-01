import { PayloadAction, createSlice } from '@reduxjs/toolkit';

/**
 * Лёгкое зеркало outbox для UI.
 *
 * Источник правды о конвертах — KV-хранилище (outbox-store), Redux ничего из
 * него не переживает и не дублирует: тут только счётчик недоставленных для
 * полоски «N отчётов ждут отправки» и стадия текущей отправки конвейера.
 * Наполняют его исключительно thunk'и (enqueueAndDeliver / drainOutbox /
 * markDelivered / markFailed) — сами по хранилищу пересчитывая счётчик.
 */
export enum OUTBOX_DELIVERY_PHASE {
    /** Конверт записан (awaited), доставка ещё не начиналась. */
    ENQUEUED = 'enqueued',
    /** Доставка идёт: клейм/POST/бэкофф. */
    DELIVERING = 'delivering',
    /** Цель приняла операцию; исход отдаст поллинг статуса. */
    ACCEPTED = 'accepted',
    /** А4: ядро исполнено напрямую в Битриксе (delivered либо partial). */
    EXECUTED_DIRECT = 'executed-direct',
    /** Цель отвергла payload (4xx/бизнес-отказ) — без авторетраев. */
    REJECTED = 'rejected',
    /** Сессионный бэкофф исчерпан — конверт ждёт дренажа. */
    EXHAUSTED = 'exhausted',
    /** Доставка не состоялась: лок/аренда/состояние (см. summary). */
    SKIPPED = 'skipped',
}

export type OutboxState = typeof initialState;

const initialState = {
    /** Сколько конвертов домена ещё не delivered. */
    undeliveredCount: 0,
    /**
     * Сколько из них — partial (А4): ядро исполнено напрямую, ждут ДОСЫЛКИ
     * хвоста (эндпоинт А5), а не отправки. Полоске — честная формулировка.
     */
    partialCount: 0,
    /**
     * Конверты, проведённые НЕ ЦЕЛИКОМ (А4, directFailedCommands): ни дренаж,
     * ни «Повторить» их не починят — нужен человек. В undeliveredCount они
     * не входят (см. isUndeliveredEnvelope), поэтому счётчик отдельный:
     * полоска говорит о них тревожным тоном.
     */
    incompleteCount: 0,
    /** Для какого домена посчитан счётчик (страховка от смешения порталов). */
    countedDomain: null as string | null,
    /**
     * Прогон дренажа идёт прямо сейчас.
     *
     * Зачем в сторе: счётчики зеркала публикуются в КОНЦЕ прогона, и до
     * первого его завершения (самый частый случай — вход менеджера на
     * следующий день) интерфейсу нечего сказать, хотя система в этот момент
     * как раз работает. Флаг взводится на старте прогона, у которого есть
     * что везти, и снимается в его конце — по нему полоска говорит
     * «отправляем сохранённые отчёты…» и держит живой индикатор.
     */
    draining: false,
    /** Текущая отправка конвейера outbox; фоновый дренаж сюда не пишет. */
    current: null as {
        operationId: string;
        phase: OUTBOX_DELIVERY_PHASE;
    } | null,
};

const outboxSlice = createSlice({
    name: 'outbox',
    initialState,
    reducers: {
        setUndelivered: (
            state: OutboxState,
            action: PayloadAction<{
                domain: string;
                count: number;
                /** partial среди недоставленных; не передан — ноль. */
                partialCount?: number;
                /** Проведённые не целиком (в count не входят); нет — ноль. */
                incompleteCount?: number;
            }>,
        ) => {
            state.countedDomain = action.payload.domain;
            state.undeliveredCount = action.payload.count;
            state.partialCount = action.payload.partialCount ?? 0;
            state.incompleteCount = action.payload.incompleteCount ?? 0;
        },
        /**
         * Прогон дренажа начался/закончился. Взводится только у прогона, у
         * которого есть что везти: иначе полоска мигала бы «отправляем
         * сохранённые отчёты…» на каждом холостом прогоне.
         */
        setDraining: (state: OutboxState, action: PayloadAction<boolean>) => {
            state.draining = action.payload;
        },
        setCurrentDelivery: (
            state: OutboxState,
            action: PayloadAction<{
                operationId: string;
                phase: OUTBOX_DELIVERY_PHASE;
            }>,
        ) => {
            state.current = action.payload;
        },
        /** Сброс «текущей отправки» — только если это всё ещё она. */
        clearCurrentDelivery: (
            state: OutboxState,
            action: PayloadAction<{ operationId: string }>,
        ) => {
            if (state.current?.operationId === action.payload.operationId) {
                state.current = null;
            }
        },
        reset: () => initialState,
    },
});

export const outboxReducer = outboxSlice.reducer;
export const outboxActions = outboxSlice.actions;
