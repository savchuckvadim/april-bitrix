import { Bitrix } from '@workspace/bitrix';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import {
    innValidationError,
    mergeInnPool,
    normalizeInn,
} from '../lib/inn-validate';
import { getCurrentInn, getInnTarget } from '../lib/inn-selectors';
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

/**
 * ИНН записали в обход этого блока (вкладка «ИНН» сделки, «Выбрать»): в
 * Битриксе значение уже новое, а шапка до перезагрузки показывала старое.
 * Перечитываем ОДНУ сущность — ту, чей ИНН показывает шапка (компания,
 * без неё сделка, лид), — и показываем ровно то, что увидели бы после
 * перезагрузки. Бэк при выборе пишет ИНН в сделку, а в компанию — только в
 * пустое поле, поэтому гадать по ответу вкладки нельзя.
 *
 * Полное обновление сущностей (setAppBitrixData) не годится: оно заново
 * собирает поля, контакты и связи клиента — лишние запросы ради одного ИНН.
 */
export const refreshInnFromBitrix =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const target = getInnTarget(getState());
        if (!target) return;
        try {
            const bitrix = Bitrix.getService();
            const row = (
                target.entity === 'company'
                    ? await bitrix.company.get(target.entityId)
                    : target.entity === 'deal'
                      ? await bitrix.deal.get(target.entityId)
                      : // У лида get отдаёт ответ целиком, запись — в result.
                        (await bitrix.lead.get(target.entityId))?.result
            ) as unknown as Record<string, unknown> | null;
            const raw = row?.[target.ufKey];
            const value = typeof raw === 'string' ? raw.trim() : '';
            if (value && value !== getCurrentInn(getState())) {
                dispatch(innActions.syncValue({ value }));
            }
        } catch (error) {
            console.error('refreshInnFromBitrix error', error);
        }
    };
