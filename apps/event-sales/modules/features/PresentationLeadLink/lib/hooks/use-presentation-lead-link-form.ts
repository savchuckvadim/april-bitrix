'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { LeadRequestCard } from '@/modules/features/LeadRequestCard/model';
import type {
    PresentationLeadCandidate,
    PresentationSyncSiteStageCode,
    PresentationSyncSiteStatusCode,
} from '../../model';
import type { PresentationLeadLinkStatus } from '../../model/PresentationLeadLinkSlice';

export interface PresentationLeadLinkForm {
    isOpen: boolean;
    candidates: PresentationLeadCandidate[];
    candidatesStatus: PresentationLeadLinkStatus;
    selectedLeadId: number | null;
    noLink: boolean;
    card: LeadRequestCard | null;
    cardStatus: PresentationLeadLinkStatus;
    siteStatusCode: PresentationSyncSiteStatusCode | null;
    siteStageCode: PresentationSyncSiteStageCode | null;
    /** Выбран лид, карточка загружена, но обязательные статусы пустые. */
    statusesMissing: boolean;
    canConfirm: boolean;
}

/**
 * Вся логика формы модалки — компонент остаётся чистым. Правило
 * обязательности: при выбранной заявке установленные поля статуса и
 * стадии должны быть заполнены; поле не установлено на портале — не
 * требуем; карточка не загрузилась — не блокируем отправку (бэк всё
 * равно залинкует лид, статусы просто не уедут).
 */
export const usePresentationLeadLinkForm = (): PresentationLeadLinkForm => {
    const state = useAppSelector(s => s.presentationLeadLink);

    const statusesMissing =
        state.selectedLeadId !== null &&
        state.cardStatus === 'ready' &&
        state.card !== null &&
        ((state.card.siteStatus.installed && !state.siteStatusCode) ||
            (state.card.siteStage.installed && !state.siteStageCode));

    const canConfirm =
        state.noLink ||
        (state.selectedLeadId !== null &&
            state.cardStatus !== 'loading' &&
            !statusesMissing);

    return {
        isOpen: state.isOpen,
        candidates: state.candidates,
        candidatesStatus: state.candidatesStatus,
        selectedLeadId: state.selectedLeadId,
        noLink: state.noLink,
        card: state.card,
        cardStatus: state.cardStatus,
        siteStatusCode: state.siteStatusCode,
        siteStageCode: state.siteStageCode,
        statusesMissing,
        canConfirm,
    };
};
