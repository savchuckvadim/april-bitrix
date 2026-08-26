'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { LeadRequestCard } from '@/modules/features/LeadRequestCard/model';
import type {
    PresentationLeadCandidate,
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
    /** Выбран лид, карточка загружена, но обязательный статус пуст. */
    statusesMissing: boolean;
    canConfirm: boolean;
}

/**
 * Вся логика формы модалки — компонент остаётся чистым. Правило
 * обязательности: при выбранной заявке установленный статус заявки должен
 * быть заполнен (ось слита — стадии больше нет); поле не установлено на
 * портале — не требуем; карточка не загрузилась — не блокируем отправку
 * (бэк всё равно залинкует лид, статус просто не уедет).
 */
export const usePresentationLeadLinkForm = (): PresentationLeadLinkForm => {
    const state = useAppSelector(s => s.presentationLeadLink);

    const statusesMissing =
        state.selectedLeadId !== null &&
        state.cardStatus === 'ready' &&
        state.card !== null &&
        state.card.siteStatus.installed &&
        !state.siteStatusCode;

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
        statusesMissing,
        canConfirm,
    };
};
