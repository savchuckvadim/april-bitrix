import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import { getResultMenu } from "@/modules/widgets/EventItem";
import { EventItemResultType } from "@/modules/widgets/EventItem/model/EventItemSlice";
import { setCurrentReportContact } from "@/modules/entities/EventContact/model/EventContactThunk";

import { Bitrix } from '@workspace/bitrix';
import type { BXTask } from "@workspace/bx";
import { getEvServiceTasksFromBxTasks } from "../lib/service-task-util";
import { EV_PLAN_SERVICE_PROP } from "@/modules/entities/EventPlan/type/event-plan-service-type";
import { eventServiceTaskActions } from "./EventServiceTaskSlice";
import { EventTask } from "@/modules/entities/EventTask/types/event-task-type";
import { BX_TASK_MARK } from "@workspace/bx/src/type/bitrix-type";
import { getServiceSignalTaskGroupId, getServiceTaskGroupId } from "@workspace/pbx";
import { eventTaskActions } from "@/modules/entities/EventTask";
import { hookAPI } from "@workspace/api/src/services/april-hook-api";
import { API_METHOD } from "@workspace/api";

//thunks

export const initialServiceTasksFromCurrentTask =
    (
        tasks: BXTask[] | null // Array<EventTask>,
    ) =>
        async (dispatch: AppDispatch, getState: AppGetState) => {
            // IS_PROD && portal && dispatch(getHistory(portal))

            const state = getState();
            const serviceEventTypes = state.eventPlanService[EV_PLAN_SERVICE_PROP.TYPE].items;
            const domain = state.app.domain

            const evntTasks = getEvServiceTasksFromBxTasks(tasks, serviceEventTypes, domain) as Array<EventTask>;
            if (evntTasks && evntTasks.length) {
                const currentTask = evntTasks[0];
                dispatch(eventServiceTaskActions.setFetchedTasks({ tasks: evntTasks }));

                dispatch(eventServiceTaskActions.setCurrentTask({ task: currentTask }));

                dispatch(setCurrentReportContact(currentTask));
                //    if (!data || !data.length) {

                //        dispatch(
                //            getResultMenu(
                //                EventItemResultType.NEW,
                //                null
                //            )
                //        )

                //    }
            }
        };
export const initialEventServiceTasks =
    (
        tasks: BXTask[] | null, // Array<EventTask>,
        userId: number | null, // если не пришли значит tasks уже были запрошены
        companyId: number | null, //,
        domain: string | null //
    ) =>
        async (dispatch: AppDispatch, getState: AppGetState) => {
            // dispatch(setPreloader(true))

            const state = getState();
            const serviceEventTypes = state.eventPlanService[EV_PLAN_SERVICE_PROP.TYPE].items;
            const callingTaskGroupId = getServiceTaskGroupId(domain)
            const ssTaskGroupId = getServiceSignalTaskGroupId(domain)
            // }

            const filter = Number(userId) === 187 ? {
                GROUP_ID: [callingTaskGroupId, ssTaskGroupId],
                UF_CRM_TASK: [`CO_${companyId}`],
                // RESPONSIBLE_ID: userId,
            } : {
                // groupId: callingTaskGroupId,
                // ufCrmTask: [`CO_${companyId}`],
                // responsibleId: userId,
                // status: '!=5',

                GROUP_ID: [callingTaskGroupId, ssTaskGroupId],
                UF_CRM_TASK: [`CO_${companyId}`],
                RESPONSIBLE_ID: userId,
                "!=STATUS": 5,
            }


            const data = {
                filter: filter,
                select: [
                    "ID",
                    "UF_CRM_TASK",
                    "TITLE",
                    "DATE_START",
                    "CREATED_DATE",
                    "CHANGED_DATE",
                    "CLOSED_DATE",
                    "DESCRIPTION",
                    "DEADLINE",
                    "PRIORITY",
                    "MARK",
                    "GROUP_ID",

                    "CREATED_BY",
                    "STATUS_CHANGED_BY",
                    "REAL_STATUS",
                    "STATUS",
                    "STAGE_ID",
                    "RESPONSIBLE_ID",
                    "CREATED_BY",
                    "TITLE",
                ],
            };

            if (!tasks || !tasks.length) {
                if (userId && companyId && domain) {

                    const responseTaks = (await Bitrix.getService().api.call("tasks.task.list", data)) as {
                        tasks: BXTask[];
                    };
                    if (responseTaks && responseTaks.tasks) {
                        tasks = responseTaks.tasks;
                    }
                }
            }

            // IS_PROD && portal && dispatch(getHistory(portal))

            if (tasks && tasks.length) {
                const domain = state.app.domain

                const evntTasks = getEvServiceTasksFromBxTasks(tasks, serviceEventTypes, domain) as Array<EventTask>;

                dispatch(
                    eventServiceTaskActions.setFetchedTasks({
                        tasks: evntTasks,
                    })
                );
            } else {
                dispatch(eventServiceTaskActions.setFetchedTasks({ tasks: null }));

                dispatch(getResultMenu(EventItemResultType.NEW, null));
            }
        };




export const updateTaskMark =
    (
        // mark: BX_TASK_MARK
    ) =>
        async (dispatch: AppDispatch, getState: AppGetState) => {

            const state = getState();
            const currentTask = state.eventTask.current
            const isLoading = state.eventServiceTask.isMarkLoading
            if (isLoading) return

            const currentMark = currentTask && currentTask.mark ? currentTask.mark : null as BX_TASK_MARK

            let mark = null
            if (currentMark === BX_TASK_MARK.NONE || currentMark === null) {
                mark = BX_TASK_MARK.BAD
            } else if (currentMark === BX_TASK_MARK.BAD) {
                mark = BX_TASK_MARK.GOOD
            } else if (currentMark === BX_TASK_MARK.GOOD) {
                mark = BX_TASK_MARK.BAD
                console.log('newValue', mark)
            }


            dispatch(eventServiceTaskActions.setIsMarkLoading({ isMarkLoading: true }))
            const domain = state.app.domain

            dispatch(eventServiceTaskActions.updateTaskMark({ id: currentTask.id, mark: mark }))
            dispatch(eventTaskActions.updateTaskMark({ id: currentTask.id, mark: mark }))


            if (currentTask) {

                // const result = await bitrixAPI.getMethod(
                //   'tasks.task.update',
                //   {
                //     taskId: currentTask.id,
                //     fields: {
                //       MARK: mark,
                //     },
                //   },
                //   domain

                // )

                const method = 'tasks.task.update'
                const data = {
                    taskId: currentTask.id,
                    fields: {
                        MARK: mark,
                    },
                }
                const bxReqHookData = {
                    domain,
                    method,
                    bxData: data,
                };
                void (await hookAPI.service("bitrix/method", API_METHOD.POST, "result", bxReqHookData));

            }
            dispatch(eventServiceTaskActions.setIsMarkLoading({ isMarkLoading: false }))
        }
