import {
    pbxRequest,
    PbxApiError,
    type PbxAuthSource,
} from '../marketplace/pbx-api.client';
import type { CabinetSiteSession } from './cabinet.types';

/**
 * Сессия кабинета на САЙТЕ (вход по email и паролю, вне Битрикса).
 *
 * Access-токен — только в памяти вкладки; refresh — httpOnly-cookie на
 * ручках `/api/cabinet/auth` (JS его не видит). При загрузке страницы
 * сессия восстанавливается ручкой refresh, перед истечением access —
 * обновляется сама. Во фрейме Битрикса не используется: там сессия фрейма.
 */

export type SiteSessionStatus =
    | 'idle' //       ещё не проверяли
    | 'loading' //    идёт вход / обновление
    | 'ready' //      вошли
    | 'anonymous'; // не вошли (нет cookie или она истекла)

export interface SiteSessionSnapshot {
    status: SiteSessionStatus;
    userId: number | null;
}

type Listener = () => void;

/** Обновлять access за минуту до истечения. */
const REFRESH_AHEAD_MS = 60_000;
const AUTH_PATH = '/api/cabinet/auth';

/**
 * Состояние — один контейнер на globalThis: при transpilePackages webpack
 * может собрать две копии модуля, и токен «пропал» бы между ними (тот же
 * урок, что у стора сессии фрейма, живой тест 2026-07-18).
 */
interface SiteSessionCore {
    snapshot: SiteSessionSnapshot;
    token: string | null;
    refreshTimer: ReturnType<typeof setTimeout> | null;
    inFlight: Promise<boolean> | null;
    listeners: Set<Listener>;
}

const GLOBAL_KEY = '__cabinetSiteSession__';

function getCore(): SiteSessionCore {
    const holder = globalThis as typeof globalThis & {
        [GLOBAL_KEY]?: SiteSessionCore;
    };
    holder[GLOBAL_KEY] ??= {
        snapshot: { status: 'idle', userId: null },
        token: null,
        refreshTimer: null,
        inFlight: null,
        listeners: new Set<Listener>(),
    };
    return holder[GLOBAL_KEY];
}

const core = getCore();

function emit(next: SiteSessionSnapshot): void {
    core.snapshot = next;
    core.listeners.forEach((listener) => listener());
}

function apply(session: CabinetSiteSession): void {
    core.token = session.accessToken;
    emit({ status: 'ready', userId: session.userId });
    scheduleRefresh(session.accessExpiresAt);
}

function clear(): void {
    core.token = null;
    if (core.refreshTimer) clearTimeout(core.refreshTimer);
    core.refreshTimer = null;
    emit({ status: 'anonymous', userId: null });
}

function scheduleRefresh(expiresAt: string | null): void {
    if (core.refreshTimer) clearTimeout(core.refreshTimer);
    if (!expiresAt || typeof window === 'undefined') return;
    const delay = new Date(expiresAt).getTime() - Date.now() - REFRESH_AHEAD_MS;
    core.refreshTimer = setTimeout(
        () => void siteSession.refresh(),
        Math.max(delay, 5_000),
    );
}

export const siteSession = {
    getSnapshot(): SiteSessionSnapshot {
        return core.snapshot;
    },
    subscribe(listener: Listener): () => void {
        core.listeners.add(listener);
        return () => core.listeners.delete(listener);
    },
    getToken(): string | null {
        return core.token;
    },

    /** Восстановить сессию по refresh-cookie (идемпотентно). @returns вошли ли */
    refresh(): Promise<boolean> {
        if (core.inFlight) return core.inFlight;
        if (core.snapshot.status !== 'ready') {
            emit({ ...core.snapshot, status: 'loading' });
        }
        core.inFlight = pbxRequest<CabinetSiteSession>({
            method: 'POST',
            path: `${AUTH_PATH}/refresh`,
            anonymous: true,
            credentials: 'include',
        })
            .then((session) => {
                apply(session);
                return true;
            })
            .catch(() => {
                clear();
                return false;
            })
            .finally(() => {
                core.inFlight = null;
            });
        return core.inFlight;
    },

    /** Вход по паролю. Ошибку (неверный пароль, пауза) бросает наверх. */
    async login(email: string, password: string): Promise<void> {
        emit({ ...core.snapshot, status: 'loading' });
        try {
            apply(
                await pbxRequest<CabinetSiteSession>({
                    method: 'POST',
                    path: `${AUTH_PATH}/login`,
                    body: { email, password },
                    anonymous: true,
                    credentials: 'include',
                }),
            );
        } catch (error) {
            clear();
            throw error;
        }
    },

    async logout(): Promise<void> {
        try {
            await pbxRequest<{ ok: boolean }>({
                method: 'POST',
                path: `${AUTH_PATH}/logout`,
                anonymous: true,
                credentials: 'include',
            });
        } catch (error) {
            if (!(error instanceof PbxApiError)) throw error;
        } finally {
            clear();
        }
    },
};

/** Bearer кабинета на сайте; 401 — сессия кончилась, на страницу входа. */
export const siteAuthSource: PbxAuthSource = {
    getToken: async () => {
        if (core.token) return core.token;
        // Страница открыта заново — сначала восстановить по cookie.
        const { status } = core.snapshot;
        if (status === 'idle' || status === 'loading') {
            await siteSession.refresh();
        }
        return core.token;
    },
    onUnauthorized: () => clear(),
    expiredMessage: 'Сессия истекла — войдите заново',
};
