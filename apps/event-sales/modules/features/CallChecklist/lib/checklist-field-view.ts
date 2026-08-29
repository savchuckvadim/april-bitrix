import type { Portal } from '@workspace/pbx';
import type {
    ChecklistDef,
    ChecklistFieldRef,
} from '../type/call-checklist.type';
import {
    checklistFieldRefs,
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

/**
 * Ответы, черновики и «пишется прямо сейчас» — все три по ключу ответа
 * («набор:вопрос»), а не по коду поля: одно поле спрашивается в разных
 * наборах и делить состояние между ними нельзя.
 */
export interface ChecklistFieldViewInput {
    portal: Portal | null | undefined;
    rows: ChecklistEntityRows;
    /** Записанные значения (факт: портал принял). */
    saved: Record<string, string>;
    /** Набранное, ещё не записанное. */
    drafts: Record<string, string>;
    savingKeys: Record<string, boolean>;
    /**
     * Снимок значений CRM на момент появления вопроса — читают только
     * пункты с «обязательностью изменения» (`requireChange`).
     */
    baseline: Record<string, string>;
    onChange: (ref: ChecklistFieldRef, value: string) => void;
    onClear: (ref: ChecklistFieldRef) => void;
}

export const buildChecklistFieldViews = (
    def: ChecklistDef,
    input: ChecklistFieldViewInput,
): ChecklistFieldView[] =>
    checklistFieldRefs(def)
        .map(ref => resolveChecklistField(ref, input.portal, input.rows))
        .filter((f): f is ResolvedChecklistField => f !== null)
        .map(resolved => {
            const key = resolved.answerKey;
            const saved = input.saved[key];
            const value = input.drafts[key] ?? saved ?? resolved.currentValue;
            return {
                ...resolved,
                value,
                isMissing: isChecklistFieldMissing(
                    resolved,
                    saved,
                    input.baseline[key],
                ),
                isSaved: Boolean(saved),
                isSaving: Boolean(input.savingKeys[key]),
                canClear: Boolean(value),
                setValue: (next: string) => input.onChange(resolved, next),
                clear: () => input.onClear(resolved),
            };
        });
