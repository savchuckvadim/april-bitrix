import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { getDuplicateContext } from '@/modules/app/lib/utills/app-state-util';
import { ClientWorkHelper } from '../lib/api/client-work-helper';
import { summarizeJoin } from '../lib/client-work-selection';
import { toClientWorkErrorText } from '../lib/client-work-error';
import { clientWorkActions } from './ClientWorkSlice';
import type { ClientWorkJoinOperationResult } from './index';

const helper = new ClientWorkHelper();

/** Сотрудник фрейма — от него сервер решает, можно ли присоединять. */
const currentUserId = (getState: AppGetState): number =>
    Number(getState().app.bitrix.user?.ID ?? 0);

/** Открытые сделки клиента текущей сделки; не сделка — ничего не делаем. */
export const fetchClientWork =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const domain = state.app.domain;
        const dealId = getDuplicateContext(state).dealId;
        const userId = currentUserId(getState);
        if (!domain || !dealId || userId <= 0) return;

        dispatch(clientWorkActions.loadStarted({ dealId }));
        try {
            const data = await helper.load({ domain, dealId, userId });
            dispatch(clientWorkActions.loadSucceeded({ data }));
        } catch (error) {
            dispatch(
                clientWorkActions.loadFailed({
                    message: toClientWorkErrorText(error),
                }),
            );
        }
    };

/**
 * Присоединить отмеченные к основной. Права проверяет сервер (403 —
 * понятный текст); подтверждение — в UI двухшаговой кнопкой. После успеха
 * список перечитывается: присоединённые закрыты «Дублем» и из него уходят.
 */
export const joinClientWork =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const domain = state.app.domain;
        const { mainDealId, selectedIds } = state.clientWork;
        const initiatorUserId = currentUserId(getState);
        if (!domain || !mainDealId || !selectedIds.length) return;

        dispatch(clientWorkActions.joinStarted());
        try {
            const operation = await helper.join({
                domain,
                mainDealId,
                dealIds: selectedIds,
                initiatorUserId,
            });
            if (operation.status === 'failed') {
                throw new Error(
                    operation.error || 'Присоединение завершилось с ошибкой',
                );
            }
            dispatch(
                clientWorkActions.joinSucceeded({
                    summary: summarizeJoin(
                        mainDealId,
                        (operation.result ??
                            null) as ClientWorkJoinOperationResult | null,
                    ),
                }),
            );
            await dispatch(fetchClientWork());
        } catch (error) {
            dispatch(
                clientWorkActions.joinFailed({
                    message: toClientWorkErrorText(error),
                }),
            );
        }
    };
