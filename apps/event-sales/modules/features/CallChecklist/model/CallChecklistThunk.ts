import { Bitrix } from '@workspace/bitrix';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { reportFrontError } from '@/modules/shared/front-error';
import { toCrmDate, toCrmDateTime } from '@/modules/shared/lib/crm-date';
import type {
    ChecklistFieldDef,
    ChecklistId,
} from '../type/call-checklist.type';
import {
    resolveChecklistField,
    type ChecklistEntityKind,
    type ResolvedChecklistField,
} from '../lib/checklist-values';
import {
    cancelChecklistSave,
    scheduleChecklistSave,
} from '../lib/checklist-save-queue';
import { getChecklistById } from '../data/checklist-catalog';
import {
    getChecklistMissing,
    selectChecklistRows,
} from '../lib/checklist-selectors';
import { callChecklistActions } from './CallChecklistSlice';

/**
 * Значение контрола → значение портального поля.
 *
 * Даты уходят каноном CRM (`DD.MM.YYYY[ HH:mm:ss]`, тот же, что пишет
 * бэкенд), enum — bitrixId элемента, остальное — как есть. `''` снимает
 * значение. `null` — «писать нечего» (enum без такого элемента,
 * неразбираемая дата): запись отменяется, чужое значение не трогаем.
 */
const toPortalFieldValue = (
    def: ChecklistFieldDef,
    value: string,
    resolved: ResolvedChecklistField,
): string | null => {
    if (!value) return '';
    if (def.type === 'enumeration') {
        const item = resolved.field?.items?.find(i => i.code === value);
        return item ? String(item.bitrixId) : null;
    }
    if (def.type === 'date') return toCrmDate(value);
    if (def.type === 'datetime') return toCrmDateTime(value);
    return value;
};

/**
 * Запись поля чек-листа в портал.
 *
 * crm-канал — пессимистично (паттерн PurchaseSignals/Inn): сначала портал,
 * потом стейт; неудача — честная ошибка, значение-факт на экране не
 * подменяется. CRM — источник правды: значение обязано пережить отмену
 * отправки.
 *
 * dto-канал (продажа) — только стейт: значение уедет в payload отправки,
 * бэк запишет его одной операцией со сменой стадии.
 *
 * Вызывается отложенно (см. changeChecklistField) либо явной очисткой —
 * напрямую из UI больше не зовётся.
 */
export const saveChecklistField =
    (def: ChecklistFieldDef, value: string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        if (def.channel === 'dto') {
            dispatch(
                callChecklistActions.saveSucceeded({ code: def.code, value }),
            );
            return;
        }

        const state = getState();
        const resolved = resolveChecklistField(
            def,
            state.portal.portal,
            selectChecklistRows(state),
        );
        if (!resolved || !resolved.entityId) return;

        const portalValue = toPortalFieldValue(def, value, resolved);
        if (portalValue === null) return;

        const bitrix = Bitrix.getService();
        const update: Record<
            ChecklistEntityKind,
            (id: number, payload: Record<string, string>) => Promise<unknown>
        > = {
            company: (id, payload) =>
                bitrix.company.update(id, payload as never),
            deal: (id, payload) => bitrix.deal.update(id, payload as never),
            lead: (id, payload) => bitrix.lead.update(id, payload as never),
        };

        dispatch(callChecklistActions.saveStarted({ code: def.code }));
        try {
            await update[resolved.entity](resolved.entityId, {
                [resolved.ufKey]: portalValue,
            });
            dispatch(
                callChecklistActions.saveSucceeded({ code: def.code, value }),
            );
        } catch (error) {
            dispatch(
                callChecklistActions.saveFailed({
                    code: def.code,
                    message: 'Значение не сохранилось — попробуйте ещё раз',
                }),
            );
            reportFrontError({
                place: 'call-checklist.save',
                message: error instanceof Error ? error.message : String(error),
                context: { code: def.code },
            });
        }
    };

