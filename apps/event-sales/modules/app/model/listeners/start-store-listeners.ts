import { isAnyOf } from '@reduxjs/toolkit';
import { getSalesTaskGroupId, portalActions } from '@workspace/pbx';
import { appActions } from '../slice/AppSlice';
import { fetchAppConfig } from '../thunk/AppConfigThunk';
import { setInitEventCompany } from '@/modules/entities/EventCompany/model/EventCompanyThunk';
import {
    collectRelatedContacts,
    setCurrentReportContact,
} from '@/modules/entities/EventContact/model/EventContactThunk';
import { eventTaskActions } from '@/modules/entities/EventTask/model/EventTaskSlice';
import { eventReportActions } from '@/modules/entities/EventReport/model/EventReportSlice';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { APP_DISPLAY_MODE } from '../../types/app/app-type';
import { getTaskLinks } from '@/modules/entities/EventTask/lib/task-links';
import { initialEventTasks } from '@/modules/entities/EventTask/model/EventTaskThunk';
import { fetchTaskBoundDeals } from '@/modules/entities/RelatedCrm/model/TaskDealsThunk';
import { getInitSale } from '@/modules/entities/EventSale/model/EventSaleThunk';
import { fetchResults } from '@/modules/features/NoCall/model/NoCallThunk';
import { initReturnToTMC } from '@/modules/features/ReturnToTMC/model/ReturnToTMCThunk';
import { innActions } from '@/modules/features/Inn/model/InnSlice';
import { clientSignalsActions } from '@/modules/features/ClientSignals/model/ClientSignalsSlice';
import { startRelatedCrmAppListener } from '@/modules/entities/RelatedCrm/model/RelatedCrmAppListener';
import { fetchStagePredict } from '@/modules/features/StagePredict/model/StagePredictThunk';
import { eventPlanActions } from '@/modules/entities/EventPlan/model/EventPlanSlice';
import { eventPresentationActions } from '@/modules/entities/EventPresentation/model/PresSlice';
import { eventItemActions } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { leadRequestActions } from '@/modules/features/LeadRequestCard/model/LeadRequestSlice';
import { callChecklistActions } from '@/modules/features/CallChecklist/model/CallChecklistSlice';
import { cancelAllChecklistSaves } from '@/modules/features/CallChecklist/lib/checklist-save-queue';
import { searchDuplicates } from '@/modules/features/Duplicates/model/DuplicatesThunk';
import { initCheckPresentation } from '@/modules/features/AfterPresentation/model/AfterPresentationThunk';
import { startEventPlanAppListener } from '@/modules/entities/EventPlan/model/EventPlanAppListener';
import { startEventPlanRescheduleListener } from '@/modules/entities/EventPlan/model/EventPlanRescheduleListener';
import { startDuplicatesAppListener } from '@/modules/features/Duplicates';
import {
    resolveCurrentTaskRelink,
    resolveCurrentTaskSource,
} from '@/modules/entities/EventTask/lib/relink-current-task';
// Прямой путь: барель EVLid тянет UI (GarantLeadFrame).
import { fetchLead } from '@/modules/entities/EVLid/model/EVLeadThunk';
import { ZPR_QUERY_ROOT } from '@/modules/entities/ZprCalls';
import { getAppQueryClient } from '@/modules/app/lib/query-client';
import { getReloadResetActions } from './reload-reset';
import { startAppDiagnosticsListener } from './app-diagnostics-listener';
import type { AppStartListening } from '../store';

/**
 * Единая точка регистрации RTK-listeners приложения.
 *
 * Паттерн: побочные реакции («портал загружен → инициализировать компанию»,
 * «задачи загружены → подтянуть сделки») регистрируются здесь как listeners,
 * а не диспатчатся из вложенных thunk'ов.
 *
 * На вход — типизированный startAppListening из store: внутри effect'ов
 * `getState()` уже RootState, `dispatch` уже AppDispatch, кастов не нужно.
 */
