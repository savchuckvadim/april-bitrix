import { Bitrix } from '@workspace/bitrix';
import type { AppThunk, RootState } from '@/modules/app/model/store';
import { fetchRelatedDetails } from '@/modules/entities/RelatedCrm/model/RelatedCrmThunk';
import { LeadRequestHelper } from '../lib/api/lead-request-helper';
import type { LeadRequestUpdate } from './index';
import { leadRequestActions } from './LeadRequestSlice';

const helper = new LeadRequestHelper();

/** Лид карточки: явный аргумент → лид встройки → лид текущей задачи. */
const resolveLeadId = (
    state: RootState,
    explicitLeadId?: number,
): number | null => {
    if (explicitLeadId && explicitLeadId > 0) return explicitLeadId;
    const contextLead = Number(state.app.bitrix.lead?.ID);
    if (Number.isFinite(contextLead) && contextLead > 0) return contextLead;
    const taskLead = Number(state.eventLead.lead?.ID);
    if (Number.isFinite(taskLead) && taskLead > 0) return taskLead;
    return null;
};

/**
 * Загрузка карточки заявки; без лида в контексте — тихий no-op.
 *
 * НАМЕРЕННО без кэш-скипа: принятие/передача меняют isAccepted на бэке
 * (после передачи другому принимать нужно ЗАНОВО), и фронт обязан
 * считывать необходимость принять свежей при каждом монтировании панели.
 * Бэк-ручка лёгкая (один lead.get), частота — открытие экрана.
 */
export const fetchLeadRequestCard =
    (explicitLeadId?: number): AppThunk =>
    async (dispatch, getState) => {
        const state = getState();
        const leadId = resolveLeadId(state, explicitLeadId);
        if (!leadId) return;
        // Дедуп: слот уже держит этого лида — не перетираем его же
        // повторным запросом (иконка и гейт часто просят одно и то же).
        const held = state.leadRequest;
        if (
            held.leadId === leadId &&
            (held.status === 'loading' || held.status === 'ready')
        ) {
            return;
        }
        dispatch(leadRequestActions.setLoading(leadId));
        try {
            const card = await helper.getCard(state.app.domain, leadId);
            // Пока ждали, слот запросили под другого лида — опоздавший
            // ответ выбрасываем, иначе карточка одного показывалась бы
            // под именем другого.
            if (getState().leadRequest.leadId !== leadId) return;
            dispatch(leadRequestActions.setCard(card));
        } catch (error) {
            if (getState().leadRequest.leadId !== leadId) return;
            dispatch(
                leadRequestActions.setError(
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить заявку',
                ),
            );
        }
    };

/**
 * Принятие заявки текущим пользователем (кнопка «Принять в работу»):
 * бэк идемпотентен, после — перечитка карточки (isAccepted, история).
 */
export const acceptLeadRequest = (): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const leadId = state.leadRequest.leadId;
    if (!leadId) return;
    dispatch(leadRequestActions.setSaving(true));
    try {
        const userId = Number(state.app.bitrix.user?.ID) || undefined;
        await helper.accept(state.app.domain, leadId, userId);
        const card = await helper.getCard(state.app.domain, leadId);
        dispatch(leadRequestActions.setCard(card));
    } catch (error) {
        dispatch(
            leadRequestActions.setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось принять заявку',
            ),
        );
    } finally {
        dispatch(leadRequestActions.setSaving(false));
    }
};

/** Задержка перечитки после операций хуков: они идут через очередь. */
const TRANSFER_REFETCH_DELAY_MS = 2500;

/**
 * «Передать другому»: повторный ХО без responsible — бэк выберет
 * следующего в отделе передающего (сам он исключён) и подсветит
 * самопередачу в истории. Карточка перечитывается с задержкой —
 * операция выполняется воркером очереди.
 */
export const transferLeadRequest =
    (targetUserId?: number | null): AppThunk =>
    async (dispatch, getState) => {
        const state = getState();
        const leadId = state.leadRequest.leadId;
        const userId = Number(state.app.bitrix.user?.ID);
        if (!leadId || !userId) return;
        dispatch(leadRequestActions.setSaving(true));
        try {
            await helper.transfer(
                state.app.domain,
                leadId,
                userId,
                targetUserId,
            );
            await new Promise(resolve =>
                setTimeout(resolve, TRANSFER_REFETCH_DELAY_MS),
            );
            const card = await helper.getCard(state.app.domain, leadId);
            dispatch(leadRequestActions.setCard(card));
        } catch (error) {
            dispatch(
                leadRequestActions.setError(
                    error instanceof Error
                        ? error.message
                        : 'Не удалось передать заявку',
                ),
            );
        } finally {
            dispatch(leadRequestActions.setSaving(false));
        }
    };

