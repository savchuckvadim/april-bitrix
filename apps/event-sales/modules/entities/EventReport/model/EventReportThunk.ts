import type {
    AppDispatch,
    AppGetState,
    RootState,
} from '@/modules/app/model/store';
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
    (comment: string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
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

/**
 * Восстановление черновика комментария при инициализации процесса.
 *
 * Только в ПУСТУЮ форму. Init перезапускается после каждой отправки
 * (`reloadApp`), и менеджер к этому моменту нередко уже печатает
 * комментарий к следующей задаче той же компании: ключ черновика знает
 * компанию и пользователя, но не задачу, и восстановление поверх набранного
 * подменяло бы живой текст сохранённым 400 мс назад.
 */
export const getSavedComment =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const { domain, key } = getCommentContext(getState());
        const saved = await getFromLocalStorage(key, domain);
        if (!saved) return;
        if (getState().eventReport.report[EV_REPORT_PROP.COMMENT]) return;
        dispatch(
            eventReportActions.setReportProp({
                propName: EV_REPORT_PROP.COMMENT,
                value: String(saved),
            }),
        );
    };

/**
 * Черновик в localStorage стирается, форма НЕ трогается.
 *
 * Зовётся в момент, когда отчёт принят к доставке: черновик потреблён, и
 * держать его дальше — значит вернуть отправленный комментарий в форму
 * следующего отчёта. Именно так и происходило: очистка формы (`cleanEvent`)
 * идёт по `done` поллинга и пропускается, если менеджер до этого открыл
 * другую задачу той же компании (clean-after-send) — черновик переживал
 * отправку, а `reloadApp` → `getSavedComment` возвращал его в форму.
 *
 * Состояние формы остаётся на своём месте: при ошибке доставки «Повторить»
 * шлёт комментарий из стейта, а не из черновика.
 */
export const clearCommentDraft =
    () => async (_dispatch: AppDispatch, getState: AppGetState) => {
        const { key } = getCommentContext(getState());
        await clearFromLocalStorage(key);
    };

/** Очистка черновика И формы после успешной отправки. */
export const clearComment =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        await dispatch(clearCommentDraft());
        dispatch(
            eventReportActions.setReportProp({
                propName: EV_REPORT_PROP.COMMENT,
                value: '',
            }),
        );
    };
