import { Bitrix } from '@workspace/bitrix';
import { buildEnumFieldPatch } from '@workspace/pbx';
import type { AppThunk } from '@/modules/app/model/store';
import { appActions } from '@/modules/app/model/AppSlice';
import {
    CLIENT_CHOICE_CODE,
    type ClientChoiceField,
} from '../lib/client-card-fields';

/**
 * Прогноз или статус клиента из шапки — запись в компанию Битрикса (как в
 * «Звонках»). Оптимистично: шапка меняется сразу, при ошибке — откат.
 * Возвращает, записалось ли значение.
 */
export const updateClientChoice =
    (field: ClientChoiceField, itemCode: string): AppThunk<Promise<boolean>> =>
    async (dispatch, getState) => {
        const state = getState();
        const company = state.app.bitrix.company;
        const patch = buildEnumFieldPatch(
            state.portal.current?.company?.bitrixfields,
            CLIENT_CHOICE_CODE[field],
            itemCode,
        );
        if (!company || !patch) return false;

        // интерфейс компании не индексируется — разворачиваем в запись
        const raw: Record<string, unknown> = { ...company };
        const previous = Object.fromEntries(
            Object.keys(patch).map(key => [key, raw[key]]),
        );
        dispatch(appActions.patchCompany(patch));
        try {
            await Bitrix.getService().company.update(company.ID, patch);
            return true;
        } catch (error) {
            console.error('client-card: поле компании не записано', error);
            dispatch(appActions.patchCompany(previous));
            return false;
        }
    };
