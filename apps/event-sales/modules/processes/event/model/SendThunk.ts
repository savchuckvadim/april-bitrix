import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import {
    clearComment,
    eventReportActions,
} from '@/modules/entities/EventReport';
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
// Прямые пути: барель фичи тянет UI-диалог (правило store).
import { selectNeedPresentationLeadLink } from '@/modules/features/PresentationLeadLink/lib/presentation-lead-link.selectors';
import { openPresentationLeadLink } from '@/modules/features/PresentationLeadLink/model/PresentationLeadLinkThunk';
import { presentationLeadLinkActions } from '@/modules/features/PresentationLeadLink/model/PresentationLeadLinkSlice';
import { taskLeadLinksActions } from '@/modules/features/TaskLeadLinks/model/TaskLeadLinksSlice';
// Прямые пути: барель CallChecklist тянет UI-диалог (правило store).
import { selectNextPendingChecklist } from '@/modules/features/CallChecklist/lib/checklist-selectors';
import { callChecklistActions } from '@/modules/features/CallChecklist/model/CallChecklistSlice';
import { openCallChecklist } from '@/modules/features/CallChecklist/model/CallChecklistThunk';
import { ensureStagePredict } from '@/modules/features/StagePredict/model/StagePredictThunk';
import { stagePredictActions } from '@/modules/features/StagePredict/model/StagePredictSlice';
import { returnToTmcActions } from '@/modules/features/ReturnToTMC';
import { finishResultMenu } from '@/modules/widgets/EventItem/model/EventItemThunk';
import { reloadApp } from '@/modules/app/model/thunk/AppThunk';
import { eventActions } from './EventSlice';
import { eventItemActions } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { flowStatusActions } from './FlowStatusSlice';
import { watchFlowOperation } from './FlowWatchThunk';
import { createOperationId } from '../lib/operation-id';
import { FlowHelper } from '../lib/api/flow-helper';
import { buildFlowPayload } from '../lib/build-flow-payload';
import {
    getClientContext,
    getIsTmcMode,
    type ClientContext,
} from '@/modules/app/lib/utills/app-state-util';
import { getSocketIdSafe } from '@/modules/app/lib/ws/ws-client.util';
import { getPlannedFinishText, validateSend } from '../lib/send-validation';
import { awaitQuestionnaireCatalog } from '../lib/questionnaire-gate';
import { getSendPreflight } from '../lib/send-preflight';
import { shouldCleanAfterSend } from '../lib/clean-after-send';

const flowHelper = new FlowHelper();

/**
 * Отправка отчёта: каталог анкет → валидация → (обязательный опросник) →
 * sendEvent.
 * Порт legacy send(). Навигация на Finish — декларативно: sendEvent ставит
 * event.isFinish, EventProcessInit переводит на /finish.
 */
