import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import { EventTask } from "../types/event-task-type";
import { eventTaskActions } from "./EventTaskSlice";
import { getResultMenu } from "@/modules/widgets/EventItem";
import { EventItemResultType } from "@/modules/widgets/EventItem/model/EventItemSlice";
import { getEvTasksFromBxTasks } from "../lib/task-util";
import { getInitSale } from "@/modules/entities/EventSale";
import { setCurrentReportContact } from "@/modules/entities/EventContact/model/EventContactThunk";

import { Bitrix } from '@workspace/bitrix';
import type { BXTask } from "@workspace/bx";

//thunks

export const initialTasksFromCurrentTask =
    (tasks: Array<EventTask>) => async (dispatch: AppDispatch, getState: AppGetState) => {
        // IS_PROD && portal && dispatch(getHistory(portal))

        if (tasks && tasks.length) {
            const currentTask = tasks[0];
            dispatch(eventTaskActions.setFetchedTasks({ tasks }));

            dispatch(eventTaskActions.setCurrentTask({ task: currentTask }));

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
export const initialEventTasks =
    (
        tasks: Array<BXTask>, // Array<EventTask>,
        userId: number,
        companyId: number,
        domain: string
    ) =>
        async (dispatch: AppDispatch, getState: AppGetState) => {
            // dispatch(setPreloader(true))

            // const state = getState()
            // const domain = state.app.domain
            // const currentUser = state.app.bitrix.user
            // let placement = state.app.bitrix.placement as Placement | undefined

            // const data = {
            //     domain: domain || TESTING_DOMAIN,
            //     userId: currentUser || DEV_CURRENT_USER_ID,
            //     placement: placement || {
            //         placement: 'COMPANY',
            //         options: {
            //             ID: TESTING_COMPANY_ID
            //         }
            //     },

            // }

            // const tasks = await hookAPI
            //     .service(
            //         'full/tasks',
            //         API_METHOD.POST,
            //         'tasks',
            //         data
            //     ) as Array<BXTask> | null
            let resultTasks = tasks;
            let callingTaskGroupId = 1;
            if (domain === "april-dev.bitrix24.ru") {
                callingTaskGroupId = 9;
            }
            if (domain === "april-garant.bitrix24.ru") {
                callingTaskGroupId = 28;
            }
            if (domain === "gsr.bitrix24.ru") {
                callingTaskGroupId = 41;
            }
            const data = {
                filter: {
                    // groupId: callingTaskGroupId,
                    // ufCrmTask: [`CO_${companyId}`],
                    // responsibleId: userId,
                    // status: '!=5',

                    GROUP_ID: callingTaskGroupId,
                    UF_CRM_TASK: [`CO_${companyId}`],
                    RESPONSIBLE_ID: userId,
                    "!=STATUS": 5,
                },
                select: [
                    "ID",
                    "UF_CRM_TASK",
                    "TITLE",
                    "DATE_START",
                    "CREATED_DATE",
                    "CHANGED_DATE",
                    "CLOSED_DATE",

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
                const responseTaks = (await Bitrix.getService().api.call("tasks.task.list", data)) as {
                    tasks: BXTask[];
                };
                if (responseTaks && responseTaks.tasks) {
                    tasks = responseTaks.tasks;
                }
            }

            // IS_PROD && portal && dispatch(getHistory(portal))

            if (tasks && tasks.length) {
                // const resultTasks = tasks.map(task => {

                //     const { type, name, eventType } = parseTaskTitle(task.title)
                //     const isExpired = checkIfTaskIsOverdue(task)
                //     const deadline = getFormatDate(task.deadline)
                //     return {
                //         ...task,
                //         name,
                //         type,
                //         eventType,
                //         isExpired,
                //         deadline,
                //         presentation: null,
                //         dealBase: null,
                //     } as EventTask

                // }) as Array<EventTask>

                const evntTasks = getEvTasksFromBxTasks(tasks) as Array<EventTask>;
                dispatch(
                    eventTaskActions.setFetchedTasks({
                        tasks: evntTasks,
                    })
                );
                dispatch(getInitSale(null, evntTasks));
            } else {
                dispatch(eventTaskActions.setFetchedTasks({ tasks: null }));

                dispatch(getResultMenu(EventItemResultType.NEW, null));
            }
        };
