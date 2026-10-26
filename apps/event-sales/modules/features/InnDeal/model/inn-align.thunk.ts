import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { innActions } from '@/modules/features/Inn/model/InnSlice';
import {
    getCurrentInn,
    getInnMirrorTarget,
    getInnTarget,
} from '@/modules/features/Inn/lib/inn-selectors';
import { InnDealHelper } from '../lib/api/inn-deal-helper';

const helper = new InnDealHelper();

/**
 * Текущий ИНН сделки — при открытии, а не только во вкладке «ИНН»
 * (владелец 25.10.2026).
 *
 * Сделка с компанией, и у одной из сторон ИНН пуст → бэк лёгким чтением
 * (сделка, компания, её реквизиты) дописывает пустую сторону: из другой
 * стороны или из реквизита компании. Обе стороны заполнены — в сеть не
 * ходим; повторы одного открытия режет бэк (отметка в Redis на 15 минут,
 * владелец 26.10.2026). Ответ сразу ставится в шапку.
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
