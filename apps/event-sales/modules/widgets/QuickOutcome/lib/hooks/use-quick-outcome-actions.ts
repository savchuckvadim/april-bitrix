'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    getClientContext,
    getIsTmcMode,
} from '@/modules/app/lib/utills/app-state-util';
import { FLOW_STAGE } from '@/modules/processes/event/model/FlowStatusSlice';
import { openQuickOutcome } from '../../model/QuickOutcomeThunk';
import {
    type QuickOutcomeButtonState,
    type QuickOutcomeKind,
    getQuickOutcomeButtons,
} from '../quick-outcome';

export interface QuickOutcomeActions {
    /** Какие кнопки итога видны и какие из них серые (правило getQuickOutcomeButtons). */
    buttons: QuickOutcomeButtonState[];
    /** Все кнопки неактивны — идёт отправка или загрузка. */
    disabled: boolean;
    /** Почему все кнопки неактивны — подсказкой при наведении. */
    hint?: string;
    open: (kind: QuickOutcomeKind) => void;
}

/**
 * Кнопки итога («Продажа» / «Отказ») — одни правила для шапки и для пустого
 * списка дел: какие показать, когда они неактивны и что делают.
 *
 * Пока уходит отчёт по клиенту, кнопки неактивны: второй итог был бы
 * дублем (сервер его и не примет).
 */
export const useQuickOutcomeActions = (
    isItemScreen: boolean,
): QuickOutcomeActions => {
    const dispatch = useAppDispatch();
    const context = useAppSelector(getClientContext);
    const isTmc = useAppSelector(getIsTmcMode);
    const inProgress = useAppSelector(s => s.preloader.inProgress);
    const isSending = useAppSelector(
        s => s.flowStatus.stage === FLOW_STAGE.SENDING,
    );

    return {
        buttons: getQuickOutcomeButtons({ isItemScreen, context, isTmc }),
        disabled: inProgress || isSending,
        hint: isSending ? 'Отчёт ещё отправляется — дождитесь' : undefined,
        open: kind => void dispatch(openQuickOutcome(kind)),
    };
};
