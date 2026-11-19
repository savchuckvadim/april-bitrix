import { customAxios } from '@workspace/nest-kpi-report-sales-api';
import type { CallsListRequest, CallsListResponse } from '../../model/types';
import { CALLS_LIST_API_URL } from '../calls-list.const';

/**
 * Страница списка разборов. Ручка новая — через `customAxios` (сессия
 * портала, Bearer) с ручным типом до перегенерации клиента. Ответ без
 * конверта AI-аналитики: `customAxios` снимает только общий конверт Nest.
 * Не руководителю бэк отвечает 403 «Раздел доступен руководителям».
 */
export async function fetchCallsList(
    request: CallsListRequest,
): Promise<CallsListResponse> {
    return customAxios<CallsListResponse>({
        url: CALLS_LIST_API_URL,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: request,
    });
}
