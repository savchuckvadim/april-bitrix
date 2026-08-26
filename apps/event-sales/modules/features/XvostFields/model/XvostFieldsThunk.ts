import { Bitrix } from '@workspace/bitrix';
import { findUfKey } from '@workspace/pbx';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { afterPresentationActions } from '@/modules/features/AfterPresentation/model/AfterPresentationSlice';
import { reportFrontError } from '@/modules/shared/front-error';
import {
    toXvostPortalValue,
    xvostToAnswerValue,
    type XvostFieldCode,
} from '../lib/xvost-fields';
import { xvostFieldsActions } from './XvostFieldsSlice';

/**
 * Запись хвост-поля в СДЕЛКУ контекста — пессимистично, как остальные ручные
 * pbx-поля модалки: сначала портал, потом стейт. Неудача — честная ошибка в
 * карточке, значение не подменяется.
 *
 * Deal-only по владельческой таблице install (todo2508): весь блок op_xvost_*
 * установлен только на сделке — компания/лид носителями не бывают.
 */
export const saveXvostField =
    (code: XvostFieldCode, value: string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const deal = state.app.bitrix.deal;
        const fields = state.portal.portal?.bitrixDeal?.bitrixfields;

        const key = findUfKey(fields, code);
        if (!deal || !key) return;
        const dealId = Number(deal.ID);

        // В портал — каноном CRM, а не строкой браузерного контрола: то же
        // поле пишет опросник, и два диалекта в одном поле не уживаются.
        const portalValue = toXvostPortalValue(code, value);
        if (portalValue === null) return;

        dispatch(xvostFieldsActions.setError({ message: null }));
        try {
            const bitrix = Bitrix.getService();
            await bitrix.deal.update(dealId, { [key]: portalValue } as never);
            dispatch(xvostFieldsActions.setValue({ dealId, code, value }));
            // Тот же код живёт вопросом опросника (id вопроса = код поля):
            // синхронизируем ответ, иначе повторный submit опросника
            // перезаписал бы ручную правку своим прошлым значением.
            dispatch(
                afterPresentationActions.syncAnswer({
                    id: code,
                    value: xvostToAnswerValue(code, value),
                }),
            );
        } catch (error) {
            dispatch(
                xvostFieldsActions.setError({
                    message: 'Не сохранилось — попробуйте ещё раз',
                }),
            );
            reportFrontError({
                place: 'xvost-fields.save',
                message: error instanceof Error ? error.message : String(error),
                context: { code },
            });
        }
    };
