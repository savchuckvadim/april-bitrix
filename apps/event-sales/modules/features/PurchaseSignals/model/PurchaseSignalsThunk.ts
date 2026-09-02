import { Bitrix } from '@workspace/bitrix';
import { findUfKey } from '@workspace/pbx';
import type { AppDispatch, AppGetState, RootState } from '@/modules/app/model/store';
import type { PBXField } from '@/modules/app/types/portal/portal-type';
import { reportFrontError } from '@/modules/shared/front-error';
import {
    toConcurentFieldValue,
    type PurchaseDateCode,
} from '../lib/purchase-signals';
import { purchaseSignalsActions } from './PurchaseSignalsSlice';

interface SignalTarget {
    kind: 'deal' | 'company' | 'lead';
    id: number;
    fields: PBXField[] | undefined;
    update: (id: number, payload: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Носители сигналов покупки: сделка + сущность-владелец (компания, а без
 * неё лид) — требование владельца 31.08 («по сделке + по сущности»).
 * Один список на обе записи (даты и конкуренты): разойдись они, дата
 * писалась бы в одни карточки, а конкуренты — в другие.
 */
const signalTargets = (state: RootState): SignalTarget[] => {
    const portal = state.portal.portal;
    const { company, deal, lead } = state.app.bitrix;
    const bitrix = Bitrix.getService();

    const candidates: Array<SignalTarget | null> = [
        deal
            ? {
                  kind: 'deal',
                  id: Number(deal.ID),
                  fields: portal?.bitrixDeal?.bitrixfields,
                  update: (id, payload) =>
                      bitrix.deal.update(id, payload as never),
              }
            : null,
        company
            ? {
                  kind: 'company',
                  id: Number(company.ID),
                  fields: portal?.company?.bitrixfields,
                  update: (id, payload) =>
                      bitrix.company.update(id, payload as never),
              }
            : null,
        // Лид — сущность-владелец только когда компании нет (лид-only).
        !company && lead
            ? {
                  kind: 'lead',
                  id: Number(lead.ID),
                  fields: portal?.lead?.bitrixfields,
                  update: (id, payload) =>
                      bitrix.lead.update(id, payload as never),
              }
            : null,
    ];

    return candidates.filter(
        (target): target is SignalTarget => Boolean(target?.id),
    );
};

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
        const targets = signalTargets(getState());

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

/**
 * Запись выбранных конкурентов во все носители, у которых есть справочник.
 *
 * Значение у каждого носителя СВОЁ: коды вариантов общие, а id элементов —
 * нет, поэтому массив id собирается по справочнику конкретной сущности
 * (`toConcurentFieldValue`). Итог — тот же пессимистичный протокол, что у
 * дат: портал, потом стейт, честная ошибка при частичной записи.
 */
export const saveConcurents =
    (codes: string[]) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const targets = signalTargets(getState());

        const writable = targets
            .map(target => ({
                ...target,
                field: toConcurentFieldValue(target.fields, codes),
            }))
            .filter(
                (
                    target,
                ): target is (typeof targets)[number] & {
                    field: NonNullable<ReturnType<typeof toConcurentFieldValue>>;
                } => target.field !== null,
            );
        if (!writable.length) return;

        dispatch(purchaseSignalsActions.setError({ message: null }));
        let accepted = 0;
        for (const target of writable) {
            try {
                await target.update(target.id, {
                    [target.field.key]: target.field.value,
                });
                accepted += 1;
            } catch (error) {
                reportFrontError({
                    place: 'purchase-signals.save-concurents',
                    message:
                        error instanceof Error ? error.message : String(error),
                    context: { entity: target.kind, id: target.id },
                });
            }
        }

        if (accepted > 0) {
            dispatch(purchaseSignalsActions.setConcurents({ codes }));
        }
        if (accepted < writable.length) {
            dispatch(
                purchaseSignalsActions.setError({
                    message:
                        accepted === 0
                            ? 'Конкуренты не сохранились — попробуйте ещё раз'
                            : 'Конкуренты записаны не во все карточки — проверьте после отправки',
                }),
            );
        }
    };
