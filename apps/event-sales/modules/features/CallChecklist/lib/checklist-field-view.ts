import type { Portal } from '@workspace/pbx';
import type { ChecklistDef, ChecklistFieldDef } from '../type/call-checklist.type';
import {
    resolveChecklistField,
    type ChecklistEntityRows,
    type ResolvedChecklistField,
} from './checklist-values';
import { isChecklistFieldMissing } from './checklist-selectors';

/**
 * Вьюха поля чек-листа для контролов — одна на инлайн-карточку и на модалку.
 *
 * Раньше каждый хук собирал её сам, и «одно и то же поле» в двух местах
 * различалось правилами (у инлайна не было фолбэка на базовую сделку).
 * Здесь чистая сборка: состояние поля + колбэки, никаких подписок.
 */
export interface ChecklistFieldView extends ResolvedChecklistField {
    /** Что показывает контрол: черновик → записанное → текущее из CRM. */
    value: string;
    /** Обязательное и не закрыто ни ответом, ни значением CRM. */
    isMissing: boolean;
    /** Менеджер уже записал значение в этой сессии. */
    isSaved: boolean;
    /** Запись прямо сейчас идёт в портал. */
    isSaving: boolean;
    /** Есть что стирать — можно предложить явную очистку. */
    canClear: boolean;
    setValue: (value: string) => void;
    clear: () => void;
}

export interface ChecklistFieldViewInput {
    portal: Portal | null | undefined;
    rows: ChecklistEntityRows;
    /** Записанные значения (факт: портал принял). */
    saved: Record<string, string>;
    /** Набранное, ещё не записанное. */
    drafts: Record<string, string>;
    savingCodes: Record<string, boolean>;
    onChange: (def: ChecklistFieldDef, value: string) => void;
    onClear: (def: ChecklistFieldDef) => void;
}

export const buildChecklistFieldViews = (
    def: ChecklistDef,
    input: ChecklistFieldViewInput,
): ChecklistFieldView[] =>
    def.fields
        .map(field => resolveChecklistField(field, input.portal, input.rows))
        .filter((f): f is ResolvedChecklistField => f !== null)
        .map(resolved => {
            const code = resolved.def.code;
            const saved = input.saved[code];
            const value = input.drafts[code] ?? saved ?? resolved.currentValue;
            return {
                ...resolved,
                value,
                isMissing: isChecklistFieldMissing(resolved, saved),
                isSaved: Boolean(saved),
                isSaving: Boolean(input.savingCodes[code]),
                canClear: Boolean(value),
                setValue: (next: string) => input.onChange(resolved.def, next),
                clear: () => input.onClear(resolved.def),
            };
        });
