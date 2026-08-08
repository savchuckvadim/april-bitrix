import { Bitrix } from '@workspace/bitrix';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import {
    innValidationError,
    mergeInnPool,
    normalizeInn,
} from '../lib/inn-validate';
import { getInnTarget } from '../lib/inn-selectors';
import { innActions } from './InnSlice';

/**
 * Запись ИНН в текущую сущность (компания приоритетно, без неё — сделка/лид).
 *
 * Паттерн пессимистичный: сначала успешный crm.*.update, потом состояние —
 * эталон записи pbx-полей (docs/pbx-fields-system.md, контракт записи).
 * Автопоиск дублей по свежему ИНН — реакцией листенера на setSaved.
 */
export const saveInn =
    (raw: string) => async (dispatch: AppDispatch, getState: AppGetState) => {
        const validationError = innValidationError(raw);
        if (validationError) {
            dispatch(innActions.setError({ message: validationError }));
            return false;
        }
        const digits = normalizeInn(raw)!;

        const target = getInnTarget(getState());
        if (!target) {
            dispatch(
                innActions.setError({
                    message: 'Поле ИНН не настроено на портале.',
                }),
            );
            return false;
        }

        dispatch(innActions.setSaving({ status: true }));
        try {
            const bitrix = Bitrix.getService();
            const fields: Record<string, unknown> = {
                [target.ufKey]: digits,
            };
            // Склад кандидатов: новый ИНН + прежний текущий — уникально в
            // op_inn_pool тем же update'ом (поле может быть не проинсталлено —
            // тогда пишем только текущий).
            if (target.poolKey) {
                fields[target.poolKey] = mergeInnPool(
                    target.poolValues,
                    target.value,
                    digits,
                );
            }
            if (target.entity === 'company') {
                await bitrix.company.update(target.entityId, fields);
            } else if (target.entity === 'deal') {
                await bitrix.deal.update(target.entityId, fields as never);
            } else {
                await bitrix.lead.update(target.entityId, fields as never);
            }
            dispatch(innActions.setSaved({ value: digits }));
            return true;
        } catch (error) {
            console.error('saveInn error', error);
            dispatch(
                innActions.setError({
                    message: 'Не удалось сохранить ИНН — попробуйте ещё раз.',
                }),
            );
            return false;
        }
    };
