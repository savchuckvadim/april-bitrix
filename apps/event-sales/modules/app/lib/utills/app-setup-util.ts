import { BXTask, BXUser, Placement } from '@workspace/bx';
import type { AppDispatch } from '../../model/store';
import { APP_FROM_ENUM, appActions } from '../../model/slice/AppSlice';
import { APP_DISPLAY_MODE } from '../../types/app/app-type';
import { EntitiesFromPlacement } from './placement-util';
import {
    initialEventTasks,
    initialTasksFromCurrentTask,
} from '@/modules/entities/EventTask/model/EventTaskThunk';
import { getEvTasksFromBxTasks } from '@/modules/entities/EventTask/lib/task-util';

/**
 * Push the resolved Bitrix entities into the app state.
 *
 * В store всегда РЕАЛЬНЫЙ placement: display/fitWindow считаются от него, а
 * контекст сущности описывают `from` + company/deal/lead. Историческая
 * подмена на фейковый `CRM_COMPANY_DETAIL_TAB` удалена — она заодно незаконно
 * включала fitWindow во встройках `*_DETAIL_ACTIVITY`.
 */
export const initAppEntities = (
    dispatch: AppDispatch,
    entities: EntitiesFromPlacement,
    domain: string,
    user: BXUser | null,
    placement: Placement | null,
    display: APP_DISPLAY_MODE,
): void => {
    dispatch(
        appActions.setAppData({
            domain,
            user,
            placement,
            company: entities.currentCompany,
            deal: entities.currentDeal,
            lead: entities.currentLead,
            task: entities.currentTask as unknown as BXTask | null,
            from: entities.from,
            display,
        }),
    );
};

/** Initialize the event task list for the current context. */
export const initAppTask = (
    dispatch: AppDispatch,
    currentTask: BXTask | null,
    domain: string,
    userId: number,
    companyId: number | null,
    leadId: number | null,
    dealId: number | null,
    from: APP_FROM_ENUM
): void => {
    if (!currentTask) {
        dispatch(
            initialEventTasks([], userId, companyId, domain, leadId, dealId, from),
        );
    } else {
        dispatch(initialTasksFromCurrentTask(getEvTasksFromBxTasks([currentTask])));
    }
};
