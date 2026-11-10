import {
    PORTAL_SESSION_OPEN_PATH,
    customAxios,
} from '@workspace/nest-konstructor-api';

/**
 * Формы ручки `POST /api/auth/portal-session`. Описаны руками, пока не прогнан
 * `pnpm run generate` в `@workspace/nest-konstructor-api`; после генерации —
 * алиасы на `PortalSessionOpenDto` и `PortalSessionDto`.
 */
export interface PortalSessionOpenInput {
    domain: string;
    accessToken: string;
    memberId?: string;
}

export interface PortalSession {
    token: string;
    expiresAt: string | null;
    domain: string;
}

/** Обмен auth-данных фрейма Bitrix24 на токен сессии портала бэка конструктора. */
export class PortalSessionHelper {
    open(input: PortalSessionOpenInput): Promise<PortalSession> {
        return customAxios<PortalSession>({
            url: PORTAL_SESSION_OPEN_PATH,
            method: 'POST',
            data: input,
        });
    }
}
