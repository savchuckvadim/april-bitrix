import { getSalesAiAnalyticsAdmin } from '@workspace/nest-admin-api';
import type {
    ModelFeedbackQuery,
    ModelFeedbackResult,
    ModelForecastBacktestResult,
    ModelPoolStatusResult,
    ModelQualityLinkResult,
    ModelRecommendationEffectResult,
} from '../../model';

/**
 * Единственное место импорта `@workspace/nest-admin-api` для раздела
 * «Модель и обратная связь» (`Sales AI Analytics Admin`): сводка
 * обратной связи и снапшоты Фазы 4 — пул порталов, проверка точности
 * прогноза, эффект советов, связь качества с результатом.
 *
 * Все ручки только читают готовые снапшоты: `latest = null` — снапшот
 * ещё не считался (штатно), исключение — сбой самой ручки (403, сеть).
 */
export class AiAnalyticsModelHelper {
    private api: ReturnType<typeof getSalesAiAnalyticsAdmin>;

    constructor() {
        this.api = getSalesAiAnalyticsAdmin();
    }

    /** Сводка обратной связи за период (виды, менеджеры, доля «полезно»). */
    feedback(query: ModelFeedbackQuery): Promise<ModelFeedbackResult> {
        return this.api.aiAnalyticsFeedbackCostAdminFeedbackSummary(query);
    }

    /** Последний снапшот пула порталов с обезличенными вердиктами. */
    poolStatus(domain: string): Promise<ModelPoolStatusResult> {
        return this.api.aiAnalyticsPhase4AdminPoolStatus({ domain });
    }

    /** Проверки точности прогноза за последние `months` закрытых месяцев. */
    forecastBacktest(
        domain: string,
        months: number,
    ): Promise<ModelForecastBacktestResult> {
        return this.api.aiAnalyticsPhase4AdminForecastBacktest({
            domain,
            months,
        });
    }

    /** Последний расчёт эффекта советов (гейт ступени «советы»). */
    recommendationEffect(
        domain: string,
    ): Promise<ModelRecommendationEffectResult> {
        return this.api.aiAnalyticsPhase4AdminRecommendationEffect({ domain });
    }

    /** Последний отчёт о связи качества разговора с ближним исходом. */
    qualityLink(domain: string): Promise<ModelQualityLinkResult> {
        return this.api.aiAnalyticsPhase4AdminQualityLink({ domain });
    }
}
