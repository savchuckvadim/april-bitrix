import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { checkPresentationData } from '../data/check-presentation';
import { afterPresentationActions } from './AfterPresentationSlice';

/**
 * Загрузка опросника. TODO(бэк): заменить мок-каталог на запрос
 * (опросник у разных клиентов отличается) — см. gap-док.
 */
export const initCheckPresentation =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        if (getState().afterPresentation.initialized) return;
        dispatch(
            afterPresentationActions.setInitialized({ items: checkPresentationData }),
        );
    };

/** Открыть опросник: инициализируем (если ещё нет) и показываем модалку. */
export const openCheckPresentation =
    () => async (dispatch: AppDispatch) => {
        await dispatch(initCheckPresentation());
        dispatch(afterPresentationActions.setActiveStatus({ status: true }));
    };

/** Отмена: откат рабочих ответов к сохранённому снимку и закрытие. */
export const closeCheckPresentation = () => (dispatch: AppDispatch) => {
    dispatch(afterPresentationActions.revertAnswers());
    dispatch(afterPresentationActions.setPendingSend({ status: false }));
    dispatch(afterPresentationActions.setActiveStatus({ status: false }));
};

/**
 * Сохранение заполненного опросника: фиксация ответов + подтверждение.
 * Валидация обязательных полей — в UI до вызова.
 * Если модалка была обязательным шагом перед отправкой (pendingSend) —
 * продолжаем отправку события (ленивый импорт против циклической зависимости).
 */
export const submitCheckPresentation =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        dispatch(afterPresentationActions.commitAnswers());
        dispatch(afterPresentationActions.setConfirmed({ status: true }));
        dispatch(afterPresentationActions.setActiveStatus({ status: false }));

        const wasPendingSend = getState().afterPresentation.pendingSend;
        if (wasPendingSend) {
            dispatch(afterPresentationActions.setPendingSend({ status: false }));
            const { send } = await import(
                '@/modules/processes/event/model/SendThunk'
            );
            dispatch(send());
        }
    };
