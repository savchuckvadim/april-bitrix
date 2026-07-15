import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { Bitrix } from '@workspace/bitrix';
import type { BXTask } from '@workspace/bx';
import { getDomainConfig } from '@/modules/app/consts/domain-config';
import { EventTask } from '../types/event-task-type';
import { eventTaskActions } from './EventTaskSlice';
import { getEvTasksFromBxTasks } from '../lib/task-util';
import { setCurrentReportContact } from '@/modules/entities/EventContact/model/EventContactThunk';

const TASK_SELECT = [
    'ID', 'UF_CRM_TASK', 'TITLE', 'DATE_START', 'CREATED_DATE', 'CHANGED_DATE',
    'CLOSED_DATE', 'DEADLINE', 'PRIORITY', 'MARK', 'GROUP_ID', 'CREATED_BY',
    'STATUS_CHANGED_BY', 'REAL_STATUS', 'STATUS', 'STAGE_ID', 'RESPONSIBLE_ID',
];

/**
 * Инициализация списка задач из уже известной текущей задачи
 * (placement TASK / CALL_CARD).
 * Реакции на setFetchedTasks (getInitSale и т.п.) — в store-listeners.
 */
export const initialTasksFromCurrentTask =
    (tasks: Array<EventTask>) => async (dispatch: AppDispatch) => {
        const currentTask = tasks?.[0];
        if (currentTask) {
            dispatch(eventTaskActions.setFetchedTasks({ tasks }));
            dispatch(eventTaskActions.setCurrentTask({ task: currentTask }));
            dispatch(setCurrentReportContact(currentTask));
        }
    };

/**
 * Загрузка открытых задач обзвона пользователя по компании
 * (tasks.task.list, группа задач — из domain-config).
 */
export const initialEventTasks =
    (tasks: Array<BXTask>, userId: number, companyId: number, domain: string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const { taskGroupId } = getDomainConfig(domain, getState().app.bitrix.user);

        if (!tasks || !tasks.length) {
            const response = (await Bitrix.getService().api.call('tasks.task.list', {
                filter: {
                    GROUP_ID: taskGroupId,
                    UF_CRM_TASK: [`CO_${companyId}`],
                    RESPONSIBLE_ID: userId,
                    '!=STATUS': 5,
                },
                select: TASK_SELECT,
            })) as { tasks: BXTask[] } | null;

            if (response?.tasks) {
                tasks = response.tasks;
            }
        }

        if (tasks && tasks.length) {
            const evntTasks = getEvTasksFromBxTasks(tasks);
            dispatch(eventTaskActions.setFetchedTasks({ tasks: evntTasks }));
            // getInitSale(evntTasks) — реакция listener'а на setFetchedTasks (Фаза 4)
        } else {
            dispatch(eventTaskActions.setFetchedTasks({ tasks: null }));
            // TODO(Фаза 4): нет задач → открыть меню нового события
            // (getResultMenu(EventItemResultType.NEW, null))
        }
    };
