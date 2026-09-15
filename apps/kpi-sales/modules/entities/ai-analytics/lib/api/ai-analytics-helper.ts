import {
    getSalesAiAnalytics,
    type AiCacheResetResponseDto,
    type AiFeedbackResultDto,
} from '@workspace/nest-kpi-report-sales-api';
import type {
    AiAgenda,
    AiAnalyticsSettings,
    AiAttention,
    AiByType,
    AiByTypeCallType,
    AiByTypeLayout,
    AiCacheResetScope,
    AiEnvelope,
    AiFeedbackInput,
    AiFeedbackList,
    AiManagerLevelInput,
    AiOverview,
    AiOverviewFilters,
    AiPulse,
    AiQueueOptions,
    AiSettingsSaveResult,
} from '../../model';

/** Кто спрашивает: домен портала и Bitrix-id эффективного пользователя. */
export interface AiRequester {
    domain: string;
    requesterUserId: string;
}

/**
 * AI-аналитика ОП — ЕДИНСТВЕННОЕ место импорта generated-клиента
 * sales-ai-analytics. Все ручки POST с телом { domain, requesterUserId, … },
 * ответ — конверт { status, requestKey, data?, message? }; права считает
 * сервер (менеджер без роли руководителя видит только себя).
 *
 * Тяжёлые ручки (overview / attention / by-type) принимают socketId и
 * forceRefresh: при queued/processing результат кладётся в кэш сервера, а
 * фронт получает WS-событие ai-analytics:overview:done и повторяет POST.
 */
export class AiAnalyticsHelper {
    private api: ReturnType<typeof getSalesAiAnalytics>;

    constructor() {
        this.api = getSalesAiAnalytics();
    }

    async getSettings(
        requester: AiRequester,
    ): Promise<AiEnvelope<AiAnalyticsSettings>> {
        return await this.api.aiAnalyticsGetSettings(requester);
    }

    async getPulse(requester: AiRequester): Promise<AiEnvelope<AiPulse>> {
        return await this.api.aiAnalyticsGetPulse(requester);
    }

    async getAgenda(requester: AiRequester): Promise<AiEnvelope<AiAgenda>> {
        return await this.api.aiAnalyticsGetAgenda(requester);
    }

    /** Обзор менеджер × тип за период (очередь + WS). */
    async getOverview(
        requester: AiRequester,
        filters: AiOverviewFilters,
        options: AiQueueOptions = {},
    ): Promise<AiEnvelope<AiOverview>> {
        return await this.api.aiAnalyticsOverviewGetOverview({
            ...requester,
            ...filters,
            ...options,
        });
    }

    /** Карточки «Внимание» над кэшем обзора (те же фильтры). */
    async getAttention(
        requester: AiRequester,
        filters: AiOverviewFilters,
        options: AiQueueOptions = {},
    ): Promise<AiEnvelope<AiAttention>> {
        return await this.api.aiAnalyticsOverviewGetAttention({
            ...requester,
            ...filters,
            ...options,
        });
    }

    /** Срез обзора по типу звонка либо objections; раскладка wide | long. */
    async getByType(
        requester: AiRequester,
        filters: AiOverviewFilters,
        callType: AiByTypeCallType,
        layout: AiByTypeLayout,
        options: AiQueueOptions = {},
    ): Promise<AiEnvelope<AiByType>> {
        return await this.api.aiAnalyticsOverviewGetByType({
            ...requester,
            ...filters,
            ...options,
            callType,
            layout,
        });
    }

    /** Уровни менеджеров (только руководители cup|op; сбрасывает кэш обзора). */
    async saveSettings(
        requester: AiRequester,
        levels: AiManagerLevelInput[],
    ): Promise<AiEnvelope<AiSettingsSaveResult>> {
        return await this.api.aiAnalyticsOverviewSaveSettings({
            ...requester,
            levels,
        });
    }

    async addFeedback(
        requester: AiRequester,
        feedback: AiFeedbackInput,
    ): Promise<AiEnvelope<AiFeedbackResultDto>> {
        return await this.api.aiAnalyticsAddFeedback({
            ...requester,
            ...feedback,
        });
    }

    async listFeedback(
        requester: AiRequester,
        from: string,
        to: string,
        managerId?: string,
    ): Promise<AiEnvelope<AiFeedbackList>> {
        return await this.api.aiAnalyticsListFeedback({
            ...requester,
            from,
            to,
            managerId,
        });
    }

    async resetCache(
        requester: AiRequester,
        scope?: AiCacheResetScope,
    ): Promise<AiCacheResetResponseDto> {
        return await this.api.aiAnalyticsResetCache({ ...requester, scope });
    }
}
