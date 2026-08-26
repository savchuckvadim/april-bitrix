'use client';

import { useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getChecklistById } from '../../data/checklist-catalog';
import type { ChecklistDef } from '../../type/call-checklist.type';
import { selectChecklistRows } from '../checklist-selectors';
import {
    buildChecklistFieldViews,
    type ChecklistFieldView,
} from '../checklist-field-view';
import {
    changeChecklistField,
    clearChecklistField,
} from '../../model/CallChecklistThunk';

export interface ModalChecklistView {
    def: ChecklistDef | null;
    fields: ChecklistFieldView[];
    /** Все обязательные поля закрыты — «Готово» активна. */
    isReady: boolean;
    /** Базовая сделка ещё грузится — «сейчас: …» появится следом. */
    isBaseDealLoading: boolean;
    error: string | null;
}

/**
 * Активный модальный чек-лист (шаг цепочки send): те же поля и те же правила
 * заполнения, что в инлайн-карточке — сборка вьюхи общая
 * (`buildChecklistFieldViews`), носители полей общие (`selectChecklistRows`).
 */
export const useModalChecklist = (): ModalChecklistView => {
    const dispatch = useAppDispatch();
    const activeId = useAppSelector(s => s.callChecklist.activeModalId);
    const saved = useAppSelector(s => s.callChecklist.valueByCode);
    const drafts = useAppSelector(s => s.callChecklist.draftByCode);
    const savingCodes = useAppSelector(s => s.callChecklist.savingCodes);
    const error = useAppSelector(s => s.callChecklist.error);
    const isBaseDealLoading = useAppSelector(
        s => s.callChecklist.baseDeal.status === 'loading',
    );
    const rows = useAppSelector(selectChecklistRows, shallowEqual);
    const portal = useAppSelector(s => s.portal.portal);

    return useMemo(() => {
        const def = activeId ? (getChecklistById(activeId) ?? null) : null;
        if (!def) {
            return {
                def: null,
                fields: [],
                isReady: false,
                isBaseDealLoading,
                error,
            };
        }

        const fields = buildChecklistFieldViews(def, {
            portal,
            rows,
            saved,
            drafts,
            savingCodes,
            onChange: (field, value) =>
                dispatch(changeChecklistField(field, value)),
            onClear: field => dispatch(clearChecklistField(field)),
        });

        return {
            def,
            fields,
            isReady: fields.every(field => !field.isMissing),
            isBaseDealLoading,
            error,
        };
    }, [
        dispatch,
        activeId,
        rows,
        portal,
        saved,
        drafts,
        savingCodes,
        isBaseDealLoading,
        error,
    ]);
};
