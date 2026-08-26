import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { checkPresentationData } from '../data/check-presentation';
import { afterPresentationActions } from './AfterPresentationSlice';
import { persistCheckPresentation } from './CheckPresentationPersistThunk';

/**
 * Загрузка опросника. TODO(бэк): заменить мок-каталог на запрос
 * (опросник у разных клиентов отличается) — см. gap-док.
 */
export const initCheckPresentation =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        if (getState().afterPresentation.initialized) return;
        dispatch(
            afterPresentationActions.setInitialized({
                items: checkPresentationData,
            }),
        );
    };

/** Открыть опросник: инициализируем (если ещё нет) и показываем модалку. */
export const openCheckPresentation = () => async (dispatch: AppDispatch) => {
    await dispatch(initCheckPresentation());
    dispatch(afterPresentationActions.setActiveStatus({ status: true }));
};

/** Отмена: откат рабочих ответов к сохранённому снимку и закрытие. */
export const closeCheckPresentation = () => (dispatch: AppDispatch) => {
    dispatch(afterPresentationActions.setPersistError({ message: null }));
    dispatch(afterPresentationActions.revertAnswers());
    dispatch(afterPresentationActions.setPendingSend({ status: false }));
    dispatch(afterPresentationActions.setActiveStatus({ status: false }));
};

/**
 * Сохранение заполненного опросника: запись ответов на портал → подтверждение.
 * Валидация обязательных полей — в UI до вызова.
 *
 * Порядок именно такой. Раньше подтверждение и закрытие шли ПЕРЕД записью, а
 * ошибки записи глохли в console.error: менеджер видел «сохранено», отчёт
 * уходил, ответов на портале не было. Теперь:
 * - ни одна сущность не приняла ответы → подтверждения нет, окно остаётся
 *   открытым с честным сообщением, отправка не продолжается;
 * - приняли не все → предупреждение, но работа продолжается: часть данных
 *   на портале уже есть, а держать менеджера в окне из-за одной сущности
 *   (например, лида, которого удалили) — хуже.
 *
 * Если модалка была обязательным шагом перед отправкой (pendingSend) —
 * продолжаем отправку события (ленивый импорт против циклической зависимости).
 */
export const submitCheckPresentation =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        // Коммит до записи: персист пишет именно committed-снимок.
        dispatch(afterPresentationActions.commitAnswers());

        const result = await dispatch(persistCheckPresentation());

        if (result.isTotalFailure) {
            dispatch(
                afterPresentationActions.setPersistError({
                    message:
                        'Ответы не сохранились — попробуйте ещё раз. ' +
                        'Отчёт не отправлен.',
                }),
            );
            // Окно остаётся открытым, pendingSend не гасим: отправка ждёт
            // удачной записи, а ответы уже в committed — «Отмена» их не съест.
            return;
        }

        dispatch(
            afterPresentationActions.setPersistError({
                message: result.failed.length
                    ? 'Часть ответов не записалась в карточку клиента — ' +
                      'проверьте поля после отправки.'
                    : null,
            }),
        );
        dispatch(afterPresentationActions.setConfirmed({ status: true }));
        dispatch(afterPresentationActions.setActiveStatus({ status: false }));

        const wasPendingSend = getState().afterPresentation.pendingSend;
        if (wasPendingSend) {
            dispatch(
                afterPresentationActions.setPendingSend({ status: false }),
            );
            const { send } = await import(
                '@/modules/processes/event/model/SendThunk'
            );
            dispatch(send());
        }
    };
