import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
    AiAbout,
    AiAboutEndpoint,
    AiAgenda,
    AiAnalyticsSettings,
    AiAttention,
    AiBrief,
    AiByType,
    AiByTypeLayout,
    AiDailyPlan,
    AiDailyPlanQuery,
    AiDossier,
    AiDossierQuery,
    AiOverview,
    AiPlanFact,
    AiPlanFactQuery,
    AiPulse,
    AiRopMarkSaveResult,
    AiRopMarkWeek,
    AiRopMarkWeekQuery,
    AiStyleCard,
    AiStyleQuery,
} from './index';
import {
    AI_CALL_TYPE_ALL,
    isAiCallTypeSelection,
    type AiCallTypeSelection,
} from '../lib/ai-call-types.data';
import { isAiByTypeLayout } from '../lib/ai-overview.data';
import {
    aiFeedbackReducers,
    emptyAiFeedback,
    type AiFeedbackState,
} from './ai-analytics-feedback.reducers';

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
    | 'byType'
    | 'dailyPlan'
    | 'brief'
    | 'ropMark'
    | 'style'
    | 'planFact'
    | 'dossier';

/** Секции, которые считает очередь (WS done → повторный POST). */
export const AI_QUEUED_SECTIONS = [
    'overview',
    'attention',
    'byType',
    'brief',
    'dossier',
] as const;
export type AiQueuedSection = (typeof AI_QUEUED_SECTIONS)[number];

export type AiSectionData = {
    settings: AiAnalyticsSettings;
    pulse: AiPulse;
    agenda: AiAgenda;
    overview: AiOverview;
    attention: AiAttention;
    byType: AiByType;
    dailyPlan: AiDailyPlan;
    brief: AiBrief;
    ropMark: AiRopMarkWeek;
    style: AiStyleCard;
    planFact: AiPlanFact;
    dossier: AiDossier;
};

/** Сохранение слепой метки (rop-mark/save); список недели остаётся на экране. */
export interface AiRopMarkSaveState {
    /** transcriptionId звонка, метка по которому отправляется; null — нет. */
    pending: string | null;
    /** Текст 400/403 сервера или сети; сбрасывается новой отправкой. */
    error: string | null;
    /** Результат последней записи (id, replaced, blind). */
    lastSaved: AiRopMarkSaveResult | null;
}

