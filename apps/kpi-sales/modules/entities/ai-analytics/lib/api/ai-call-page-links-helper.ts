import { customAxios } from '@workspace/nest-kpi-report-sales-api';
import type { AiRequester } from './ai-analytics-helper';

/** Ссылка на страницу разбора одного звонка — как отдаёт бэкенд. */
export interface AiCallPageLink {
    transcriptionId: string;
    url: string;
}

/**
 * Ссылки на страницы разбора для звонков списка. Ручка новая — ходит через
 * `customAxios` с ручным типом до перегенерации клиента. Бэкенд отдаёт
 * ссылки только на звонки, которые пользователю и так видны на витрине.
 */
export async function fetchAiCallPageLinks(
    requester: AiRequester,
    transcriptionIds: string[],
): Promise<AiCallPageLink[]> {
    const response = await customAxios<{ links: AiCallPageLink[] }>({
        url: '/api/ai-analytics/call-page/links',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { ...requester, transcriptionIds },
    });
    return response.links ?? [];
}
