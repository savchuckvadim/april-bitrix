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

/**
 * Внутреннее состояние стора вынесено на globalThis-синглтон.
 *
 * Почему: при transpilePackages + смешанных импортах (`@workspace/bitrix`
 * баррель И `@workspace/bitrix/src/...` глубокие) webpack может собрать
 * ДВЕ копии этого модуля. Тогда `exchange` кладёт токен в один инстанс,
 * а `pbxRequest`/summary читает другой — токена нет, летит 401 и ложное
 * «Сессия истекла» (живой тест 2026-07-18). Общий контейнер на globalThis
 * гарантирует ОДНО состояние, даже если модуль задублирован (плюс
 * переживает SSR-хидрацию и StrictMode-двойной маунт).
 */
interface SessionStoreCore {
    snapshot: SessionSnapshot;
    listeners: Set<Listener>;
    bootstrapper: (() => Promise<unknown>) | null;
    instanceId: string;
}

const GLOBAL_KEY = '__pbxPortalSessionStore__';

function getCore(): SessionStoreCore {
    const globalObject = globalThis as typeof globalThis & {
        [GLOBAL_KEY]?: SessionStoreCore;
    };
    if (!globalObject[GLOBAL_KEY]) {
        globalObject[GLOBAL_KEY] = {
            snapshot: {
                status: 'idle',
                session: null,
                fallbackState: null,
            },
            listeners: new Set<Listener>(),
            bootstrapper: null,
            instanceId: Math.random().toString(36).slice(2, 8),
        };
    }
    return globalObject[GLOBAL_KEY];
}

const core = getCore();

/** Диагностическая метка контейнера состояния (общая для всех копий модуля). */
export const SESSION_STORE_INSTANCE_ID = core.instanceId;

/**
 * Идемпотентный запускатель bootstrap-а (регистрирует session.bootstrap
 * при загрузке модуля). Нужен waitForToken: если сессию ещё никто не
 * инициализировал (idle) — стор запускает bootstrap сам, вместо того
 * чтобы бессмысленно ждать таймаут.
 */
export function registerSessionBootstrapper(
    fn: () => Promise<unknown>,
): void {
    core.bootstrapper = fn;
}

function emit(next: Partial<SessionSnapshot>): void {
    core.snapshot = { ...core.snapshot, ...next };
    core.listeners.forEach((listener) => listener());
}

export const portalSessionStore = {
    getSnapshot(): SessionSnapshot {
        return core.snapshot;
    },
    subscribe(listener: Listener): () => void {
        core.listeners.add(listener);
        return () => core.listeners.delete(listener);
    },
    /** Текущий токен для Bearer (null — сессии нет) */
    getToken(): string | null {
        return core.snapshot.session?.token ?? null;
    },
    /**
     * Дождаться ИСХОДА bootstrap-а сессии (ready/absent/expired) и вернуть
     * токен (null — сессии нет). Закрывает гонку «авторизованный запрос
     * стартовал раньше, чем обмен кода положил токен» (живой тест
     * 2026-07-18: summary ушёл без Bearer → ложное «Сессия истекла»).
     */
    waitForToken(timeoutMs: number): Promise<string | null> {
        const settled = () =>
            core.snapshot.status === 'ready' ||
            core.snapshot.status === 'absent' ||
            core.snapshot.status === 'expired';
        if (settled()) {
            return Promise.resolve(this.getToken());
        }
        // bootstrap ещё не запускали (страница без initPortalSession) —
        // запускаем сами: он идемпотентен и быстро даст исход
        // (нет кода в query → absent мгновенно).
        if (core.snapshot.status === 'idle' && core.bootstrapper) {
            void core.bootstrapper();
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
        console.info(
            `[pbx-session:${core.instanceId}] ready state=${session.state}`,
        );
        emit({ status: 'ready', session, fallbackState: null });
    },
    setAbsent(fallbackState: PortalSessionState | null): void {
        console.info(
            `[pbx-session:${core.instanceId}] absent fallback=${fallbackState ?? '-'}`,
        );
        emit({ status: 'absent', session: null, fallbackState });
    },
    /** Вызывается клиентом API при 401 — сессия протухла */
    markExpired(): void {
        console.warn(
            `[pbx-session:${core.instanceId}] markExpired (пришёл 401)`,
        );
        emit({ status: 'expired', session: null });
    },
    /** Обновить состояние допуска после действий (например, подачи заявки) */
    patchState(state: PortalSessionState): void {
        if (core.snapshot.session) {
            emit({ session: { ...core.snapshot.session, state } });
        } else {
            emit({ fallbackState: state });
        }
    },
};
