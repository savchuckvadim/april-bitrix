import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { eventHistoryActions, EVHistoryItem } from './EVHistorySlice';
import { HistoryHelper } from '../lib/api/history-helper';

const historyHelper = new HistoryHelper();

/** История звонков/комментариев по компании. */
export const getEventSalesHistory =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        if (state.eventHistory.isLoading) return;

        const companyId = Number(state.app.bitrix.company?.ID || 0);
        const domain = state.app.domain;
        if (!companyId || !domain) return;

        dispatch(eventHistoryActions.setIsLoading({ status: true }));
        try {
            const result = (await historyHelper.getCompanyHistory({
                domain,
                companyId,
            })) as EVHistoryItem[] | null;
            dispatch(eventHistoryActions.setFetchedHistory({ history: result ?? [] }));
        } catch (error) {
            console.error('getEventSalesHistory error', error);
            dispatch(eventHistoryActions.setIsLoading({ status: false }));
        }
    };
