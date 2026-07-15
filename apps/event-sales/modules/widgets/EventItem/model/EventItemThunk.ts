import { AppDispatch } from '@/modules/app/model/store';
import { eventTaskActions } from '@/modules/entities/EventTask';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { setCurrentReportContact } from '@/modules/entities/EventContact/model/EventContactThunk';
import { fetchLead } from '@/modules/entities/EVLid';
import { eventSaleActions, getInitSale } from '@/modules/entities/EventSale';
import {
    PresentationProp,
    eventPresentationActions,
} from '@/modules/entities/EventPresentation';
import { eventPostFailActions } from '@/modules/entities/EVPostFail';
import { preloaderActions } from '@/modules/shared/Preloader';
import { EventItemResultType, eventItemActions } from './EventItemSlice';

/**
 * Открытие меню результата по событию (переход List → Item).
 * Навигация — на вызывающей стороне через useEventNavigation().toItem().
 */
export const getResultMenu =
    (type: EventItemResultType, task: EventTask | null) =>
    async (dispatch: AppDispatch) => {
        dispatch(preloaderActions.setPreloader({ status: true }));

        dispatch(fetchLead(task));
        dispatch(getInitSale(task ? [task] : []));

        dispatch(eventTaskActions.setCurrentTask({ task }));
        dispatch(setCurrentReportContact(task));
        dispatch(
            eventItemActions.setEventItemMenuStatus({
                status: true,
                menuType: type,
            }),
        );

        // презентация с результатом — сразу отмечаем проведённой
        if (task?.eventType === 'presentation' && type === EventItemResultType.RESULT) {
            dispatch(
                eventPresentationActions.setPresentationProp({
                    name: PresentationProp.IS_PRESENTATION_DONE,
                    value: true,
                }),
            );
        }

        dispatch(preloaderActions.setPreloader({ status: false }));
    };

/** Отмена меню результата (возврат Item → List); навигация — на вызывающей стороне. */
export const cancelResultMenu = () => async (dispatch: AppDispatch) => {
    dispatch(eventTaskActions.setCurrentTask({ task: null }));
    dispatch(
        eventItemActions.setEventItemMenuStatus({ status: false, menuType: null }),
    );
    dispatch(eventPresentationActions.clean());
    dispatch(eventPostFailActions.clean());
};

/** Завершение (после успешной отправки, Item → Finish); навигация — на вызывающей стороне. */
export const finishResultMenu = () => async (dispatch: AppDispatch) => {
    dispatch(eventTaskActions.setCurrentTask({ task: null }));
    dispatch(
        eventItemActions.setEventItemMenuStatus({ status: false, menuType: null }),
    );
    dispatch(eventPostFailActions.clean());
    dispatch(eventSaleActions.setCurrentPresList({ taskId: null }));
    dispatch(eventSaleActions.clean());
    dispatch(preloaderActions.setPreloader({ status: false }));
};
