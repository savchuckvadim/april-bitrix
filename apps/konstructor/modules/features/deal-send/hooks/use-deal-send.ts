'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import { selectMainRow } from '@/modules/entities/row-set';
import { ROUTE_KONSTRUCTOR, useKonstructorNavigation } from '@/modules/shared/lib/routing';
import { sendDeal } from '../model/deal-send-thunk';

/**
 * Кнопка «Сохранить / Создать сделку»: отправка полей и строк в Bitrix,
 * слепок, переход к документам. skipped — предупреждение (поле не на портале).
 */
export const useDealSend = (options: { navigateAfter?: boolean } = {}) => {
    const dispatch = useAppDispatch();
    const nav = useKonstructorNavigation();
    const dealId = useAppSelector(state => state.app.dealId);
    const hasMainRow = Boolean(useAppSelector(selectMainRow));
    const status = useAppSelector(state => state.dealSend.status);
    const error = useAppSelector(state => state.dealSend.error);
    const skipped = useAppSelector(state => state.dealSend.skipped);
    // сервисный отдел после сохранения остаётся на ценах (легаси), продажи — к документам
    const staysOnPrices = useAppSelector(state => state.app.department === APP_DEP.SERVICE);

    const send = async () => {
        const ok = await dispatch(sendDeal());
        if (ok && options.navigateAfter && !staysOnPrices) nav.to(ROUTE_KONSTRUCTOR.DOCUMENT);
        return ok;
    };

    return {
        canSend: hasMainRow,
        label: dealId ? 'Сохранить сделку' : 'Создать сделку',
        isSending: status === 'sending',
        isDone: status === 'done',
        error: status === 'error' ? error : null,
        skipped,
        send,
    };
};
