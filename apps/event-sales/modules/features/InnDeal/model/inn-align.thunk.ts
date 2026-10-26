import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { innActions } from '@/modules/features/Inn/model/InnSlice';
import {
    getCurrentInn,
    getInnMirrorTarget,
    getInnTarget,
} from '@/modules/features/Inn/lib/inn-selectors';
import { InnDealHelper } from '../lib/api/inn-deal-helper';

const helper = new InnDealHelper();

const STORAGE_PREFIX = 'event-sales:inn-align';

/** Уже выравнивали в этой вкладке — второй раз не ходим. */
const markAligned = (domain: string, dealId: number): boolean => {
    try {
        const key = `${STORAGE_PREFIX}:${domain}:${dealId}`;
        if (window.sessionStorage.getItem(key) === '1') return false;
        window.sessionStorage.setItem(key, '1');
        return true;
    } catch {
        // Нет хранилища — выравниваем: бэк сам ничего не пишет без нужды.
        return true;
    }
};

/**
 * Текущий ИНН сделки — при открытии, а не только во вкладке «ИНН»
 * (владелец 25.10.2026).
 *
 * Сделка с компанией, и у одной из сторон ИНН пуст → бэк лёгким чтением
 * (сделка, компания, её реквизиты) дописывает пустую сторону: из другой
 * стороны или из реквизита компании. Один вызов на сделку за вкладку;
 * обе стороны заполнены — в сеть не ходим. Ответ сразу ставится в шапку.
 */
export const alignDealInnOnOpen =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const domain = state.app.domain;
        const deal = state.app.bitrix.deal as unknown as Record<
            string,
            unknown
        > | null;
        const dealTarget = getInnMirrorTarget(state);
        const companyTarget = getInnTarget(state);
        if (!domain || !deal || !dealTarget || !companyTarget) return;
        if (String(deal.CLOSED ?? '').toUpperCase() === 'Y') return;
        if (dealTarget.value && companyTarget.value) return;
        if (!markAligned(domain, dealTarget.entityId)) return;

        try {
            const { current } = await helper.align(
                dealTarget.entityId,
                domain,
            );
            if (current && current !== getCurrentInn(getState())) {
                dispatch(innActions.syncValue({ value: current }));
            }
        } catch (error) {
            console.error('alignDealInnOnOpen error', error);
        }
    };