/**
 * «Преобразовать в работу»: лид без основной сделки → хук lead-to-work
 * (from_lead, задачи переносятся). Операция в очереди — карточка
 * перечитывается с задержкой, связи (baseDealId) приезжают ей.
 */
export const convertLeadToWork = (): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const leadId = state.leadRequest.leadId;
    if (!leadId) return;
    dispatch(leadRequestActions.setSaving(true));
    try {
        const userId = Number(state.app.bitrix.user?.ID) || undefined;
        await helper.convertToWork(state.app.domain, leadId, userId);
        await new Promise(resolve =>
            setTimeout(resolve, TRANSFER_REFETCH_DELAY_MS),
        );
        const card = await helper.getCard(state.app.domain, leadId);
        dispatch(leadRequestActions.setCard(card));
    } catch (error) {
        dispatch(
            leadRequestActions.setError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось преобразовать лид в работу',
            ),
        );
    } finally {
        dispatch(leadRequestActions.setSaving(false));
    }
};

/**
 * Глубокая проверка дублей с итогом в timeline лида (duplicate-check хук).
 * Карточка перечитывается с задержкой — маркеры дублей мог обновить хук.
 */
export const runDeepDuplicateCheck =
    (): AppThunk => async (dispatch, getState) => {
        const state = getState();
        const leadId = state.leadRequest.leadId;
        if (!leadId) return;
        dispatch(leadRequestActions.setSaving(true));
        try {
            await helper.deepDuplicateCheck(state.app.domain, leadId);
            await new Promise(resolve =>
                setTimeout(resolve, TRANSFER_REFETCH_DELAY_MS),
            );
            const card = await helper.getCard(state.app.domain, leadId);
            dispatch(leadRequestActions.setCard(card));
        } catch (error) {
            dispatch(
                leadRequestActions.setError(
                    error instanceof Error
                        ? error.message
                        : 'Не удалось запустить проверку дублей',
                ),
            );
        } finally {
            dispatch(leadRequestActions.setSaving(false));
        }
    };

/**
 * Смена битриксовской стадии лида (STATUS_ID) из панели заявки.
 *
 * Пишем напрямую в портал типизированным сервисом; после успеха — оверрайд
 * в слайсе (полоска обновляется мгновенно) и перечитка графа связей, чтобы
 * миниатюры лидов в шапке и карточках показали ту же стадию.
 */
export const changeLeadBitrixStage =
    (leadId: number, statusId: string): AppThunk =>
    async dispatch => {
        if (!leadId || !statusId) return;
        dispatch(leadRequestActions.setSaving(true));
        try {
            await Bitrix.getService().lead.update(leadId, {
                STATUS_ID: statusId,
            });
            dispatch(leadRequestActions.setBitrixStage({ leadId, statusId }));
            await dispatch(fetchRelatedDetails({ force: true }));
        } catch (error) {
            dispatch(
                leadRequestActions.setError(
                    error instanceof Error
                        ? error.message
                        : 'Не удалось изменить стадию лида',
                ),
            );
        } finally {
            dispatch(leadRequestActions.setSaving(false));
        }
    };

/**
 * Правка карточки: пессимистичное сохранение (бэк валидирует «Не ЦА без
 * типа» → 400) с перечитыванием карточки — история и readiness приходят
 * пересчитанными.
 */
export const saveLeadRequest =
    (patch: Omit<LeadRequestUpdate, 'domain' | 'leadId'>): AppThunk =>
    async (dispatch, getState) => {
        const state = getState();
        const leadId = state.leadRequest.leadId;
        if (!leadId) return;
        dispatch(leadRequestActions.setSaving(true));
        try {
            await helper.update({
                domain: state.app.domain,
                leadId,
                ...patch,
            });
            const card = await helper.getCard(state.app.domain, leadId);
            dispatch(leadRequestActions.setCard(card));
        } catch (error) {
            dispatch(
                leadRequestActions.setError(
                    error instanceof Error
                        ? error.message
                        : 'Не удалось сохранить заявку',
                ),
            );
        } finally {
            dispatch(leadRequestActions.setSaving(false));
        }
    };
