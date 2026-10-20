import { getSalesAiAnalyticsAdmin } from '@workspace/nest-admin-api';
import type {
    AiAnalyticsBackfillDto,
    AiAnalyticsGoldenSetRunDto,
    AiAnalyticsReanalyzeRunDto,
    AiAnalyticsRecomputeDto,
    AiAnalyticsRetentionRunDto,
} from '@workspace/nest-admin-api';
import type { GuideActionPayload } from '../guide-actions';
import type { GuideSection, GuideSectionItem } from '../../model';

type Data = Record<string, unknown>;

/**
 * Единственное место импорта `@workspace/nest-admin-api` для путеводителя:
 * оглавление, раздел и выполнение действий форм «Запуск» через те же
 * ручки `Sales AI Analytics Admin`, что и разделы «Аудит» / «Модель».
 * Внешние действия (kpi-report-sales, event-sales) здесь не выполняются —
 * для них UI показывает Swagger и тело; попытка вызвать — ошибка.
 */
export class AiAnalyticsGuideHelper {
    private api: ReturnType<typeof getSalesAiAnalyticsAdmin>;

    constructor() {
        this.api = getSalesAiAnalyticsAdmin();
    }

    listSections(): Promise<GuideSectionItem[]> {
        return this.api.aiAnalyticsGuideAdminList();
    }

    getSection(code: string): Promise<GuideSection> {
        return this.api.aiAnalyticsGuideAdminEntry(code);
    }

    /** Выполнить действие формы; ответ — как отдал бэк (для JSON-карточки). */
    runAction(payload: GuideActionPayload): Promise<unknown> {
        if (payload.kind === 'external') {
            return Promise.reject(
                new Error(
                    'Эта ручка живёт в другом приложении — выполните её в его Swagger',
                ),
            );
        }
        const data = payload.data;
        const domain = String(data.domain);
        switch (payload.action) {
            case 'backfill':
                return this.api.aiAnalyticsPipelineAdminBackfill(
                    data as unknown as AiAnalyticsBackfillDto,
                );
            case 'recompute':
                return this.api.aiAnalyticsPipelineAdminRecompute(
                    data as unknown as AiAnalyticsRecomputeDto,
                );
            case 'etl-status':
                return this.api.aiAnalyticsPipelineAdminStatus({
                    domain,
                    ...optionalNumber(data, 'days'),
                });
            case 'forecast-backtest':
                return this.api.aiAnalyticsPhase4AdminForecastBacktest({
                    domain,
                    ...optionalNumber(data, 'months'),
                });
            case 'stage-history-probe':
                return this.api.aiAnalyticsAuditAdminProbeStageHistory({
                    domain,
                    ...optionalNumber(data, 'months'),
                });
            case 'reanalyze':
                return this.api.aiAnalyticsReanalyzeAdminRun(
                    data as unknown as AiAnalyticsReanalyzeRunDto,
                );
            case 'reanalyze-status':
                return this.api.aiAnalyticsReanalyzeAdminStatus({
                    domain,
                    from: String(data.from),
                    to: String(data.to),
                });
            case 'cost':
                return this.api.aiAnalyticsFeedbackCostAdminCostSummary({
                    domain,
                    month: String(data.month),
                });
            case 'feedback':
                return this.api.aiAnalyticsFeedbackCostAdminFeedbackSummary({
                    domain,
                    from: String(data.from),
                    to: String(data.to),
                });
            case 'golden-set':
                return this.api.aiAnalyticsGoldenSetAdminList({ domain });
            case 'golden-set-run':
                return this.api.aiAnalyticsGoldenSetAdminRun(
                    data as unknown as AiAnalyticsGoldenSetRunDto,
                );
            case 'retention':
                return this.api.aiAnalyticsRetentionAdminRun(
                    data as unknown as AiAnalyticsRetentionRunDto,
                );
            default:
                return Promise.reject(
                    new Error(`Действие «${payload.action}» из админки не выполняется`),
                );
        }
    }
}

/** Числовой query-параметр только если задан. */
const optionalNumber = (data: Data, name: string): Record<string, number> =>
    typeof data[name] === 'number' ? { [name]: data[name] } : {};
