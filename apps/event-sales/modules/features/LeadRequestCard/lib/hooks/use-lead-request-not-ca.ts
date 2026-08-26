'use client';

import { useCallback } from 'react';
import { findPortalField } from '@workspace/pbx';
import { PBX_SALES_EVENT_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/event/pbx-sales-event-field.type';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { leadRequestActions } from '../../model/LeadRequestSlice';
import type { LeadNotCaTypeCode, LeadRequestItem } from '../../model';

/**
 * «Не ЦА»: тип испрашивается в форме отчёта и уезжает в
 * EventSalesFlowDto.leadSync — бэк на финале уведёт сделку в `sales_not_ca`,
 * проставит статусы заявки и допишет историю.
 *
 * Items — из СЛЕПКА ПОРТАЛА (`op_lead_not_ca_type` на лиде), а не из карточки
 * заявки: «Не ЦА» доступен и по сделке БЕЗ лида, где карточки нет вовсе.
 * Карточка остаётся фолбэком для порталов со старым слепком в кэше.
 */
export const useLeadRequestNotCa = () => {
    const dispatch = useAppDispatch();
    const card = useAppSelector(state => state.leadRequest.card);
    const value = useAppSelector(
        state => state.leadRequest.finalSync.notCaTypeCode,
    );
    const portalField = useAppSelector(state =>
        findPortalField(
            state.portal.portal?.lead?.bitrixfields,
            PBX_SALES_EVENT_FIELD_CODES.op_lead_not_ca_type,
        ),
    );

    const setValue = useCallback(
        (code: LeadNotCaTypeCode) =>
            dispatch(leadRequestActions.setNotCaTypeCode(code)),
        [dispatch],
    );

    const items: LeadRequestItem[] = portalField?.items?.length
        ? portalField.items.map(item => ({ code: item.code, name: item.name }))
        : (card?.notCaType.items ?? []);

    return {
        visible: items.length > 0,
        items,
        value,
        setValue,
    };
};
