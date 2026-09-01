import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { checkPresentationData } from '../data/check-presentation';
import { afterPresentationActions } from './AfterPresentationSlice';
import {
    persistCheckPresentation,
    type CheckPresentationPersistResult,
} from './CheckPresentationPersistThunk';

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
 * Чем предупредить менеджера, когда записалось не всё. null — записалось
 * всё, что портал вообще мог принять.
 *
 * «Некуда писать» идёт первым и своим текстом: это не сбой записи, а
 * отсутствие полей на портале, и менеджеру важно знать, что ответы всё
 * равно уедут — с отчётом, а не в никуда.
 *
 * У «нет полей» и «нет самой карточки» тексты РАЗНЫЕ. Первый зовёт
 * проверить поля опросника на портале, второй — сказать, что проверять
 * нечего: отчитываются из встройки без привязки к CRM, и единственный путь
 * ответов там и так один. Одно сообщение на обе беды отправляло бы половину
 * менеджеров искать несуществующую проблему в настройках.
 */
const persistWarning = (
    result: CheckPresentationPersistResult,
): string | null => {
    if (result.noTargets) {
        return 'Карточка клиента не открыта — ответы уедут вместе с отчётом.';
    }
    if (result.nothingWritten) {
        return (
            'Полей опросника нет в карточке клиента — ответы уедут ' +
            'вместе с отчётом.'
        );
    }
    if (result.failed.length) {
        return (
            'Часть ответов не записалась в карточку клиента — ' +
            'проверьте поля после отправки.'
        );
    }
    return null;
};

/**
 * Сохранение заполненного опросника: запись ответов на портал → подтверждение.
 * Валидация обязательных полей — в UI до вызова.
 *
 * Порядок именно такой. Раньше подтверждение и закрытие шли ПЕРЕД записью, а
 * ошибки записи глохли в console.error: менеджер видел «сохранено», отчёт
 * уходил, ответов на портале не было. Теперь:
 * - ни одна сущность НЕ ПРИНЯЛА ответы (портал отказал) → подтверждения нет,
 *   окно остаётся открытым с честным сообщением, отправка не продолжается:
 *   повтор осмыслен, «Сохранить» может пройти со второго раза;
 * - писать оказалось НЕКУДА (полей опросника нет в слепке браузера) либо
 *   некому (в контексте нет ни компании, ни сделки, ни лида) →
 *   предупреждение своим текстом на каждый случай, но работа продолжается.
 *   Окно тут запирать нельзя: повтор ничего не изменит, а незапущенный
 *   отчёт уносит с собой и payload `presentation.survey` — единственный
 *   оставшийся путь ответов на портал (поток пишет их по СВОЕМУ слепку,
 *   который полей не терял);
 * - приняли не все → предупреждение, но работа продолжается: часть данных
 *   на портале уже есть, а держать менеджера в окне из-за одной сущности
 *   (например, лида, которого удалили) — хуже.
 *
 * Итог считает ТОЛЬКО фрейм-запись: второго писателя (серверной ручки)
 * больше нет, серверный контур — сам поток отчёта, а он исполняется позже и
 * решения этого окна не меняет. Ответы уедут в его payload
 * (`presentation.survey`) в любом случае — но молча обещать менеджеру
 * «сохранено», когда в карточку не легло ничего, нельзя: при отказе портала
 * он остаётся в окне, при отсутствии полей — получает предупреждение
 * (persistError; в окне оно на месте, если опросник откроют снова).
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
                message: persistWarning(result),
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