/**
 * Менеджер изменил поле.
 *
 * Два правила, ради которых это отдельный thunk:
 * 1) запись откладывается (CHECKLIST_SAVE_DEBOUNCE_MS) — серия
 *    правок даёт ОДИН update, а промежуточные состояния ввода в портал не
 *    попадают;
 * 2) ПУСТОЕ значение само в портал не уходит. `<input type="date">` отдаёт
 *    `''` на каждом незавершённом вводе, и прежняя запись «как есть» стирала
 *    стоявшую в CRM дату. Стереть значение можно только явно —
 *    {@link clearChecklistField} (кнопка у заполненного поля).
 *
 * dto-канал пишется сразу: там нет ни запроса, ни чужого значения, которое
 * можно затереть, — только payload отправки.
 */
export const changeChecklistField =
    (def: ChecklistFieldDef, value: string) => (dispatch: AppDispatch) => {
        dispatch(callChecklistActions.setDraft({ code: def.code, value }));

        if (def.channel === 'dto') {
            cancelChecklistSave(def.code);
            dispatch(
                callChecklistActions.saveSucceeded({ code: def.code, value }),
            );
            return;
        }

        if (!value) {
            cancelChecklistSave(def.code);
            return;
        }

        scheduleChecklistSave(def.code, () => {
            void dispatch(saveChecklistField(def, value));
        });
    };

/** Явная очистка поля — единственный путь, которым в портал уходит пустота. */
export const clearChecklistField =
    (def: ChecklistFieldDef) => async (dispatch: AppDispatch) => {
        cancelChecklistSave(def.code);
        dispatch(callChecklistActions.setDraft({ code: def.code, value: '' }));
        await dispatch(saveChecklistField(def, ''));
    };

/**
 * Строка базовой сделки для «текущих значений» стадийных чек-листов:
 * во встройке-компании сделки в сторе нет — тянем по predict.baseDealId.
 * Ошибка не блокирует: чек-лист покажет поля без текущих значений.
 */
export const ensureChecklistBaseDeal =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        if (state.app.bitrix.deal) return;
        const baseDealId = state.stagePredict.result?.baseDealId;
        if (!baseDealId) return;
        const current = state.callChecklist.baseDeal;
        if (
            current.id === baseDealId &&
            (current.status === 'ready' || current.status === 'loading')
        ) {
            return;
        }

        dispatch(callChecklistActions.baseDealPending({ id: baseDealId }));
        try {
            const row = await Bitrix.getService().deal.get(baseDealId);
            if (row && typeof row === 'object') {
                dispatch(
                    callChecklistActions.baseDealLoaded({
                        id: baseDealId,
                        row: row as unknown as Record<string, unknown>,
                    }),
                );
            } else {
                dispatch(
                    callChecklistActions.baseDealFailed({ id: baseDealId }),
                );
            }
        } catch (error) {
            console.warn('checklist base deal load failed', error);
            dispatch(callChecklistActions.baseDealFailed({ id: baseDealId }));
        }
    };

/** Открыть модальный чек-лист (шаг цепочки send). */
export const openCallChecklist =
    (id: ChecklistId) => async (dispatch: AppDispatch) => {
        await dispatch(ensureChecklistBaseDeal());
        dispatch(callChecklistActions.modalOpened({ id }));
    };

/**
 * Подтверждение модалки: обязательные поля закрыты → confirmed → закрыть →
 * если отправка ждала (pendingSend) — продолжить send() ленивым импортом
 * (паттерн AfterPresentation, против цикла модулей). Повторный проход
 * send() откроет СЛЕДУЮЩИЙ неподтверждённый чек-лист или отправит.
 */
export const confirmCallChecklist =
    (id: ChecklistId) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const def = getChecklistById(id);
        if (!def) return;
        const missing = getChecklistMissing(getState(), def);
        if (missing.length > 0) return; // кнопка и так задизейблена

        dispatch(callChecklistActions.setConfirmed({ id }));
        dispatch(callChecklistActions.modalClosed());

        const pending = getState().callChecklist.pendingSend;
        if (pending) {
            dispatch(callChecklistActions.setPendingSend({ status: false }));
            const { send } = await import(
                '@/modules/processes/event/model/SendThunk'
            );
            dispatch(send());
        }
    };

/** Отмена модалки: отправка прервана, менеджер вернулся на форму. */
export const cancelCallChecklist = () => async (dispatch: AppDispatch) => {
    dispatch(callChecklistActions.modalClosed());
    dispatch(callChecklistActions.setPendingSend({ status: false }));
};
