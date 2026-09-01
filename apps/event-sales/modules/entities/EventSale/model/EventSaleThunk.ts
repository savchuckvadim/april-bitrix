import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { BXDeal } from '@workspace/bx';
import { TESTING_DOMAIN, TESTING_USER } from '@/modules/app/consts/app-global';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { eventSaleActions } from './EventSaleSlice';
import { EventSaleHelper } from '../lib/api/event-sale-helper';
import { Bitrix } from '@workspace/bitrix';
import { getPresentationCategoryId } from '../lib/presentation-deals';
import { BACKEND_SUPPORT_READY } from '@/modules/app/consts/backend-support.const';

/** Что показываем в селекте презентаций: название, стадия, дата, сумма. */
const PRES_DEAL_SELECT = [
    'ID',
    'TITLE',
    'STAGE_ID',
    'CATEGORY_ID',
    'OPPORTUNITY',
    'CLOSED',
    'DATE_CREATE',
];

const eventSaleHelper = new EventSaleHelper();

/**
 * Сбор презентационных сделок для связи с продажей.
 * Есть задачи → по первым 10 задачам `deals`; нет задач → `new-task/init`.
 * Вызывается listener'ом на eventTaskActions.setFetchedTasks (store-listeners).
 */
export const getInitSale =
    (actionTasks: Array<EventTask> | null) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const app = state.app;
        const tasks = actionTasks ?? state.eventTask.tasks;

        // Эндпоинты deals/new-task/init на бэке — заглушки: до 10 пустых
        // запросов на старт, а пустой ответ помечал presDeals «загруженными»
        // и гасил настоящий fetchPresentationDeals. Пока бэк не готов —
        // не ходим вовсе (см. backend-support.const).
        if (!BACKEND_SUPPORT_READY.companyDeals) return;

        if (state.eventSale.isLoading) return;
        dispatch(eventSaleActions.setIsLoading({ status: true }));

        try {
            const domain = app.domain || TESTING_DOMAIN;
            const currentCompany = app.bitrix.company;
            const userId = Number(app.bitrix.user?.ID || TESTING_USER.ID);
            let saleTaskDeals: BXDeal[] = [];

            if (tasks?.length) {
                // параллельно по первым 10 задачам (legacy делал последовательно)
                const responses = await Promise.all(
                    tasks.slice(0, 10).map(currentTask =>
                        eventSaleHelper
                            .getCompanyDeals({
                                domain,
                                currentTask: currentTask as unknown as Record<
                                    string,
                                    unknown
                                >,
                            })
                            .catch(() => null),
                    ),
                );
                for (const response of responses) {
                    if (response?.allPresentationDeals?.length) {
                        saleTaskDeals =
                            response.allPresentationDeals as unknown as BXDeal[];
                    }
                }
            } else {
                const response = await eventSaleHelper.initNewTask({
                    userId,
                    domain,
                    company: currentCompany as unknown as Record<
                        string,
                        unknown
                    > | null,
                    // Реальный контекст, не хардкод: по сделке без компании
                    // бэк должен знать, что мы в deal, а не в company.
                    from: app.bitrix.from ?? 'company',
                    baseDealId: null,
                });
                if (response?.deals?.allPresentationDeals) {
                    saleTaskDeals = response.deals
                        .allPresentationDeals as unknown as BXDeal[];
                }
            }

            dispatch(
                eventSaleActions.setPortalSale({ presDeals: saleTaskDeals }),
            );
        } catch (error) {
            console.error('getInitSale error', error);
        } finally {
            dispatch(eventSaleActions.setIsLoading({ status: false }));
        }
    };

/**
 * Презентационные сделки клиента для связи с продажей — прямо из портала.
 *
 * Продажу присоединяют к СОСТОЯВШЕЙСЯ презентации, то есть чаще всего к уже
 * закрытой сделке: список «только открытые» здесь бесполезен, и менеджер
 * видел «презентационных сделок нет» при десятке проведённых. Бэковый
 * эндпоинт event-support/deals — до сих пор заглушка (отдаёт null), поэтому
 * спрашиваем портал сами: воронка презентаций из слепка, клиент — компания
 * встройки, закрытые НЕ отсекаем.
 */
export const fetchPresentationDeals =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        if (state.eventSale.presDeals.isItemsFetched) return;

        const companyId = Number(state.app.bitrix.company?.ID);
        const categoryId = getPresentationCategoryId(
            state.portal.portal?.bitrixDeal?.categories,
        );
        if (!companyId || categoryId === null) return;

        try {
            const response = await Bitrix.getService().deal.getList(
                {
                    COMPANY_ID: String(companyId),
                    CATEGORY_ID: String(categoryId),
                } as never,
                PRES_DEAL_SELECT,
                { DATE_CREATE: 'DESC' } as never,
            );
            const deals = (response?.result ?? []) as unknown as BXDeal[];
            dispatch(eventSaleActions.setPortalSale({ presDeals: deals }));
        } catch (error) {
            console.error('fetchPresentationDeals error', error);
        }
    };
