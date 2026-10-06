import type { BXDeal } from '@workspace/bx';
import type { BoundDealRow } from './bound-deal-view';

/**
 * Сделка, из которой открыли фрейм, — строкой для полоски стадии в шапке.
 *
 * Сделка плейсмента уже лежит в сторе (её читает бут), поэтому главная
 * полоска шапки строится из неё БЕЗ запроса связей клиента: граф связей
 * больше не грузится на каждое открытие (разбор нагрузки 05.10.2026), а
 * «на какой стадии сделка» менеджер должен видеть сразу.
 *
 * Тип BXDeal минимальный (ID, TITLE), но `crm.deal.get` отдаёт сделку
 * целиком — нужные поля читаем по именам и проверяем руками.
 */
const toText = (value: unknown): string | null =>
    typeof value === 'string' && value.trim() ? value : null;

const toClosed = (value: unknown): 'Y' | 'N' | undefined => {
    if (value === 'Y') return 'Y';
    if (value === 'N') return 'N';
    return undefined;
};

export const toContextDealRow = (
    deal: BXDeal | null | undefined,
): BoundDealRow | null => {
    if (!deal) return null;
    const raw = deal as unknown as Record<string, unknown>;
    const id = Number(raw.ID);
    if (!Number.isFinite(id) || id <= 0) return null;

    const categoryId = Number(raw.CATEGORY_ID);
    const closed = toClosed(raw.CLOSED);

    return {
        ID: id,
        TITLE: toText(raw.TITLE),
        STAGE_ID: toText(raw.STAGE_ID),
        CATEGORY_ID: Number.isFinite(categoryId) ? categoryId : null,
        OPPORTUNITY: toText(raw.OPPORTUNITY),
        ...(closed ? { CLOSED: closed } : {}),
        DATE_CREATE: toText(raw.DATE_CREATE),
    };
};
