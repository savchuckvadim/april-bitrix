'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    getCanSellContext,
    getClientContext,
    getIsTmcMode,
} from '@/modules/app/lib/utills/app-state-util';
import { FLOW_STAGE } from '@/modules/processes/event/model/FlowStatusSlice';
import { openQuickOutcome } from '../../model/QuickOutcomeThunk';
import { type QuickOutcomeKind, getQuickOutcomeButtons } from '../quick-outcome';

export interface QuickOutcomeActions {
    /** Какие итоги доступны (правило getQuickOutcomeButtons). */
    kinds: QuickOutcomeKind[];
    disabled: boolean;
    /** Почему кнопки неактивны — подсказкой при наведении. */
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
    const canSell = useAppSelector(getCanSellContext);
    const isTmc = useAppSelector(getIsTmcMode);
    const inProgress = useAppSelector(s => s.preloader.inProgress);
    const isSending = useAppSelector(
        s => s.flowStatus.stage === FLOW_STAGE.SENDING,
    );

    return {
        kinds: getQuickOutcomeButtons({
            isItemScreen,
            hasClient: context !== 'unknown',
            canSell,
            isTmc,
        }),
        disabled: inProgress || isSending,
        hint: isSending ? 'Отчёт ещё отправляется — дождитесь' : undefined,
        open: kind => void dispatch(openQuickOutcome(kind)),
    };
};
