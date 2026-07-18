import type { PortalSession, PortalSessionState } from './session.types';

/**
 * In-memory хранилище portal-context сессии.
 *
 * Токен НИКОГДА не попадает в localStorage/sessionStorage/cookies —
 * только память вкладки (решение docs/AUTH.md бэка: Bearer-only, безопасно
 * для iframe). Потеря памяти (перезагрузка iframe) = переоткрытие из
 * Битрикса, бэк выдаст новый одноразовый код.
 *
 * Подписка — для React через useSyncExternalStore.
 */

export type SessionStatus =
    | 'idle' //     bootstrap ещё не запускался
    | 'loading' //  идёт обмен кода
    | 'ready' //    сессия получена
    | 'absent' //   кода не было и сессии нет (state из query, напр. unauthorized)
    | 'expired'; // бэк ответил 401 — токен протух

export interface SessionSnapshot {
    status: SessionStatus;
    session: PortalSession | null;
    /** Состояние допуска без сессии (из query redirect-а, напр. unauthorized) */
    fallbackState: PortalSessionState | null;
}

type Listener = () => void;

let snapshot: SessionSnapshot = {
    status: 'idle',
    session: null,
    fallbackState: null,
};
const listeners = new Set<Listener>();

/**
 * Идемпотентный запускатель bootstrap-а (регистрирует session.bootstrap
 * при загрузке модуля). Нужен waitForToken: если сессию ещё никто не
 * инициализировал (idle) — стор запускает bootstrap сам, вместо того
 * чтобы бессмысленно ждать таймаут.
 */
let bootstrapper: (() => Promise<unknown>) | null = null;

export function registerSessionBootstrapper(
    fn: () => Promise<unknown>,
): void {
    bootstrapper = fn;
}

function emit(next: Partial<SessionSnapshot>): void {
    snapshot = { ...snapshot, ...next };
    listeners.forEach((listener) => listener());
}

export const portalSessionStore = {
    getSnapshot(): SessionSnapshot {
        return snapshot;
    },
    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    /** Текущий токен для Bearer (null — сессии нет) */
    getToken(): string | null {
        return snapshot.session?.token ?? null;
    },
    /**
     * Дождаться ИСХОДА bootstrap-а сессии (ready/absent/expired) и вернуть
     * токен (null — сессии нет). Закрывает гонку «авторизованный запрос
     * стартовал раньше, чем обмен кода положил токен» (живой тест
     * 2026-07-18: summary ушёл без Bearer → ложное «Сессия истекла»).
     */
    waitForToken(timeoutMs: number): Promise<string | null> {
        const settled = () =>
            snapshot.status === 'ready' ||
            snapshot.status === 'absent' ||
            snapshot.status === 'expired';
        if (settled()) {
            return Promise.resolve(this.getToken());
        }
        // bootstrap ещё не запускали (страница без initPortalSession) —
        // запускаем сами: он идемпотентен и быстро даст исход
        // (нет кода в query → absent мгновенно).
        if (snapshot.status === 'idle' && bootstrapper) {
            void bootstrapper();
        }
        return new Promise((resolve) => {
            const timer = setTimeout(() => {
                unsubscribe();
                resolve(this.getToken());
            }, timeoutMs);
            const unsubscribe = portalSessionStore.subscribe(() => {
                if (settled()) {
                    clearTimeout(timer);
                    unsubscribe();
                    resolve(this.getToken());
                }
            });
        });
    },
    setLoading(): void {
        emit({ status: 'loading' });
    },
    setSession(session: PortalSession): void {
        emit({ status: 'ready', session, fallbackState: null });
    },
    setAbsent(fallbackState: PortalSessionState | null): void {
        emit({ status: 'absent', session: null, fallbackState });
    },
    /** Вызывается клиентом API при 401 — сессия протухла */
    markExpired(): void {
        emit({ status: 'expired', session: null });
    },
    /** Обновить состояние допуска после действий (например, подачи заявки) */
    patchState(state: PortalSessionState): void {
        if (snapshot.session) {
            emit({ session: { ...snapshot.session, state } });
        } else {
            emit({ fallbackState: state });
        }
    },
};
