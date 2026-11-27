'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectMainRow } from '@/modules/entities/row-set';
import { dealSummaryActions } from '../lib/deal-summary-actions.util';

/** Кнопки сделки в «Итоге» шага «Цены»: решение «сделка есть / нет» берётся там же, где у кнопки сделки. */
export const useDealSummaryActions = () => {
    const hasDeal = useAppSelector(state => Boolean(state.app.dealId));
    const canSend = Boolean(useAppSelector(selectMainRow));
    return dealSummaryActions({ hasDeal, canSend });
};
