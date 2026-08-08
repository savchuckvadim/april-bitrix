import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { Bitrix } from '@workspace/bitrix';
import type { BXTask } from '@workspace/bx';
import { getDomainConfig } from '@/modules/app/consts/domain-config';
import { EventTask } from '../types/event-task-type';
import { eventTaskActions } from './EventTaskSlice';
import { getEvTasksFromBxTasks } from '../lib/task-util';
import { EVENT_TASK_SELECT } from '../lib/task-select';
import { setCurrentReportContact } from '@/modules/entities/EventContact/model/EventContactThunk';
import { APP_FROM_ENUM } from '@/modules/app/model/slice/AppSlice';


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
 * Загрузка открытых задач обзвона пользователя по владельцу контекста
 * (tasks.task.list, группа задач — из domain-config).
 *
 * Привязка выбирается честно по владельцу: компания > сделка > лид.
 * Раньше при отсутствии компании фильтр превращался в `CO_null` и просто
 * ничего не находил — кейс «сделка без компании» был сломан.
 */
export const initialEventTasks =
    (tasks: Array<BXTask>, userId: number, companyId: number | null, domain: string, leadId: number | null, dealId: number | null, from: APP_FROM_ENUM) =>
        async (dispatch: AppDispatch, getState: AppGetState) => {
            const { taskGroupId } = getDomainConfig(domain, getState().app.bitrix.user);
            void from;
            const ufCrmTasks = companyId
                ? `CO_${companyId}`
                : dealId
                  ? `D_${dealId}`
                  : leadId
                    ? `L_${leadId}`
                    : null;
            if (!ufCrmTasks) {
                dispatch(eventTaskActions.setFetchedTasks({ tasks: null }));
                return;
            }
            if (!tasks || !tasks.length) {
                try {
                    const response = await Bitrix.getService().task.getList(
                        {
                            GROUP_ID: taskGroupId,
                            UF_CRM_TASK: [ufCrmTasks],
                            RESPONSIBLE_ID: userId,
                            '!=STATUS': 5,
                        } as never,
                        EVENT_TASK_SELECT,
                    );

                    const fetched = response?.result?.tasks as unknown as
                        | BXTask[]
                        | undefined;
                    if (fetched) {
                        tasks = fetched;
                    }
                } catch (error) {
                    // Без этого падение запроса просто роняло thunk: isFetched
                    // оставался false, и список крутил скелетон бесконечно.
                    console.error('initialEventTasks error', error);
                    dispatch(
                        eventTaskActions.setTasksError({
                            message: 'Не удалось загрузить события',
                        }),
                    );
                    return;
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
