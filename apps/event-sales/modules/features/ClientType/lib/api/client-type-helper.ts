import { customAxios } from '@workspace/nest-event-sales-api';
import type { ClientTypeCode } from '../client-type-view';

/** Ответ бэка: тип клиента у сделки и компании после чтения или записи. */
export interface ClientTypeState {
    current: ClientTypeCode | null;
    deal: ClientTypeCode | null;
    company: ClientTypeCode | null;
    conflict: boolean;
    warnings: string[];
}

/** Ответ выравнивания: `skipped` — бэк недавно уже выравнивал, шапку не трогаем. */
export interface ClientTypeAlignResult extends ClientTypeState {
    skipped: boolean;
}

export interface ClientTypeSetRequest {
    domain: string;
    code: ClientTypeCode;
    dealId?: number;
    companyId?: number;
}

const URL = '/api/client-type';

/**
 * Транспорт «Типа клиента». Клиент orval для этих ручек ещё не сгенерирован
 * (генерация требует поднятого бэка) — тот же мутатор `customAxios`, что и
 * у ИНН. Без `withRetry`: оба вызова пишут.
 */
export const alignClientType = (
    dealId: number,
    domain: string,
): Promise<ClientTypeAlignResult> =>
    customAxios<ClientTypeAlignResult>({
        url: `${URL}/deal/${dealId}/align`,
        method: 'POST',
        data: { domain },
    });

export const setClientType = (
    request: ClientTypeSetRequest,
): Promise<ClientTypeState> =>
    customAxios<ClientTypeState>({
        url: `${URL}/set`,
        method: 'POST',
        data: request,
    });
