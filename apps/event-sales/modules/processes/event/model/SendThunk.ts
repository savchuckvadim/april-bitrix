import { AppDispatch, AppGetState } from '@/modules/app/model/store';
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
import { flowStatusActions } from './FlowStatusSlice';
import { watchFlowOperation } from './FlowWatchThunk';
import { createOperationId } from '../lib/operation-id';
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

/**
 * Сборка payload + POST /event-sales/flow.
 *
 * Порядок намеренно такой: сначала уводим на финиш, потом ждём ответ. Запрос
 * идёт долго (бэкенд выполняет весь batch Битрикса синхронно), и держать
 * менеджера на форме всё это время незачем — он уже всё заполнил. Экран финиша
 * сам показывает стадию по `flowStatus`.
 *
 * Состояние формы чистим ТОЛЬКО после успеха и уже после ухода со страницы:
 * если чистить до перехода, сброс видно на самой форме (в лиде это выглядело
 * как «план оттопырился» — разворачивался полный список типов), а при ошибке
 * пользователю было бы нечего переотправлять.
 */
export const sendEvent =
    (options: { reuseOperation?: boolean } = {}) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        // Повтор идёт с тем же id: если предыдущая отправка на самом деле
        // дошла, бэкенд вернёт её статус, а не выполнит flow второй раз.
        const operationId =
            (options.reuseOperation && state.flowStatus.operationId) ||
            createOperationId();

        const payload = buildFlowPayload(state, { operationId });
        const isTmc = getIsTmcMode(state);
        const hasCompany = !!state.app.bitrix.company;
        const finishResult = payload.plan?.isPlanned
            ? isPresentationPlanned(state)
                ? 'Презентация запланирована'
                : 'Звонок запланирован'
            : '';

        dispatch(
            flowStatusActions.setSending({
                startedAt: Date.now(),
                result: finishResult,
                operationId,
            }),
        );
        dispatch(eventActions.setFinishStatus({ status: true, result: finishResult }));

        try {
            await flowHelper.sendFlow(payload);
        } catch (error) {
            console.error('sendEvent error', error);
            dispatch(
                flowStatusActions.setError({
                    message:
                        'Не удалось отправить отчёт. Данные никуда не делись — можно повторить.',
                }),
            );
            return;
        }

        // POST лишь принял операцию — исход узнаём отдельно.
        await dispatch(
            watchFlowOperation({
                operationId,
                domain: payload.domain,
                tasksStale: true,
                onDone: () => dispatch(cleanEvent(isTmc, hasCompany)),
            }),
        );
    };

/** Повтор отправки после ошибки: состояние формы при ошибке не чистилось. */
export const retrySendEvent = () => async (dispatch: AppDispatch) => {
    await dispatch(sendEvent({ reuseOperation: true }));
};

/** Очистка состояния после отправки (порт legacy cleanEvent). */
export const cleanEvent =
    (isTmc: boolean, hasCompany: boolean) => async (dispatch: AppDispatch) => {
        dispatch(eventTaskActions.setCurrentTask({ task: null }));
        dispatch(setCurrentReportContact(null));
        dispatch(finishResultMenu());
        dispatch(eventReportActions.clean({ isTmc }));
        dispatch(eventPlanActions.clean({ isTmc, hasCompany }));
        dispatch(eventPresentationActions.clean());
        dispatch(afterPresentationActions.resetForNewEvent());
        dispatch(returnToTmcActions.setActiveStatus({ status: false }));
        dispatch(clearComment());
    };
