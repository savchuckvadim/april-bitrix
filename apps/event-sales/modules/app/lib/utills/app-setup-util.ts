import { BXTask, BXUser, Placement } from '@workspace/bx';
import { AppDispatch } from '../../model/store';
import { appActions } from '../../model/slice/AppSlice';
import { APP_DISPLAY_MODE } from '../../types/app/app-type';
import { EntitiesFromPlacement } from './placement-util';
import {
    initialEventTasks,
    initialTasksFromCurrentTask,
} from '@/modules/entities/EventTask/model/EventTaskThunk';
import { getEvTasksFromBxTasks } from '@/modules/entities/EventTask/lib/task-util';

/** Push the resolved Bitrix entities into the app state. */
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
            placement: entities.companyPlacement.options.ID
                ? entities.companyPlacement
                : placement,
            company: entities.currentCompany,
            deal: entities.currentDeal,
            lead: entities.currentLead,
            task: entities.currentTask as unknown as BXTask | null,
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
    companyId: number,
): void => {
    if (!currentTask) {
        dispatch(initialEventTasks([], userId, companyId, domain));
    } else {
        dispatch(initialTasksFromCurrentTask(getEvTasksFromBxTasks([currentTask])));
    }
};
