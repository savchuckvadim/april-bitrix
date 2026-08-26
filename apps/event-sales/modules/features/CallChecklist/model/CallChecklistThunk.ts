import { Bitrix } from '@workspace/bitrix';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { reportFrontError } from '@/modules/shared/front-error';
import type {
    ChecklistFieldDef,
    ChecklistId,
} from '../type/call-checklist.type';
import {
    resolveChecklistField,
    type ChecklistEntityKind,
    type ChecklistEntityRows,
} from '../lib/checklist-values';
import { getChecklistById } from '../data/checklist-catalog';
import { getChecklistMissing } from '../lib/checklist-selectors';
import { callChecklistActions } from './CallChecklistSlice';

const entityRows = (state: {
    app: { bitrix: { company: unknown; deal: unknown; lead: unknown } };
    callChecklist: { baseDeal: { row: Record<string, unknown> | null } };
}): ChecklistEntityRows => ({
    company: state.app.bitrix.company as Record<string, unknown> | null,
    deal:
        (state.app.bitrix.deal as Record<string, unknown> | null) ??
        state.callChecklist.baseDeal.row,
    lead: state.app.bitrix.lead as Record<string, unknown> | null,
});

/**
 * Запись поля чек-листа.
 *
 * crm-канал — пессимистично (паттерн PurchaseSignals/Inn): сначала портал,
 * потом стейт; неудача — честная ошибка, значение на экране не подменяется.
 * CRM — источник правды: значение обязано пережить отмену отправки.
 *
 * dto-канал (продажа) — только стейт: значение уедет в payload отправки,
 * бэк запишет его одной операцией со сменой стадии.
 */
export const saveChecklistField =
    (def: ChecklistFieldDef, value: string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        if (def.channel === 'dto') {
            dispatch(callChecklistActions.setValue({ code: def.code, value }));
            return;
        }

        const state = getState();
        const resolved = resolveChecklistField(
            def,
            state.portal.portal,
            entityRows(state),
        );
        if (!resolved || !resolved.entityId) return;

        // enum пишется bitrixId item'а; '' снимает значение.
        let portalValue = value;
        if (def.type === 'enumeration' && value) {
            const item = resolved.field?.items?.find(i => i.code === value);
            if (!item) return;
            portalValue = String(item.bitrixId);
        }

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

        dispatch(callChecklistActions.setError({ message: null }));
        try {
            await update[resolved.entity](resolved.entityId, {
                [resolved.ufKey]: portalValue,
            });
            dispatch(callChecklistActions.setValue({ code: def.code, value }));
        } catch (error) {
            dispatch(
                callChecklistActions.setError({
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
