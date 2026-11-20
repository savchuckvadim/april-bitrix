import { customAxios } from '@workspace/nest-kpi-report-sales-api';
import type {
    AiDealMovementDealsPage,
    AiDealMovementDealsQuery,
    AiDealMovementOverview,
    AiDealMovementOverviewQuery,
    AiEnvelope,
} from '../../model';
import { AI_DEAL_MOVEMENT_ROUTES } from '../ai-deal-movement.data';
import { aiReadyData } from '../ai-envelope.util';
import type { AiRequester } from './ai-analytics-helper';

/*
 * Витрина «Движение сделок»: две синхронные ручки под сессией портала.
 * Ходят через `customAxios` с ручными типами до перегенерации клиента.
 * Данные — ночные снимки и разборы из БД: пересчёт отчёта не запускают.
 * Права режет сервер: руководителю — его отдел, остальным 403.
 */

const post = <T>(url: string, data: object): Promise<AiEnvelope<T>> =>
    customAxios<AiEnvelope<T>>({
        url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data,
    });

/** Статусы, динамика по ночам, матрица и честность оценок за период. */
export async function fetchAiDealMovementOverview(
    requester: AiRequester,
    query: AiDealMovementOverviewQuery,
): Promise<AiDealMovementOverview> {
    const envelope = await post<AiDealMovementOverview>(
        AI_DEAL_MOVEMENT_ROUTES.overview,
        { ...requester, ...query },
    );
    return aiReadyData(envelope);
}

/** Страница проблемных сделок последней ночи (отбор и порядок — на сервере). */
export async function fetchAiDealMovementDeals(
    requester: AiRequester,
    query: AiDealMovementDealsQuery,
): Promise<AiDealMovementDealsPage> {
    const envelope = await post<AiDealMovementDealsPage>(
        AI_DEAL_MOVEMENT_ROUTES.deals,
        { ...requester, ...query },
    );
    return aiReadyData(envelope);
}
