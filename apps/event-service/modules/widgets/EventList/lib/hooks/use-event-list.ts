import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { EventItemResultType } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { getResultMenu } from '@/modules/widgets/EventItem';
import { APP_DEP } from '@/modules/app/model/AppSlice';

/** Event list tasks (sales/service) + result-menu handler (replaces EventListContainer). */
export const useEventList = () => {
    const dispatch = useAppDispatch();
    const saleTasks = useAppSelector(state => state.eventTask.tasks);
    const serviceTasks = useAppSelector(state => state.eventServiceTask.tasks);
    const depSettings = useAppSelector(state => state.app.department);

    const tasks: EventTask[] = (depSettings === APP_DEP.SALES ? saleTasks : serviceTasks) ?? [];

    const setResultMenuStatus = (status: EventItemResultType, task: EventTask) => {
        dispatch(getResultMenu(status, task));
    };

    return { tasks, setResultMenuStatus };
};
