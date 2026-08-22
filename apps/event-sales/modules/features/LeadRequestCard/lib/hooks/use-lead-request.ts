'use client';

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { SectionStatus } from '@/modules/shared/SectionState';
import {
    fetchLeadRequestCard,
    saveLeadRequest,
} from '../../model/LeadRequestThunk';
import { leadRequestActions } from '../../model/LeadRequestSlice';
import { needsNotCaType } from '../not-ca-rule';
import type { LeadRequestUpdate } from '../../model';

/** Enum-поля карточки, редактируемые селектами (типы значений — из DTO). */
export type LeadRequestEnumPatch = Pick<
    LeadRequestUpdate,
    'siteStatusCode' | 'siteStageCode' | 'leadStatusCode' | 'notCaTypeCode'
>;
export type LeadRequestEnumPatchKey = keyof LeadRequestEnumPatch;

/** Булевы маркеры карточки, редактируемые чекбоксами. */
export type LeadRequestBoolPatchKey = keyof Pick<
    LeadRequestUpdate,
    'blackShort' | 'boostSale' | 'nppReported'
>;

/**
 * Вся логика панели заявки: загрузка карточки по контексту, статус
 * секции, точечные правки (селекты/чекбоксы). UI остаётся разметкой.
 */
export const useLeadRequest = (explicitLeadId?: number) => {
    const dispatch = useAppDispatch();
    const { card, status, saving, error } = useAppSelector(
        state => state.leadRequest,
    );
    const hasContextLead = useAppSelector(state =>
        Boolean(state.app.bitrix.lead?.ID ?? state.eventLead.lead?.ID),
    );

    useEffect(() => {
        dispatch(fetchLeadRequestCard(explicitLeadId));
    }, [dispatch, explicitLeadId]);

    const retry = useCallback(
        () => dispatch(fetchLeadRequestCard(explicitLeadId)),
        [dispatch, explicitLeadId],
    );

    const patchEnum = useCallback(
        <K extends LeadRequestEnumPatchKey>(
            key: K,
            value: NonNullable<LeadRequestEnumPatch[K]>,
        ) => {
            const patch = { [key]: value };
            // «Не ЦА» без типа портал не примет (400) — спрашиваем тип и
            // отправляем оба поля разом, а не ловим ошибку постфактум.
            if (needsNotCaType(patch, card)) {
                dispatch(leadRequestActions.askNotCaType(patch));
                return;
            }
            dispatch(saveLeadRequest(patch));
        },
        [dispatch, card],
    );

    const patchBool = useCallback(
        (key: LeadRequestBoolPatchKey, value: boolean) => {
            dispatch(saveLeadRequest({ [key]: value }));
        },
        [dispatch],
    );

    const sectionStatus: SectionStatus = status === 'idle' ? 'loading' : status;

    return {
        card,
        status: sectionStatus,
        saving,
        error,
        /** Панель видима: есть явный лид либо лид в контексте встройки. */
        visible: Boolean(explicitLeadId) || hasContextLead || status !== 'idle',
        retry,
        patchEnum,
        patchBool,
    };
};
