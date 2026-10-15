import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { logClient } from '@/modules/app/lib/helper/logClient';
import { safeSocketId } from '@/modules/entities/airtime';
import type { DigestBXUser } from './index';
import { DigestHelper } from '../lib/api/digest-helper';
import { digestActions } from './digest-slice';

const helper = new DigestHelper();

/** Интервал поллинг-фолбэка (WS может не подняться за прокси). */
export const DIGEST_POLL_INTERVAL_MS = 7_000;

/** Формат ключа = requestKey бэка: `day|{date}|{date}|{sortedIds}`. */
export const buildDigestRequestKey = (
    date: string,
    users: readonly { ID?: string | number }[],
): string =>
    `day|${date}|${date}|${users
        .map(user => Number(user.ID))
        .filter(id => Number.isFinite(id) && id > 0)
        .sort((a, b) => a - b)
        .join('_')}`;

const toBxUser = (user: {
    ID?: string | number;
    NAME?: string;
    LAST_NAME?: string;
}): DigestBXUser => ({
    ID: String(user.ID ?? ''),
    NAME: user.NAME ?? '',
    LAST_NAME: user.LAST_NAME ?? '',
});

interface DigestFetchOptions {
    /** Пересчитать день, игнорируя кэш бэка (кнопка «Пересчитать»/повтор после ошибки). */
    forceRefresh?: boolean;
    /** Повторный POST поллинга/WS-done: без pending и дедуп-гейта. */
    poll?: boolean;
}

let pollTimer: ReturnType<typeof setTimeout> | null = null;

const schedulePoll = (
    requestKey: string,
    dispatch: AppDispatch,
    getState: AppGetState,
): void => {
    if (pollTimer) clearTimeout(pollTimer);
    pollTimer = setTimeout(() => {
        pollTimer = null;
        const current = getState().digest;
        if (current.requestKey !== requestKey || current.status !== 'queued') {
            return;
        }
        void dispatch(fetchDigest({ poll: true }));
    }, DIGEST_POLL_INTERVAL_MS);
};

/** Немедленный повторный POST (WS done без данных) — заберёт конверт из кэша. */
export const pollDigestNow =
    () => (dispatch: AppDispatch, getState: AppGetState) => {
        if (getState().digest.status === 'queued') {
            void dispatch(fetchDigest({ poll: true }));
        }
    };

/**
 * Дайджест за выбранный день по текущей выборке сотрудников (как остальные
 * вкладки: department.current, без выбора — весь видимый периметр).
 * Конверт ready|queued|error: queued → поллинг раз в 7 с + WS
 * kpi-report:digest:done; устаревшие ответы отсекаются по requestKey.
 */
export const fetchDigest =
    (options: DigestFetchOptions = {}) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { app, department, digest } = state;
        const users = (
            department.current.length ? department.current : department.items
        ).map(toBxUser);
        // Пустой domain — публичная страница /share: дайджеста там нет.
        if (!app.domain || !digest.date || !users.length) return;

        const requestKey = buildDigestRequestKey(digest.date, users);
        if (!options.poll && !options.forceRefresh) {
            const sameKey = digest.requestKey === requestKey;
            if (sameKey && digest.status !== 'error' && digest.status !== 'idle') {
                return;
            }
        }
        // Повторный POST (поллинг/автообновление) только для загруженного
        // ключа: день или выборка сменились — обычный запрос уже в пути.
        if (options.poll && digest.requestKey !== requestKey) return;
        if (!options.poll) {
            dispatch(digestActions.pending({ requestKey }));
        }

        try {
            const envelope = await helper.get({
                domain: app.domain,
                filters: { kind: 'day', date: digest.date, departament: users },
                socketId: safeSocketId(),
                // Поллинг не форсит: forceRefresh только на явном действии.
                forceRefresh: options.poll ? undefined : options.forceRefresh,
            });

            if (envelope.status === 'queued') {
                dispatch(digestActions.queued({ requestKey }));
                schedulePoll(requestKey, dispatch, getState);
                return;
            }
            if (envelope.status === 'error' || !envelope.data) {
                dispatch(
                    digestActions.failed({
                        requestKey,
                        message: envelope.message ?? 'Не удалось собрать дайджест',
                    }),
                );
                return;
            }
            dispatch(digestActions.arrived({ requestKey, data: envelope.data }));
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Ошибка запроса дайджеста';
            dispatch(digestActions.failed({ requestKey, message }));
            logClient(
                {
                    title: 'digest',
                    level: 'error',
                    context: 'fetchDigest',
                    message,
                    domain: app.domain,
                    userId: app.bitrix.user?.ID,
                },
                { requestKey },
            );
        }
    };
