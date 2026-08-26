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

/**
 * Носители полей чек-листа. Единственное место, где решается, откуда берётся
 * строка сделки — из стора или из лениво догруженной базовой (встройка-
 * компания): у инлайн-хука раньше была своя копия БЕЗ этого фолбэка, и
 * карточка не показывала чек-лист, который окно предпроверки требовало
 * заполнить (дедлок).
 */
export const selectChecklistRows = (state: RootState): ChecklistEntityRows => ({
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

/**
 * Инлайн-блоки конкретной колонки. `place` не задан — колонка плана
 * (поведение прежнего каталога): вопросы отчёта появились позже и
 * объявляют место явно.
 */
export const selectInlineChecklistsAt = (
    state: RootState,
    place: 'plan' | 'report',
): ChecklistDef[] =>
    selectActiveChecklists(state).filter(
        def =>
            def.presentation === 'inline' && (def.place ?? 'plan') === place,
    );

/**
 * ВСЕ инлайн-блоки обеих колонок — для валидации отправки: обязательное
 * поле обязано блокировать отправку независимо от того, в какой колонке
 * его спрашивают.
 */
export const selectInlineChecklists = (state: RootState): ChecklistDef[] =>
    selectActiveChecklists(state).filter(def => def.presentation === 'inline');

/** Резолв полей чек-листа: неустановленные на портале поля выпадают. */
export const resolveChecklistFields = (
    state: RootState,
    def: ChecklistDef,
): ResolvedChecklistField[] =>
    def.fields
        .map(field =>
            resolveChecklistField(
                field,
                state.portal.portal,
                selectChecklistRows(state),
            ),
        )
        .filter((f): f is ResolvedChecklistField => f !== null);

/**
 * Обязательное поле не закрыто: нет ни сохранённого менеджером значения,
 * ни ГОДНОГО текущего значения в CRM. Единственное определение «не
 * заполнено» — его зовут и валидация отправки, и карточка (подсветка поля).
 */
export const isChecklistFieldMissing = (
    resolved: ResolvedChecklistField,
    savedValue: string | undefined,
): boolean => {
    if (!resolved.def.required) return false;
    if (savedValue) return false;
    if (!resolved.currentValue) return true;
    return isChecklistValueStale(resolved);
};

/**
 * Значение из CRM просрочено: смысл требования — «счёт выставлен ПЕРЕД
 * этим звонком», а не «когда-нибудь». Без срока годности счёт годичной
 * давности закрывал чек-лист оплаты, и звонок планировался без реального
 * счёта.
 *
 * Работает только для дат: там значение само себе отметка времени. У
 * справочников и строк узнать возраст ответа неоткуда — они не стареют.
 */
const isChecklistValueStale = (resolved: ResolvedChecklistField): boolean => {
    const days = resolved.def.staleAfterDays;
    if (!days) return false;
    if (resolved.def.type !== 'date' && resolved.def.type !== 'datetime') {
        return false;
    }
    const filledAt = parseChecklistDate(resolved.currentValue);
    if (!filledAt) return false;
    const ageDays = (Date.now() - filledAt) / MS_IN_DAY;
    return ageDays > days;
};

const MS_IN_DAY = 24 * 60 * 60 * 1000;

/**
 * Дата значения контрола (`YYYY-MM-DD[THH:mm]`) в миллисекунды. Разбор
 * лексический: значение — настенная дата портала, и прогон через
 * часовой пояс браузера сдвигал бы полуночные даты на сутки.
 */
const parseChecklistDate = (value: string): number | null => {
    const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(
        value,
    );
    if (!match) return null;
    const [, year, month, day, hours = '0', minutes = '0'] = match;
    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
    ).getTime();
};

/**
 * Незакрытые обязательные поля чек-листа. Поле, не установленное на портале,
 * отправку не блокирует (его физически некуда писать).
 */
export const getChecklistMissing = (
    state: RootState,
    def: ChecklistDef,
): ChecklistFieldDef[] =>
    resolveChecklistFields(state, def)
        .filter(resolved =>
            isChecklistFieldMissing(
                resolved,
                state.callChecklist.valueByCode[resolved.def.code],
            ),
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
