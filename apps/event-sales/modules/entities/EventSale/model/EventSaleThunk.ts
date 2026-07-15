import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { BXDeal } from '@workspace/bx';
import {
    DEV_CURRENT_USER_ID,
    TESTING_DOMAIN,
} from '@/modules/app/consts/app-global';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { eventSaleActions } from './EventSaleSlice';
import { EventSaleHelper } from '../lib/api/event-sale-helper';

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

        if (state.eventSale.isLoading) return;
        dispatch(eventSaleActions.setIsLoading({ status: true }));

        try {
            const domain = app.domain || TESTING_DOMAIN;
            const currentCompany = app.bitrix.company;
            const userId = Number(app.bitrix.user?.ID || DEV_CURRENT_USER_ID);
            let saleTaskDeals: BXDeal[] = [];

            if (tasks?.length) {
                // параллельно по первым 10 задачам (legacy делал последовательно)
                const responses = await Promise.all(
                    tasks.slice(0, 10).map(currentTask =>
                        eventSaleHelper
                            .getCompanyDeals({
                                domain,
                                currentTask:
                                    currentTask as unknown as Record<string, unknown>,
                            })
                            .catch(() => null),
                    ),
                );
                for (const response of responses) {
                    if (response?.allPresentationDeals?.length) {
                        saleTaskDeals = response.allPresentationDeals as unknown as BXDeal[];
                    }
                }
            } else {
                const response = await eventSaleHelper.initNewTask({
                    userId,
                    domain,
                    company: currentCompany as unknown as Record<string, unknown> | null,
                    from: 'company',
                    baseDealId: null,
                });
                if (response?.deals?.allPresentationDeals) {
                    saleTaskDeals = response.deals
                        .allPresentationDeals as unknown as BXDeal[];
                }
            }

            dispatch(eventSaleActions.setPortalSale({ presDeals: saleTaskDeals }));
        } catch (error) {
            console.error('getInitSale error', error);
        } finally {
            dispatch(eventSaleActions.setIsLoading({ status: false }));
        }
    };
