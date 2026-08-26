'use client';

import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getChecklistById } from '../../data/checklist-catalog';
import {
    resolveChecklistField,
    type ChecklistEntityRows,
    type ResolvedChecklistField,
} from '../checklist-values';
import { saveChecklistField } from '../../model/CallChecklistThunk';
import type { ChecklistDef } from '../../type/call-checklist.type';
import type { InlineChecklistFieldView } from './use-inline-checklists';

export interface ModalChecklistView {
    def: ChecklistDef | null;
    fields: InlineChecklistFieldView[];
    /** Все обязательные поля закрыты — «Готово» активна. */
    isReady: boolean;
    /** Базовая сделка ещё грузится — «сейчас: …» появится следом. */
    isBaseDealLoading: boolean;
    error: string | null;
}

/**
 * Активный модальный чек-лист (шаг цепочки send): поля с текущими
 * значениями (строка сделки — из стора либо лениво догруженная базовая)
 * и записью по каналу поля (crm — сразу в портал, dto — в payload).
 */
export const useModalChecklist = (): ModalChecklistView => {
    const dispatch = useAppDispatch();
    const activeId = useAppSelector(s => s.callChecklist.activeModalId);
    const overrides = useAppSelector(s => s.callChecklist.valueByCode);
    const error = useAppSelector(s => s.callChecklist.error);
    const baseDeal = useAppSelector(s => s.callChecklist.baseDeal);
    const bitrix = useAppSelector(s => s.app.bitrix);
    const portal = useAppSelector(s => s.portal.portal);

    return useMemo(() => {
        const def = activeId ? (getChecklistById(activeId) ?? null) : null;
        if (!def) {
            return {
                def: null,
                fields: [],
                isReady: false,
                isBaseDealLoading: false,
                error,
            };
        }

        const rows: ChecklistEntityRows = {
            company: bitrix.company as unknown as Record<
                string,
                unknown
            > | null,
            deal:
                (bitrix.deal as unknown as Record<string, unknown> | null) ??
                baseDeal.row,
            lead: bitrix.lead as unknown as Record<string, unknown> | null,
        };

        const fields = def.fields
            .map(field => resolveChecklistField(field, portal, rows))
            .filter((f): f is ResolvedChecklistField => f !== null)
            .map(resolved => ({
                ...resolved,
                value: overrides[resolved.def.code] ?? resolved.currentValue,
                isMissing:
                    resolved.def.required &&
                    !overrides[resolved.def.code] &&
                    !resolved.currentValue,
                isSaved: Boolean(overrides[resolved.def.code]),
                setValue: (value: string) =>
                    dispatch(saveChecklistField(resolved.def, value)),
            }));

        return {
            def,
            fields,
            isReady: fields.every(field => !field.isMissing),
            isBaseDealLoading: baseDeal.status === 'loading',
            error,
        };
    }, [dispatch, activeId, overrides, error, baseDeal, bitrix, portal]);
};
