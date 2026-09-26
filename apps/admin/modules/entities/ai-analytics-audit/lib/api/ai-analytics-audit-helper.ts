import { getSalesAiAnalyticsAdmin } from '@workspace/nest-admin-api';
import type {
    AiAnalyticsAuditAboutResponse,
    AiAnalyticsAuditResult,
    AiAnalyticsAuditRun,
    AiAnalyticsGoldenSetResult,
    AiAnalyticsGoldenSetRun,
    AiAnalyticsGoldenSetRunResult,
    AiAnalyticsStageHistoryProbe,
} from '../../model';
import { toAuditResult } from '../audit-report.guard';

/**
 * Единственное место импорта `@workspace/nest-admin-api` для аудита данных
 * AI-аналитики (`Sales AI Analytics Admin`: `/api/admin/ai-analytics/audit*`,
 * проба истории стадий `/api/admin/ai-analytics/stage-history/probe` и
 * набор test-retest `/api/admin/ai-analytics/golden-set*`).
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
        return toAuditResult(await this.api.aiAnalyticsAuditAdminRun(dto));
    }

    /** Последний снапшот домена (ручка или крон). 404 — снапшотов ещё нет. */
    async latest(domain: string): Promise<AiAnalyticsAuditResult> {
        return toAuditResult(
            await this.api.aiAnalyticsAuditAdminLatest({ domain }),
        );
    }

    /**
     * Самоописание аудита; с доменом — ещё и состояние портала (рубильник
     * AI-аналитики, признак аудита, дата последнего снапшота).
     */
    about(domain?: string): Promise<AiAnalyticsAuditAboutResponse> {
        return this.api.aiAnalyticsAuditAdminAbout(
            domain ? { domain } : undefined,
        );
    }

    /**
     * Проба истории стадий сделок портала: доступен ли crm.stagehistory.list
     * и на сколько месяцев вглубь есть история. Ошибка Bitrix — не исключение,
     * а `available = false` с текстом в `error`; исключение — сбой самой ручки.
     */
    probeStageHistory(
        domain: string,
        months: number,
    ): Promise<AiAnalyticsStageHistoryProbe> {
        return this.api.aiAnalyticsAuditAdminProbeStageHistory({
            domain,
            months,
        });
    }

    /** Состав отчётов согласия (test-retest) портала: по одному на версию промпта. */
    listGoldenSet(domain: string): Promise<AiAnalyticsGoldenSetResult> {
        return this.api.aiAnalyticsGoldenSetAdminList({ domain });
    }

    /**
     * Поставить джобу повторного прогона разборов в очередь CALL_REPORT.
     * `dispatched = false` с `reason` — штатный ответ (очередь не подключена
     * в сборке), не ошибка; исключение — сбой самой ручки (валидация, 403).
     */
    runGoldenSet(
        dto: AiAnalyticsGoldenSetRun,
    ): Promise<AiAnalyticsGoldenSetRunResult> {
        return this.api.aiAnalyticsGoldenSetAdminRun(dto);
    }
}
