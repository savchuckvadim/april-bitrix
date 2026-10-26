import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { entityIdOf } from '@/modules/shared/lib/entity-id';
import { alignDealOwner } from '../lib/api/deal-owner-helper';

/**
 * Компания и контакты — за ответственным сделки, по которой работают
 * (владелец 22.10.2026). При открытии СВОЕЙ открытой сделки бэк переводит
 * на сотрудника компанию и контакты, у которых другой ответственный:
 * перенесённые сделки никто не трогал, и бизнес-процесс портала их не
 * выровнял. Чужую сделку смотрят, но клиента этим не забирают — в сеть не
 * ходим; повторы одного открытия режет бэк (Redis, 15 минут). Ответ шапке
 * не нужен.
 */
export const alignDealOwnerOnOpen =
    () => async (_dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const domain = state.app.domain;
        const deal = state.app.bitrix.deal as unknown as Record<
            string,
            unknown
        > | null;
        const dealId = entityIdOf(deal);
        const userId = entityIdOf(state.app.bitrix.user);
        if (!domain || !dealId || !userId) return;
        if (String(deal?.CLOSED ?? '').toUpperCase() === 'Y') return;
        if (Number(deal?.ASSIGNED_BY_ID) !== userId) return;

        try {
            await alignDealOwner(dealId, domain, userId);
        } catch (error) {
            console.error('alignDealOwnerOnOpen error', error);
        }
    };
