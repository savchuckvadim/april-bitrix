import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
    AiAgenda,
    AiAnalyticsSettings,
    AiAttention,
    AiByType,
    AiByTypeLayout,
    AiFeedbackKind,
    AiOverview,
    AiPulse,
} from './index';
import {
    AI_CALL_TYPE_ALL,
    isAiCallTypeSelection,
    type AiCallTypeSelection,
} from '../lib/ai-call-types.data';
import { isAiByTypeLayout } from '../lib/ai-overview.data';

export type AiStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Состояние очереди тяжёлой ручки, пока секция в loading. */
export type AiJobStatus = 'queued' | 'processing' | null;

/** Секция данных: одна ручка — один статус, свой requestKey и ошибка. */
export interface AiSection<T> {
    status: AiStatus;
    data: T | null;
    /** Наш ключ запроса (lib/ai-request-key.util) — гард дублей/устаревших. */
    requestKey: string | null;
    /** Ключ, которым ответил сервер (ключ кэша) — по нему матчится WS-событие. */
    serverKey: string | null;
    /** Тяжёлые ручки: расчёт в очереди/идёт; null — синхронный ответ. */
    jobStatus: AiJobStatus;
    /** Сколько раз по таймауту повторяли POST в рамках этого requestKey. */
    queuedAttempts: number;
    error: string | null;
}

export type AiDataSection =
    | 'settings'
    | 'pulse'
    | 'agenda'
    | 'overview'
    | 'attention'
    | 'byType';

/** Секции, которые считает очередь (WS done → повторный POST). */
export const AI_QUEUED_SECTIONS = ['overview', 'attention', 'byType'] as const;
export type AiQueuedSection = (typeof AI_QUEUED_SECTIONS)[number];

export type AiSectionData = {
    settings: AiAnalyticsSettings;
    pulse: AiPulse;
    agenda: AiAgenda;
    overview: AiOverview;
    attention: AiAttention;
    byType: AiByType;
};

export interface AiAnalyticsState {
    settings: AiSection<AiAnalyticsSettings>;
    pulse: AiSection<AiPulse>;
    agenda: AiSection<AiAgenda>;
    overview: AiSection<AiOverview>;
    attention: AiSection<AiAttention>;
    byType: AiSection<AiByType>;
    feedback: {
        /** Объекты, по которым реакция сейчас отправляется. */
        pending: string[];
        /** object → последняя отправленная реакция (подсветка кнопок). */
        sent: Record<string, AiFeedbackKind>;
        /** Объекты, по которым view-телеметрия уже ушла в этой сессии. */
        viewed: string[];
        error: string | null;
    };
    /** Сохранение уровней менеджеров (settings/save). */
    levels: {
        saving: boolean;
        error: string | null;
        /** Момент последнего успешного сохранения (ISO). */
        savedAt: string | null;
    };
    /** Подвкладка разбора по типам звонков (персист в ui-settings blob). */
    selectedCallType: AiCallTypeSelection;
    /** Раскладка среза по типу: wide — строка на менеджера, long — на показатель. */
    typesLayout: AiByTypeLayout;
    /** Открыт ли второй уровень «Разбор по типам». */
    typesDrawerOpen: boolean;
}

const emptySection = <T>(): AiSection<T> => ({
    status: 'idle',
    data: null,
    requestKey: null,
    serverKey: null,
    jobStatus: null,
    queuedAttempts: 0,
    error: null,
});

const initialState: AiAnalyticsState = {
    settings: emptySection(),
    pulse: emptySection(),
    agenda: emptySection(),
    overview: emptySection(),
    attention: emptySection(),
    byType: emptySection(),
    feedback: { pending: [], sent: {}, viewed: [], error: null },
    levels: { saving: false, error: null, savedAt: null },
    selectedCallType: AI_CALL_TYPE_ALL,
    typesLayout: 'wide',
    typesDrawerOpen: false,
};

interface SectionReadyPayload {
    section: AiDataSection;
    data: AiSectionData[AiDataSection];
    requestKey: string;
    serverKey: string;
}

/**
 * AI-аналитика ОП: настройки/готовность, пульс дисциплины, повестка РОПа,
 * обзор менеджер × тип (очередь + WS), «Внимание», срез по типу, реакции
 * и уровни. Секции независимы: у каждой свой статус и ключ, ответ с чужим
 * ключом (устаревший) игнорируется.
 */
