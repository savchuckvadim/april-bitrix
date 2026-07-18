import type { AuthUserDto } from '@workspace/nest-admin-api';

/**
 * In-memory стор аутентификации админки (паттерн external store +
 * useSyncExternalStore — как session.store кабинета).
 *
 * SSR-safe: модуль без обращений к window/document на верхнем уровне;
 * на сервере остаётся в 'idle'. Источник ИСТИНЫ о токене — cookie
 * фронт-домена (auth-token-storage), стор хранит только производное
 * состояние (кто вошёл) для UI.
 */

export type AuthStatus =
    | 'idle' //          bootstrap не запускался (SSR/первый рендер)
    | 'loading' //       идёт проверка токена (GET /auth/me)
    | 'authenticated' // вошли, user заполнен
    | 'anonymous'; //    токена нет/просрочен

export interface AuthSnapshot {
    status: AuthStatus;
    user: AuthUserDto | null;
}

type Listener = () => void;

let snapshot: AuthSnapshot = { status: 'idle', user: null };
const listeners = new Set<Listener>();

function emit(next: AuthSnapshot): void {
    snapshot = next;
    listeners.forEach((listener) => listener());
}

export const authStore = {
    getSnapshot(): AuthSnapshot {
        return snapshot;
    },
    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    setLoading(): void {
        emit({ status: 'loading', user: snapshot.user });
    },
    setAuthenticated(user: AuthUserDto): void {
        emit({ status: 'authenticated', user });
    },
    setAnonymous(): void {
        emit({ status: 'anonymous', user: null });
    },
};
