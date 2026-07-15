import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { preloaderActions } from '@/modules/shared/Preloader';
import { clearComment, eventReportActions } from '@/modules/entities/EventReport';
import { eventTaskActions } from '@/modules/entities/EventTask';
import { eventPlanActions } from '@/modules/entities/EventPlan';
import { eventPresentationActions } from '@/modules/entities/EventPresentation';
import { setCurrentReportContact } from '@/modules/entities/EventContact/model/EventContactThunk';
import {
    EV_COMPANY_PROP,
    eventCompanyActions,
} from '@/modules/entities/EventCompany';
import {
    afterPresentationActions,
    openCheckPresentation,
    selectNeedAfterPresentation,
} from '@/modules/features/AfterPresentation';
import { returnToTmcActions } from '@/modules/features/ReturnToTMC';
import { finishResultMenu } from '@/modules/widgets/EventItem/model/EventItemThunk';
import { eventActions } from './EventSlice';
import { EV_ERROR_CODE } from '../types/event-types';
import { FlowHelper } from '../lib/api/flow-helper';
import { buildFlowPayload } from '../lib/build-flow-payload';
import {
    getIsTmcMode,
    isPresentationPlanned,
    validateSend,
} from '../lib/send-validation';

const flowHelper = new FlowHelper();

/**
 * Отправка отчёта: валидация → (обязательный опросник) → sendEvent.
 * Порт legacy send(). Навигация на Finish — декларативно: sendEvent ставит
 * event.isFinish, EventProcessInit переводит на /finish.
 */
export const send = () => async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const { result, isColorRequiredError } = validateSend(state);

    if (result.isError || isColorRequiredError) {
        if (result.isError) {
            dispatch(eventActions.setErrors(result));
        }
        if (isColorRequiredError) {
            dispatch(
                eventCompanyActions.setError({
                    type: EV_COMPANY_PROP.COLOR,
                    error: 'Обновите прогноз',
                }),
            );
        }
        return;
    }

    // хвост опросника обязателен: если применим и не подтверждён —
    // открываем модалку как шаг перед отправкой, отправка продолжится после неё
    if (selectNeedAfterPresentation(state)) {
        dispatch(afterPresentationActions.setPendingSend({ status: true }));
        dispatch(openCheckPresentation());
        return;
    }

    dispatch(eventActions.cleanErrors());
    await dispatch(sendEvent());
};

/** Сборка payload + POST /event-sales/flow + очистка + финиш. */
export const sendEvent =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        dispatch(preloaderActions.setPreloader({ status: true }));

        try {
            const payload = buildFlowPayload(state);
            await flowHelper.sendFlow(payload);

            const isTmc = getIsTmcMode(state);
            const finishResult = payload.plan?.isPlanned
                ? isPresentationPlanned(state)
                    ? 'Презентация запланирована'
                    : 'Звонок запланирован'
                : '';

            dispatch(cleanEvent(isTmc));
            dispatch(
                eventActions.setFinishStatus({ status: true, result: finishResult }),
            );
        } catch (error) {
            console.error('sendEvent error', error);
            dispatch(
                eventActions.setError({
                    code: EV_ERROR_CODE.COMMENT,
                    value: 'Не удалось отправить отчёт — попробуйте ещё раз',
                }),
            );
        } finally {
            dispatch(preloaderActions.setPreloader({ status: false }));
        }
    };

/** Очистка состояния после отправки (порт legacy cleanEvent). */
export const cleanEvent =
    (isTmc: boolean) => async (dispatch: AppDispatch) => {
        dispatch(eventTaskActions.setCurrentTask({ task: null }));
        dispatch(setCurrentReportContact(null));
        dispatch(finishResultMenu());
        dispatch(eventReportActions.clean({ isTmc }));
        dispatch(eventPlanActions.clean({ isTmc }));
        dispatch(eventPresentationActions.clean());
        dispatch(afterPresentationActions.resetForNewEvent());
        dispatch(returnToTmcActions.setActiveStatus({ status: false }));
        dispatch(clearComment());
    };
