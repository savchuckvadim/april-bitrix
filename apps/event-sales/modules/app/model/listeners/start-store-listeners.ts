import { portalActions } from '@workspace/pbx';
import { appActions } from '../slice/AppSlice';
import { fetchAppConfig } from '../thunk/AppConfigThunk';
import { setInitEventCompany } from '@/modules/entities/EventCompany/model/EventCompanyThunk';
import { collectRelatedContacts } from '@/modules/entities/EventContact/model/EventContactThunk';
import { eventTaskActions } from '@/modules/entities/EventTask/model/EventTaskSlice';
import { getTaskLinks } from '@/modules/entities/EventTask/lib/task-links';
import { fetchTaskBoundDeals } from '@/modules/entities/RelatedCrm/model/TaskDealsThunk';
import { getInitSale } from '@/modules/entities/EventSale/model/EventSaleThunk';
import { fetchResults } from '@/modules/features/NoCall/model/NoCallThunk';
import { initReturnToTMC } from '@/modules/features/ReturnToTMC/model/ReturnToTMCThunk';
import { innActions } from '@/modules/features/Inn/model/InnSlice';
import { clientSignalsActions } from '@/modules/features/ClientSignals/model/ClientSignalsSlice';
import { taskDealsActions } from '@/modules/entities/RelatedCrm/model/TaskDealsSlice';
import { relatedCrmActions } from '@/modules/entities/RelatedCrm/model/RelatedCrmSlice';
import { startRelatedCrmAppListener } from '@/modules/entities/RelatedCrm/model/RelatedCrmAppListener';
import { bitrixUserActions } from '@/modules/entities/BitrixUser';
import { purchaseSignalsActions } from '@/modules/features/PurchaseSignals/model/PurchaseSignalsSlice';
import { leadMarksActions } from '@/modules/features/LeadMarks/model/LeadMarksSlice';
import { leadRequestActions } from '@/modules/features/LeadRequestCard/model/LeadRequestSlice';
import { presentationLeadLinkActions } from '@/modules/features/PresentationLeadLink/model/PresentationLeadLinkSlice';
import { taskLeadLinksActions } from '@/modules/features/TaskLeadLinks/model/TaskLeadLinksSlice';
import { searchDuplicates } from '@/modules/features/Duplicates/model/DuplicatesThunk';
import { initCheckPresentation } from '@/modules/features/AfterPresentation/model/AfterPresentationThunk';
import { startEventPlanAppListener } from '@/modules/entities/EventPlan/model/EventPlanAppListener';
import { startEventPlanRescheduleListener } from '@/modules/entities/EventPlan/model/EventPlanRescheduleListener';
import { startDuplicatesAppListener } from '@/modules/features/Duplicates';
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

    // Контекст встройки установлен → портальные настройки приложения с бэка
    // (админка → Settings → event-sales) поверх legacy domain-config.
    startAppListening({
        actionCreator: appActions.setAppData,
        effect: async (action, listenerApi) => {
            listenerApi.dispatch(fetchAppConfig(action.payload.domain));
        },
    });

    // Перезагрузка приложения (кнопка ⟳) → сброс КЭШИРУЮЩИХ слайсов.
    // appActions.reload гасит только app.initialized, а слайсы новых фич
    // хранят «уже запрошено» (taskDeals.requestedIds), карты и оверрайды —
    // без сброса повторный init их не перезапрашивал, и после reload на
    // экране оставались данные прошлого клиента.
    startAppListening({
        actionCreator: appActions.reload,
        effect: async (_action, listenerApi) => {
            listenerApi.dispatch(taskDealsActions.reset());
            listenerApi.dispatch(relatedCrmActions.reset());
            listenerApi.dispatch(bitrixUserActions.reset());
            listenerApi.dispatch(purchaseSignalsActions.reset());
            listenerApi.dispatch(leadMarksActions.reset());
            listenerApi.dispatch(innActions.reset());
            listenerApi.dispatch(clientSignalsActions.reset());
            listenerApi.dispatch(leadRequestActions.reset());
            listenerApi.dispatch(
                presentationLeadLinkActions.resetForNewEvent(),
            );
            listenerApi.dispatch(taskLeadLinksActions.reset());
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
}
