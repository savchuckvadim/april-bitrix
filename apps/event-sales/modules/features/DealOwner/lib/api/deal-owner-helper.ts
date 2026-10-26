import { customAxios } from '@workspace/nest-event-sales-api';

/** Ответ бэка: что переназначено или почему ничего не менялось. */
export interface DealOwnerAlignResult {
    responsibleId: number | null;
    /** `recent` — бэк недавно уже выравнивал эту сделку для сотрудника. */
    skipped: 'not_own' | 'closed' | 'aligned' | 'recent' | null;
    companyMoved: boolean;
    contactsMoved: number;
    warnings: string[];
}

/**
 * Компания и контакты — на ответственного своей сделки (бэк event-sales).
 * Без `withRetry`: вызов пишет.
 */
export const alignDealOwner = (
    dealId: number,
    domain: string,
    userId: number,
): Promise<DealOwnerAlignResult> =>
    customAxios<DealOwnerAlignResult>({
        url: `/api/deal-owner/deal/${dealId}/align`,
        method: 'POST',
        data: { domain, userId },
    });
