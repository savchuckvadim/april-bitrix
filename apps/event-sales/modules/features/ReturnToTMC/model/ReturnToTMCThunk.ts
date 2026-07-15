import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { eventReportActions } from '@/modules/entities/EventReport';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { eventTaskActions } from '@/modules/entities/EventTask';
import { setCurrentReportContact } from '@/modules/entities/EventContact/model/EventContactThunk';
import { eventPlanActions } from '@/modules/entities/EventPlan';
import {
    EventItemResultType,
    eventItemActions,
} from '@/modules/widgets/EventItem/model/EventItemSlice';
import { DEPARTAMENT_STATE_PROP } from '@/modules/features/Departament/type/department-type';
import { TmcDealsForReturn, returnToTmcActions } from './ReturnToTMCSlice';
import { TmcDealsHelper } from '../lib/api/tmc-deals-helper';

const tmcDealsHelper = new TmcDealsHelper();

/**
 * ТМЦ-сделки по презентационным задачам (кнопка WithTM).
 * Вызывается listener'ом на setFetchedTasks (гейт withTM + sales-режим).
 */
export const initReturnToTMC =
    (tasks: EventTask[]) => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        if (state.returnToTmc.isLoading) return;

        const withTmc = state.app.config.withTM;
        const isSalesDepartment =
            state.department[DEPARTAMENT_STATE_PROP.MODE].current?.code === 'sales';
        if (!withTmc || !isSalesDepartment) return;

        dispatch(returnToTmcActions.setLoadingStatus({ status: true }));
        try {
            const response = (await tmcDealsHelper.getTmcDeals({
                domain: state.app.domain,
                tasks: tasks.map(task => ({
                    id: Number(task.id),
                    ufCrmTask: task.ufCrmTask,
                })),
            })) as unknown as TmcDealsForReturn[] | null;

            if (response) {
                dispatch(returnToTmcActions.init({ tmcDeals: response }));
            }
        } catch (error) {
            console.error('initReturnToTMC error', error);
        } finally {
            dispatch(returnToTmcActions.setLoadingStatus({ status: false }));
        }
    };

/** Открытие/закрытие меню возврата в ТМЦ по задаче. */
export const getReturnToTMCMenu =
    (taskId: number | null, status: boolean) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const currentTask =
            state.eventTask.tasks?.find(task => task.id === taskId) ?? null;

        dispatch(
            eventItemActions.setMenuType({
                menuType: status ? EventItemResultType.NORESULT : null,
            }),
        );
        dispatch(eventPlanActions.setActiveStatus({ status: !status }));
        dispatch(eventReportActions.clean({ isTmc: false }));
        dispatch(eventTaskActions.setCurrentTask({ task: currentTask }));
        dispatch(setCurrentReportContact(currentTask));

        if (status) {
            // статус работы «Отказ» (id=3 в WORK_STATUS_ITEMS)
            dispatch(
                eventReportActions.setReportProp({
                    propName: EV_REPORT_PROP.WORK_STATUS,
                    value: 3,
                }),
            );
        }

        dispatch(returnToTmcActions.setActiveStatus({ status }));
    };

/**
 * Отправка возврата в ТМЦ: обязателен комментарий, дальше общий sendEvent
 * (payload включает returnToTmc, т.к. меню активно).
 */
export const sendReturnToTmc =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const comment = state.eventReport.report[EV_REPORT_PROP.COMMENT];

        if (!comment) {
            const { eventActions, emptyErrors } = await import(
                '@/modules/processes/event/model/EventSlice'
            );
            dispatch(
                eventActions.setErrors({
                    isError: true,
                    errors: { ...emptyErrors, comment: 'Напишите комментарий' },
                }),
            );
            return;
        }

        const { sendEvent } = await import(
            '@/modules/processes/event/model/SendThunk'
        );
        await dispatch(sendEvent());
    };
