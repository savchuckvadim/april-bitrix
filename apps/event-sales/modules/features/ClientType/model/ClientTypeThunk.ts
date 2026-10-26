import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { entityIdOf } from '@/modules/shared/lib/entity-id';
import { serverReasonText } from '@/modules/shared/lib/request-error';
import { alignClientType, setClientType } from '../lib/api/client-type-helper';
import type { ClientTypeCode } from '../lib/client-type-view';
import { selectClientTypeView } from '../lib/client-type-selectors';
import { clientTypeActions } from './ClientTypeSlice';

const SAVE_ERROR = 'Не удалось сохранить тип клиента — попробуйте ещё раз.';

/**
 * Тип клиента при открытии сделки (владелец 26.10.2026, как у ИНН): у
 * сделки с компанией одна сторона пуста, другая заполнена — бэк переносит
 * значение в пустую. Обе пусты, обе заполнены или разные — в сеть не
 * ходим; повторы одного открытия режет бэк (Redis, 15 минут) и отвечает
 * `skipped` — тогда шапку не трогаем.
 */
export const alignClientTypeOnOpen =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const domain = state.app.domain;
        const deal = state.app.bitrix.deal as unknown as Record<
            string,
            unknown
        > | null;
        const dealId = entityIdOf(deal);
        if (!domain || !dealId || !state.app.bitrix.company) return;
        if (String(deal?.CLOSED ?? '').toUpperCase() === 'Y') return;

        const view = selectClientTypeView(state);
        if (!view.available || Boolean(view.deal) === Boolean(view.company)) {
            return;
        }

        try {
            const result = await alignClientType(dealId, domain);
            if (result.skipped) return;
            dispatch(
                clientTypeActions.setSaved({
                    deal: result.deal,
                    company: result.company,
                }),
            );
        } catch (error) {
            console.error('alignClientTypeOnOpen error', error);
        }
    };

/**
 * Выбор типа клиента в шапке: бэк пишет и в компанию, и в открытую сделку.
 * Пессимистично — шапка меняется после ответа.
 */
export const saveClientType =
    (code: ClientTypeCode) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { deal, company } = state.app.bitrix;
        dispatch(clientTypeActions.setSaving());
        try {
            const result = await setClientType({
                domain: state.app.domain,
                code,
                dealId: entityIdOf(deal),
                companyId: entityIdOf(company),
            });
            dispatch(
                clientTypeActions.setSaved({
                    deal: result.deal,
                    company: result.company,
                }),
            );
            return true;
        } catch (error) {
            console.error('saveClientType error', error);
            dispatch(
                clientTypeActions.setError({
                    message: serverReasonText(error, SAVE_ERROR),
                }),
            );
            return false;
        }
    };
