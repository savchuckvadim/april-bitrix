import { getSalesAiAnalyticsAdmin } from '@workspace/nest-admin-api';
import type {
    AiAnalyticsAuditAboutResponse,
    AiAnalyticsAuditResult,
    AiAnalyticsAuditRun,
} from '../../model';
import { toAuditResult } from '../audit-report.guard';

/**
 * Единственное место импорта `@workspace/nest-admin-api` для аудита данных
 * AI-аналитики (`Sales AI Analytics Admin`, `/api/admin/ai-analytics/audit*`).
 *
 * Ответы run/latest сужаются guard-ом: в Swagger `report` объявлен как
 * `Object`, и generated-тип его формы не знает.
 *
 * Расчёт синхронный и на больших порталах идёт секунды; сгенерированный
 * клиент ходит с общим таймаутом транспорта (30 с). Если окажется мало —
 * поднимать per-request, как это сделано для создания поля анкеты.
 */
export class AiAnalyticsAuditHelper {
    private api: ReturnType<typeof getSalesAiAnalyticsAdmin>;

    constructor() {
        this.api = getSalesAiAnalyticsAdmin();
    }

    /**
     * Запустить аудит по живой БД. 403 — на портале выключен признак
     * ai_analytics_audit_enabled; текст ошибки бэка показывается как есть.
     */
    async run(dto: AiAnalyticsAuditRun): Promise<AiAnalyticsAuditResult> {
        return toAuditResult(await this.api.salesAiAnalyticsAdminRun(dto));
    }

    /** Последний снапшот домена (ручка или крон). 404 — снапшотов ещё нет. */
    async latest(domain: string): Promise<AiAnalyticsAuditResult> {
        return toAuditResult(
            await this.api.salesAiAnalyticsAdminLatest({ domain }),
        );
    }

    /**
     * Самоописание аудита; с доменом — ещё и состояние портала (рубильник
     * AI-аналитики, признак аудита, дата последнего снапшота).
     */
    about(domain?: string): Promise<AiAnalyticsAuditAboutResponse> {
        return this.api.salesAiAnalyticsAdminAbout(
            domain ? { domain } : undefined,
        );
    }
}
