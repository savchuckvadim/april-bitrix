import { customAxios } from '@workspace/nest-event-sales-api';
import type { EvFlowDto } from '@/modules/processes/event/model';
import type { TakeoverPreview } from '../../model/types';

/**
 * Что заберёт и закроет отправка этого отчёта (бэк event-sales). Только
 * чтение на стороне бэка — повтор безопасен.
 */
export const fetchTakeoverPreview = (
    payload: EvFlowDto,
): Promise<TakeoverPreview> =>
    customAxios<TakeoverPreview>({
        url: '/api/event-sales/flow/takeover-preview',
        method: 'POST',
        data: payload,
    });
