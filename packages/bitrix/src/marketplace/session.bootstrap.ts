import { pbxRequest } from './pbx-api.client';
import { portalSessionStore, SessionSnapshot } from './session.store';
import type { PortalSession, PortalSessionState } from './session.types';

/**
 * Bootstrap portal-context сессии на страницах, куда редиректит бэк-роутер
 * (`?state=...&code=...`):
 *
 *  1) берёт одноразовый `code` из query → POST /session/exchange → сессия
 *     в память (стор), `code` вычищается из URL (он одноразовый — повторный
 *     обмен после перезагрузки всё равно даст 404);
 *  2) кода нет → статус absent + fallback-state из query (unauthorized и т.п.);
 *  3) параллельные вызовы дедуплицируются (один exchange на загрузку).
 */

const VALID_STATES: readonly PortalSessionState[] = [
    'onboarding',
    'pending',
    'active',
    'blocked',
    'unauthorized',
];

function readQueryState(params: URLSearchParams): PortalSessionState | null {
    const raw = params.get('state');
    return VALID_STATES.includes(raw as PortalSessionState)
        ? (raw as PortalSessionState)
        : null;
}

function stripCodeFromUrl(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    window.history.replaceState(null, '', url.toString());
}

let bootstrapPromise: Promise<SessionSnapshot> | null = null;

/** Идемпотентная инициализация сессии (безопасно звать из нескольких мест) */
export function initPortalSession(): Promise<SessionSnapshot> {
    if (bootstrapPromise) return bootstrapPromise;
    bootstrapPromise = run();
    return bootstrapPromise;
}

async function run(): Promise<SessionSnapshot> {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const fallbackState = readQueryState(params);

    if (!code) {
        portalSessionStore.setAbsent(fallbackState);
        return portalSessionStore.getSnapshot();
    }

    portalSessionStore.setLoading();
    stripCodeFromUrl();
    try {
        const session = await pbxRequest<PortalSession>({
            method: 'POST',
            path: '/api/bitrix-marketplace/session/exchange',
            body: { code },
            anonymous: true,
        });
        portalSessionStore.setSession(session);
    } catch {
        // код истёк (60с) или уже использован — сессии нет
        portalSessionStore.setAbsent(fallbackState);
    }
    return portalSessionStore.getSnapshot();
}

/** Для тестов/повторной инициализации при hot-reload */
export function resetPortalSessionBootstrap(): void {
    bootstrapPromise = null;
}
