import { AppDispatch, AppGetState, RootState } from '@/modules/app/model/store';
import {
    clearFromLocalStorage,
    getFromLocalStorage,
    saveToLocalStorage,
} from '@workspace/api';
import { getIsLeadContext } from '@/modules/app/lib/utills/app-state-util';
import { EV_REPORT_PROP } from '../type/event-report-type';
import { eventReportActions } from './EventReportSlice';
import { getCommentKey } from '../lib/event-comment-util';

const getCommentContext = (state: RootState) => {
    const isLeadContext = getIsLeadContext(state);
    const app = state.app;
    return {
        domain: app.domain,
        key: getCommentKey(
            app.domain,
            isLeadContext,
            isLeadContext ? app.bitrix.lead?.ID : null,
            !isLeadContext ? app.bitrix.company?.ID : null,
            app.bitrix.user?.ID,
        ),
    };
};

let saveCommentTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Черновик комментария живёт в шифрованном localStorage — переживает закрытие
 * виджета. Состояние обновляется сразу, запись в storage — с debounce 400мс
 * (не шифруем на каждый keystroke).
 */
export const setAndSaveComment =
    (comment: string) => async (dispatch: AppDispatch, getState: AppGetState) => {
        dispatch(
            eventReportActions.setReportProp({
                propName: EV_REPORT_PROP.COMMENT,
                value: comment,
            }),
        );

        if (saveCommentTimer) clearTimeout(saveCommentTimer);
        saveCommentTimer = setTimeout(() => {
            const { domain, key } = getCommentContext(getState());
            saveToLocalStorage(key, comment, domain);
        }, 400);
    };

/** Восстановление черновика комментария при инициализации процесса. */
export const getSavedComment =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const { domain, key } = getCommentContext(getState());
        const saved = await getFromLocalStorage(key, domain);
        if (saved) {
            dispatch(
                eventReportActions.setReportProp({
                    propName: EV_REPORT_PROP.COMMENT,
                    value: String(saved),
                }),
            );
        }
    };

/** Очистка черновика после успешной отправки. */
export const clearComment =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const { key } = getCommentContext(getState());
        clearFromLocalStorage(key);
        dispatch(
            eventReportActions.setReportProp({
                propName: EV_REPORT_PROP.COMMENT,
                value: '',
            }),
        );
    };
