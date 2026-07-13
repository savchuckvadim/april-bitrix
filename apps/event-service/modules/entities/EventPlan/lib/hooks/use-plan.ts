import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_PLAN_PROP } from '../../type/event-plan-type';
import { EV_PLAN_STATE_ITEM, changeWorkStatusFromDeadline, eventPlanActions } from '../../model/EventPlanSlice';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { EventItemResultType } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { EV_CONTACT_PROP } from '@/modules/entities/EventContact/type/event-contact-type';

/** Plan process state + handlers (replaces the old PlanContainer). */
export const usePlan = () => {
    const dispatch = useAppDispatch();
    const planState = useAppSelector(state => state.eventPlan);
    const type = planState[EV_PLAN_PROP.TYPE] as EV_PLAN_STATE_ITEM;
    const date = planState[EV_PLAN_PROP.DATE];

    const currentEventResult = useAppSelector(state => state.eventItemMenu.type) as EventItemResultType;
    const isNoResultMenu =
        currentEventResult === EventItemResultType.NORESULT ||
        currentEventResult === EventItemResultType.EXPIRED;

    const workStatus = useAppSelector(
        state => state.eventReport.report[EV_REPORT_PROP.WORK_STATUS].current,
    );

    useEffect(() => {
        dispatch(changeWorkStatusFromDeadline());
    }, [date, workStatus]);

    const planPropChange = (type: EV_PLAN_PROP | EV_CONTACT_PROP, value: string): void => {
        dispatch(eventPlanActions.setPlanProp({ name: type as EV_PLAN_PROP, value }));
    };

    return { type, date, isNoResultMenu, planPropChange };
};
