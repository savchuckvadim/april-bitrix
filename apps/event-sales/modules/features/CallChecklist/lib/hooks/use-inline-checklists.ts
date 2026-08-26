'use client';

import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { CHECKLIST_CATALOG } from '../../data/checklist-catalog';
import type {
    ChecklistDef,
    ChecklistTrigger,
} from '../../type/call-checklist.type';
import {
    resolveChecklistField,
    type ChecklistEntityRows,
    type ResolvedChecklistField,
} from '../checklist-values';
import { saveChecklistField } from '../../model/CallChecklistThunk';

export interface InlineChecklistFieldView extends ResolvedChecklistField {
    /** Значение для контрола: сохранённое менеджером или из CRM. */
    value: string;
    isMissing: boolean;
    /** Менеджер уже сохранил значение в этой сессии (запись в CRM прошла). */
    isSaved: boolean;
    setValue: (value: string) => void;
}

export interface InlineChecklistView {
    def: ChecklistDef;
    fields: InlineChecklistFieldView[];
}

export interface InlineChecklistsView {
    checklists: InlineChecklistView[];
    error: string | null;
}

/**
 * Активные инлайн-чек-листы для колонки плана: поля с текущими значениями
 * из CRM и записью на изменение (пессимистично, см. CallChecklistThunk).
 *
 * Подписки точечные (как PurchaseSignals) — резолв в useMemo, чтобы селектор
 * не собирал новые массивы на каждый чих стора.
 */
export const useInlineChecklists = (): InlineChecklistsView => {
    const dispatch = useAppDispatch();
    const error = useAppSelector(s => s.callChecklist.error);
    const overrides = useAppSelector(s => s.callChecklist.valueByCode);
    const planTypeCode = useAppSelector(s => s.eventPlan.type.current?.code);
    const isPlanActive = useAppSelector(s => s.eventPlan.isActive);
    const taskEventType = useAppSelector(s => s.eventTask.current?.eventType);
    const config = useAppSelector(s => s.app.config);
    const bitrix = useAppSelector(s => s.app.bitrix);
    const portal = useAppSelector(s => s.portal.portal);

    return useMemo(() => {
        const rows: ChecklistEntityRows = {
            company: bitrix.company as unknown as Record<
                string,
                unknown
            > | null,
            deal: bitrix.deal as unknown as Record<string, unknown> | null,
            lead: bitrix.lead as unknown as Record<string, unknown> | null,
        };

        const isTriggerActive = (trigger: ChecklistTrigger): boolean => {
            if (trigger.kind === 'planType') {
                return isPlanActive && planTypeCode === trigger.planCode;
            }
            if (trigger.kind === 'reportType') {
                return taskEventType === trigger.eventType;
            }
            // targetStage активируется предиктом стадии (Фаза 3).
            return false;
        };

        const checklists = CHECKLIST_CATALOG.filter(
            def =>
                def.presentation === 'inline' &&
                Boolean(config[def.configKey]) &&
                isTriggerActive(def.trigger),
        )
            .map(def => ({
                def,
                fields: def.fields
                    .map(field => resolveChecklistField(field, portal, rows))
                    .filter(
                        (f): f is ResolvedChecklistField => f !== null,
                    )
                    .map(resolved => ({
                        ...resolved,
                        value:
                            overrides[resolved.def.code] ??
                            resolved.currentValue,
                        isMissing:
                            resolved.def.required &&
                            !overrides[resolved.def.code] &&
                            !resolved.currentValue,
                        isSaved: Boolean(overrides[resolved.def.code]),
                        setValue: (value: string) =>
                            dispatch(saveChecklistField(resolved.def, value)),
                    })),
            }))
            // Ни одно поле не установлено — чек-листа нет (самогейт).
            .filter(checklist => checklist.fields.length > 0);

        return { checklists, error };
    }, [
        dispatch,
        error,
        overrides,
        planTypeCode,
        isPlanActive,
        taskEventType,
        config,
        bitrix,
        portal,
    ]);
};
