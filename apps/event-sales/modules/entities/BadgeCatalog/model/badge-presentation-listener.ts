import type { AppStartListening } from '@/modules/app/model/store';
import { afterPresentationActions } from '@/modules/features/AfterPresentation/model/AfterPresentationSlice';
import {
    selectCheckPresentationComment,
    selectIsCheckPresentationApplicable,
} from '@/modules/features/AfterPresentation/lib/check-presentation.selectors';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { setAndSaveComment } from '@/modules/entities/EventReport/model/EventReportThunk';

/**
 * Чек-лист презентации собирает комментарий сам.
 *
 * Подтвердил ответы — текст чек-листа встаёт в комментарий, и требование
 * «напишите комментарий» выполнено без прозы (решение владельца 27.10.2026:
 * то же, что сделали со сводкой «Хвост»). Менеджер может отправить как есть
 * или дописать.
 *
 * Бережно: подставляем только в пустой комментарий или поверх своего же
 * прошлого автотекста (поправил ответы → текст обновился). Написанное рукой
 * не трогаем. В payload текст чек-листа второй раз не дописывается — см.
 * build-flow-payload.
 */
export const startBadgePresentationCommentListener = (
    startAppListening: AppStartListening,
): void => {
    let lastAutoComment = '';

    startAppListening({
        actionCreator: afterPresentationActions.setConfirmed,
        effect: (action, listenerApi) => {
            if (!action.payload.status) return;
            const state = listenerApi.getState();
            if (!selectIsCheckPresentationApplicable(state)) return;

            const text = selectCheckPresentationComment(state).trim();
            if (!text) return;
            const current = state.eventReport.report[EV_REPORT_PROP.COMMENT].trim();
            if (current && current !== lastAutoComment) return;
            if (current === text) return;

            lastAutoComment = text;
            void listenerApi.dispatch(setAndSaveComment(text));
        },
    });
};
