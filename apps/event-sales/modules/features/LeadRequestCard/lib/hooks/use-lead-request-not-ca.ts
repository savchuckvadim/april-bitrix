'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { leadRequestActions } from '../../model/LeadRequestSlice';
import type { LeadNotCaTypeCode, LeadRequestItem } from '../../model';

/**
 * «Не ЦА» при отказе: тип испрашивается в форме отчёта и уезжает в
 * EventSalesFlowDto.leadSync — бэк на финале проставит статусы заявки
 * и допишет историю. Видимость — только когда карточка заявки загружена
 * и поле типа установлено на портале.
 */
export const useLeadRequestNotCa = () => {
    const dispatch = useAppDispatch();
    const card = useAppSelector(state => state.leadRequest.card);
    const value = useAppSelector(
        state => state.leadRequest.finalSync.notCaTypeCode,
    );

    const setValue = useCallback(
        (code: LeadNotCaTypeCode) =>
            dispatch(leadRequestActions.setNotCaTypeCode(code)),
        [dispatch],
    );

    const items: LeadRequestItem[] = card?.notCaType.items ?? [];

    return {
        visible: Boolean(card?.notCaType.installed && items.length),
        items,
        value,
        setValue,
    };
};
