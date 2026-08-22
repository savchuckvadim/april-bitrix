'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    findLeadStageIndex,
    useLeadStageDict,
} from '@/modules/entities/RelatedCrm';
import { changeLeadBitrixStage } from '../../model/LeadRequestThunk';

export interface LeadBitrixStage {
    /** Текущий STATUS_ID лида панели (оверрайд → граф связей → лид контекста). */
    statusId: string | null;
    /** Стадии лестницы для селекта (sales-категория слепка, без финалов). */
    options: Array<{ value: string; label: string }>;
    /** Текущая стадия входит в лестницу (вне её полоска не рисуется). */
    isOnLadder: boolean;
    saving: boolean;
    changeStage: (statusId: string) => void;
}

/**
 * Битриксовская стадия лида панели заявки.
 *
 * Карточка заявки с бэка STATUS_ID не возит — стадия резолвится из уже
 * загруженного: оверрайд после смены из панели (мгновенно), лид из графа
 * связей, лид контекста встройки (только если это тот же лид).
 */
export const useLeadBitrixStage = (): LeadBitrixStage => {
    const dispatch = useAppDispatch();
    const leadId = useAppSelector(s => s.leadRequest.leadId);
    const override = useAppSelector(s =>
        s.leadRequest.leadId
            ? (s.leadRequest.bitrixStageById[s.leadRequest.leadId] ?? null)
            : null,
    );
    const graphStatus = useAppSelector(s => {
        const id = s.leadRequest.leadId;
        if (!id) return null;
        return (
            s.relatedCrm.details?.leads?.find(lead => lead.id === id)
                ?.statusId ?? null
        );
    });
    const contextStatus = useAppSelector(s => {
        const id = s.leadRequest.leadId;
        if (!id) return null;
        const lead = (s.app.bitrix.lead ?? s.eventLead.lead) as Record<
            string,
            unknown
        > | null;
        if (!lead || Number(lead.ID) !== id) return null;
        const status = lead.STATUS_ID;
        return typeof status === 'string' && status ? status : null;
    });
    const saving = useAppSelector(s => s.leadRequest.saving);
    const dict = useLeadStageDict();

    const statusId = override ?? graphStatus ?? contextStatus;

    const changeStage = useCallback(
        (value: string) => {
            if (leadId && value) {
                dispatch(changeLeadBitrixStage(leadId, value));
            }
        },
        [dispatch, leadId],
    );

    return {
        statusId,
        options: dict.map(item => ({
            value: item.statusId,
            label: item.name,
        })),
        isOnLadder: findLeadStageIndex(dict, statusId) >= 0,
        saving,
        changeStage,
    };
};
