import {
    getPortalSession,
    type PortalSessionDto,
    type PortalSessionOpenDto,
} from '@workspace/nest-kpi-report-sales-api';

/** Что фронт присылает из auth-данных фрейма для открытия сессии. */
export type PortalSessionOpenInput = PortalSessionOpenDto;
/** Открытая сессия: токен, срок, домен и пользователь портала. */
export type PortalSession = PortalSessionDto;

/**
 * Обмен auth-данных фрейма Bitrix24 на portal-context JWT бэка
 * kpi-report-sales (`POST /api/auth/portal-session`) — единственное место
 * импорта generated-клиента сессии (правило CLAUDE.md про `lib/api/*-helper`).
 */
export class PortalSessionHelper {
    private readonly api = getPortalSession();

    open(input: PortalSessionOpenInput): Promise<PortalSession> {
        return this.api.portalSessionOpen(input);
    }
}
