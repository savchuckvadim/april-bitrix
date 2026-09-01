import { Bitrix } from '@workspace/bitrix';
import { findUfKey } from '@workspace/pbx';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { reportFrontError } from '@/modules/shared/front-error';
import type { PurchaseDateCode } from '../lib/purchase-signals';
import { purchaseSignalsActions } from './PurchaseSignalsSlice';

/**
 * Запись даты ВО ВСЕ носители контекста, у которых поле установлено:
 * сделка + сущность-владелец (компания или лид) — требование владельца
 * 31.08 («по сделке + по сущности»). Раньше писался ОДИН носитель по
 * приоритету, и дата на сделке расходилась с датой на компании: читали
 * потом из разного и видели разное.
 *
 * Пессимистично, как ИНН: сначала портал, потом стейт. Ни один носитель не
 * принял — честная ошибка в карточке, значение не подменяется; принял хотя
 * бы один — значение фиксируется (частичная запись видна по ошибке).
 */
export const savePurchaseDate =
    (code: PurchaseDateCode, value: string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const portal = state.portal.portal;
        const { company, deal, lead } = state.app.bitrix;
        const bitrix = Bitrix.getService();

        const targets = [
            deal
                ? {
                      kind: 'deal',
                      id: Number(deal.ID),
                      fields: portal?.bitrixDeal?.bitrixfields,
                      update: (id: number, payload: Record<string, string>) =>
                          bitrix.deal.update(id, payload as never),
                  }
                : null,
            company
                ? {
                      kind: 'company',
                      id: Number(company.ID),
                      fields: portal?.company?.bitrixfields,
                      update: (id: number, payload: Record<string, string>) =>
                          bitrix.company.update(id, payload as never),
                  }
                : null,
            // Лид — сущность-владелец только когда компании нет (лид-only).
            !company && lead
                ? {
                      kind: 'lead',
                      id: Number(lead.ID),
                      fields: portal?.lead?.bitrixfields,
                      update: (id: number, payload: Record<string, string>) =>
                          bitrix.lead.update(id, payload as never),
                  }
                : null,
        ].filter((target): target is NonNullable<typeof target> =>
            Boolean(target?.id),
        );

        const writable = targets
            .map(target => ({
                ...target,
                key: findUfKey(target.fields, code),
            }))
            .filter(
                (target): target is (typeof targets)[number] & { key: string } =>
                    Boolean(target.key),
            );
        if (!writable.length) return;

        dispatch(purchaseSignalsActions.setError({ message: null }));
        let accepted = 0;
        for (const target of writable) {
            try {
                await target.update(target.id, { [target.key]: value });
                accepted += 1;
            } catch (error) {
                reportFrontError({
                    place: 'purchase-signals.save',
                    message:
                        error instanceof Error ? error.message : String(error),
                    context: { code, entity: target.kind, id: target.id },
                });
            }
        }

        if (accepted > 0) {
            dispatch(purchaseSignalsActions.setValue({ code, value }));
        }
        if (accepted < writable.length) {
            dispatch(
                purchaseSignalsActions.setError({
                    message:
                        accepted === 0
                            ? 'Дата не сохранилась — попробуйте ещё раз'
                            : 'Дата записана не во все карточки — проверьте после отправки',
                }),
            );
        }
    };