export const send =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        // Каталог анкет — ПЕРВЫМ шагом, до валидации: состав вопросов
        // решает, что обязательно, и валидация на ещё не доехавшем каталоге
        // пропустила бы незаполненную портальную анкету (риск «тихая утечка
        // незаполненных анкет» из плана). Ждём только пока каталог грузится
        // и только до дедлайна: не дождались — работаем на встроенном
        // наборе, отправку это не останавливает (см. questionnaire-gate).
        await awaitQuestionnaireCatalog(getState);

        const state = getState();
        const { result, isColorRequiredError } = validateSend(state);
        // Полная предпроверка шире валидации: пометки заявок при
        // продаже/отказе — тоже стоп, хотя validateSend про них не знает.
        const preflight = getSendPreflight(state);

        if (!preflight.isReady) {
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
            // Всё незаполненное — одним окном у кнопки отправки: подсказки у
            // самих полей остаются, но поля разбросаны по экрану, и раньше
            // отправка молчала («нажал — ничего не произошло»).
            dispatch(eventItemActions.setPreflightOpen({ isOpen: true }));
            return;
        }

        dispatch(eventItemActions.setPreflightOpen({ isOpen: false }));

        // хвост опросника обязателен: если применим и не подтверждён —
        // открываем модалку как шаг перед отправкой, отправка продолжится после неё
        if (selectNeedAfterPresentation(state)) {
            dispatch(afterPresentationActions.setPendingSend({ status: true }));
            dispatch(openCheckPresentation());
            return;
        }

        // Факт презентации + вопрос о связи с заявкой ещё не закрыт → модалка
        // «презентация связана с заявкой?» (сама продолжит отправку; без
        // открытых заявок закрывается и продолжает мгновенно).
        if (selectNeedPresentationLeadLink(state)) {
            await dispatch(openPresentationLeadLink());
            return;
        }

        // Стадийные чек-листы («Клиент на решении», «Продажа»): предикт
        // обязан быть актуальным ДО решения — иначе гонка «модалка не
        // открылась, отчёт ушёл без чек-листа» (сервер-гард — страховка).
        // Несколько чек-листов проходят один за другим тем же re-entry:
        // confirm модалки перезапускает send(), открывается следующий.
        await dispatch(ensureStagePredict());
        const nextChecklist = selectNextPendingChecklist(getState());
        if (nextChecklist) {
            dispatch(callChecklistActions.setPendingSend({ status: true }));
            await dispatch(openCallChecklist(nextChecklist.code));
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

        // socketId — для точечных push-событий очередей (в т.ч. zpr-flow:done);
        // сокет не подключён — поле просто не уходит, поллинг остаётся.
        const payload = buildFlowPayload(state, {
            operationId,
            socketId: getSocketIdSafe(),
        });
        const isTmc = getIsTmcMode(state);
        const context = getClientContext(state);
        // Задача отправленного отчёта: фоновый onDone сверит её с открытой
        // на момент done и не тронет форму, если менеджер уже ушёл в другую.
        const sentTaskId = state.eventTask.current?.id ?? null;
        const finishResult = payload.plan?.isPlanned
            ? getPlannedFinishText(state)
            : '';

        dispatch(
            flowStatusActions.setSending({
                startedAt: Date.now(),
                result: finishResult,
                operationId,
            }),
        );
        dispatch(
            eventActions.setFinishStatus({
                status: true,
                result: finishResult,
            }),
        );

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
                onDone: async () => {
                    // Очередь работает долго: менеджер мог уже открыть другое
                    // дело и заполнять НОВЫЙ отчёт — cleanEvent стирал бы его.
                    // Форму чистим только когда она всё ещё принадлежит
                    // отправленному отчёту (решение — clean-after-send).
                    const doneState = getState();
                    if (
                        shouldCleanAfterSend({
                            isFinishOpen: doneState.event.isFinish,
                            sentTaskId,
                            currentTaskId:
                                doneState.eventTask.current?.id ?? null,
                            isItemMenuOpen: doneState.eventItemMenu.isActive,
                        })
                    ) {
                        await dispatch(cleanEvent(isTmc, context));
                    } else {
                        // Из процессных флагов отправленного отчёта вручную
                        // гасим только ТМЦ-меню: оно не входит в каталог
                        // reload-reset, а забытый isActive подмешал бы
                        // returnToTmc в payload следующей отправки.
                        dispatch(
                            returnToTmcActions.setActiveStatus({
                                status: false,
                            }),
                        );
                    }
                    // Очередь отработала — в самой сущности уже изменились
                    // стадии, поля и задачи. Полный init перезапускает все
                    // листенеры и перечитывает данные: другого честного
                    // способа увидеть результат flow у фрейма нет. Остальные
                    // процессные флаги сбрасывает его каталог reload-reset.
                    dispatch(reloadApp());
                },
            }),
        );
    };

/** Повтор отправки после ошибки: состояние формы при ошибке не чистилось. */
export const retrySendEvent = () => async (dispatch: AppDispatch) => {
    await dispatch(sendEvent({ reuseOperation: true }));
};

/**
 * Очистка состояния после отправки (порт legacy cleanEvent).
 *
 * Здесь и «форма текущего отчёта» (current задача/контакт, report/plan/
 * presentation, комментарий, меню), и «процессные флаги» отправки. Фоновый
 * onDone зовёт её ТОЛЬКО когда форма всё ещё принадлежит отправленному
 * отчёту (см. clean-after-send) — иначе стёрся бы новый заполняемый отчёт.
 */
export const cleanEvent =
    (isTmc: boolean, context: ClientContext) =>
    async (dispatch: AppDispatch) => {
        dispatch(eventTaskActions.setCurrentTask({ task: null }));
        dispatch(setCurrentReportContact(null));
        dispatch(finishResultMenu());
        dispatch(eventReportActions.clean({ isTmc }));
        dispatch(eventPlanActions.clean({ isTmc, context }));
        dispatch(eventPresentationActions.clean());
        dispatch(afterPresentationActions.resetForNewEvent());
        dispatch(presentationLeadLinkActions.resetForNewEvent());
        dispatch(taskLeadLinksActions.reset());
        dispatch(callChecklistActions.reset());
        dispatch(stagePredictActions.reset());
        dispatch(returnToTmcActions.setActiveStatus({ status: false }));
        dispatch(clearComment());
    };