export function startStoreListeners(startAppListening: AppStartListening) {
    // Портал загружен → поля компании (цвет/статус) + контакты компании.
    // Ждём (до 5с) РЕЗОЛВА СУЩНОСТЕЙ (from в state), а не саму компанию:
    // в контекстах без компании (лид, сделка без компании) она не придёт
    // никогда, и прежнее ожидание компании стабильно съедало все 5 секунд,
    // задерживая заодно и initCheckPresentation.
    startAppListening({
        actionCreator: portalActions.setPortal,
        effect: async (action, listenerApi) => {
            const portal = action.payload.portal;
            const { dispatch } = listenerApi;

            await listenerApi.condition(
                (_action, currentState) => !!currentState.app?.bitrix?.from,
                5000,
            );

            // Company-таноки сами no-op'ятся без компании.
            dispatch(setInitEventCompany(portal));
            dispatch(collectRelatedContacts(portal));
            // История НЕ грузится здесь: у давнего клиента это сотни записей,
            // а смотрят её единицы. Её тянет сама секция при появлении.
            dispatch(initCheckPresentation());
        },
    });

    /*
     * Гвард «чужая задача» (todo2508): открылись из встройки задачи, а задача
     * не из группы «Звонки» отдела продаж — приложение работать с ней не
     * должно (полноэкранная заглушка вместо интерфейса). Источник истины по
     * группе — слепок портала (bitrixCallingTasksGroup), поэтому проверка
     * живёт на его загрузке, а не в init.
     */
    startAppListening({
        actionCreator: portalActions.setPortal,
        effect: async (action, listenerApi) => {
            const state = listenerApi.getState();
            if (state.app.display.mode !== APP_DISPLAY_MODE.TASK) return;
            const task = state.app.bitrix.task as unknown as Record<
                string,
                unknown
            > | null;
            if (!task) return;
            const taskGroupId = Number(task.groupId ?? task.GROUP_ID ?? 0);
            const salesGroupId = getSalesTaskGroupId(action.payload.portal);
            if (taskGroupId && salesGroupId && taskGroupId !== salesGroupId) {
                listenerApi.dispatch(appActions.setGuard('foreignTask'));
            }
        },
    });

    // Компания появилась ПОСЛЕ инициализации (привязали к сделке из виджета)
    // → та же инициализация полей и контактов, что и на буте.
    startAppListening({
        actionCreator: appActions.setAppBitrixData,
        effect: async (action, listenerApi) => {
            if (!action.payload.company) return;
            const portal = listenerApi.getState().portal.portal;
            if (!portal) return;
            listenerApi.dispatch(setInitEventCompany(portal));
            listenerApi.dispatch(collectRelatedContacts(portal));
        },
    });

    // Задачи загружены → сделки для продажи, счётчики результатов,
    // ТМЦ-сделки для возврата (гейты — внутри thunk'ов).
    startAppListening({
        actionCreator: eventTaskActions.setFetchedTasks,
        effect: async (action, listenerApi) => {
            const { dispatch } = listenerApi;
            // Открытое дело переезжает на СВЕЖИЙ объект задачи: reload
            // заменяет tasks, а current без перепривязки показывал бы
            // данные прошлой загрузки. Контакт отчёта и лид задачи — из
            // свежих привязок (контактный слайс к этому моменту сброшен).
            const prevCurrent = listenerApi.getState().eventTask.current;
            const freshCurrent = resolveCurrentTaskRelink(
                prevCurrent,
                action.payload.tasks,
            );
            if (freshCurrent) {
                dispatch(
                    eventTaskActions.setCurrentTask({ task: freshCurrent }),
                );
            }
            // Контакт и лид восстанавливаем и когда свежей задачи в списке
            // НЕТ (закрыли в другом окне): current намеренно остаётся прежним
            // объектом, но сбросы reload уже стёрли контакт и лид — без
            // восстановления из ПРЕЖНЕЙ задачи карточка оставалась пустой.
            const contactSource = resolveCurrentTaskSource(
                prevCurrent,
                action.payload.tasks,
            );
            if (contactSource) {
                dispatch(setCurrentReportContact(contactSource));
                dispatch(fetchLead(contactSource));
            }
            // Контакты задачи (C_xxx) и её лидов — источник наравне с
            // компанией: у задачи бывает свой контакт, которого в компании нет.
            const portal = listenerApi.getState().portal.portal;
            if (portal) dispatch(collectRelatedContacts(portal));
            dispatch(getInitSale(action.payload.tasks));
            dispatch(fetchResults());
            if (action.payload.tasks?.length) {
                dispatch(initReturnToTMC(action.payload.tasks));
                // Привязанные к задачам сделки — напрямую из портала: в графе
                // связей клиента старых сделок без CRM-связей нет, а полоски
                // стадий обязаны показывать именно привязанные (по ним отчёт).
                // Ждём слепок портала (до 5с): по нему thunk классифицирует
                // воронку сделки (categoryCode → скрытие «ОП Основной»), а на
                // TASK/CALL_CARD задачи готовы раньше слепка. Не дождались —
                // запрос всё равно уходит, просто без категорий (fail-open).
                await listenerApi.condition(
                    (_action, currentState) => !!currentState.portal.portal,
                    5000,
                );
                dispatch(
                    fetchTaskBoundDeals(
                        action.payload.tasks.flatMap(
                            task => getTaskLinks(task).dealIds,
                        ),
                    ),
                );
            }
        },
    });

    // ИНН записан → сразу проверить дубли по нему (свежий сигнал — самый
    // сильный: вес 100). force — кэш двухминутного автопоиска уже неактуален.
    startAppListening({
        actionCreator: innActions.setSaved,
        effect: async (action, listenerApi) => {
            listenerApi.dispatch(
                searchDuplicates({
                    raw: { inns: [action.payload.value] },
                    force: true,
                }),
            );
        },
    });

    // Телефон/email добавлен лиду → тот же немедленный поиск дублей по нему.
    startAppListening({
        actionCreator: clientSignalsActions.setSaved,
        effect: async (action, listenerApi) => {
            const { kind, value } = action.payload;
            listenerApi.dispatch(
                searchDuplicates({
                    raw:
                        kind === 'phone'
                            ? { phones: [value] }
                            : { emails: [value] },
                    force: true,
                }),
            );
        },
    });

    /*
     * Портальные настройки приехали ПОЗЖЕ сущностей Битрикса — это норма:
     * сущности резолвятся мгновенно, а настройки идут по сети. Если в них
     * оказалась ДРУГАЯ группа задач, список дел надо перезапросить: он уже
     * ушёл со значением по домену и вернул чужие (или никакие) задачи.
     *
     * Раньше это лечилось ожиданием настроек перед первым запросом, но
     * ожидание с таймаутом — гонка: на медленной сети запрос всё равно
     * уходил со старым значением и молча отдавал пустой список (инцидент
     * 27.08: «дел нет», а после отправки отчёта они появлялись).
     */
    startAppListening({
        actionCreator: appActions.mergeConfig,
        effect: async (action, listenerApi) => {
            const nextGroupId = action.payload.taskGroupId;
            if (!nextGroupId) return;
            const state = listenerApi.getState();
            // Встройка задачи: список строится из неё самой, запроса нет.
            if (state.app.bitrix.task) return;
            const loadedWith = state.eventTask.loadedWithGroupId;
            if (!loadedWith || loadedWith === nextGroupId) return;

            const bitrix = state.app.bitrix;
            // from резолвится вместе с сущностями и к этому моменту есть;
            // без него запрос строить нечем — тогда и перезапрашивать нечего.
            if (!bitrix.from) return;
            listenerApi.dispatch(
                initialEventTasks(
                    [],
                    Number(bitrix.user?.ID || 0),
                    Number(bitrix.company?.ID || 0),
                    state.app.domain,
                    Number(bitrix.lead?.ID || 0),
                    Number(bitrix.deal?.ID || 0),
                    bitrix.from,
                ),
            );
        },
    });
    // Контекст встройки установлен → портальные настройки приложения с бэка
    // (админка → Settings → event-sales) поверх legacy domain-config.
    startAppListening({
        actionCreator: appActions.setAppData,
        effect: async (action, listenerApi) => {
            listenerApi.dispatch(fetchAppConfig(action.payload.domain));
        },
    });

    // Перезагрузка приложения (кнопка ⟳) → сброс КЭШИРУЮЩИХ слайсов.
    // appActions.reload гасит только app.initialized, а слайсы хранят «уже
    // запрошено» (requestedIds, status: 'ready', initialized), карты и
    // оверрайды — без сброса повторный init их не перезапрашивал, и после
    // reload на экране оставались данные прошлой сессии. Полный каталог
    // сбросов и что в него НЕ входит — в reload-reset.ts.
    startAppListening({
        actionCreator: appActions.reload,
        effect: async (_action, listenerApi) => {
            for (const action of getReloadResetActions()) {
                listenerApi.dispatch(action);
            }
            // ЗПР живёт в react-query, а не в redux: у него свой кэш, и
            // общий каталог сбросов до него не достаёт. Ссылки op_zprs
            // мержатся с перечитанным стором, но САМИ элементы (стадия,
            // лента комментариев) могли измениться в Битриксе — «Обновить»
            // обязано их перечитать, как и всё остальное на экране.
            getAppQueryClient().invalidateQueries({
                queryKey: [ZPR_QUERY_ROOT],
            });
        },
    });

    // Сброс чек-листов (смена сущности, reload, очистка после отправки) →
    // гасим отложенные записи полей. Таймеры живут вне стора (их нельзя
    // сериализовать) и вне компонент — иначе размонтирование одной из двух
    // карточек чек-листа рубило бы запись другой; отменить их может только
    // явная смена сущности.
    startAppListening({
        actionCreator: callChecklistActions.reset,
        effect: async () => {
            cancelAllChecklistSaves();
        },
    });

    // Уход со статуса «Не ЦА» → выбранный тип очищается: notCaTypeCode в
    // finalSync прочитает buildLeadSync при ЛЮБОЙ отправке, и забытое
    // значение уводило бы сделку в «не ЦА» уже из другого статуса.
    // Кросс-слайсовая реакция — поэтому листенер, а не редьюсер отчёта.
    startAppListening({
        actionCreator: eventReportActions.setReportProp,
        effect: async (action, listenerApi) => {
            if (action.payload.propName !== EV_REPORT_PROP.WORK_STATUS) return;
            const state = listenerApi.getState();
            const code =
                state.eventReport.report[EV_REPORT_PROP.WORK_STATUS].current
                    .code;
            if (code !== 'notCa' && state.leadRequest.finalSync.notCaTypeCode) {
                listenerApi.dispatch(leadRequestActions.setNotCaTypeCode(null));
            }
        },
    });

    // Предикт стадии основной воронки — топливо стадийных чек-листов
    // («Клиент на решении», «Продажа»). Пересчитывается на всё, что меняет
    // вход лестницы: статус работы, тип плана, отметка презентации, тип
    // меню, инициализация. Debounce: серия кликов по сегментам — один
    // запрос. Гейт настроек — внутри buildStagePredictRequest.
    startAppListening({
        matcher: isAnyOf(
            appActions.setAppData,
            eventReportActions.setReportProp,
            eventPlanActions.setPlanProp,
            eventPlanActions.setIsActive,
            eventPresentationActions.setPresentationProp,
            eventItemActions.setMenuType,
            leadRequestActions.setNotCaTypeCode,
        ),
        effect: async (_action, listenerApi) => {
            listenerApi.cancelActiveListeners();
            await listenerApi.delay(400);
            await listenerApi.dispatch(fetchStagePredict());
        },
    });

    // Подписки, живущие внутри своих слайсов (app/setAppData → инициализация плана).
    startEventPlanAppListener(startAppListening);
    // «Не очень» → план перестраивается под перенос текущей задачи.
    startEventPlanRescheduleListener(startAppListening);
    // app/setAppData → автопроверка дублей клиента (быстрый уровень + кэш).
    startDuplicatesAppListener(startAppListening);
    // app/setAppData|setAppBitrixData → связи клиента в стор (шапка-layout).
    startRelatedCrmAppListener(startAppListening);
    // Инициализация завершена → одна свёрнутая группа диагностики в консоль.
    startAppDiagnosticsListener(startAppListening);
}
