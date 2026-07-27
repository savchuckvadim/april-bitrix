import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
    FinanceClosedReport,
    FinanceHotReport,
    FinanceHotThreshold,
} from './index';
import type { ComparisonMode } from '../lib/period-shift.util';

export type FinanceStatus = 'idle' | 'loading' | 'ready' | 'error';

/** requestKey: `${dateFrom}|${dateTo}|${sortedIds.join('_')}`. */
export const buildFinanceRequestKey = (
    from: string,
    to: string,
    assignedIds: number[],
): string =>
    `${from}|${to}|${[...assignedIds].sort((a, b) => a - b).join('_')}`;

/** Дата к виду yyyy-MM-dd (бэк может эхнуть ISO с временем/зоной). */
const dateOnly = (value: string): string => String(value).slice(0, 10);

const keyDates = (requestKey: string | null): [string, string] | null => {
    if (!requestKey) return null;
    const [from, to] = requestKey.split('|');
    return from && to ? [dateOnly(from), dateOnly(to)] : null;
};

const keyIds = (requestKey: string | null): number[] => {
    const raw = requestKey?.split('|')[2];
    return raw ? raw.split('_').map(Number).filter(Boolean) : [];
};

interface ClosedSection {
    status: FinanceStatus;
    report: FinanceClosedReport | null;
    requestKey: string | null;
    error: string | null;
}

/** Клиентские фильтры вкладки «Финансы» ('all' — без фильтра). */
export interface FinanceTypeFilters {
    contractType: string;
    clientType: string;
}

export const FINANCE_TYPE_FILTER_ALL = 'all';

export interface FinanceState {
    closed: ClosedSection;
    comparison: ClosedSection & { mode: ComparisonMode };
    /** Фильтры по типу договора / типу клиента (закрытые + горячие). */
    typeFilters: FinanceTypeFilters;
    hot: {
        threshold: FinanceHotThreshold;
        status: FinanceStatus;
        report: FinanceHotReport | null;
        /** `${threshold}|${sortedIds}` — даты не участвуют (live snapshot). */
        requestKey: string | null;
        error: string | null;
        /**
         * Публичная страница /share: отчёты по всем порогам из снимка —
         * переключатель порога работает без запросов (см. seedSnapshot).
         */
        seededByThreshold: Partial<
            Record<FinanceHotThreshold, FinanceHotReport>
        > | null;
        /** Хвост requestKey снимка (sorted ids) для свопа по порогу. */
        seededIdsKey: string | null;
    };
    /** Финансы одного менеджера (user report). */
    userFinance: ClosedSection & {
        userId: number | null;
        comparisonReport: FinanceClosedReport | null;
        comparisonKey: string | null;
    };
}

const emptyClosed = (): ClosedSection => ({
    status: 'idle',
    report: null,
    requestKey: null,
    error: null,
});

const initialState: FinanceState = {
    closed: emptyClosed(),
    comparison: { ...emptyClosed(), mode: 'off' },
    typeFilters: {
        contractType: FINANCE_TYPE_FILTER_ALL,
        clientType: FINANCE_TYPE_FILTER_ALL,
    },
    hot: {
        threshold: 'presentation',
        status: 'idle',
        report: null,
        requestKey: null,
        error: null,
        seededByThreshold: null,
        seededIdsKey: null,
    },
    userFinance: {
        ...emptyClosed(),
        userId: null,
        comparisonReport: null,
        comparisonKey: null,
    },
};

/**
 * Роутинг WS-ответа closed-sales: событие одно на все запросы, корреляции
 * нет. Матчим по (нормализованным) датам requestKey; период сравнения
 * всегда со сдвинутыми датами, поэтому отделяется от основного. Совпадение
 * дат основной/пользовательской секции разводит isSingleUserReport;
 * устаревший ответ по другому составу сотрудников отсекает idsCoverReport.
 */
const matchesDates = (
    requestKey: string | null,
    report: FinanceClosedReport,
): boolean => {
    const dates = keyDates(requestKey);
    return (
        !!dates &&
        dates[0] === dateOnly(report.dateFrom) &&
        dates[1] === dateOnly(report.dateTo)
    );
};

