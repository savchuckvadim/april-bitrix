import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { eventReportActions } from '@/modules/entities/EventReport';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { EV_PLAN_PROP } from '../type/event-plan-type';
import { isDifferenceMoreThanFourMonths } from '../lib/plan-util';

/**
 * Дата плана дальше 4 месяцев ↔ статус работы «Отложено»
 * (id=1 setAside / id=0 inJob в каталоге WORK_STATUS_ITEMS).
 */
export const changeWorkStatusFromDeadline =
    () => (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const workStatus =
            state.eventReport.report[EV_REPORT_PROP.WORK_STATUS].current;
        const date = state.eventPlan[EV_PLAN_PROP.DATE];
        if (!workStatus) return;

        const isExpired = isDifferenceMoreThanFourMonths(date);

        if (workStatus.code === 'inJob' && isExpired) {
            dispatch(
                eventReportActions.setReportProp({
                    propName: EV_REPORT_PROP.WORK_STATUS,
                    value: 1, // setAside
                }),
            );
        } else if (workStatus.code === 'setAside' && !isExpired) {
            dispatch(
                eventReportActions.setReportProp({
                    propName: EV_REPORT_PROP.WORK_STATUS,
                    value: 0, // inJob
                }),
            );
        }
    };