export interface AiAnalyticsState {
    settings: AiSection<AiAnalyticsSettings>;
    pulse: AiSection<AiPulse>;
    agenda: AiSection<AiAgenda>;
    overview: AiSection<AiOverview>;
    attention: AiSection<AiAttention>;
    byType: AiSection<AiByType>;
    /** План дня менеджера (plan/daily); гейт — settings.data.dailyPlanEnabled. */
    dailyPlan: AiSection<AiDailyPlan>;
    /** Чей план и на какой день запрошен (нужен UI в loading/error). */
    dailyPlanQuery: AiDailyPlanQuery | null;
    /** AI-резюме периода (brief, очередь + WS). */
    brief: AiSection<AiBrief>;
    /** Слепая оценка: подбор недели и метки (rop-mark/list, при отсутствии — pick). */
    ropMark: AiSection<AiRopMarkWeek>;
    /** Какая неделя запрошена (пусто — текущая неделя портала); по ней перечитка после метки. */
    ropMarkQuery: AiRopMarkWeekQuery | null;
    ropMarkSave: AiRopMarkSaveState;
    /** Карточка стиля менеджера (manager/style). */
    style: AiSection<AiStyleCard>;
    /** Чья карточка и за какой месяц запрошена. */
    styleQuery: AiStyleQuery | null;
    /** Реконсиляция «план — факт» месяца (plan-fact, sync; Фаза 3). */
    planFact: AiSection<AiPlanFact>;
    /** Какой месяц и какие менеджеры запрошены. */
    planFactQuery: AiPlanFactQuery | null;
    /** Досье менеджера (dossier, очередь + WS; Фаза 3). */
    dossier: AiSection<AiDossier>;
    /** Чьё досье и за какое окно запрошено. */
    dossierQuery: AiDossierQuery | null;
    /** «Как считаем» — кэш по ручке (overview | plan/daily | brief | manager/style). */
    about: Partial<Record<AiAboutEndpoint, AiSection<AiAbout>>>;
    feedback: AiFeedbackState;
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

const emptyRopMarkSave = (): AiRopMarkSaveState => ({
    pending: null,
    error: null,
    lastSaved: null,
});

const initialState: AiAnalyticsState = {
    settings: emptySection(),
    pulse: emptySection(),
    agenda: emptySection(),
    overview: emptySection(),
    attention: emptySection(),
    byType: emptySection(),
    dailyPlan: emptySection(),
    dailyPlanQuery: null,
    brief: emptySection(),
    ropMark: emptySection(),
    ropMarkQuery: null,
    ropMarkSave: emptyRopMarkSave(),
    style: emptySection(),
    styleQuery: null,
    planFact: emptySection(),
    planFactQuery: null,
    dossier: emptySection(),
    dossierQuery: null,
    about: {},
    feedback: emptyAiFeedback(),
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

/** Секция кэша «Как считаем» по ручке; отсутствующая — создаётся пустой. */
const aboutSection = (
    state: AiAnalyticsState,
    endpoint: AiAboutEndpoint,
): AiSection<AiAbout> => {
    const existing = state.about[endpoint];
    if (existing) return existing;
    const created = emptySection<AiAbout>();
    state.about[endpoint] = created;
    return created;
};

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

        /* Реакции: pending / sent / errors / viewed — feedback.reducers. */
        ...aiFeedbackReducers,
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

        /* ---------- Фаза 2: план дня, стиль, слепая оценка, «Как считаем» ---------- */

        /** Запомнить, чей план и на какой день запрошен (до sectionPending). */
        dailyPlanQueried: (
            state: AiAnalyticsState,
            action: PayloadAction<AiDailyPlanQuery>,
        ) => {
            state.dailyPlanQuery = action.payload;
        },
        /** Запомнить, чья карточка стиля и за какой месяц запрошена. */
        styleQueried: (
            state: AiAnalyticsState,
            action: PayloadAction<AiStyleQuery>,
        ) => {
            state.styleQuery = action.payload;
        },

        /* ---------- Фаза 3: план-факт, досье ---------- */

        /** Запомнить месяц и менеджеров план-факта (до sectionPending). */
        planFactQueried: (
            state: AiAnalyticsState,
            action: PayloadAction<AiPlanFactQuery>,
        ) => {
            state.planFactQuery = action.payload;
        },
        /** Запомнить, чьё досье и за какое окно запрошено. */
        dossierQueried: (
            state: AiAnalyticsState,
            action: PayloadAction<AiDossierQuery>,
        ) => {
            state.dossierQuery = action.payload;
        },

        /** Запомнить неделю слепой оценки (до sectionPending). */
        ropMarkQueried: (
            state: AiAnalyticsState,
            action: PayloadAction<AiRopMarkWeekQuery>,
        ) => {
            state.ropMarkQuery = action.payload;
        },
        ropMarkSaving: (
            state: AiAnalyticsState,
            action: PayloadAction<string>,
        ) => {
            state.ropMarkSave.pending = action.payload;
            state.ropMarkSave.error = null;
        },
        /** Метка записана; список недели перечитает thunk. */
        ropMarkSaved: (
            state: AiAnalyticsState,
            action: PayloadAction<AiRopMarkSaveResult>,
        ) => {
            state.ropMarkSave.pending = null;
            state.ropMarkSave.lastSaved = action.payload;
        },
        /** 400 (вне подбора) / 403 (вне периметра, не руководитель) — текст сервера. */
        ropMarkSaveFailed: (
            state: AiAnalyticsState,
            action: PayloadAction<string>,
        ) => {
            state.ropMarkSave.pending = null;
            state.ropMarkSave.error = action.payload;
        },

        aboutPending: (
            state: AiAnalyticsState,
            action: PayloadAction<{
                endpoint: AiAboutEndpoint;
                requestKey: string;
            }>,
        ) => {
            const section = aboutSection(state, action.payload.endpoint);
            section.status = 'loading';
            section.requestKey = action.payload.requestKey;
            section.error = null;
        },
        aboutReady: (
            state: AiAnalyticsState,
            action: PayloadAction<{
                endpoint: AiAboutEndpoint;
                data: AiAbout;
                requestKey: string;
                serverKey: string;
            }>,
        ) => {
            const { endpoint, data, requestKey, serverKey } = action.payload;
            const section = aboutSection(state, endpoint);
            if (section.requestKey !== requestKey) return;
            section.status = 'ready';
            section.serverKey = serverKey;
            section.error = null;
            section.data = data;
        },
        aboutFailed: (
            state: AiAnalyticsState,
            action: PayloadAction<{
                endpoint: AiAboutEndpoint;
                requestKey: string;
                error: string;
            }>,
        ) => {
            const section = aboutSection(state, action.payload.endpoint);
            if (section.requestKey !== action.payload.requestKey) return;
            section.status = 'error';
            section.error = action.payload.error;
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
            state.dailyPlan = emptySection();
            state.dailyPlanQuery = null;
            state.brief = emptySection();
            state.ropMark = emptySection();
            state.ropMarkQuery = null;
            state.ropMarkSave = emptyRopMarkSave();
            state.style = emptySection();
            state.styleQuery = null;
            state.planFact = emptySection();
            state.planFactQuery = null;
            state.dossier = emptySection();
            state.dossierQuery = null;
            state.about = {};
            state.feedback = emptyAiFeedback();
            state.levels = { saving: false, error: null, savedAt: null };
            state.typesDrawerOpen = false;
        },
    },
});

export const aiAnalyticsReducer = aiAnalyticsSlice.reducer;
export const aiAnalyticsActions = aiAnalyticsSlice.actions;
