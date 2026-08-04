import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import type { BXUserDto } from '@workspace/nest-kpi-report-sales-api';
import { AirtimeHelper } from '../lib/api/airtime-helper';
import {
    AIRTIME_POLL_INTERVAL_MS,
    safeSocketId,
} from '../lib/queue-flow.util';
import { airtimeActions } from './airtime-slice';

const airtimeHelper = new AirtimeHelper();

/** Формат ключа = requestKey бэка: `${from}|${to}|${sortedIds}`. */
export const buildAirtimeRequestKey = (
    from: string,
    to: string,
    users: BXUserDto[],
): string =>
    `${from}|${to}|${users
        .map(user => Number(user.ID))
        .sort((a, b) => a - b)
        .join('_')}`;

const toBxUserDto = (user: {
    ID?: string | number;
    NAME?: string;
    LAST_NAME?: string;
}): BXUserDto => ({
    ID: String(user.ID ?? ''),
    NAME: user.NAME ?? '',
    LAST_NAME: user.LAST_NAME ?? '',
});

interface AirtimeFetchOptions {
    /** Пересчитать живой хвост (кнопка «Пересчитать»/повтор после ошибки). */
    forceRefresh?: boolean;
    /** Повторный POST поллинга/WS-done: без pending, без дедуп-гейта. */
    poll?: boolean;
}

type AirtimeSectionKey = 'team' | 'user';

/**
 * Таймеры поллинга по секциям. Поллинг ОБЯЗАТЕЛЕН (не только фолбэк WS):
 * каждый повторный POST подтягивает следующую порцию job'ов на бэке
 * (порционная постановка) — закрыл вкладку → поллинг умер → очередь
 * затухает сама.
 */
const pollTimers: Record<AirtimeSectionKey, ReturnType<
    typeof setTimeout
> | null> = { team: null, user: null };

const schedulePoll = (
    section: AirtimeSectionKey,
    requestKey: string,
    dispatch: AppDispatch,
    getState: AppGetState,
    poll: () => void,
): void => {
    const existing = pollTimers[section];
    if (existing) clearTimeout(existing);
    pollTimers[section] = setTimeout(() => {
        pollTimers[section] = null;
        const current = getState().airtime[section];
        // Ключ сменился или секция уже не queued — поллинг не нужен.
        if (current.requestKey !== requestKey || current.status !== 'queued') {
            return;
        }
        poll();
    }, AIRTIME_POLL_INTERVAL_MS);
};

/** Немедленный повторный POST (WS airtime:done) — заберёт отчёт из кэша. */
export const pollTeamAirtimeNow =
    () => (dispatch: AppDispatch, getState: AppGetState) => {
        if (getState().airtime.team.status === 'queued') {
            void dispatch(getTeamAirtime({ poll: true }));
        }
    };

export const pollUserAirtimeNow =
    () => (dispatch: AppDispatch, getState: AppGetState) => {
        const { status, userId } = getState().airtime.user;
        if (status === 'queued' && userId) {
            void dispatch(getUserAirtime(userId, { poll: true }));
        }
    };

/** Эфирное время команды (текущий фильтр сотрудников + даты отчёта). */
export const getTeamAirtime =
    (options: AirtimeFetchOptions = {}) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { from, to } = state.report.date;
        const users = state.department.current.map(toBxUserDto);
        // Пустой domain — публичная страница /share: данные сидятся снимком.
        if (!state.app.domain || !from || !to || !users.length) return;

        const requestKey = buildAirtimeRequestKey(from, to, users);
        const { status, requestKey: loadedKey } = state.airtime.team;
        if (!options.poll && !options.forceRefresh) {
            // Тот же ключ уже готов/грузится/в очереди — не дублируем.
            if (loadedKey === requestKey && status !== 'error') return;
        }

        if (!options.poll) {
            dispatch(airtimeActions.teamPending({ requestKey }));
        }
        try {
            const report = await airtimeHelper.getStatistic({
                domain: state.app.domain,
                filters: { departament: users, dateFrom: from, dateTo: to },
                mode: 'queue',
                socketId: safeSocketId(),
                // Поллинг не форсит: forceRefresh только на явном действии.
                forceRefresh: options.poll ? undefined : options.forceRefresh,
            });

            if (report.status === 'queued') {
                dispatch(airtimeActions.teamQueued({ requestKey, report }));
                schedulePoll('team', requestKey, dispatch, getState, () =>
                    void dispatch(getTeamAirtime({ poll: true })),
                );
                return;
            }
            if (report.status === 'error') {
                dispatch(
                    airtimeActions.teamFailed({
                        requestKey,
                        message:
                            report.message ??
                            'Сбор эфирного времени завершился ошибкой. Нажмите «Пересчитать».',
                    }),
                );
                return;
            }
            dispatch(airtimeActions.teamArrived({ requestKey, report }));
        } catch (error) {
            dispatch(
                airtimeActions.teamFailed({
                    requestKey,
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Не удалось получить эфирное время',
                }),
            );
        }
    };

/** Эфирное время одного сотрудника (карточка в user report). */
export const getUserAirtime =
    (userId: number, options: AirtimeFetchOptions = {}) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { from, to } = state.report.date;
        const bxUser = state.department.items.find(
            item => Number(item?.ID) === userId,
        );
        if (!state.app.domain || !from || !to || !bxUser) return;

        const users = [toBxUserDto(bxUser)];
        const requestKey = buildAirtimeRequestKey(from, to, users);
        const { status, requestKey: loadedKey } = state.airtime.user;
        if (!options.poll && !options.forceRefresh) {
            if (loadedKey === requestKey && status !== 'error') return;
        }

        if (!options.poll) {
            dispatch(airtimeActions.userPending({ requestKey, userId }));
        }
        try {
            const report = await airtimeHelper.getStatistic({
                domain: state.app.domain,
                filters: { departament: users, dateFrom: from, dateTo: to },
                mode: 'queue',
                socketId: safeSocketId(),
                forceRefresh: options.poll ? undefined : options.forceRefresh,
            });

            if (report.status === 'queued') {
                dispatch(airtimeActions.userQueued({ requestKey, report }));
                schedulePoll('user', requestKey, dispatch, getState, () =>
                    void dispatch(getUserAirtime(userId, { poll: true })),
                );
                return;
            }
            if (report.status === 'error') {
                dispatch(
                    airtimeActions.userFailed({
                        requestKey,
                        message:
                            report.message ??
                            'Сбор эфирного времени завершился ошибкой.',
                    }),
                );
                return;
            }
            dispatch(airtimeActions.userArrived({ requestKey, report }));
        } catch (error) {
            dispatch(
                airtimeActions.userFailed({
                    requestKey,
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Не удалось получить эфирное время',
                }),
            );
        }
    };