const aiAnalyticsSlice = createSlice({
    name: 'aiAnalytics',
    initialState,
    reducers: {
        sectionPending: (
            state: AiAnalyticsState,
            action: PayloadAction<{
                section: AiDataSection;
                requestKey: string;
            }>,
        ) => {
            const section = state[action.payload.section];
            section.status = 'loading';
            section.requestKey = action.payload.requestKey;
            section.jobStatus = null;
            section.queuedAttempts = 0;
            section.error = null;
        },
        /** Тяжёлая ручка ответила queued/processing: ждём WS или таймаут. */
        sectionQueued: (
            state: AiAnalyticsState,
            action: PayloadAction<{
                section: AiQueuedSection;
                requestKey: string;
                serverKey: string;
                jobStatus: Exclude<AiJobStatus, null>;
            }>,
        ) => {
            const {
                section: name,
                requestKey,
                serverKey,
                jobStatus,
            } = action.payload;
            const section = state[name];
            if (section.requestKey !== requestKey) return;
            section.status = 'loading';
            section.serverKey = serverKey;
            section.jobStatus = jobStatus;
            section.queuedAttempts += 1;
        },
        sectionReady: (
            state: AiAnalyticsState,
            action: PayloadAction<SectionReadyPayload>,
        ) => {
            const {
                section: name,
                data,
                requestKey,
                serverKey,
            } = action.payload;
            const section = state[name];
            // Ответ на уже неактуальный запрос (сменился requester/фильтр).
            if (section.requestKey !== requestKey) return;
            section.status = 'ready';
            section.serverKey = serverKey;
            section.jobStatus = null;
            section.error = null;
            // Тип данных секции гарантирует thunk (одна ручка — одна секция).
            (section as AiSection<typeof data>).data = data;
        },
        sectionFailed: (
            state: AiAnalyticsState,
            action: PayloadAction<{
                section: AiDataSection;
                requestKey: string;
                error: string;
            }>,
        ) => {
            const section = state[action.payload.section];
            if (section.requestKey !== action.payload.requestKey) return;
            section.status = 'error';
            section.jobStatus = null;
            section.error = action.payload.error;
        },

        feedbackSending: (
            state: AiAnalyticsState,
            action: PayloadAction<string>,
        ) => {
            if (!state.feedback.pending.includes(action.payload)) {
                state.feedback.pending.push(action.payload);
            }
            state.feedback.error = null;
        },
        feedbackSent: (
            state: AiAnalyticsState,
            action: PayloadAction<{ object: string; kind: AiFeedbackKind }>,
        ) => {
            const { object, kind } = action.payload;
            state.feedback.pending = state.feedback.pending.filter(
                item => item !== object,
            );
            // view — телеметрия, кнопки по ней не подсвечиваем.
            if (kind !== 'view') state.feedback.sent[object] = kind;
        },
        feedbackFailed: (
            state: AiAnalyticsState,
            action: PayloadAction<{ object: string; error: string }>,
        ) => {
            state.feedback.pending = state.feedback.pending.filter(
                item => item !== action.payload.object,
            );
            state.feedback.error = action.payload.error;
        },
        /** Дедуп view-телеметрии на сессию (стор живёт сессию фрейма). */
        markViewed: (
            state: AiAnalyticsState,
            action: PayloadAction<string>,
        ) => {
            if (!state.feedback.viewed.includes(action.payload)) {
                state.feedback.viewed.push(action.payload);
            }
        },
        /** «Отработано» по сигналу: локально гасим флаг до перечитки пульса. */
        alertHandled: (
            state: AiAnalyticsState,
            action: PayloadAction<string>,
        ) => {
            const alert = state.pulse.data?.alerts.find(
                item => item.transcriptionId === action.payload,
            );
            if (alert) alert.handled = true;
        },

        levelsSaving: (state: AiAnalyticsState) => {
            state.levels.saving = true;
            state.levels.error = null;
        },
        /** Уровни сохранены — listener перечитает обзор (кэш сброшен сервером). */
        levelsSaved: (
            state: AiAnalyticsState,
            action: PayloadAction<string>,
        ) => {
            state.levels.saving = false;
            state.levels.savedAt = action.payload;
        },
        levelsFailed: (
            state: AiAnalyticsState,
            action: PayloadAction<string>,
        ) => {
            state.levels.saving = false;
            state.levels.error = action.payload;
        },

        setSelectedCallType: (
            state: AiAnalyticsState,
            action: PayloadAction<AiCallTypeSelection>,
        ) => {
            state.selectedCallType = action.payload;
        },
        setTypesLayout: (
            state: AiAnalyticsState,
            action: PayloadAction<AiByTypeLayout>,
        ) => {
            state.typesLayout = action.payload;
        },
        setTypesDrawerOpen: (
            state: AiAnalyticsState,
            action: PayloadAction<boolean>,
        ) => {
            state.typesDrawerOpen = action.payload;
        },
        /** Гидратация из ui-settings blob (значения могли протухнуть). */
        hydrateSettings: (
            state: AiAnalyticsState,
            action: PayloadAction<{
                selectedCallType?: unknown;
                typesLayout?: unknown;
            }>,
        ) => {
            const { selectedCallType, typesLayout } = action.payload;
            if (isAiCallTypeSelection(selectedCallType)) {
                state.selectedCallType = selectedCallType;
            }
            if (isAiByTypeLayout(typesLayout)) state.typesLayout = typesLayout;
        },
        /** Сброс данных (смена домена/пользователя) — настройки UI остаются. */
        resetData: (state: AiAnalyticsState) => {
            state.settings = emptySection();
            state.pulse = emptySection();
            state.agenda = emptySection();
            state.overview = emptySection();
            state.attention = emptySection();
            state.byType = emptySection();
            state.feedback = { pending: [], sent: {}, viewed: [], error: null };
            state.levels = { saving: false, error: null, savedAt: null };
            state.typesDrawerOpen = false;
        },
    },
});

export const aiAnalyticsReducer = aiAnalyticsSlice.reducer;
export const aiAnalyticsActions = aiAnalyticsSlice.actions;
