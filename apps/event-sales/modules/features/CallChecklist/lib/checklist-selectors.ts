import type { RootState } from '@/modules/app/model/store';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan/type/event-plan-type';
import { CHECKLIST_CATALOG } from '../data/checklist-catalog';
import type {
    ChecklistDef,
    ChecklistFieldDef,
    ChecklistTrigger,
} from '../type/call-checklist.type';
import {
    resolveChecklistField,
    type ChecklistEntityRows,
    type ResolvedChecklistField,
} from './checklist-values';

/**
 * Активность чек-листов и незакрытые обязательные поля — чистые функции
 * над RootState: их зовут и UI (карточка в плане), и send-validation.
 */

const entityRows = (state: RootState): ChecklistEntityRows => ({
    company: state.app.bitrix.company as unknown as Record<
        string,
        unknown
    > | null,
    // Встройка-компания: сделки в сторе нет — текущие значения берутся из
    // строки базовой сделки, лениво догруженной по predict.baseDealId.
    deal:
        (state.app.bitrix.deal as unknown as Record<string, unknown> | null) ??
        state.callChecklist.baseDeal.row,
    lead: state.app.bitrix.lead as unknown as Record<string, unknown> | null,
});

const isTriggerActive = (
    trigger: ChecklistTrigger,
    state: RootState,
): boolean => {
    if (trigger.kind === 'planType') {
        const plan = state.eventPlan;
        return (
            plan[EV_PLAN_PROP.IS_ACTIVE] &&
            plan[EV_PLAN_PROP.TYPE].current?.code === trigger.planCode
        );
    }
    if (trigger.kind === 'reportType') {
        return state.eventTask.current?.eventType === trigger.eventType;
    }
    // Отправка двинет основную сделку на эту стадию — знает только предикт
    // (лестница живёт на бэке). Нет предикта — чек-лист молчит.
    return state.stagePredict.result?.targetStageCode === trigger.stageCode;
};

/** Чек-листы, активные сейчас (конфиг портала + триггер). */
export const selectActiveChecklists = (state: RootState): ChecklistDef[] =>
    CHECKLIST_CATALOG.filter(
        def =>
            Boolean(state.app.config[def.configKey]) &&
            isTriggerActive(def.trigger, state),
    );

export const selectInlineChecklists = (state: RootState): ChecklistDef[] =>
    selectActiveChecklists(state).filter(def => def.presentation === 'inline');

/** Резолв полей чек-листа: неустановленные на портале поля выпадают. */
export const resolveChecklistFields = (
    state: RootState,
    def: ChecklistDef,
): ResolvedChecklistField[] =>
    def.fields
        .map(field =>
            resolveChecklistField(field, state.portal.portal, entityRows(state)),
        )
        .filter((f): f is ResolvedChecklistField => f !== null);

/**
 * Незакрытые обязательные поля: нет ни сохранённого менеджером значения,
 * ни текущего значения в CRM. Поле, не установленное на портале, отправку
 * не блокирует (его физически некуда писать).
 */
export const getChecklistMissing = (
    state: RootState,
    def: ChecklistDef,
): ChecklistFieldDef[] =>
    resolveChecklistFields(state, def)
        .filter(
            resolved =>
                resolved.def.required &&
                !state.callChecklist.valueByCode[resolved.def.code] &&
                !resolved.currentValue,
        )
        .map(resolved => resolved.def);

/** Инлайн-чек-листы с незакрытыми полями — для send-validation/preflight. */
export const selectIncompleteInlineChecklists = (
    state: RootState,
): ChecklistDef[] =>
    selectInlineChecklists(state).filter(
        def => getChecklistMissing(state, def).length > 0,
    );

export const selectModalChecklists = (state: RootState): ChecklistDef[] =>
    selectActiveChecklists(state).filter(def => def.presentation === 'modal');

/**
 * Следующий модальный чек-лист для цепочки send(): активный, с
 * резолвящимися полями и либо не подтверждён, либо остались незакрытые
 * обязательные. Подтверждённые пропускаются (идемпотентный re-entry) —
 * поэтому «модалки одна за другой» получаются сами: confirm → send() →
 * открылся следующий.
 */
export const selectNextPendingChecklist = (
    state: RootState,
): ChecklistDef | null =>
    selectModalChecklists(state).find(
        def =>
            resolveChecklistFields(state, def).length > 0 &&
            (!state.callChecklist.confirmed[def.id] ||
                getChecklistMissing(state, def).length > 0),
    ) ?? null;
