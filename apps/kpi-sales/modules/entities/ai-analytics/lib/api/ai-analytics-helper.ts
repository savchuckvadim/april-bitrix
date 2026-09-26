import {
    getSalesAiAnalytics,
    type AiCacheResetResponseDto,
    type AiFeedbackResultDto,
} from '@workspace/nest-kpi-report-sales-api';
import type {
    AiAbout,
    AiAboutEndpoint,
    AiAgenda,
    AiAnalyticsSettings,
    AiAttention,
    AiBrief,
    AiByType,
    AiByTypeCallType,
    AiByTypeLayout,
    AiCacheResetScope,
    AiDailyPlan,
    AiDailyPlanQuery,
    AiDossier,
    AiDossierQuery,
    AiEnvelope,
    AiFeedbackInput,
    AiFeedbackList,
    AiOverview,
    AiOverviewFilters,
    AiPlanFact,
    AiPlanFactQuery,
    AiPulse,
    AiQueueOptions,
    AiRopMarkInput,
    AiRopMarkSaveResult,
    AiRopMarkWeek,
    AiRopMarkWeekQuery,
    AiSettingsInput,
    AiSettingsSaveResult,
    AiStyleCard,
    AiStyleQuery,
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

    /**
     * Настройки витрины: уровни, цели, отсутствия, подтверждение состава и
     * остальные блоки (только руководители cup|op; сбрасывает кэш обзора).
     * Блок не передан — на сервере остаётся прежним.
     */
    async saveSettings(
        requester: AiRequester,
        input: AiSettingsInput,
    ): Promise<AiEnvelope<AiSettingsSaveResult>> {
        return await this.api.aiAnalyticsOverviewSaveSettings({
            ...requester,
            ...input,
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

    /* ---------- Фаза 2 ---------- */

    /**
     * План дня менеджера от цели месяца (sync по снапшотам). При выключенной
     * ai_analytics_daily_plan_enabled сервер отвечает 403 с текстом.
     */
    async getDailyPlan(
        requester: AiRequester,
        query: AiDailyPlanQuery,
    ): Promise<AiEnvelope<AiDailyPlan>> {
        return await this.api.aiAnalyticsPlanGetDailyPlan({
            ...requester,
            ...query,
        });
    }

    /** AI-резюме периода (очередь + WS ai-analytics:brief:done|error). */
    async getBrief(
        requester: AiRequester,
        filters: AiOverviewFilters,
        options: AiQueueOptions = {},
    ): Promise<AiEnvelope<AiBrief>> {
        return await this.api.aiAnalyticsBriefGetBrief({
            ...requester,
            from: filters.from,
            to: filters.to,
            managerIds: filters.managerIds,
            ...options,
        });
    }

    /** Подбор трёх звонков недели (только руководители; forceRefresh — заново). */
    async pickRopMark(
        requester: AiRequester,
        query: AiRopMarkWeekQuery = {},
        forceRefresh = false,
    ): Promise<AiEnvelope<AiRopMarkWeek>> {
        return await this.api.aiAnalyticsRopMarkPick({
            ...requester,
            ...query,
            forceRefresh: forceRefresh || undefined,
        });
    }

    /** Подбор недели с метками; подбора нет — calls пуст и generatedAt = ''. */
    async listRopMark(
        requester: AiRequester,
        query: AiRopMarkWeekQuery = {},
    ): Promise<AiEnvelope<AiRopMarkWeek>> {
        return await this.api.aiAnalyticsRopMarkList({
            ...requester,
            ...query,
        });
    }

    /** Слепая метка по звонку подбора (400 — вне подбора, 403 — вне периметра). */
    async saveRopMark(
        requester: AiRequester,
        input: AiRopMarkInput,
    ): Promise<AiEnvelope<AiRopMarkSaveResult>> {
        return await this.api.aiAnalyticsRopMarkSave({
            ...requester,
            ...input,
        });
    }

    /**
     * Карточка стиля менеджера. Единственная ручка модуля без конверта —
     * сервер отдаёт AiStyleCardDto как есть (status: ready | few_data |
     * opt_out — это состояние КАРТОЧКИ, не конверта); заворачиваем в
     * конверт сами, чтобы секция грузилась общим загрузчиком. Ключ —
     * менеджер и месяц профиля.
     */
    async getStyleProfile(
        requester: AiRequester,
        query: AiStyleQuery,
    ): Promise<AiEnvelope<AiStyleCard>> {
        const card = await this.api.aiAnalyticsStyleGetStyleProfile({
            ...requester,
            managerId: query.managerId,
            monthKey: query.month,
        });
        return {
            status: 'ready',
            requestKey: `style:${card.managerId}:${card.monthKey ?? ''}`,
            data: card,
        };
    }

    /* ---------- Фаза 3 ---------- */

    /**
     * Реконсиляция «план — факт» месяца (sync по снапшотам): цели
     * руководителя против факта на дату; периметр отсекает сервер.
     */
    async getPlanFact(
        requester: AiRequester,
        query: AiPlanFactQuery,
    ): Promise<AiEnvelope<AiPlanFact>> {
        return await this.api.aiAnalyticsPlanFactGetPlanFact({
            ...requester,
            ...query,
        });
    }

    /** Досье менеджера за окно месяцев (очередь + WS ai-analytics:dossier:done|error). */
    async getDossier(
        requester: AiRequester,
        query: AiDossierQuery,
        options: AiQueueOptions = {},
    ): Promise<AiEnvelope<AiDossier>> {
        return await this.api.aiAnalyticsDossierGetDossier({
            ...requester,
            ...query,
            ...options,
        });
    }

    /** Блок «Как считаем» для ручки витрины (sync, status всегда ready). */
    async getAbout(
        requester: AiRequester,
        endpoint: AiAboutEndpoint,
    ): Promise<AiEnvelope<AiAbout>> {
        return await this.api.aiAnalyticsAboutGetAbout({
            ...requester,
            endpoint,
        });
    }
}
