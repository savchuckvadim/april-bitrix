import { Bitrix } from '@workspace/bitrix';
import { findUfKey } from '@workspace/pbx';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { reportFrontError } from '@/modules/shared/front-error';
import type { PurchaseDateCode } from '../lib/purchase-signals';
import { purchaseSignalsActions } from './PurchaseSignalsSlice';

/**
 * Запись даты в носителя (компания → сделка → лид) — пессимистично, как ИНН:
 * сначала портал, потом стейт. Неудача — честная ошибка в карточке, значение
 * не подменяется.
 */
export const savePurchaseDate =
    (code: PurchaseDateCode, value: string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const portal = state.portal.portal;
        const { company, deal, lead } = state.app.bitrix;
        const bitrix = Bitrix.getService();

        const target = company
            ? {
                  id: Number(company.ID),
                  fields: portal?.company?.bitrixfields,
                  update: (id: number, payload: Record<string, string>) =>
                      bitrix.company.update(id, payload as never),
              }
            : deal
              ? {
                    id: Number(deal.ID),
                    fields: portal?.bitrixDeal?.bitrixfields,
                    update: (id: number, payload: Record<string, string>) =>
                        bitrix.deal.update(id, payload as never),
                }
              : lead
                ? {
                      id: Number(lead.ID),
                      fields: portal?.lead?.bitrixfields,
                      update: (id: number, payload: Record<string, string>) =>
                          bitrix.lead.update(id, payload as never),
                  }
                : null;

        const key = target ? findUfKey(target.fields, code) : null;
        if (!target || !key) return;

        dispatch(purchaseSignalsActions.setError({ message: null }));
        try {
            await target.update(target.id, { [key]: value });
            dispatch(purchaseSignalsActions.setValue({ code, value }));
        } catch (error) {
            dispatch(
                purchaseSignalsActions.setError({
                    message: 'Дата не сохранилась — попробуйте ещё раз',
                }),
            );
            reportFrontError({
                place: 'purchase-signals.save',
                message: error instanceof Error ? error.message : String(error),
                context: { code },
            });
        }
    };
