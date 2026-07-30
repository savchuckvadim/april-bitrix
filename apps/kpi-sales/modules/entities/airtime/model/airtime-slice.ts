import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AirtimeProgressDto } from '@workspace/nest-kpi-report-sales-api';
import type { AirtimeReport } from './index';

export type AirtimeStatus = 'idle' | 'loading' | 'queued' | 'ready' | 'error';

interface AirtimeSection {
    status: AirtimeStatus;
    data: AirtimeReport | null;
    /** `${dateFrom}|${dateTo}|${sortedUserIds}` — что загружено/грузится. */
    requestKey: string | null;
    /** Прогресс сборки партиций (status queued/error): «готово N из M мес». */
    progress: AirtimeProgressDto | null;
    error: string | null;
}

export interface AirtimeState {
    /** Команда (виджет в отчёте). */
    team: AirtimeSection;
    /** Один сотрудник (карточка в user report). */
    user: AirtimeSection & { userId: number | null };
}

const emptySection = (): AirtimeSection => ({
    status: 'idle',
    data: null,
    requestKey: null,
    progress: null,
    error: null,
});

const initialState: AirtimeState = {
    team: emptySection(),
    user: { ...emptySection(), userId: null },
};

/** Payload очереди: отчёт (возможно частичный) + ключ для отсева устаревших. */
interface ArrivedPayload {
    requestKey: string;
    report: AirtimeReport;
}

interface ProgressPayload {
    requestKey: string;
    progress: AirtimeProgressDto;
}

interface FailedPayload {
    requestKey?: string;
    message: string;
}

/** Общие переходы секции (team/user идентичны — DRY). */
const applyPending = (section: AirtimeSection, requestKey: string): void => {
    // Смена фильтра — старые данные другого периода под стеклом вводили бы
    // в заблуждение; тот же ключ (ретрай/forceRefresh) — данные оставляем.
    if (section.requestKey !== requestKey) {
        section.data = null;
        section.progress = null;
    }
    section.status = 'loading';
    section.requestKey = requestKey;
    section.error = null;
};

const applyQueued = (
    section: AirtimeSection,
    payload: ArrivedPayload,
): void => {
    if (section.requestKey !== payload.requestKey) return; // устаревший ответ
    section.status = 'queued';
    section.progress = payload.report.progress ?? null;
    section.error = null;
    // Частичные данные готовых месяцев — таблица «под стеклом». Пустой
    // partial не затирает предыдущий (readyMonths только растёт).
    if (payload.report.users?.length) {
        section.data = payload.report;
    }
};

const applyArrived = (
    section: AirtimeSection,
    payload: ArrivedPayload,
): void => {
    if (section.requestKey !== payload.requestKey) return; // устаревший ответ
    section.status = 'ready';
    section.data = payload.report;
    section.progress = null;
    section.error = null;
};

const applyProgress = (
    section: AirtimeSection,
    payload: ProgressPayload,
): void => {
    if (section.requestKey !== payload.requestKey) return;
    if (section.status !== 'queued' && section.status !== 'loading') return;
    section.status = 'queued';
    section.progress = payload.progress;
};

const applyFailed = (section: AirtimeSection, payload: FailedPayload): void => {
    if (payload.requestKey && section.requestKey !== payload.requestKey) {
        return; // ошибка устаревшего запроса
    }
    section.status = 'error';
    section.error = payload.message;
};

const airtimeSlice = createSlice({
    name: 'airtime',
    initialState,
    reducers: {
        teamPending: (
            state: AirtimeState,
            action: PayloadAction<{ requestKey: string }>,
        ) => {
            applyPending(state.team, action.payload.requestKey);
        },
        /** Ответ queued: прогресс + частичные данные готовых месяцев. */
        teamQueued: (
            state: AirtimeState,
            action: PayloadAction<ArrivedPayload>,
        ) => {
            applyQueued(state.team, action.payload);
        },
        /** Готовый отчёт (поллинг/первый ответ) с отсевом по requestKey. */
        teamArrived: (
            state: AirtimeState,
            action: PayloadAction<ArrivedPayload>,
        ) => {
            applyArrived(state.team, action.payload);
        },
        /** Прогресс из WS airtime:progress. */
        teamProgress: (
            state: AirtimeState,
            action: PayloadAction<ProgressPayload>,
        ) => {
            applyProgress(state.team, action.payload);
        },
        teamFailed: (
            state: AirtimeState,
            action: PayloadAction<FailedPayload>,
        ) => {
            applyFailed(state.team, action.payload);
        },
        /** Легаси/снапшот (public /share): готовый отчёт без отсева по ключу. */
        teamReady: (
            state: AirtimeState,
            action: PayloadAction<AirtimeReport>,
        ) => {
            state.team.status = 'ready';
            state.team.data = action.payload;
            state.team.progress = null;
        },
        userPending: (
            state: AirtimeState,
            action: PayloadAction<{ requestKey: string; userId: number }>,
        ) => {
            applyPending(state.user, action.payload.requestKey);
            state.user.userId = action.payload.userId;
        },
        userQueued: (
            state: AirtimeState,
            action: PayloadAction<ArrivedPayload>,
        ) => {
            applyQueued(state.user, action.payload);
        },
        userArrived: (
            state: AirtimeState,
            action: PayloadAction<ArrivedPayload>,
        ) => {
            applyArrived(state.user, action.payload);
        },
        userProgress: (
            state: AirtimeState,
            action: PayloadAction<ProgressPayload>,
        ) => {
            applyProgress(state.user, action.payload);
        },
        userFailed: (
            state: AirtimeState,
            action: PayloadAction<FailedPayload>,
        ) => {
            applyFailed(state.user, action.payload);
        },
        userReady: (
            state: AirtimeState,
            action: PayloadAction<AirtimeReport>,
        ) => {
            state.user.status = 'ready';
            state.user.data = action.payload;
            state.user.progress = null;
        },
    },
});

export const airtimeReducer = airtimeSlice.reducer;
export const airtimeActions = airtimeSlice.actions;