/** Сотрудники отчёта входят в запрошенный состав (отсев устаревших). */
const idsCoverReport = (
    requestKey: string | null,
    report: FinanceClosedReport,
): boolean => {
    const ids = new Set(keyIds(requestKey));
    if (!ids.size) return true; // «все» — состав не ограничен
    return report.employees.every(emp => ids.has(emp.assignedId));
};

const isSingleUserReport = (
    requestKey: string | null,
    report: FinanceClosedReport,
): boolean => {
    const ids = keyIds(requestKey);
    return (
        ids.length === 1 &&
        report.employees.length > 0 &&
        report.employees.every(emp => emp.assignedId === ids[0])
    );
};

const financeSlice = createSlice({
    name: 'finance',
    initialState,
    reducers: {
        closedPending: (state: FinanceState, action: PayloadAction<string>) => {
            state.closed.status = 'loading';
            state.closed.requestKey = action.payload;
            state.closed.error = null;
        },
        closedReady: (
            state: FinanceState,
            action: PayloadAction<FinanceClosedReport>,
        ) => {
            state.closed.status = 'ready';
            state.closed.report = action.payload;
        },
        closedFailed: (state: FinanceState, action: PayloadAction<string>) => {
            state.closed.status = 'error';
            state.closed.error = action.payload;
        },

        comparisonPending: (
            state: FinanceState,
            action: PayloadAction<string>,
        ) => {
            state.comparison.status = 'loading';
            state.comparison.requestKey = action.payload;
            state.comparison.error = null;
        },
        comparisonReady: (
            state: FinanceState,
            action: PayloadAction<FinanceClosedReport>,
        ) => {
            state.comparison.status = 'ready';
            state.comparison.report = action.payload;
        },
        comparisonFailed: (
            state: FinanceState,
            action: PayloadAction<string>,
        ) => {
            state.comparison.status = 'error';
            state.comparison.error = action.payload;
        },
        setComparisonMode: (
            state: FinanceState,
            action: PayloadAction<ComparisonMode>,
        ) => {
            state.comparison.mode = action.payload;
            if (action.payload === 'off') {
                state.comparison = { ...emptyClosed(), mode: 'off' };
                state.userFinance.comparisonReport = null;
                state.userFinance.comparisonKey = null;
            }
        },

        hotPending: (state: FinanceState, action: PayloadAction<string>) => {
            state.hot.status = 'loading';
            state.hot.requestKey = action.payload;
            state.hot.error = null;
        },
        hotReady: (
            state: FinanceState,
            action: PayloadAction<FinanceHotReport>,
        ) => {
            state.hot.status = 'ready';
            state.hot.report = action.payload;
        },
        hotFailed: (state: FinanceState, action: PayloadAction<string>) => {
            state.hot.status = 'error';
            state.hot.error = action.payload;
        },
        setTypeFilter: (
            state: FinanceState,
            action: PayloadAction<{
                key: keyof FinanceTypeFilters;
                value: string;
            }>,
        ) => {
            state.typeFilters[action.payload.key] = action.payload.value;
        },

        setHotThreshold: (
            state: FinanceState,
            action: PayloadAction<FinanceHotThreshold>,
        ) => {
            state.hot.threshold = action.payload;
            // Публичная страница: отчёт нового порога уже в снимке — своп
            // без запроса (getHotClients на /share гардится по domain).
            const seeded = state.hot.seededByThreshold?.[action.payload];
            if (seeded) {
                state.hot.status = 'ready';
                state.hot.report = seeded;
                state.hot.requestKey = `${action.payload}|${state.hot.seededIdsKey ?? ''}`;
                state.hot.error = null;
            }
        },

        userFinancePending: (
            state: FinanceState,
            action: PayloadAction<{ requestKey: string; userId: number }>,
        ) => {
            state.userFinance.status = 'loading';
            state.userFinance.requestKey = action.payload.requestKey;
            state.userFinance.userId = action.payload.userId;
            state.userFinance.error = null;
        },
        userFinanceReady: (
            state: FinanceState,
            action: PayloadAction<FinanceClosedReport>,
        ) => {
            state.userFinance.status = 'ready';
            state.userFinance.report = action.payload;
        },
        userFinanceFailed: (
            state: FinanceState,
            action: PayloadAction<string>,
        ) => {
            state.userFinance.status = 'error';
            state.userFinance.error = action.payload;
        },
        userFinanceComparisonPending: (
            state: FinanceState,
            action: PayloadAction<string>,
        ) => {
            state.userFinance.comparisonKey = action.payload;
        },
        userFinanceComparisonReady: (
            state: FinanceState,
            action: PayloadAction<FinanceClosedReport>,
        ) => {
            state.userFinance.comparisonReport = action.payload;
        },

        /**
         * Сидинг публичного снимка (/share): закрытые продажи + горячие
         * по всем порогам. requestKey совпадает с тем, что построили бы
         * thunks — их гард «уже загружено» отсекает повторные запросы.
         */
        seedSnapshot: (
            state: FinanceState,
            action: PayloadAction<{
                closed: FinanceClosedReport | null;
                hotByThreshold: Partial<
                    Record<FinanceHotThreshold, FinanceHotReport>
                >;
                assignedIds: number[];
                from: string;
                to: string;
            }>,
        ) => {
            const { closed, hotByThreshold, assignedIds, from, to } =
                action.payload;

            if (closed) {
                state.closed = {
                    status: 'ready',
                    report: closed,
                    requestKey: buildFinanceRequestKey(from, to, assignedIds),
                    error: null,
                };
            }

            const idsKey = [...assignedIds]
                .sort((a, b) => a - b)
                .join('_');
            state.hot.seededByThreshold = hotByThreshold;
            state.hot.seededIdsKey = idsKey;
            const current = hotByThreshold[state.hot.threshold];
            if (current) {
                state.hot.status = 'ready';
                state.hot.report = current;
                state.hot.requestKey = `${state.hot.threshold}|${idsKey}`;
                state.hot.error = null;
            }
        },

        hydrateSettings: (
            state: FinanceState,
            action: PayloadAction<{
                comparison?: ComparisonMode;
                hotThreshold?: FinanceHotThreshold;
            }>,
        ) => {
            if (action.payload.comparison) {
                state.comparison.mode = action.payload.comparison;
            }
            if (action.payload.hotThreshold) {
                state.hot.threshold = action.payload.hotThreshold;
            }
        },

        /** Приход queued-результата closed-sales по WS (см. док класса). */
        closedSalesArrived: (
            state: FinanceState,
            action: PayloadAction<FinanceClosedReport>,
        ) => {
            const report = action.payload;
            if (!report || !Array.isArray(report.employees)) return;

            if (
                state.userFinance.status === 'loading' &&
                matchesDates(state.userFinance.requestKey, report) &&
                isSingleUserReport(state.userFinance.requestKey, report)
            ) {
                state.userFinance.status = 'ready';
                state.userFinance.report = report;
                return;
            }
            if (
                state.userFinance.comparisonKey &&
                !state.userFinance.comparisonReport &&
                matchesDates(state.userFinance.comparisonKey, report) &&
                isSingleUserReport(state.userFinance.comparisonKey, report)
            ) {
                state.userFinance.comparisonReport = report;
                return;
            }
            if (
                state.comparison.status === 'loading' &&
                matchesDates(state.comparison.requestKey, report) &&
                idsCoverReport(state.comparison.requestKey, report)
            ) {
                state.comparison.status = 'ready';
                state.comparison.report = report;
                return;
            }
            if (
                state.closed.status === 'loading' &&
                matchesDates(state.closed.requestKey, report) &&
                idsCoverReport(state.closed.requestKey, report)
            ) {
                state.closed.status = 'ready';
                state.closed.report = report;
            }
        },
    },
});

export const financeReducer = financeSlice.reducer;
export const financeActions = financeSlice.actions;
