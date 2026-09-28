import { format } from 'date-fns';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { Bitrix } from '@workspace/bitrix';
import type { BXTask } from '@workspace/bx';
import { parseTaskTitle } from '@/modules/entities/EventTask/lib/task-util';
import { selectWorkingUserId } from '@/modules/app/lib/utills/working-user';
import { PlanScheduleEvent, planScheduleActions } from './PlanScheduleSlice';

/**
 * Занятость на выбранную дату плана (задачи с дедлайном в этот день) — для
 * таймлайна TimePicker. Кэш по дате: повторный выбор того же дня не дёргает
 * API (запрос идёт при коммите даты, не на каждый ввод времени).
 *
 * Занятость — ТОГО, НА КОГО записывается дело: в режиме руководителя это
 * сотрудник, и свободное время руководителя ему ничего не говорит. Смена
 * сотрудника сбрасывает кэш (листенер режима руководителя).
 */
export const fetchPlanDaySchedule =
    (date: string) => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        if (!date) return;
        if (state.planSchedule.isLoading || state.planSchedule.date === date)
            return;

        const userId = selectWorkingUserId(state) ?? 0;
        if (!userId) return;

        dispatch(planScheduleActions.setLoading({ status: true }));
        try {
            const response = await Bitrix.getService().task.getList(
                {
                    RESPONSIBLE_ID: userId,
                    '>=DEADLINE': `${date} 00:00:00`,
                    '<=DEADLINE': `${date} 23:59:59`,
                    '!=STATUS': 5,
                } as never,
                ['ID', 'TITLE', 'DEADLINE'],
            );

            const items: PlanScheduleEvent[] = (
                (response?.result?.tasks ?? []) as unknown as BXTask[]
            )
                .filter(task => task.deadline)
                .map(task => {
                    const { name, eventType } = parseTaskTitle(task.title);
                    return {
                        time: format(new Date(task.deadline), 'HH:mm'),
                        title: name || task.title,
                        type: eventType,
                    };
                })
                .sort((a, b) => a.time.localeCompare(b.time));

            dispatch(planScheduleActions.setFetched({ date, items }));
        } catch (error) {
            console.error('fetchPlanDaySchedule error', error);
            dispatch(planScheduleActions.setFetched({ date, items: [] }));
        }
    };
