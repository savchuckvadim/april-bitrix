import { customAxios } from '@workspace/nest-event-sales-api';

/** ИНН из шапки — `POST /api/inn/set` бэка event-sales. */
export interface InnSetRequest {
    domain: string;
    inn: string;
    dealId?: number;
    companyId?: number;
    leadId?: number;
    /** Кто указал ИНН — для записи в ленте сделки. */
    userId?: number;
}

/** Куда лёг ИНН: сделка (и за ней компания и заявки), компания или заявка. */
export interface InnSetResult {
    inn: string;
    entity: 'deal' | 'company' | 'lead';
    warnings: string[];
}

/**
 * Запись ИНН из шапки через бэк — единственного писателя ИНН (26.10.2026).
 * Без `withRetry`: запись оставляет след в ленте сделки.
 */
export const setInnOnServer = (request: InnSetRequest): Promise<InnSetResult> =>
    customAxios<InnSetResult>({
        url: '/api/inn/set',
        method: 'POST',
        data: request,
    });
